'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { signIn } from '@/app/publisher/actions';

export function PublisherSignInPanel() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === 'auth_failed' ? 'Magic link expired or invalid. Request a new link.' : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  return (
    <div>
      {sent ? (
        <div className="flux-alert-success px-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(137,206,255,0.3)] bg-[rgba(0,52,78,0.4)] text-[var(--flux-secondary)]">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--flux-on-surface)]">Check your inbox</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--flux-on-surface-variant)]">
            We sent a magic link to{' '}
            <span className="flux-code-sm font-semibold text-[var(--flux-secondary)]">{email}</span>. Open it on this
            device to enter Content OS.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="flux-label-caps mb-2 block text-[var(--flux-outline)]">Work email</span>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              className="flux-input disabled:opacity-60"
            />
          </label>

          {error ? <p className="flux-alert-error px-3 py-2.5 text-xs font-medium">{error}</p> : null}

          <button type="submit" disabled={loading} className="flux-btn-primary h-11 w-full">
            <Send className="h-4 w-4" />
            {loading ? 'Sending link…' : 'Send magic link'}
          </button>
        </form>
      )}

      <div className="flux-alert-neutral mt-5 px-3 py-3 text-xs leading-relaxed">
        Passwordless sign-in for the publishing pipeline — create, review, schedule, and audit posts without a separate
        PRD password.
      </div>
    </div>
  );
}
