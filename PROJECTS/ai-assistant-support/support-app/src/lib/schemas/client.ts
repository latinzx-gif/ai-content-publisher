/** Matches the aas_clients table schema. */
export interface Client {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  linear_project_id: string | null;
  repo_url: string | null;
}

/** Slim shape returned for dropdowns / LIFF endpoints. */
export type ActiveClient = Pick<Client, "id" | "name" | "slug">;
