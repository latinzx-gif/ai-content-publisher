import Link from "next/link";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const status = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    buffer: Boolean(process.env.BUFFER_ACCESS_TOKEN),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">Integrations</p>
        <h1 className="mt-2 text-2xl font-black text-[var(--navy)]">Facebook &amp; Google Drive</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Connect Facebook and Google Drive from PRD Settings → Integrations. Tokens are shared across Publisher and PRD.
        </p>
        <Link
          className="mt-4 inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--navy)] hover:bg-white"
          href="/?page=settings"
        >
          Open Integrations
        </Link>
      </section>
      <SettingsClient status={status} />
    </div>
  );
}
