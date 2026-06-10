"use client";

import { useState } from "react";

import {
  runQualityChecks,
  type QualityCheckResult,
  type QualityStatus,
} from "@/lib/publisher/quality-checker";
import { getPost, getPostContent, upsertPost } from "@/lib/publisher/db";
import { Badge } from "@/components/publisher/ui/badge";
import { Button } from "@/components/publisher/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/publisher/ui/card";
import { Input } from "@/components/publisher/ui/input";

export default function QualityChecker({
  initialPostId,
}: {
  initialPostId: string;
}) {
  const [postId, setPostId] = useState(initialPostId || createPostId());
  const [results, setResults] = useState<QualityCheckResult[]>([]);
  const [message, setMessage] = useState("");

  async function runChecks() {
    setMessage("Running checks…");
    try {
      const row = await getPostContent(postId);
      const content = row?.content ?? null;
      const rules = row?.rules ?? null;
      const results = await runQualityChecks(content, rules, postId);
      setResults(results);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Quality check failed.");
    }
  }

  async function saveResults() {
    if (!results.length) {
      setMessage("Run checks before saving.");
      return;
    }

    try {
      const existing = await getPost(postId);
      const existingMeta = (existing?.metadata ?? {}) as Record<string, unknown>;
      await upsertPost({
        post_id: postId,
        metadata: {
          ...existingMeta,
          qc: { results, saved_at: new Date().toISOString() },
        },
      });
      setMessage(`Quality check saved to ${postId}.`);
    } catch {
      setMessage("Failed to save QC results. Check console.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
          Quality Check
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Run seven mock checks against saved content and rules before review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QC inputs</CardTitle>
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
                setResults([]);
                setMessage("");
              }}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-3">
            <Button type="button" onClick={runChecks}>
              Run Checks
            </Button>
            <Button type="button" variant="outline" onClick={saveResults}>
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
          <CardTitle>Check results</CardTitle>
          <CardDescription>PASS, WARN, FAIL, and NOTE statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length ? (
            <div className="overflow-x-auto rounded-[calc(var(--radius)*0.55)] border border-[var(--line)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--surface-muted)] text-[var(--navy)]">
                  <tr>
                    <th className="w-56 px-4 py-3 font-black">Check</th>
                    <th className="w-28 px-4 py-3 font-black">Status</th>
                    <th className="px-4 py-3 font-black">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.check} className="border-t border-[var(--line)]">
                      <td className="px-4 py-3 font-bold text-[var(--navy)]">
                        {result.check}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={result.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-subtle)]">
                        {result.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">
              Run checks to populate the table.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: QualityStatus }) {
  const className = {
    pass: "bg-[var(--success-soft)] text-[var(--success-ink)]",
    warn: "bg-[var(--warning-soft)] text-[var(--warning-ink)]",
    fail: "bg-[var(--danger-soft)] text-[var(--danger-ink)]",
    note: "bg-[var(--info-soft)] text-[var(--info-ink)]",
  }[status];

  return <Badge className={className}>{status.toUpperCase()}</Badge>;
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
