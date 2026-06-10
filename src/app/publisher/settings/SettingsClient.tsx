"use client";

import { useState } from "react";
import { Badge } from "@/components/publisher/ui/badge";
import { Button } from "@/components/publisher/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import { testBufferConnection } from "./actions";

type EnvStatus = {
  openai: boolean;
  buffer: boolean;
  supabase: boolean;
};

export default function SettingsClient({ status }: { status: EnvStatus }) {
  const [bufferTestResult, setBufferTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function handleTestBuffer() {
    setTesting(true);
    setBufferTestResult(null);
    try {
      const result = await testBufferConnection();
      if (result.ok) {
        setBufferTestResult(`Connected — ${result.profiles} profile(s) found.`);
      } else {
        setBufferTestResult(`Failed: ${result.error}`);
      }
    } catch {
      setBufferTestResult("Test failed — check console.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Settings</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          API connection status for this environment. Keys are read from{" "}
          <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs">.env.local</code>{" "}
          — edit that file to update credentials.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="OpenAI"
          envKey="OPENAI_API_KEY"
          connected={status.openai}
          description="Used for brief generation, content drafting, QC, and DALL-E image generation."
        />

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle>Buffer</CardTitle>
              <StatusBadge connected={status.buffer} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Used for publishing and scheduling posts. Set{" "}
              <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs">
                BUFFER_ACCESS_TOKEN
              </code>{" "}
              and optionally{" "}
              <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs">
                BUFFER_PROFILE_ID
              </code>
              .
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestBuffer}
              disabled={testing}
            >
              {testing ? "Testing…" : "Test Connection"}
            </Button>
            {bufferTestResult ? (
              <p
                className={`text-sm font-semibold ${
                  bufferTestResult.startsWith("Connected")
                    ? "text-[var(--success-ink)]"
                    : "text-[var(--danger-ink)]"
                }`}
              >
                {bufferTestResult}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <StatusCard
          title="Supabase"
          envKey="NEXT_PUBLIC_SUPABASE_URL"
          connected={status.supabase}
          description="Database for all post data, audit logs, and image records."
        />
      </div>

      <Card>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--navy)]">Phase 1 note:</strong> Credential management
            via UI is not available in Phase 1. Edit{" "}
            <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5 text-xs">.env.local</code>{" "}
            directly and restart the dev server to apply changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({
  connected,
  description,
  envKey,
  title,
}: {
  connected: boolean;
  description: string;
  envKey: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <StatusBadge connected={connected} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <code className="block rounded bg-[var(--surface-muted)] px-2 py-1 text-xs">
          {envKey}
        </code>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge className="bg-[var(--success-soft)] text-[var(--success-ink)]">Connected</Badge>
  ) : (
    <Badge className="bg-[var(--danger-soft)] text-[var(--danger-ink)]">Not set</Badge>
  );
}
