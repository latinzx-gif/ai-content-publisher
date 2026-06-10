"use client";

import { useState } from "react";
import { Button } from "@/components/publisher/ui/button";
import { Input } from "@/components/publisher/ui/input";
import { signIn } from "@/app/publisher/actions";

export default function PublisherLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const result = await signIn(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-[var(--radius)] border border-[var(--line-warm)] bg-[var(--paper)] p-8 shadow-[var(--shadow)]">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[var(--navy)]">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Magic link to your email — Content OS publisher
          </p>
        </div>

        {sent ? (
          <div className="rounded-[calc(var(--radius)*0.6)] bg-[var(--emerald-soft)] px-4 py-3 text-sm font-semibold text-[var(--emerald)]">
            Check your email — a sign-in link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[var(--text-subtle)]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error ? (
              <p className="text-sm font-semibold text-[var(--danger,red)]">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
