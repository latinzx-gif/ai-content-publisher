"use client";

import { useEffect, useState } from "react";

import {
  emptyHistory,
  generateImage,
  getImageHistory,
  type GeneratedImage,
  type ImageHistory,
  type ImageType,
} from "@/lib/publisher/image-generator";
import type { ImagePromptSet } from "@/lib/publisher/image-prompt-generator";
import { getPostContent, insertPostImage } from "@/lib/publisher/db";
import { Button } from "@/components/publisher/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/publisher/ui/card";
import { Input } from "@/components/publisher/ui/input";

export default function ImageGenerator({
  initialPostId,
}: {
  initialPostId: string;
}) {
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [history, setHistory] = useState<ImageHistory>(() =>
    emptyHistory(initialPostId || "post_missing")
  );
  const [message, setMessage] = useState("");

  // Load history from DB when postId changes
  useEffect(() => {
    if (!postId) return;
    getImageHistory(postId).then(setHistory);
  }, [postId]);

  async function handleGenerate(type: ImageType) {
    const row = await getPostContent(postId);
    const promptSet = row?.image_prompts as ImagePromptSet | null;
    const prompt = promptSet?.[type];

    if (!prompt) {
      setMessage(`Generate and save image prompts for ${postId} first.`);
      return;
    }

    setMessage("Generating image…");
    try {
      const currentHistory = await getImageHistory(postId);
      const image = await generateImage(prompt, postId, type, currentHistory);

      await insertPostImage({
        post_id: postId,
        type: image.type,
        version: image.version,
        image_url: image.image_url,
        is_placeholder: false,
        prompt: image.prompt as unknown as Record<string, unknown>,
        visual_concept_id: prompt.visual_concept_id ?? null,
      });

      setHistory((prev) => ({
        ...prev,
        [type]: [...(prev[type] ?? []), image],
        saved_at: new Date().toISOString(),
      }));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image generation failed.");
    }
  }

  const primaryCurrent = history.primary.at(-1) || null;
  const secondaryCurrent = history.secondary.at(-1) || null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Images</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Generate local placeholder image records from saved primary and
          secondary image prompts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Image inputs</CardTitle>
          <CardDescription>
            Reads prompt records from the database and keeps version history.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[1fr_auto]">
          <Field label="Post ID">
            <Input
              value={postId}
              onChange={(event) => {
                setPostId(event.target.value);
                setHistory(emptyHistory(event.target.value));
                setMessage("");
              }}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Button type="button" onClick={() => handleGenerate("primary")}>
              Generate Primary
            </Button>
            <Button type="button" onClick={() => handleGenerate("secondary")}>
              Generate Secondary
            </Button>
          </div>
          {message ? (
            <p className="text-sm font-semibold text-[var(--emerald)] md:col-span-2">
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ImageCard
          image={primaryCurrent}
          title="Primary Image"
          onRegenerate={() => handleGenerate("primary")}
        />
        <ImageCard
          image={secondaryCurrent}
          title="Secondary Image"
          onRegenerate={() => handleGenerate("secondary")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version history</CardTitle>
          <CardDescription>All generated placeholder image versions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <HistoryList title="Primary versions" images={history.primary} />
          <HistoryList title="Secondary versions" images={history.secondary} />
        </CardContent>
      </Card>
    </div>
  );
}

function ImageCard({
  image,
  onRegenerate,
  title,
}: {
  image: GeneratedImage | null;
  onRegenerate: () => void;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {image ? `Version ${image.version}` : "No image generated yet."}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {image ? (
          <>
            <div className="flex aspect-[3/2] items-center justify-center rounded-[calc(var(--radius)*0.55)] bg-[var(--navy)] p-6 text-center text-2xl font-black text-[var(--paper)]">
              {title} V{image.version}
            </div>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Prompt used" value={image.prompt.hero_object} />
              <InfoRow label="Version number" value={String(image.version)} />
              <InfoRow label="Timestamp" value={image.generated_at} />
              <InfoRow label="Placeholder URL" value={image.image_url} />
            </dl>
          </>
        ) : (
          <p className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">
            Generate this image to create version 1.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryList({ images, title }: { images: GeneratedImage[]; title: string }) {
  return (
    <div>
      <h2 className="text-sm font-black text-[var(--navy)]">{title}</h2>
      {images.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {images.map((image) => (
            <li key={`${image.type}-${image.version}-${image.generated_at}`} className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
              <p className="font-bold text-[var(--navy)]">Version {image.version}</p>
              <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{image.generated_at}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-muted)]">
          No versions yet.
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
      <dt className="font-bold text-[var(--navy)]">{label}</dt>
      <dd className="mt-1 break-words text-[var(--text-subtle)]">{value}</dd>
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

function createPostId() {
  return `post_${Date.now()}`;
}
