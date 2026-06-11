import type { User } from "@supabase/supabase-js";
import {
  createAuthAccountClient,
  findAuthUserByEmail,
  normalizeAuthEmail,
  provisionWorkspaceUser,
} from "@/lib/server/authAccounts";
import { createClient } from "@/lib/publisher/supabase/server";
import type { PublisherGoogleProfile } from "@/lib/publisher/google-login-oauth";

function publisherAuthCallbackUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  return `${siteUrl.replace(/\/$/, "")}/publisher/auth/callback`;
}

async function ensureGoogleAuthUser(profile: PublisherGoogleProfile): Promise<User> {
  const admin = createAuthAccountClient();
  const email = normalizeAuthEmail(profile.email);
  const existingUser = await findAuthUserByEmail(admin, email);

  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: profile.name,
      name: profile.name,
      avatar_url: profile.picture,
      provider: "google",
      google_id: profile.id,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Unable to create Google account.");
  }

  return data.user;
}

export async function signInPublisherWithGoogleProfile(profile: PublisherGoogleProfile) {
  const user = await ensureGoogleAuthUser(profile);
  await provisionWorkspaceUser(user);

  const admin = createAuthAccountClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: normalizeAuthEmail(profile.email),
    options: {
      redirectTo: publisherAuthCallbackUrl(),
    },
  });

  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    throw new Error(error?.message ?? "Unable to start Google sign-in session.");
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (verifyError) {
    throw new Error(verifyError.message);
  }

  return user;
}
