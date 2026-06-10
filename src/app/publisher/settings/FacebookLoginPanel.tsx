'use client';

import { PublishingLoginPanel } from '@/components/publishing/PublishingLoginPanel';
import type { PublishingConnectionsStatus } from '@/lib/publishing/publishing-connection-status';
import { disconnectPublishingProvider } from './actions';

export default function FacebookLoginPanel({
  initialStatus,
}: {
  initialStatus: PublishingConnectionsStatus;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">Publishing</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Buffer & Facebook Login</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Login to Buffer and Facebook from this screen. After both are connected, approved posts can be scheduled to your Facebook Page.
        </p>
      </div>

      <PublishingLoginPanel
        initialStatus={initialStatus}
        returnTo="/publisher/settings"
        mode="publisher"
        onDisconnect={disconnectPublishingProvider}
      />
    </div>
  );
}
