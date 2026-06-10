"use client";

import { useMemo, useState } from "react";

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

type CreateMode = "manual" | "batch";

type CreateDraft = {
  mode: CreateMode;
  topic: string;
  theme: string;
  brand: string;
  campaign: string;
  platform: string;
  account: string;
  date: string;
  language: string;
  category: string;
  objective: string;
  saved_at?: string;
};

const draftKey = "ai-content-publisher:create-draft";

const initialDraft: CreateDraft = {
  mode: "manual",
  topic: "",
  theme: "",
  brand: "",
  campaign: "",
  platform: "",
  account: "",
  date: "",
  language: "Thai",
  category: "Brand update",
  objective: "awareness",
};

const platforms = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter/X",
  "TikTok",
  "Threads",
];

const languages = ["Thai", "English", "Chinese", "Japanese", "Korean"];
const categories = [
  "Brand update",
  "Thought leadership",
  "Educational",
  "Promotion",
  "Community",
  "Product",
];
const objectives = [
  "awareness",
  "engagement",
  "conversion",
  "education",
  "entertainment",
];

export default function CreateForm() {
  const [draft, setDraft] = useState<CreateDraft>(() => {
    const stored = readStoredDraft();
    return stored ? { ...initialDraft, ...stored } : initialDraft;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [storedDraft, setStoredDraft] = useState<CreateDraft | null>(() =>
    readStoredDraft()
  );

  const activePromptLabel = draft.mode === "manual" ? "Topic" : "Theme";
  const activePromptValue = draft.mode === "manual" ? draft.topic : draft.theme;

  const fieldErrors = useMemo(
    () => ({
      prompt: errors.prompt,
      brand: errors.brand,
      platform: errors.platform,
    }),
    [errors]
  );

  function updateDraft<K extends keyof CreateDraft>(
    field: K,
    value: CreateDraft[K]
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      if (field === "topic" || field === "theme") delete next.prompt;
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!activePromptValue.trim()) {
      nextErrors.prompt = `${activePromptLabel} is required.`;
    }

    if (!draft.brand.trim()) {
      nextErrors.brand = "Brand is required.";
    }

    if (!draft.platform.trim()) {
      nextErrors.platform = "Platform is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveDraft() {
    if (!validate()) {
      setSaveMessage("");
      return;
    }

    const nextDraft = {
      ...draft,
      saved_at: new Date().toISOString(),
    };

    window.localStorage.setItem(draftKey, JSON.stringify(nextDraft));
    setStoredDraft(nextDraft);
    setDraft(nextDraft);
    setSaveMessage("Draft saved locally.");
  }

  function restoreDraft() {
    if (!storedDraft) return;

    setDraft({ ...initialDraft, ...storedDraft });
    setErrors({});
    setSaveMessage("Stored draft restored.");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Create</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Start a content session with either a single manual topic or a batch
          of related topics from a theme.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New content draft</CardTitle>
          <CardDescription>
            Required fields are validated before the draft is stored locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="inline-flex rounded-[var(--radius)] border border-[var(--input-line)] bg-[var(--paper)] p-1">
            {(["manual", "batch"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={draft.mode === mode ? "default" : "ghost"}
                onClick={() => updateDraft("mode", mode)}
              >
                {mode === "manual" ? "Manual Mode" : "Batch Theme Mode"}
              </Button>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label={activePromptLabel} error={fieldErrors.prompt}>
              <Textarea
                value={activePromptValue}
                placeholder={
                  draft.mode === "manual"
                    ? "Describe the single post topic."
                    : "Enter 3-5 topics separated by new lines."
                }
                onChange={(event) =>
                  updateDraft(
                    draft.mode === "manual" ? "topic" : "theme",
                    event.target.value
                  )
                }
              />
              {draft.mode === "batch" ? (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Enter 3-5 topics separated by new lines.
                </p>
              ) : null}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Brand" error={fieldErrors.brand}>
                <Select
                  value={draft.brand}
                  onChange={(event) => updateDraft("brand", event.target.value)}
                >
                  <option value="">Select brand</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Siam Wellness">Siam Wellness</option>
                  <option value="Education Studio">Education Studio</option>
                </Select>
              </Field>

              <Field label="Campaign">
                <Input
                  value={draft.campaign}
                  placeholder="Q3 launch"
                  onChange={(event) =>
                    updateDraft("campaign", event.target.value)
                  }
                />
              </Field>

              <Field label="Platform" error={fieldErrors.platform}>
                <Select
                  value={draft.platform}
                  onChange={(event) =>
                    updateDraft("platform", event.target.value)
                  }
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Account">
                <Input
                  value={draft.account}
                  placeholder="@brand.account"
                  onChange={(event) =>
                    updateDraft("account", event.target.value)
                  }
                />
              </Field>

              <Field label="Date">
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                />
              </Field>

              <Field label="Language">
                <Select
                  value={draft.language}
                  onChange={(event) =>
                    updateDraft("language", event.target.value)
                  }
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Category">
                <Select
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft("category", event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Objective">
                <Select
                  value={draft.objective}
                  onChange={(event) =>
                    updateDraft("objective", event.target.value)
                  }
                >
                  {objectives.map((objective) => (
                    <option key={objective} value={objective}>
                      {objective}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={saveDraft}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!storedDraft}
              onClick={restoreDraft}
            >
              Restore Saved Draft
            </Button>
            {saveMessage ? (
              <p className="text-sm font-semibold text-[var(--emerald)]">
                {saveMessage}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {storedDraft ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Retrieved draft</CardTitle>
            <CardDescription>
              Last saved{" "}
              {storedDraft.saved_at
                ? new Date(storedDraft.saved_at).toLocaleString()
                : "locally"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <SummaryItem label="Mode" value={storedDraft.mode} />
              <SummaryItem label="Brand" value={storedDraft.brand} />
              <SummaryItem label="Platform" value={storedDraft.platform} />
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none">
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No local draft is saved yet. Complete the required fields and save
              a draft to make it available to the next workflow step.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[var(--text-subtle)]">{label}</span>
      {children}
      {error ? <span className="block text-sm text-[var(--crimson)]">{error}</span> : null}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-[var(--ink)]">{value || "Not set"}</dd>
    </div>
  );
}

function readStoredDraft() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(draftKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as CreateDraft;
  } catch {
    window.localStorage.removeItem(draftKey);
    return null;
  }
}
