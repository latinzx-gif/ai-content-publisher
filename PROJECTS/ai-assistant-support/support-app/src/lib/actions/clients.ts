"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ActiveClient, Client } from "@/lib/schemas/client";

/**
 * Fetch all active clients from the aas_clients table.
 * Used by the LIFF API endpoint for dropdown selectors.
 * Returns only id, name, and slug.
 */
export async function getActiveClients(): Promise<ActiveClient[]> {
  const supabase = await createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("aas_clients")
    .select("id, name, slug")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getActiveClients error:", error);
    throw new Error(`Failed to fetch active clients: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetch all clients for the admin registry page.
 * Includes full detail: id, name, slug, active, created_at.
 */
export async function getClients(): Promise<
  Pick<Client, "id" | "name" | "slug" | "active" | "created_at">[]
> {
  const supabase = await createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("aas_clients")
    .select("id, name, slug, active, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("getClients error:", error);
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  return data ?? [];
}