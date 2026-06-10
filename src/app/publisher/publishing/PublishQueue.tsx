"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/publisher/ui/badge";
import { Button } from "@/components/publisher/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import { Input } from "@/components/publisher/ui/input";
import { getAllPostSummaries, type PostSummary } from "@/lib/publisher/calendar-data";
import type { GeneratedContent } from "@/lib/publisher/content-generator";
import type { FacebookPublishMode } from "@/lib/publisher/facebook-publisher";
import { publishPost, retryPost, schedulePost } from "@/lib/publisher/publish-router";
import type { BufferResult } from "@/lib/publisher/buffer-publisher";
import { getAuditLogs, getPostContent } from "@/lib/publisher/db";
import type { AcpAuditLog } from "@/lib/publisher/supabase/types";

type PublishActionResult = BufferResult & { schedule_id?: string; post_id?: string };

export default function PublishQueue({
  facebookMode,
}: {
  facebookMode: FacebookPublishMode;
}) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const all = await getAllPostSummaries();
    setPosts(
      all.filter(
        (post) =>
          ["approved", "scheduled", "failed"].includes(post.status) &&
          post.platform.toLowerCase().includes("facebook")
      )
    );
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh().finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function publish(post: PostSummary) {
    const content = await readContent(post.post_id);
    const result = await publishPost(post.post_id, content, post.platform);
    afterAction(post.post_id, result);
    await refresh();
  }

  async function schedule(post: PostSummary) {
    const content = await readContent(post.post_id);
    const result = await schedulePost(
      post.post_id,
      content,
      scheduledAt[post.post_id] || "",
      post.platform
    );
    afterAction(post.post_id, result);
    await refresh();
  }

  async function retry(post: PostSummary) {
    const result = await retryPost(post.post_id, post.platform);
    afterAction(post.post_id, result);
    await refresh();
  }

  function afterAction(postId: string, result: PublishActionResult) {
    const label = result.mock ? " [mock]" : "";
    setMessages((current) => ({
      ...current,
      [postId]: result.success
        ? `${result.publish_id || result.schedule_id || "Saved."}${label}`
        : result.error || "Publish failed.",
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Publishing</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Facebook-only publishing queue. Approved Facebook posts can be scheduled directly to your connected Page; posts for other platforms do not appear here while the Buffer integration is paused.
        </p>
      </div>

      {facebookMode === "live" ? (
        <div className="flex items-center gap-3 rounded-[calc(var(--radius)*0.55)] border border-[var(--emerald-soft)] bg-[var(--emerald-soft)] px-4 py-3">
          <span className="text-lg" aria-hidden>✅</span>
          <p className="text-sm font-semibold text-[var(--emerald)]">
            Facebook Page connected — live schedule is enabled for Facebook posts.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[calc(var(--radius)*0.55)] border border-[var(--warning-line,var(--line))] bg-[var(--warning-soft)] px-4 py-3">
          <span className="text-lg" aria-hidden>⚠️</span>
          <p className="text-sm font-semibold text-[var(--warning-ink)]">
            Facebook mock mode — connect Facebook in Settings before scheduling live posts.
          </p>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">Loading approved posts...</p>
          </CardContent>
        </Card>
      ) : posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.post_id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{post.headline}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{post.post_id}</p>
                  </div>
                  <Badge className="bg-[var(--info-soft)] text-[var(--info-ink)]">{post.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-[calc(var(--radius)*0.55)] bg-[var(--surface-muted)] p-4 text-sm md:grid-cols-2">
                  <p><strong>Primary:</strong> Main Post</p>
                  <p><strong>Secondary:</strong> First Comment (manual action on platform)</p>
                  <p><strong>Platform:</strong> {post.platform}</p>
                  <p><strong>Scheduled:</strong> {post.scheduled_at || "Not scheduled"}</p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <Button type="button" onClick={() => publish(post)}>Publish Now</Button>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-[var(--text-subtle)]">
                      Schedule date and time
                    </span>
                    <Input
                      className="w-full sm:w-60"
                      type="datetime-local"
                      value={scheduledAt[post.post_id] || ""}
                      onChange={(event) =>
                        setScheduledAt((current) => ({
                          ...current,
                          [post.post_id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <Button type="button" variant="outline" onClick={() => schedule(post)}>
                    Schedule
                  </Button>
                  {post.status === "failed" ? (
                    <Button type="button" variant="outline" onClick={() => retry(post)}>
                      Retry
                    </Button>
                  ) : null}
                </div>
                {messages[post.post_id] ? (
                  <p className="text-sm font-semibold text-[var(--emerald)]">
                    {messages[post.post_id]}
                  </p>
                ) : null}
                <PublishLogs postId={post.post_id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No approved Facebook posts in the queue. Approve a Facebook post in Review first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PublishLogs({ postId }: { postId: string }) {
  const [logs, setLogs] = useState<AcpAuditLog[]>([]);

  useEffect(() => {
    getAuditLogs({ type: "publish", postId }).then(setLogs);
  }, [postId]);

  return logs.length ? (
    <div className="rounded-[calc(var(--radius)*0.55)] border border-[var(--line)]">
      {logs.map((log) => (
        <div className="border-t border-[var(--line)] p-3 text-sm first:border-t-0" key={log.id}>
          <p className="font-bold text-[var(--navy)]">{log.action} · {log.status}</p>
          <p className="text-[var(--text-muted)]">{log.created_at}</p>
          <p className="mt-1 text-[var(--text-subtle)]">{log.details}</p>
        </div>
      ))}
    </div>
  ) : null;
}

async function readContent(postId: string): Promise<GeneratedContent | null> {
  const row = await getPostContent(postId);
  return (row?.content as GeneratedContent | null) ?? null;
}
