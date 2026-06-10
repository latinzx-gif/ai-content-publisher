"use client";

import { useState } from "react";

import {
  generateContent,
  type GeneratedContent,
  type GeneratedContentVersion,
} from "@/lib/publisher/content-generator";
import { getPostContent, upsertPostContent } from "@/lib/publisher/db";
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

const languages = ["Thai", "English", "Chinese", "Japanese", "Korean"];

export default function ContentGenerator({
  initialPostId,
}: {
  initialPostId: string;
}) {
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [primaryLang, setPrimaryLang] = useState("Thai");
  const [secondaryLang, setSecondaryLang] = useState("English");
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setMessage("Generating…");
    try {
      const row = await getPostContent(postId);
      const brief = row?.brief ?? null;
      const rules = row?.rules ?? null;
      const next = await generateContent(brief, rules, primaryLang, secondaryLang, postId);
      setContent({ ...next, post_id: postId });
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Content generation failed.");
    }
  }

  async function regenerate(languageType: "primary" | "secondary") {
    setMessage("Regenerating…");
    try {
      const row = await getPostContent(postId);
      const brief = row?.brief ?? null;
      const rules = row?.rules ?? null;
      const next = await generateContent(brief, rules, primaryLang, secondaryLang, postId);
      setContent((current) => {
        if (!current) return { ...next, post_id: postId };
        return {
          ...current,
          [languageType]: next[languageType],
          generated_at: next.generated_at,
        };
      });
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Regeneration failed.");
    }
  }

  function updateField(
    languageType: "primary" | "secondary",
    field: keyof GeneratedContentVersion,
    value: string
  ) {
    setContent((current) => {
      if (!current) return current;
      return {
        ...current,
        [languageType]: {
          ...current[languageType],
          [field]: value,
        },
      };
    });
    setMessage("");
  }

  async function saveContent() {
    if (!content) {
      setMessage("Generate content before saving.");
      return;
    }

    try {
      await upsertPostContent({
        post_id: postId,
        content: { ...content, post_id: postId, saved_at: new Date().toISOString() } as unknown as Record<string, unknown>,
      });
      setMessage(`Content saved to ${postId}.`);
    } catch {
      setMessage("Failed to save content. Check console.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
          Content Generation
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Generate editable primary post copy and secondary first-comment copy
          from the saved brief and rules for one post record.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content inputs</CardTitle>
          <CardDescription>
            Reads brief and rules from the database using the selected post ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-3">
          <Field label="Post ID">
            <Input
              value={postId}
              onChange={(event) => {
                setPostId(event.target.value);
                setContent(null);
                setMessage("");
              }}
            />
          </Field>
          <Field label="Primary language">
            <Select
              value={primaryLang}
              onChange={(event) => setPrimaryLang(event.target.value)}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Secondary language">
            <Select
              value={secondaryLang}
              onChange={(event) => setSecondaryLang(event.target.value)}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex flex-wrap items-center gap-3 md:col-span-3">
            <Button type="button" onClick={handleGenerate}>
              Generate
            </Button>
            <Button type="button" variant="outline" onClick={saveContent}>
              Save
            </Button>
            {message ? (
              <p className="text-sm font-semibold text-[var(--emerald)]">{message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {content ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ContentCard
            content={content.primary}
            title="Primary Post"
            onRegenerate={() => regenerate("primary")}
            onUpdate={(field, value) => updateField("primary", field, value)}
          />
          <ContentCard
            content={content.secondary}
            title="Secondary First Comment"
            onRegenerate={() => regenerate("secondary")}
            onUpdate={(field, value) => updateField("secondary", field, value)}
          />
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No generated content is loaded. Save a brief and rules for this
              post ID, then generate the primary and secondary copy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContentCard({
  content,
  onRegenerate,
  onUpdate,
  title,
}: {
  content: GeneratedContentVersion;
  onRegenerate: () => void;
  onUpdate: (field: keyof GeneratedContentVersion, value: string) => void;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Editable after generation.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextField label="Headline" value={content.headline} onChange={(value) => onUpdate("headline", value)} />
        <TextField label="Subheadline" value={content.subheadline} onChange={(value) => onUpdate("subheadline", value)} />
        <TextField label="Support Line" value={content.support_line} onChange={(value) => onUpdate("support_line", value)} />
        <TextField label="Long-form Article" value={content.long_form} onChange={(value) => onUpdate("long_form", value)} multiline />
        <TextField label="Hashtags" value={content.hashtags} onChange={(value) => onUpdate("hashtags", value)} />
        <TextField label="Disclaimer" value={content.disclaimer} onChange={(value) => onUpdate("disclaimer", value)} />
      </CardContent>
    </Card>
  );
}

function TextField({
  label,
  multiline,
  onChange,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </Field>
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
