import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { provisionWorkspaceUser } from "@/lib/server/authAccounts";
import { createClient } from "@/lib/publisher/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/publisher";
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    const loginUrl = new URL("/publisher/login", origin);
    loginUrl.searchParams.set("error", "auth_failed");
    loginUrl.searchParams.set("message", oauthError);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await provisionWorkspaceUser(user);
        } catch (provisionError) {
          console.error("[publisher/auth/callback] provisionWorkspaceUser failed", provisionError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    const loginUrl = new URL("/publisher/login", origin);
    loginUrl.searchParams.set("error", "auth_failed");
    loginUrl.searchParams.set("message", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(`${origin}/publisher/login?error=auth_failed`);
}
