import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangePublisherGoogleAuthorizationCode } from "@/lib/publisher/google-login-oauth";
import { signInPublisherWithGoogleProfile } from "@/lib/publisher/google-login-session";
import { clearOAuthCookie, readOAuthCookie } from "@/lib/publishing/oauth-routes";

function loginRedirect(origin: string, message: string) {
  const loginUrl = new URL("/publisher/login", origin);
  loginUrl.searchParams.set("error", "auth_failed");
  loginUrl.searchParams.set("message", message.slice(0, 240));
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  const storedState = await readOAuthCookie("publisher_google_oauth_state");

  await clearOAuthCookie("publisher_google_oauth_state");

  if (oauthError) {
    return loginRedirect(origin, oauthError);
  }

  if (!code) {
    return loginRedirect(origin, "Missing Google authorization code.");
  }

  if (!state || !storedState || state !== storedState) {
    return loginRedirect(origin, "Invalid Google OAuth state.");
  }

  try {
    const profile = await exchangePublisherGoogleAuthorizationCode(code);
    await signInPublisherWithGoogleProfile(profile);
    return NextResponse.redirect(new URL("/publisher", origin));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed.";
    return loginRedirect(origin, message);
  }
}
