"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/publisher/supabase/server";

export async function signIn(
  email: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/publisher/auth/callback` },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/publisher/login");
}
