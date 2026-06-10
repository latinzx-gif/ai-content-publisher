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

export default function LoginPage() {
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
      return;
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      setMessage(error instanceof Error ? error.message : authMode === 'sign-up' ? 'Unable to sign up.' : 'Unable to sign in.');
    } finally {
      setIsSigningIn(false);
    }
  }, [authMode, displayName, email, password, rememberCredentials, router]);

  return (
    <main className="min-h-dvh bg-[#f5f5f2] p-4 text-[#171717]">
      <div className="mx-auto mt-12 w-full max-w-md rounded-2xl border border-[#deded8] bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold">{authMode === 'sign-up' ? 'Create account' : 'Sign in'}</h1>
        <p className="mb-5 text-sm text-[#6e6e68]">Use your Head Office account to get live data for dashboard pages.</p>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-[#deded8] bg-[#f6f6f2] p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('sign-in');
              setMessage('');
            }}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md text-xs font-semibold ${
              authMode === 'sign-in' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68]'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('sign-up');
              setMessage('');
            }}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md text-xs font-semibold ${
              authMode === 'sign-up' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68]'
            }`}
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
          className="space-y-3"
        >
          {authMode === 'sign-up' ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#4f4f49]">Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                type="text"
                autoComplete="name"
                className="h-10 w-full rounded-lg border border-[#deded8] px-3 text-sm text-[#171717] outline-none"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#4f4f49]">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="username"
              className="h-10 w-full rounded-lg border border-[#deded8] px-3 text-sm text-[#171717] outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#4f4f49]">Password</span>
            <div className="flex items-center rounded-lg border border-[#deded8] px-3">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none"
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-md text-[#6e6e68] hover:bg-[#f6f6f2]"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#6e6e68]">
            <input
              type="checkbox"
              checked={rememberCredentials}
              onChange={(event) => setRememberCredentials(event.target.checked)}
              className="h-4 w-4"
            />
            Remember email + password
          </label>

          <button
            type="submit"
            disabled={isSigningIn}
            className="h-10 w-full rounded-lg border border-[#171717] bg-[#171717] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSigningIn ? (authMode === 'sign-up' ? 'Creating account...' : 'Signing in...') : authMode === 'sign-up' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {message ? <p className="mt-3 text-xs text-[#6e6e68]">{message}</p> : null}

        <div className="mt-5 border-t border-[#deded8] pt-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs font-medium text-[#4f4f49] hover:text-[#171717]"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
