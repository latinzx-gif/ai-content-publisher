"use client";

import { useState } from "react";

import {
  generateImagePrompts,
  type ImagePrompt,
  type ImagePromptSet,
} from "@/lib/publisher/image-prompt-generator";
import { getPostContent, upsertPostContent } from "@/lib/publisher/db";
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

export default function ImagePromptGenerator({
  initialPostId,
}: {
  initialPostId: string;
}) {
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [prompts, setPrompts] = useState<ImagePromptSet | null>(null);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    const row = await getPostContent(postId);
    const content = row?.content ?? null;
    const rules = row?.rules ?? null;
    const next = generateImagePrompts(content, rules, rules);
    setPrompts({ ...next, post_id: postId, visual_concept_id: `vc_${postId}` });
    setMessage("");
  }

  async function savePrompts() {
    if (!prompts) {
      setMessage("Generate prompts before saving.");
      return;
    }

    try {
      await upsertPostContent({
        post_id: postId,
        image_prompts: {
          ...prompts,
          post_id: postId,
          visual_concept_id: `vc_${postId}`,
          saved_at: new Date().toISOString(),
        } as unknown as Record<string, unknown>,
      });
      setMessage(`Image prompts saved to ${postId}.`);
    } catch {
      setMessage("Failed to save prompts. Check console.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
          Image Prompts
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Generate paired image prompts from saved content. Both prompts keep
          one shared visual concept ID.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt inputs</CardTitle>
          <CardDescription>
            Reads content and rules from the database for the selected post ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[1fr_auto]">
          <Field label="Post ID">
            <Input
              value={postId}
              onChange={(event) => {
                setPostId(event.target.value);
                setPrompts(null);
                setMessage("");
              }}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Button type="button" onClick={handleGenerate}>
              Generate
            </Button>
            <Button type="button" variant="outline" onClick={handleGenerate}>
              Regenerate
            </Button>
            <Button type="button" variant="outline" onClick={savePrompts}>
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

      {prompts ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <PromptCard title="Primary Image Prompt" prompt={prompts.primary} />
          <PromptCard title="Secondary Image Prompt" prompt={prompts.secondary} />
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No image prompts are generated yet. Save content and rules for
              this post, then generate the primary and secondary prompts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PromptCard({ prompt, title }: { prompt: ImagePrompt; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{prompt.visual_concept_id}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <PromptRow label="Visual Concept ID" value={prompt.visual_concept_id} />
          <PromptRow label="Layout" value={prompt.layout} />
          <PromptRow label="Mood" value={prompt.mood} />
          <PromptRow label="Hero Object" value={prompt.hero_object} />
          <PromptRow label="Color Palette" value={prompt.color_palette} />
          <PromptRow label="Text Language" value={prompt.text_language} />
        </dl>
      </CardContent>
    </Card>
  );
}

function PromptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
      <dt className="font-bold text-[var(--navy)]">{label}</dt>
      <dd className="mt-1 text-[var(--text-subtle)]">{value}</dd>
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

