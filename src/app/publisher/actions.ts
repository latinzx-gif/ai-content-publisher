"use server";

import { redirect } from "next/navigation";
import { getPublisherGoogleLoginConfig } from "@/lib/publisher/google-login-oauth";
import { createClient } from "@/lib/publisher/supabase/server";

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

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: publisherAuthCallbackUrl(),
      shouldCreateUser: true,
    },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/publisher/login");
}
