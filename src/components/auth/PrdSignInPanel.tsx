'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

const LOGIN_EMAIL_STORAGE_KEY = 'prd_login_email';
const LOGIN_PASSWORD_STORAGE_KEY = 'prd_login_password';
const LOGIN_REMEMBER_STORAGE_KEY = 'prd_login_remember_email';
const API_TOKEN_STORAGE_KEY = 'prd_api_bearer_token';

function getStoredRememberCredentials() {
  if (typeof window === 'undefined') {
    return true;
  }
  return window.localStorage.getItem(LOGIN_REMEMBER_STORAGE_KEY) !== 'false';
}

function getStoredCredential(key: string) {
  if (typeof window === 'undefined' || !getStoredRememberCredentials()) {
    return '';
  }
  return window.localStorage.getItem(key) ?? '';
}

export function PrdSignInPanel() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState(() => getStoredCredential(LOGIN_EMAIL_STORAGE_KEY));
  const [password, setPassword] = useState(() => getStoredCredential(LOGIN_PASSWORD_STORAGE_KEY));
  const [displayName, setDisplayName] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(() => getStoredRememberCredentials());
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY);
    if (storedToken) {
      router.replace('/');
    }
  }, [router]);

  const runAuth = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setMessage('Please enter email and password.');
      return;
    }

    if (authMode === 'sign-up' && trimmedPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setIsSigningIn(true);
    setMessage(authMode === 'sign-up' ? 'Creating account...' : 'Signing in...');

    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          displayName: trimmedDisplayName || undefined,
        }),
      });
      const payload = (await response.json()) as { accessToken?: string; error?: string };

      if (!response.ok || !payload.accessToken) {
        setMessage(payload.error || (authMode === 'sign-up' ? 'Sign up failed.' : 'Sign in failed.'));
        return;
      }

      if (rememberCredentials) {
        window.localStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, trimmedEmail);
        window.localStorage.setItem(LOGIN_PASSWORD_STORAGE_KEY, trimmedPassword);
      } else {
        window.localStorage.removeItem(LOGIN_EMAIL_STORAGE_KEY);
        window.localStorage.removeItem(LOGIN_PASSWORD_STORAGE_KEY);
      }

      window.localStorage.setItem(LOGIN_REMEMBER_STORAGE_KEY, rememberCredentials ? 'true' : 'false');
      window.sessionStorage.setItem(API_TOKEN_STORAGE_KEY, payload.accessToken);
      setMessage(authMode === 'sign-up' ? 'Account created. Loading dashboard...' : 'Sign in successful. Loading dashboard...');
      router.replace('/');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : authMode === 'sign-up'
            ? 'Unable to sign up.'
            : 'Unable to sign in.'
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [authMode, displayName, email, password, rememberCredentials, router]);

  const messageTone =
    message.includes('successful') || message.includes('created')
      ? 'flux-alert-success'
      : message.includes('Please enter') || message.includes('failed') || message.includes('Unable') || message.includes('must be')
        ? 'flux-alert-error'
        : 'flux-alert-neutral';

  return (
    <div>
      <div className="flux-segment">
        <button
          type="button"
          data-active={authMode === 'sign-in'}
          onClick={() => {
            setAuthMode('sign-in');
            setMessage('');
          }}
          className="flux-segment-btn"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign in
        </button>
        <button
          type="button"
          data-active={authMode === 'sign-up'}
          onClick={() => {
            setAuthMode('sign-up');
            setMessage('');
          }}
          className="flux-segment-btn"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Sign up
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void runAuth();
        }}
        className="mt-5 space-y-4"
      >
        {authMode === 'sign-up' ? (
          <label className="block">
            <span className="flux-label-caps mb-2 block text-[var(--flux-outline)]">Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              type="text"
              autoComplete="name"
              className="flux-input"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="flux-label-caps mb-2 block text-[var(--flux-outline)]">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="username"
            className="flux-input"
          />
        </label>

        <label className="block">
          <span className="flux-label-caps mb-2 block text-[var(--flux-outline)]">Password</span>
          <div className="flux-input-shell">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="flux-input"
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-[var(--flux-radius-sm)] text-[var(--flux-outline)] hover:bg-white/10 hover:text-[var(--flux-on-surface)]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2.5 text-sm text-[var(--flux-on-surface-variant)]">
          <input
            type="checkbox"
            checked={rememberCredentials}
            onChange={(event) => setRememberCredentials(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--flux-outline-variant)] accent-[var(--flux-primary-container)]"
          />
          Remember email and password on this device
        </label>

        <button type="submit" disabled={isSigningIn} className="flux-btn-primary h-11 w-full">
          {isSigningIn
            ? authMode === 'sign-up'
              ? 'Creating account...'
              : 'Signing in...'
            : authMode === 'sign-up'
              ? 'Create account'
              : 'Sign in to PRD'}
        </button>
      </form>

      {message ? <p className={`mt-4 px-3 py-2.5 text-xs leading-relaxed ${messageTone}`}>{message}</p> : null}

      <button type="button" onClick={() => router.push('/')} className="flux-btn-ghost mt-5 h-10 w-full text-xs">
        Continue without signing in (limited demo mode)
      </button>
    </div>
  );
}
