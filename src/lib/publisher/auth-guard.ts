// Session guard for publisher Server Actions (audit C3).
// Every exported function in a "use server" module is a public HTTP endpoint
// (POST + Next-Action header) — middleware only gates /publisher page
// navigation, so each action must verify the caller's session itself.

import { isServerApiAuthBypassEnabled } from "@/lib/auth-bypass";
import { createClient } from "@/lib/publisher/supabase/server";

export async function hasPublisherSession(): Promise<boolean> {
  if (isServerApiAuthBypassEnabled()) return true;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user !== null;
}

export async function requirePublisherSession(): Promise<void> {
  if (!(await hasPublisherSession())) {
    throw new Error("Unauthorized: sign in to use this action.");
  }
}
