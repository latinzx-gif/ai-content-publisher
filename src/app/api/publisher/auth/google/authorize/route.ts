import { NextResponse } from "next/server";
import {
  buildPublisherGoogleAuthorizeUrl,
  getPublisherGoogleLoginConfig,
} from "@/lib/publisher/google-login-oauth";
import { createOAuthState } from "@/lib/publishing/oauth-state";
import { setOAuthCookie } from "@/lib/publishing/oauth-routes";

export async function GET() {
  const config = getPublisherGoogleLoginConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const loginUrl = new URL("/publisher/login", siteUrl);

  if (!config.configured) {
    loginUrl.searchParams.set("error", "auth_failed");
    loginUrl.searchParams.set(
      "message",
      `Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local. Google redirect URI: ${config.redirectUri}`
    );
    return NextResponse.redirect(loginUrl);
  }

  const state = createOAuthState();
  await setOAuthCookie("publisher_google_oauth_state", state);

  return NextResponse.redirect(buildPublisherGoogleAuthorizeUrl(state));
}
