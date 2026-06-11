const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const GOOGLE_LOGIN_SCOPES = ["openid", "email", "profile"].join(" ");

export type PublisherGoogleProfile = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export function getPublisherGoogleLoginConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "http://localhost:3001";
  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/publisher/auth/google/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret),
  };
}

export function buildPublisherGoogleAuthorizeUrl(state: string) {
  const { clientId, redirectUri, configured } = getPublisherGoogleLoginConfig();
  if (!configured || !clientId) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_LOGIN_SCOPES,
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account",
    state,
  });

  return `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangePublisherGoogleAuthorizationCode(code: string): Promise<PublisherGoogleProfile> {
  const { clientId, clientSecret, redirectUri, configured } = getPublisherGoogleLoginConfig();
  if (!configured || !clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? `Google token exchange failed (${response.status}).`
    );
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${payload.access_token}` },
  });
  const profile = (await profileResponse.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    error?: { message?: string };
  };

  if (!profileResponse.ok) {
    throw new Error(profile.error?.message ?? `Google userinfo failed (${profileResponse.status}).`);
  }

  if (!profile.email || !profile.id) {
    throw new Error("Google account email was not returned.");
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email,
    picture: profile.picture,
  };
}
