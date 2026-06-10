"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Browser-side Supabase client (singleton via module scope).
// Use in Client Components ("use client") only.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
