"use server";

import { getPublishingConnectionsStatus } from "@/lib/publishing/publishing-connection-status";
import { disconnectProvider } from "@/lib/publishing/integration-connection-store";
import { createClient } from "@/lib/publisher/supabase/server";
import type { PublishingConnectionsStatus } from "@/lib/publishing/publishing-connection-status";

export type ConnectionTestResult = {
  ok: boolean;
  profiles?: number;
  error?: string;
};

export async function testBufferConnection(): Promise<ConnectionTestResult> {
  const status = await getPublishingConnectionsStatus();

  if (!status.bufferConfigured) {
    return { ok: false, error: "BUFFER_ACCESS_TOKEN is not set in .env.local" };
  }

  if (!status.bufferOk) {
    return { ok: false, error: status.bufferError ?? "Buffer connection failed." };
  }

  return { ok: true, profiles: status.facebookProfiles.length };
}

export async function loadPublishingConnectionStatus(): Promise<PublishingConnectionsStatus> {
  return getPublishingConnectionsStatus();
}

export async function disconnectPublishingProvider(provider: "buffer" | "facebook") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in required before disconnecting integrations.");
  }

  await disconnectProvider(provider);
}
