"use server";

import { redirect } from "next/navigation";
import { getPublisherGoogleLoginConfig } from "@/lib/publisher/google-login-oauth";
import { createClient } from "@/lib/publisher/supabase/server";
import {
  createAuthAccountClient,
  findAuthUserByEmail,
  isEmailAllowedToRegister,
  normalizeAuthEmail,
  provisionWorkspaceUser,
} from "@/lib/server/authAccounts";

function publisherAuthCallbackUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  return `${siteUrl.replace(/\/$/, "")}/publisher/auth/callback`;
}

export async function signInWithGoogle(): Promise<{ error?: string; url?: string }> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const config = getPublisherGoogleLoginConfig();

  if (!config.configured) {
    return {
      error: [
        "Google login is not configured yet.",
        "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, then restart npm run dev.",
        `Google Cloud redirect URI: ${config.redirectUri}`,
      ].join(" "),
    };
  }

  return { url: `${siteUrl}/api/publisher/auth/google/authorize` };
}

export async function signIn(
  email: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Audit C1: magic link must not open-register arbitrary emails — only
  // allowlisted addresses may create a new account; everyone else can only
  // sign in to an existing one.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: publisherAuthCallbackUrl(),
      shouldCreateUser: isEmailAllowedToRegister(email),
    },
  });

  if (error) {
    if (/rate limit/i.test(error.message)) {
      return {
        error:
          "ส่งอีเมลครบโควต้าชั่วโมงนี้แล้ว (Supabase built-in email จำกัด ~2 ฉบับ/ชม.) — รอประมาณ 1 ชั่วโมงแล้วลองใหม่ หรือให้ทีมรัน: node scripts/dev-magic-link.mjs <email> เพื่อรับลิงก์โดยไม่ต้องส่งเมล",
      };
    }
    return { error: error.message };
  }
  return {};
}

/**
 * Dev-only instant sign-in: mints a magic-link token via the admin API and
 * consumes it server-side immediately — no email is sent, so Supabase's
 * built-in ~2 emails/hour limit never applies. Hard-disabled in production
 * (this is a public Server Action endpoint; the NODE_ENV gate is the guard).
 */
export async function signInInstantly(email: string): Promise<{ error?: string }> {
  if (process.env.NODE_ENV === "production") {
    return { error: "Instant sign-in is available in development only." };
  }

  const normalized = normalizeAuthEmail(email);
  if (!normalized) {
    return { error: "Enter an email address." };
  }

  try {
    const admin = createAuthAccountClient();
    let user = await findAuthUserByEmail(admin, normalized);

    if (!user) {
      // Same registration rule as magic link (audit C1): only allowlisted
      // emails may create a new account.
      if (!isEmailAllowedToRegister(normalized)) {
        return {
          error: "ไม่พบบัญชีนี้ และอีเมลไม่อยู่ใน AUTH_ALLOWED_EMAILS จึงสร้างบัญชีใหม่ไม่ได้",
        };
      }

      const { data, error } = await admin.auth.admin.createUser({
        email: normalized,
        email_confirm: true,
        user_metadata: { createdBy: "publisher-dev-instant-sign-in" },
      });
      if (error || !data.user) {
        return { error: error?.message ?? "Unable to create account." };
      }
      user = data.user;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
      options: { redirectTo: publisherAuthCallbackUrl() },
    });
    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      return { error: linkError?.message ?? "Unable to mint a sign-in token." };
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });
    if (verifyError) {
      return { error: verifyError.message };
    }

    // The normal /publisher/auth/callback provisioning is skipped here, so
    // make sure profile + team membership exist (required by acp_ RLS).
    await provisionWorkspaceUser(user);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Instant sign-in failed." };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/publisher/login");
}
