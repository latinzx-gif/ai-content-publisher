"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

/** Shape of a support contact record */
export interface SupportContact {
  id: string;
  client_id: string;
  line_user_id: string;
  display_name: string | null;
  org_code: string | null;
  created_at: string;
}

/** Slim shape returned for the LIFF /me endpoint */
export interface BoundContact {
  client_id: string;
  client_name: string;
  slug: string;
}

/**
 * Bind a LINE user to a client.
 *
 * Creates a new row in `aas_support_contacts`. If a binding already exists
 * for the given `lineUserId`, it updates the existing row instead.
 *
 * @returns An object containing the bound client's id and display name.
 */
export async function bindContact(
  lineUserId: string,
  clientId: string,
  displayName?: string,
): Promise<{ client_id: string; client_name: string }> {
  const supabase = await createSupabaseServiceClient();

  // ── Resolve client name ───────────────────────────────────────────
  const { data: client } = await supabase
    .from("aas_clients")
    .select("name")
    .eq("id", clientId)
    .single();

  if (!client) {
    throw new Error("Client not found");
  }

  // ── Check for existing binding → update ──────────────────────────
  const { data: existing } = await supabase
    .from("aas_support_contacts")
    .select("id")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("aas_support_contacts")
      .update({
        client_id: clientId,
        display_name: displayName ?? null,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("bindContact update error:", updateError);
      throw new Error(`Failed to update contact: ${updateError.message}`);
    }

    return { client_id: clientId, client_name: client.name };
  }

  // ── No existing binding → insert ─────────────────────────────────
  const { error: insertError } = await supabase
    .from("aas_support_contacts")
    .insert({
      client_id: clientId,
      line_user_id: lineUserId,
      display_name: displayName ?? null,
      org_code: null,
    });

  if (insertError) {
    console.error("bindContact insert error:", insertError);
    throw new Error(`Failed to create contact: ${insertError.message}`);
  }

  return { client_id: clientId, client_name: client.name };
}

/**
 * Look up the bound contact for a given LINE user ID.
 *
 * Performs a manual two-step lookup (contact → client) to avoid
 * relying on Supabase's foreign-key join syntax which can behave
 * inconsistently across versions.
 *
 * @returns The bound client info, or `null` if no binding exists.
 */
export async function getContactByLineUserId(
  lineUserId: string,
): Promise<BoundContact | null> {
  const supabase = await createSupabaseServiceClient();

  // Step 1 — find the contact row
  const { data: contact, error: contactError } = await supabase
    .from("aas_support_contacts")
    .select("client_id")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (contactError) {
    console.error("getContactByLineUserId error:", contactError);
    throw new Error(`Failed to fetch contact: ${contactError.message}`);
  }

  if (!contact) return null;

  // Step 2 — resolve client name + slug
  const { data: client, error: clientError } = await supabase
    .from("aas_clients")
    .select("name, slug")
    .eq("id", contact.client_id)
    .single();

  if (clientError || !client) {
    console.error("getContactByLineUserId — client lookup error:", clientError);
    return null;
  }

  return {
    client_id: contact.client_id,
    client_name: client.name,
    slug: client.slug,
  };
}
