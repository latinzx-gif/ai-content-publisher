import { getClients } from "@/lib/actions/clients";
import type { Client } from "@/lib/schemas/client";

type ClientRow = Pick<Client, "id" | "name" | "slug" | "active" | "created_at">;

export default async function AdminClientsPage() {
  let clients: ClientRow[] = [];
  let error: string | null = null;

  try {
    clients = await getClients();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Client Registry</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {clients.length === 0 && !error && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-zinc-400"
                >
                  No clients found.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900">
                  {client.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                  {client.slug}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {client.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}