"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/publisher/ui/badge";
import { Button, buttonVariants } from "@/components/publisher/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import { Input } from "@/components/publisher/ui/input";
import { addLog } from "@/lib/publisher/log-system";
import {
  generateContent,
  type GeneratedContent,
} from "@/lib/publisher/content-generator";
import {
  generateImage,
  getImageHistory,
  type GeneratedImage,
  type ImageHistory,
  type ImageType,
} from "@/lib/publisher/image-generator";
import { generateImagePrompts, type ImagePromptSet } from "@/lib/publisher/image-prompt-generator";
import { AGENT_PIPELINE } from "@/lib/publisher/agent-roles";
import { runQualityChecks, type QualityCheckResult } from "@/lib/publisher/quality-checker";
import {
  approvePost,
  rejectPost,
  requestRevision,
  saveDraft,
  type ReviewStatus,
} from "@/lib/publisher/review-actions";
import {
  getPost,
  getPostContent,
  insertPostImage,
  upsertPost,
  upsertPostContent,
} from "@/lib/publisher/db";
import PostPreview from "./PostPreview";

type QcRecord = {
  post_id?: string;
  results?: QualityCheckResult[];
  saved_at?: string;
};

type ReviewWorkflow = {
  postId: string;
  platforms: string[];
  autoPublish: boolean;
};

type StoredWorkflow = {
  platforms: string[];
  autoPublish: boolean;
  saved_at: string;
};

type ReviewPipelineAudit = {
  postId: string;
  platforms: string[];
  autoPublish: boolean;
  status: "completed" | "blocked" | "failed";
  steps: string[];
  message: string;
  created_at: string;
};

type BriefEnvelope = {
  post_id?: string;
  topic?: string;
  theme?: string;
  brand?: string;
  platform?: string;
  language?: string;
};

type PipelineLog = {
  at: string;
  message: string;
  kind: "info" | "warn" | "error" | "success";
};

const PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter/X",
  "TikTok",
  "Threads",
];

export type ReviewData = {
  content: GeneratedContent | null;
  imagePrompts: ImagePromptSet | null;
  images: ImageHistory | null;
  qc: QcRecord | null;
};

