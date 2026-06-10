import { getPublishingConnectionsStatus } from "@/lib/publishing/publishing-connection-status";

import FacebookLoginPanel from "./FacebookLoginPanel";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const [status, facebookStatus] = await Promise.all([
    Promise.resolve({
      openai: Boolean(process.env.OPENAI_API_KEY),
      buffer: Boolean(process.env.BUFFER_ACCESS_TOKEN),
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
    }),
    getPublishingConnectionsStatus(),
  ]);

  return (
    <div className="space-y-6">
      <FacebookLoginPanel initialStatus={facebookStatus} />
      <SettingsClient status={status} />
    </div>
  );
}
