'use client';

import { useEffect, useState } from 'react';
import { FacebookIcon } from '@/features/prd/components/icons/prd-icons';
import { PublishingLoginPanel } from '@/components/publishing/PublishingLoginPanel';
import type { PublishingConnectionsStatus } from '@/lib/publishing/publishing-connection-status';

const API_TOKEN_STORAGE_KEY = 'prd_api_bearer_token';

function getBearerToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(API_TOKEN_STORAGE_KEY) ?? '';
}

const emptyStatus: PublishingConnectionsStatus = {
  bufferConfigured: false,
  bufferOk: false,
  bufferError: null,
  facebookProfiles: [],
  selectedProfileId: null,
  ready: false,
  bufferOAuthConfigured: false,
  bufferConnected: false,
  facebookOAuthConfigured: false,
  facebookConnected: false,
  facebookPageName: null,
  facebookPageId: null,
};

export function SettingsFacebookLogin() {
  const [initialStatus, setInitialStatus] = useState<PublishingConnectionsStatus | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const token = getBearerToken();
        const response = await fetch('/api/settings/facebook/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const payload = (await response.json()) as PublishingConnectionsStatus;
        if (response.ok) {
          setInitialStatus(payload);
          return;
        }
      } catch {
        // fall through to empty status
      }
      setInitialStatus(emptyStatus);
    }

    void loadStatus();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2] text-[#1877f2]">
          <FacebookIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Facebook & Buffer Login</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Connect Buffer and Facebook directly from here. Scheduled posts still publish through Buffer after both connections are ready.
          </p>
        </div>
      </div>

      {initialStatus ? (
        <PublishingLoginPanel initialStatus={initialStatus} returnTo="/?page=settings" mode="prd" />
      ) : (
        <p className="text-sm text-[#6e6e68]">Loading connection status…</p>
      )}
    </div>
  );
}
