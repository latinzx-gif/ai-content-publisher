"use client";

import { useState } from "react";

import { loadRules, type Rules } from "@/lib/publisher/rules-loader";
import { upsertPostContent } from "@/lib/publisher/db";
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

const languages = ["Thai", "English", "Chinese", "Japanese", "Korean"];
const platforms = ["Facebook", "Instagram", "LinkedIn", "Twitter/X", "TikTok", "Threads"];

export default function RulesLoader({ initialPostId }: { initialPostId: string }) {
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [brand, setBrand] = useState("Head Office");
  const [platform, setPlatform] = useState("Facebook");
  const [language, setLanguage] = useState("Thai");
  const [rules, setRules] = useState<Rules | null>(null);
  const [message, setMessage] = useState("");

  function handleLoadRules() {
    setRules(loadRules(brand, platform, language));
    setMessage("");
  }

  async function saveRules() {
    if (!rules) {
      setMessage("Load rules before saving.");
      return;
    }

    const payload = {
      post_id: postId,
      brand,
      platform,
      language,
      rules,
      saved_at: new Date().toISOString(),
    };

    try {
      await upsertPostContent({
        post_id: postId,
        rules: payload as unknown as Record<string, unknown>,
      });
      setMessage(`Rules saved to ${postId}.`);
    } catch {
      setMessage("Failed to save rules. Check console.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Rules</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Load brand, platform, legal, image, and language rules and attach
          them to the same post record used by the brief.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rule inputs</CardTitle>
          <CardDescription>
            Mock rules are selected by brand, platform, and language.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Post ID">
            <Input
              value={postId}
              onChange={(event) => setPostId(event.target.value)}
            />
          </Field>
          <Field label="Brand">
            <Select value={brand} onChange={(event) => setBrand(event.target.value)}>
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

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <Button type="button" onClick={handleLoadRules}>
              Load Rules
            </Button>
            <Button type="button" variant="outline" onClick={saveRules}>
              Save
            </Button>
            {message ? (
              <p className="text-sm font-semibold text-[var(--emerald)]">{message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {rules ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ReadOnlyList title="Brand voice" items={rules.brand_voice} />
          <ReadOnlyList title="Prohibited claims" items={rules.prohibited_claims} />
          <ReadOnlyObject title="Platform limits" values={rules.platform_limits} />
          <ReadOnlyObject title="Image style guide" values={rules.image_style_guide} />
          <ReadOnlyObject
            title="Language style guide"
            values={rules.language_style_guide}
          />
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No rules are loaded yet. Select the brand, platform, and language,
              then load rules before saving them to the post record.
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

function ReadOnlyList({ items, title }: { items: string[]; title: string }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-[var(--text-subtle)]">
          {items.map((item) => (
            <li key={item} className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ReadOnlyObject({
  title,
  values,
}: {
  title: string;
  values: Record<string, string>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          {Object.entries(values).map(([key, value]) => (
            <div key={key} className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-3">
              <dt className="font-bold capitalize text-[var(--navy)]">
                {key.replaceAll("_", " ")}
              </dt>
              <dd className="mt-1 text-[var(--text-subtle)]">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function createPostId() {
  return `post_${Date.now()}`;
}