export default function ReviewDashboard({
  initialPostId,
}: {
  initialPostId: string;
}) {
  const [postId, setPostId] = useState(initialPostId);
  const [status, setStatus] = useState<ReviewStatus>("draft");
  const [data, setData] = useState<ReviewData>({
    content: null,
    imagePrompts: null,
    images: null,
    qc: null,
  });
  const [requirements, setRequirements] = useState<ReviewWorkflow>({
    postId: initialPostId,
    platforms: ["Facebook"],
    autoPublish: false,
  });
  const [requirementsLoaded, setRequirementsLoaded] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([]);
  const [pipelineMessage, setPipelineMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(initialPostId));

  const autoRunSignature = useRef("");

  const activePlatforms = useMemo(
    () => normalizePlatforms(requirements.platforms),
    [requirements.platforms]
  );

  function executeAutoReviewPipeline(pipeline: ReviewWorkflow) {
    setPipelineMessage("Starting agent workflow.");
    setPipelineLogs([]);

    const workflowSteps: string[] = [];
    const logLines: PipelineLog[] = [];
    const pushLog = (kind: PipelineLog["kind"], msg: string) => {
      const entry = { at: new Date().toISOString(), kind, message: msg };
      logLines.push(entry);
      setPipelineLogs([...logLines]);
    };

    const run = async () => {
      const currentPostId = pipeline.postId;
      const startedAt = new Date().toISOString();

      if (!currentPostId) {
        setPipelineMessage("Post ID is required for agent workflow.");
        return;
      }

      try {
        addLog(
          "generation",
          "Orchestrator Pipeline Start",
          currentPostId,
          `Orchestrator claimed review workflow for ${currentPostId}.`,
          "success",
          "Orchestrator"
        );

        // Load brief and rules from DB
        const contentRow = await getPostContent(currentPostId);
        const brief = (contentRow?.brief as BriefEnvelope | null) ?? null;
        const rules = (contentRow?.rules as Record<string, unknown> | null) ?? null;

        workflowSteps.push("load brief and rules");

        let content = (contentRow?.content as GeneratedContent | null) ?? null;

        if (!content) {
          pushLog("warn", "No generated content found. Running Content Agent...");
          workflowSteps.push("content generation");

          if (!brief) {
            const failMessage = "No brief found. Create and save a brief before queueing this post.";
            pushLog("error", failMessage);
            addLog("error", "Orchestrator Intake", currentPostId, failMessage, "error", "Orchestrator");
            await upsertPost({ post_id: currentPostId, status: "revision_requested" });
            setStatus("revision_requested");
            setPipelineMessage(failMessage);

            await savePipelineAudit(currentPostId, {
              postId: currentPostId,
              platforms: pipeline.platforms,
              autoPublish: pipeline.autoPublish,
              status: "failed",
              steps: workflowSteps,
              message: failMessage,
              created_at: startedAt,
            });
            return;
          }

          const generated = await generateContent(
            brief,
            rules,
            resolveLanguage(brief, "primary"),
            resolveLanguage(brief, "secondary"),
            currentPostId
          );

          content = {
            ...generated,
            post_id: currentPostId,
            generated_at: new Date().toISOString(),
          };

          await upsertPostContent({
            post_id: currentPostId,
            content: content as unknown as Record<string, unknown>,
          });
          addLog(
            "generation",
            "Content Agent",
            currentPostId,
            `Generated content for ${currentPostId}.`,
            "success",
            "Content Agent"
          );
          pushLog("success", "Generated content draft.");
        } else {
          pushLog("info", "Found existing generated content.");
        }

        workflowSteps.push("image prompt generation");
        let imagePrompts = (contentRow?.image_prompts as ImagePromptSet | null) ?? null;

        if (!imagePrompts) {
          pushLog("warn", "No image prompts found. Running Image Prompt Agent...");

          const prompts = generateImagePrompts(content, rules, rules);
          imagePrompts = { ...prompts, post_id: currentPostId };

          await upsertPostContent({
            post_id: currentPostId,
            image_prompts: imagePrompts as unknown as Record<string, unknown>,
          });
          addLog(
            "image",
            "Image Prompt Agent",
            currentPostId,
            "Generated image prompts from prepared content.",
            "success",
            "Image Prompt Agent"
          );
          pushLog("success", "Generated image prompts.");
        } else {
          pushLog("info", "Found existing image prompts.");
        }

        workflowSteps.push("quality checks");
        const qualityRecords = await runQualityChecks(content, rules, currentPostId);
        const qcPayload: QcRecord = {
          post_id: currentPostId,
          results: qualityRecords,
          saved_at: new Date().toISOString(),
        };

        const existingPost = await getPost(currentPostId);
        const existingMeta = (existingPost?.metadata ?? {}) as Record<string, unknown>;

        await upsertPost({
          post_id: currentPostId,
          metadata: { ...existingMeta, qc: qcPayload },
        });

        const failCount = qualityRecords.filter((e) => e.status === "fail").length;
        const warnCount = qualityRecords.filter((e) => e.status === "warn").length;
        addLog(
          "generation",
          "Quality Agent",
          currentPostId,
          `QC completed with ${failCount} fail, ${warnCount} warn.`,
          failCount ? "warn" : "success",
          "Quality Agent"
        );
        pushLog("info", `QC results: ${failCount} fail, ${warnCount} warn.`);

        if (failCount > 0) {
          const failMessage = `QC blocked auto publish due to ${failCount} fail check(s).`;
          await upsertPost({ post_id: currentPostId, status: "revision_requested" });
          setStatus("revision_requested");
          setPipelineMessage(failMessage);
          pushLog("warn", failMessage);
          await savePipelineAudit(currentPostId, {
            postId: currentPostId,
            platforms: pipeline.platforms,
            autoPublish: pipeline.autoPublish,
            status: "blocked",
            steps: workflowSteps,
            message: failMessage,
            created_at: new Date().toISOString(),
          });
          return;
        }

        workflowSteps.push("image compose");
        let imageHistory = await getImageHistory(currentPostId);
        const primaryPrompt = imagePrompts?.primary;
        const secondaryPrompt = imagePrompts?.secondary;

        const needPrimary = imageHistory.primary.length === 0 && !!primaryPrompt;
        const needSecondary = imageHistory.secondary.length === 0 && !!secondaryPrompt;

        if (needPrimary || needSecondary) {
          pushLog("warn", "Running image composer for missing variants.");

          if (needPrimary && primaryPrompt) {
            const img = await generateImage(primaryPrompt, currentPostId, "primary" as ImageType, imageHistory);
            await insertPostImage({
              post_id: currentPostId,
              type: "primary",
              version: img.version,
              image_url: img.image_url,
              is_placeholder: img.is_placeholder,
              prompt: img.prompt as unknown as Record<string, unknown>,
              visual_concept_id: primaryPrompt.visual_concept_id ?? null,
            });
            imageHistory = { ...imageHistory, primary: [...imageHistory.primary, img] };
          }

          if (needSecondary && secondaryPrompt) {
            const img = await generateImage(secondaryPrompt, currentPostId, "secondary" as ImageType, imageHistory);
            await insertPostImage({
              post_id: currentPostId,
              type: "secondary",
              version: img.version,
              image_url: img.image_url,
              is_placeholder: img.is_placeholder,
              prompt: img.prompt as unknown as Record<string, unknown>,
              visual_concept_id: secondaryPrompt.visual_concept_id ?? null,
            });
            imageHistory = { ...imageHistory, secondary: [...imageHistory.secondary, img] };
          }

          const degradedCount =
            [...imageHistory.primary, ...imageHistory.secondary].filter((img) => img.is_placeholder).length;

          addLog(
            "image",
            "Image Composer Agent",
            currentPostId,
            degradedCount
              ? `Image composer degraded: ${degradedCount} placeholder slot(s) — real output missing.`
              : "Generated real visuals for available variants.",
            degradedCount ? "warn" : "success",
            "Image Composer Agent"
          );
          pushLog(degradedCount ? "warn" : "success", "Image composer finished.");
        } else {
          pushLog("info", "Image composer already prepared.");
        }

        // Placeholder output must never count as review-ready. Block the
        // publish path explicitly when any current image is degraded.
        const latestImages = [
          imageHistory.primary.at(-1),
          imageHistory.secondary.at(-1),
        ].filter(Boolean) as GeneratedImage[];
        if (latestImages.some((img) => img.is_placeholder)) {
          const failMessage =
            "Image generation degraded — placeholder output detected. Regenerate images before approval.";
          await upsertPost({ post_id: currentPostId, status: "revision_requested" });
          setStatus("revision_requested");
          setPipelineMessage(failMessage);
          pushLog("warn", failMessage);
          await savePipelineAudit(currentPostId, {
            postId: currentPostId,
            platforms: pipeline.platforms,
            autoPublish: pipeline.autoPublish,
            status: "blocked",
            steps: [...workflowSteps, "image_degraded"],
            message: failMessage,
            created_at: new Date().toISOString(),
          });
          setData({ content, imagePrompts, images: imageHistory, qc: qcPayload });
          return;
        }

        workflowSteps.push("publish queueing");
        const cleanPlatforms = normalizePlatforms(pipeline.platforms);
        const shouldPublish = pipeline.autoPublish && cleanPlatforms.length > 0;

        // Re-fetch meta for merge
        const latestPost = await getPost(currentPostId);
        const latestMeta = (latestPost?.metadata ?? {}) as Record<string, unknown>;

        if (shouldPublish) {
          const firstPlatform = cleanPlatforms[0] || "Facebook";
          const queuedAt = new Date().toISOString();

          await upsertPost({
            post_id: currentPostId,
            platform: firstPlatform,
            scheduled_at: queuedAt,
            status: "scheduled",
            metadata: { ...latestMeta, publish_platforms: cleanPlatforms },
          });
          setStatus("scheduled");

          addLog("publish", "Publish Agent", currentPostId, `Auto queued for ${cleanPlatforms.join(", ")}.`, "success", "Publish Agent");
          addLog("publish", "Orchestrator Queue Handoff", currentPostId, `Orchestrator moved job into publish queue for ${cleanPlatforms.join(", ")}.`, "success", "Orchestrator");
          pushLog("success", `Queued for auto publish on ${cleanPlatforms.join(", ")}.`);
          setPipelineMessage("Auto workflow completed and queued for publish.");

          await savePipelineAudit(currentPostId, {
            postId: currentPostId,
            platforms: cleanPlatforms,
            autoPublish: pipeline.autoPublish,
            status: "completed",
            steps: [...workflowSteps, "queued_for_publish"],
            message: `Auto workflow completed and queued for publish on ${cleanPlatforms.join(", ")}`,
            created_at: new Date().toISOString(),
          });
        } else {
          await upsertPost({
            post_id: currentPostId,
            status: "approved",
            metadata: { ...latestMeta, publish_platforms: cleanPlatforms },
          });
          setStatus("approved");
          setPipelineMessage("Auto workflow completed. Auto publish is disabled.");
          addLog("generation", "Orchestrator Hold", currentPostId, "Auto publish disabled. Post moved to approved state.", "success", "Orchestrator");

          await savePipelineAudit(currentPostId, {
            postId: currentPostId,
            platforms: cleanPlatforms,
            autoPublish: pipeline.autoPublish,
            status: "completed",
            steps: [...workflowSteps, "approved_without_auto_publish"],
            message: "Auto workflow completed. Auto publish is disabled.",
            created_at: new Date().toISOString(),
          });
        }

        const refreshed = await refreshReviewData(currentPostId);
        setData({
          content,
          imagePrompts,
          images: imageHistory,
          qc: refreshed.qc,
        });
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : "Review pipeline failed unexpectedly.";
        const failedAt = new Date().toISOString();
        addLog("error", "Orchestrator Failure", currentPostId, messageText, "error", "Orchestrator");
        setPipelineMessage(messageText);
        pushLog("error", messageText);
        await savePipelineAudit(currentPostId, {
          postId: currentPostId,
          platforms: pipeline.platforms,
          autoPublish: pipeline.autoPublish,
          status: "failed",
          steps: [...workflowSteps, "error"],
          message: messageText,
          created_at: failedAt,
        });
      }
    };

    void run();
  }

  useEffect(() => {
    if (!postId) {
      const timer = window.setTimeout(() => {
        setRequirementsLoaded(false);
        setPipelineLogs([]);
        setPipelineMessage("");
        setData({ content: null, imagePrompts: null, images: null, qc: null });
        setStatus("draft");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      const load = async () => {
        const refreshed = await refreshReviewData(postId);
        const savedRequirement = await loadRequirements(postId);
        const mergedWorkflow = { ...savedRequirement, postId };

        setRequirements(mergedWorkflow);
        setData(refreshed);
        setStatus(refreshed.status);
        setRequirementsLoaded(true);
        setMessage("");
        setPipelineMessage(refreshed.pipelineMessage || "");
        autoRunSignature.current = "";
        setLoading(false);
      };
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [postId]);

  useEffect(() => {
    if (!postId || !requirementsLoaded || loading) return;

    // Only fresh drafts auto-run. revision_requested / rejected are human stop
    // decisions — re-running requires an explicit "Run Agent Pipeline" click.
    const shouldAutoRun = status === "draft";

    if (!shouldAutoRun || activePlatforms.length === 0) return;

    const signature = buildPipelineSignature({
      postId,
      status,
      platforms: activePlatforms,
      autoPublish: requirements.autoPublish,
    });

    if (autoRunSignature.current === signature) return;

    autoRunSignature.current = signature;
    void executeAutoReviewPipeline({
      postId,
      platforms: activePlatforms,
      autoPublish: requirements.autoPublish,
    });
  }, [loading, postId, requirements.autoPublish, activePlatforms, requirementsLoaded, status]);

  async function runAction(action: "approve" | "reject" | "revision" | "draft") {
    if (!postId) {
      setMessage("Enter a post ID before changing status.");
      return;
    }

    try {
      const nextStatus = await (
        action === "approve"
          ? approvePost(postId)
          : action === "reject"
            ? rejectPost(postId)
            : action === "revision"
              ? requestRevision(postId)
              : saveDraft(postId)
      );

      setStatus(nextStatus);
      setMessage(`Status saved as ${nextStatus}.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error.";
      setMessage(`Could not save status: ${detail}`);
    }
  }

  async function saveRequirements() {
    if (!postId) {
      setMessage("Enter a post ID before saving requirements.");
      return;
    }

    const payload: StoredWorkflow = {
      platforms: activePlatforms,
      autoPublish: requirements.autoPublish,
      saved_at: new Date().toISOString(),
    };

    const existing = await getPost(postId);
    const existingMeta = (existing?.metadata ?? {}) as Record<string, unknown>;

    await upsertPost({
      post_id: postId,
      metadata: { ...existingMeta, review_workflow: payload },
    });

    setMessage("Review requirement saved.");
  }

  function togglePlatform(platform: string) {
    const nextPlatforms = activePlatforms.includes(platform)
      ? activePlatforms.filter((item) => item !== platform)
      : [...activePlatforms, platform];

    setRequirements((current) => ({
      ...current,
      postId: current.postId,
      platforms: nextPlatforms,
    }));
  }

  function runAgentPipeline() {
    if (!postId) return;
    autoRunSignature.current = "";
    void executeAutoReviewPipeline({
      postId,
      platforms: activePlatforms,
      autoPublish: requirements.autoPublish,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
            Phase 1
          </p>
          <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
            Review & Editing
          </h1>
          <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
            Review saved content, image prompts, generated images, and QC notes before
            approval.
          </p>
        </div>
        <Badge className={statusClass(status)}>{statusLabel(status)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review post</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="space-y-2">
            <span className="text-sm font-bold text-[var(--text-subtle)]">Post ID</span>
            <Input
              value={postId}
              onChange={(event) => {
                const nextPostId = event.target.value.trim();
                setLoading(Boolean(nextPostId));
                setPostId(nextPostId);
              }}
              placeholder="post_..."
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <Button type="button" onClick={() => runAction("approve")}>
              Approve
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => runAction("reject")}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => runAction("revision")}
            >
              Request Revision
            </Button>
            <Button type="button" variant="outline" onClick={() => runAction("draft")}>
              Save
            </Button>
          </div>
          {message ? (
            <p className="text-sm font-semibold text-[var(--emerald)] md:col-span-2">
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Queue requirement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Agents use this requirement to auto-run QC, content text, image prompts, and
            visual composer when this Review Queue opens.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Selected platforms for Auto Publish">
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center gap-2 rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-2 text-sm"
                  >
                    <input
                      checked={activePlatforms.includes(platform)}
                      type="checkbox"
                      onChange={() => togglePlatform(platform)}
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Auto publish control">
              <label className="inline-flex items-center gap-2 rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-2 text-sm">
                <input
                  checked={requirements.autoPublish}
                  type="checkbox"
                  onChange={() =>
                    setRequirements((current) => ({
                      ...current,
                      postId: current.postId,
                      autoPublish: !current.autoPublish,
                    }))
                  }
                />
                <span>Queue to Publishing pipeline automatically.</span>
              </label>
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={saveRequirements}>
              Save Requirement
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={runAgentPipeline}
              disabled={!postId || activePlatforms.length === 0}
            >
              Run Agent Pipeline
            </Button>
          </div>

          {pipelineMessage ? (
            <p className="text-sm text-[var(--text-muted)]">{pipelineMessage}</p>
          ) : null}
          {pipelineLogs.length ? (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Agent pipeline log
              </p>
              <div className="rounded-[calc(var(--radius)*0.55)] border border-[var(--line)]">
                {pipelineLogs.map((entry) => (
                  <p
                    key={entry.at}
                    className={`border-b border-[var(--line)] px-3 py-2 text-xs last:border-b-0 ${
                      entry.kind === "error"
                        ? "text-[var(--danger-ink)]"
                        : entry.kind === "warn"
                          ? "text-[var(--warning-ink)]"
                          : entry.kind === "success"
                            ? "text-[var(--success-ink)]"
                            : "text-[var(--text-muted)]"
                    }`}
                  >
                    {new Date(entry.at).toLocaleTimeString()} · {entry.message}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent positions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {AGENT_PIPELINE.map((agent) => (
            <div
              className="rounded-[calc(var(--radius)*0.55)] border border-[var(--line)] bg-[var(--paper)] p-4"
              key={agent.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--navy)]">{agent.name}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {agent.role}
                  </p>
                </div>
                <Badge className="bg-[var(--emerald-soft)] text-[var(--emerald)]">
                  {agent.shortName}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-[var(--text-subtle)]">{agent.phaseLabel}</p>
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                {agent.queueName}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">Loading review data...</p>
          </CardContent>
        </Card>
      ) : (
        <PostPreview data={data} postId={postId} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Regenerate Section</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/publisher/content-generation?post_id=${postId}`}
          >
            Content
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/publisher/image-prompts?post_id=${postId}`}
          >
            Image Prompts
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/publisher/images?post_id=${postId}`}
          >
            Images
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/publisher/quality-check?post_id=${postId}`}
          >
            QC
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- pure helpers -----

function normalizePlatforms(value: string[]): string[] {
  const normalized = value.map((p) => p.trim()).filter(Boolean);
  const deduped: string[] = [];
  const seen = new Set<string>();
  normalized.forEach((p) => {
    const key = p.toLowerCase();
    if (!seen.has(key)) { seen.add(key); deduped.push(p); }
  });
  return deduped.length ? deduped : ["Facebook"];
}

function resolveLanguage(brief: BriefEnvelope, field: "primary" | "secondary") {
  const base = brief.language?.trim() || "Thai";
  return field === "primary" ? base : "English";
}

async function refreshReviewData(postId: string): Promise<ReviewData & {
  status: ReviewStatus;
  pipelineMessage?: string;
}> {
  const [contentRow, postRow, imageRows] = await Promise.all([
    getPostContent(postId),
    getPost(postId),
    getImageHistory(postId),
  ]);

  const content = (contentRow?.content as GeneratedContent | null) ?? null;
  const imagePrompts = (contentRow?.image_prompts as ImagePromptSet | null) ?? null;
  const qcData = (postRow?.metadata?.qc as QcRecord | null) ?? null;
  const pipelineAudit = (postRow?.metadata?.review_pipeline as { message?: string } | null) ?? null;

  return {
    content,
    imagePrompts,
    images: imageRows,
    qc: qcData,
    status: (postRow?.status as ReviewStatus | undefined) ?? "draft",
    pipelineMessage: pipelineAudit?.message,
  };
}

async function loadRequirements(postId: string): Promise<ReviewWorkflow> {
  const postRow = await getPost(postId);
  const stored = (postRow?.metadata?.review_workflow as StoredWorkflow | null) ?? null;
  const fallbackPlatform = postRow?.platform ? [postRow.platform] : ["Facebook"];

  return {
    postId,
    platforms: normalizePlatforms(stored?.platforms || fallbackPlatform),
    autoPublish: stored?.autoPublish ?? false,
  };
}

async function savePipelineAudit(postId: string, audit: ReviewPipelineAudit) {
  const existing = await getPost(postId);
  const existingMeta = (existing?.metadata ?? {}) as Record<string, unknown>;
  await upsertPost({
    post_id: postId,
    metadata: { ...existingMeta, review_pipeline: audit },
  });
}

function buildPipelineSignature(input: {
  postId: string;
  status: ReviewStatus;
  platforms: string[];
  autoPublish: boolean;
}) {
  return `${input.postId}|${input.status}|${normalizePlatforms(input.platforms).join(",")}|${input.autoPublish}`;
}

function statusLabel(status: ReviewStatus) {
  return status.replace(/_/g, " ").toUpperCase();
}

function statusClass(status: ReviewStatus) {
  if (status === "approved") return "bg-[var(--success-soft)] text-[var(--success-ink)]";
  if (status === "rejected" || status === "revision_requested") {
    return "bg-[var(--danger-soft)] text-[var(--danger-ink)]";
  }
  return "bg-[var(--warning-soft)] text-[var(--warning-ink)]";
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm font-bold text-[var(--text-subtle)]">{label}</span>
      {children}
    </label>
  );
}
