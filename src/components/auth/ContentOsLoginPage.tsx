'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { signIn, signInInstantly, signInWithGoogle } from '@/app/publisher/actions';
import { createClient } from '@/lib/publisher/supabase/client';

// NODE_ENV is inlined at build time — the instant sign-in button never ships
// in a production build (the server action is independently gated too).
const instantSignInEnabled = process.env.NODE_ENV !== 'production';

const pipelineSteps = [
  { step: '01', title: 'Brief & sources', detail: 'RAG + Drive + official links' },
  { step: '02', title: 'Draft & review', detail: 'Agents draft, humans approve' },
  { step: '03', title: 'Publish & audit', detail: 'Facebook schedule + logs' },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function ContentOsLoginPage() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const authMessage = searchParams.get('message');
  const orbRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (authError !== 'auth_failed') {
      return null;
    }
    return authMessage ?? 'Sign-in failed or expired. Try again.';
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash.includes('access_token=')) {
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) {
        return;
      }

      if (sessionError) {
        setLoading(false);
        setError(sessionError.message);
        return;
      }

      window.location.replace('/');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const orb = orbRef.current;
      if (!orb) {
        return;
      }
      orb.style.transform = `translate(${event.clientX * 0.08}px, ${event.clientY * 0.08}px)`;
    }

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const result = await signIn(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  async function handleInstantSignIn() {
    if (!email.trim()) {
      setError('กรอกอีเมลก่อน แล้วกดเข้าระบบทันที');
      return;
    }

    setInstantLoading(true);
    setError(null);
    setNotice(null);

    const result = await signInInstantly(email.trim());

    if (result.error) {
      setInstantLoading(false);
      setError(result.error);
      return;
    }

    window.location.assign('/');
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    setNotice(null);

    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setGoogleLoading(false);
      return;
    }

    if (result.url) {
      window.location.assign(result.url);
    }
  }

  return (
    <div className="content-os-auth">
      <div className="cos-page-bg" aria-hidden />
      <div ref={orbRef} className="cos-orb fixed left-[10%] top-[18%] -z-0" aria-hidden />

      <div className="cos-shell">
        <header className="cos-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#630ed4] text-white shadow-lg shadow-violet-500/20">
              <span className="material-symbols-outlined filled text-[22px]">auto_awesome</span>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-[var(--cos-primary)]">Content OS</p>
              <p className="text-xs text-[var(--cos-on-surface-variant)]">AI publishing pipeline</p>
            </div>
          </div>
          <div className="hidden items-center gap-5 sm:flex">
            <a className="text-sm font-medium text-[var(--cos-on-surface-variant)] transition hover:text-[var(--cos-primary)]" href="#">
              Documentation
            </a>
            <a className="text-sm font-medium text-[var(--cos-on-surface-variant)] transition hover:text-[var(--cos-primary)]" href="#">
              Status
            </a>
          </div>
        </header>

        <div className="cos-split">
          <section className="cos-hero">
            <div className="cos-hero-panel cos-animate-in">
              <div className="cos-hero-glow -left-10 top-0 h-40 w-40 bg-violet-400/30" />
              <div className="cos-hero-glow bottom-0 right-0 h-52 w-52 bg-indigo-300/25" />

              <div className="relative">
                <span className="cos-pill">
                  <span className="material-symbols-outlined filled text-[14px]">bolt</span>
                  Built for content teams
                </span>

                <h1 className="mt-5 max-w-lg text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--cos-on-surface)] sm:text-[2.5rem]">
                  Publish faster with
                  <span className="block bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent">
                    review-ready AI workflows
                  </span>
                </h1>

                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--cos-on-surface-variant)]">
                  จาก brief ถึง Facebook schedule ในที่เดียว — พร้อม audit trail, compliance review และ magic-link sign-in ที่ปลอดภัย
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: '4×', label: 'Faster handoff' },
                    { value: 'Live', label: 'Facebook publish' },
                    { value: '100%', label: 'Audit logged' },
                  ].map((item) => (
                    <div key={item.label} className="cos-stat">
                      <div className="text-xl font-bold text-[var(--cos-primary-container)]">{item.value}</div>
                      <div className="mt-1 text-xs text-[var(--cos-on-surface-variant)]">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-2.5">
                  <p className="cos-label text-[var(--cos-outline)]">Pipeline preview</p>
                  {pipelineSteps.map((item, index) => (
                    <div key={item.step} className="cos-pipeline-step cos-float" style={{ animationDelay: `${index * 0.35}s` }}>
                      <div className="cos-step-dot">{item.step}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--cos-on-surface)]">{item.title}</div>
                        <div className="text-xs text-[var(--cos-on-surface-variant)]">{item.detail}</div>
                      </div>
                      <span className="material-symbols-outlined ml-auto text-[18px] text-[var(--cos-primary-container)]">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="cos-auth-panel">
            <div className="cos-glass-card cos-animate-in p-6 sm:p-8">
              <div className="text-center lg:text-left">
                <p className="cos-label text-[var(--cos-outline)]">Get started</p>
                <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.02em] text-[var(--cos-on-surface)]">
                  Sign in or create account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--cos-on-surface-variant)]">
                  ครั้งแรกจะสร้างบัญชีให้อัตโนมัติ — ใช้ Gmail หรือ magic link ได้เลย ไม่ต้องตั้งรหัสผ่าน
                </p>
              </div>

              <div className="mt-8">
                {sent ? (
                  <div className="cos-success-card">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <span className="material-symbols-outlined text-[32px] text-[var(--cos-primary-container)]">
                        mark_email_read
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[var(--cos-on-surface)]">Check your inbox</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--cos-on-surface-variant)]">
                      Magic link sent to{' '}
                      <span className="font-mono text-sm font-semibold text-[var(--cos-on-surface)]">{email}</span>
                    </p>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label className="cos-label text-[var(--cos-on-surface-variant)]" htmlFor="email">
                        Work email
                      </label>
                      <input
                        className="cos-input"
                        id="email"
                        name="email"
                        placeholder="name@company.com"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {error ? (
                      <p className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>
                    ) : null}

                    <button className="cos-btn-primary" disabled={loading || instantLoading} type="submit">
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                          <span>Sending link…</span>
                        </>
                      ) : (
                        <>
                          <span>Email me a magic link</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>

                    {instantSignInEnabled ? (
                      <button
                        className="cos-btn-outline"
                        disabled={loading || instantLoading}
                        onClick={handleInstantSignIn}
                        type="button"
                      >
                        {instantLoading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            <span>Signing in…</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px]">bolt</span>
                            <span>เข้าระบบทันที (dev — ไม่ส่งเมล)</span>
                          </>
                        )}
                      </button>
                    ) : null}
                  </form>
                )}
              </div>

              <div className="relative my-7 flex items-center">
                <div className="flex-grow border-t border-[var(--cos-outline-variant)]/35" />
                <span className="mx-4 cos-label text-[var(--cos-outline)]/70">or continue with</span>
                <div className="flex-grow border-t border-[var(--cos-outline-variant)]/35" />
              </div>

              <div className="space-y-3">
                <button
                  className="cos-btn-outline"
                  disabled={googleLoading || loading}
                  onClick={handleGoogleSignIn}
                  type="button"
                >
                  {googleLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      <span>Redirecting to Google…</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Sign up / Sign in with Google</span>
                    </>
                  )}
                </button>
                <button
                  className="cos-btn-outline"
                  onClick={() => setNotice('SAML SSO is planned for enterprise rollout.')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">terminal</span>
                  <span>Single Sign-On (SAML)</span>
                </button>
                {notice ? (
                  <p className="rounded-lg bg-[var(--cos-surface-container-low)] px-3 py-2 text-center text-xs text-[var(--cos-on-surface-variant)]">
                    {notice}
                  </p>
                ) : null}
              </div>

              <p className="mt-7 text-center text-sm text-[var(--cos-on-surface-variant)] lg:text-left">
                Need strategy dashboard?{' '}
                <Link className="font-semibold text-[var(--cos-primary)] hover:underline" href="/">
                  Open Head Office PRD
                </Link>
              </p>
            </div>
          </section>
        </div>

        <footer className="cos-footer">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <span className="text-lg font-bold text-[var(--cos-primary)]">Content OS</span>
            <span className="text-sm text-[var(--cos-on-surface-variant)]">© 2026 Content OS · AI-powered publishing</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {['Privacy', 'Terms', 'Help', 'Security'].map((item) => (
              <a
                key={item}
                className="text-sm text-[var(--cos-on-surface-variant)] transition hover:text-[var(--cos-primary)]"
                href="#"
              >
                {item}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
