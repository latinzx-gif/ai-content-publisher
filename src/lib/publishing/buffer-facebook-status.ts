import { getStoredBufferAccessToken } from '@/lib/publishing/integration-connection-store';

const BUFFER_API = 'https://api.bufferapp.com/1';

export type BufferFacebookProfile = {
  id: string;
  service: string;
  formattedUsername: string | null;
  serviceUsername: string | null;
};

export type FacebookConnectionStatus = {
  bufferConfigured: boolean;
  bufferOk: boolean;
  bufferError: string | null;
  facebookProfiles: BufferFacebookProfile[];
  selectedProfileId: string | null;
  ready: boolean;
};

type RawBufferProfile = {
  id?: string;
  service?: string;
  formatted_username?: string;
  service_username?: string;
};

function normalizeProfile(profile: RawBufferProfile): BufferFacebookProfile | null {
  if (!profile.id || !profile.service) {
    return null;
  }

  return {
    id: profile.id,
    service: profile.service,
    formattedUsername: profile.formatted_username ?? null,
    serviceUsername: profile.service_username ?? null,
  };
}

function isFacebookProfile(profile: BufferFacebookProfile) {
  return profile.service.toLowerCase().includes('facebook');
}

async function resolveBufferAccessToken() {
  return getStoredBufferAccessToken();
}

export async function getFacebookConnectionStatus(): Promise<FacebookConnectionStatus> {
  const token = await resolveBufferAccessToken();
  const selectedProfileId = process.env.BUFFER_PROFILE_ID?.trim() || null;

  if (!token) {
    return {
      bufferConfigured: false,
      bufferOk: false,
      bufferError: 'BUFFER_ACCESS_TOKEN is not configured.',
      facebookProfiles: [],
      selectedProfileId,
      ready: false,
    };
  }

  try {
    const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${token}`);
    if (!res.ok) {
      let bufferError = `Buffer API error: ${res.status}`;
      try {
        const body = (await res.json()) as { error?: string; message?: string };
        bufferError = body.error ?? body.message ?? bufferError;
      } catch {
        // ignore parse errors
      }

      return {
        bufferConfigured: true,
        bufferOk: false,
        bufferError,
        facebookProfiles: [],
        selectedProfileId,
        ready: false,
      };
    }

    const profiles = (await res.json()) as RawBufferProfile[];
    const facebookProfiles = profiles
      .map(normalizeProfile)
      .filter((profile): profile is BufferFacebookProfile => profile !== null)
      .filter(isFacebookProfile);

    const ready =
      facebookProfiles.length > 0 &&
      (!selectedProfileId || facebookProfiles.some((profile) => profile.id === selectedProfileId));

    return {
      bufferConfigured: true,
      bufferOk: true,
      bufferError: facebookProfiles.length === 0 ? 'No Facebook Page is connected in Buffer yet.' : null,
      facebookProfiles,
      selectedProfileId,
      ready,
    };
  } catch (error) {
    return {
      bufferConfigured: true,
      bufferOk: false,
      bufferError: error instanceof Error ? error.message : 'Could not reach Buffer API.',
      facebookProfiles: [],
      selectedProfileId,
      ready: false,
    };
  }
}
