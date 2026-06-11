"use server";

import { redirect } from "next/navigation";
import { getPublisherGoogleLoginConfig } from "@/lib/publisher/google-login-oauth";
import { createClient } from "@/lib/publisher/supabase/server";
import { isEmailAllowedToRegister } from "@/lib/server/authAccounts";

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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/publisher/login");
}
