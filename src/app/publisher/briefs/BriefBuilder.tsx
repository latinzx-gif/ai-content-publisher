"use client";

import { useEffect, useState } from "react";

import { generateBrief, type Brief } from "@/lib/publisher/brief-builder";
import { upsertPost, upsertPostContent, getPostContent } from "@/lib/publisher/db";
import { createPostId } from "@/lib/publisher/post-id";
import { Button } from "@/components/publisher/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/publisher/ui/card";
import { Input } from "@/components/publisher/ui/input";
import { Select } from "@/components/publisher/ui/select";
import { Textarea } from "@/components/publisher/ui/textarea";

type CreateDraft = {
  topic?: string;
  theme?: string;
  brand?: string;
  platform?: string;
  language?: string;
};

const createDraftKey = "ai-content-publisher:create-draft";
const languages = ["Thai", "English", "Chinese", "Japanese", "Korean"];
const platforms = ["Facebook", "Instagram", "LinkedIn", "Twitter/X", "TikTok", "Threads"];

export default function BriefBuilder({ initialPostId }: { initialPostId: string }) {
  const createDraft = readCreateDraft();
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [topic, setTopic] = useState(
    createDraft?.topic || createDraft?.theme || ""
  );
  const [brand, setBrand] = useState(createDraft?.brand || "Head Office");
  const [platform, setPlatform] = useState(createDraft?.platform || "Facebook");
  const [language, setLanguage] = useState(createDraft?.language || "Thai");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!postId) return;
    getPostContent(postId).then((row) => {
      if (row?.brief) {
        const saved = row.brief as { brief?: Brief };
        if (saved.brief) setBrief(saved.brief);
      }
    });
  }, [postId]);

  async function handleGenerate() {
    setMessage("Generating…");
    try {
      const result = await generateBrief(topic, brand, platform, language, postId);
      setBrief(result);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Brief generation failed.");
    }
  }

  function updateBrief(field: keyof Brief, value: string) {
    setBrief((current) => {
      if (!current) return current;
      if (field === "key_points") {
        return {
          ...current,
          key_points: value
            .split("\n")
            .map((point) => point.trim())
            .filter(Boolean),
        };
      }
      return { ...current, [field]: value };
    });
    setMessage("");
  }

  async function saveBrief() {
    if (!brief) {
      setMessage("Generate a brief before saving.");
      return;
    }

    const payload = { post_id: postId, topic, brand, platform, language, brief };

    try {
      await upsertPost({ post_id: postId, brand, platform });
      await upsertPostContent({
        post_id: postId,
        brief: payload as unknown as Record<string, unknown>,
      });
      setMessage(`Brief saved to ${postId}.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Failed to save brief: ${detail}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
          Brief Builder
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Generate a structured brief from a topic, then edit it before saving
          it to the shared post record.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brief inputs</CardTitle>
          <CardDescription>
            The topic can be prefilled from the Create draft or entered manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Field label="Topic">
            <Textarea
              value={topic}
              placeholder="Enter the topic or campaign theme."
              onChange={(event) => setTopic(event.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Post ID">
              <Input
                value={postId}
                onChange={(event) => setPostId(event.target.value)}
              />
            </Field>
            <Field label="Brand">
              <Select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              >
                <option value="Head Office">Head Office</option>
                <option value="Siam Wellness">Siam Wellness</option>
                <option value="Education Studio">Education Studio</option>
              </Select>
            </Field>
            <Field label="Platform">
              <Select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                {platforms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Language">
              <Select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <Button type="button" onClick={handleGenerate}>
              Generate
            </Button>
            <Button type="button" variant="outline" onClick={saveBrief}>
              Save
            </Button>
            {message ? (
              <p className="text-sm font-semibold text-[var(--emerald)]">{message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {brief ? (
        <Card>
          <CardHeader>
            <CardTitle>Editable brief</CardTitle>
            <CardDescription>
              Each section remains editable before content generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-2">
            <BriefField
              label="Headline"
              value={brief.headline}
              onChange={(value) => updateBrief("headline", value)}
            />
            <BriefField
              label="Angle"
              value={brief.angle}
              onChange={(value) => updateBrief("angle", value)}
            />
            <BriefField
              label="Key points"
              value={brief.key_points.join("\n")}
              onChange={(value) => updateBrief("key_points", value)}
            />
            <BriefField
              label="Target audience"
              value={brief.target_audience}
              onChange={(value) => updateBrief("target_audience", value)}
            />
            <BriefField
              label="Tone"
              value={brief.tone}
              onChange={(value) => updateBrief("tone", value)}
            />
            <BriefField
              label="Structure notes"
              value={brief.structure_notes}
              onChange={(value) => updateBrief("structure_notes", value)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No brief has been generated yet. Enter a topic and click Generate
              Brief to create editable sections for this post.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[var(--text-subtle)]">{label}</span>
      {children}
    </label>
  );
}

function BriefField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field label={label}>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function readCreateDraft() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(createDraftKey);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CreateDraft;
  } catch {
    return null;
  }
}

