export type IntegrationCallbackFlash = {
  message: string | null;
  error: string | null;
};

const INTEGRATION_LABELS: Record<string, string> = {
  google_drive: 'Google Drive',
  facebook: 'Facebook',
  buffer: 'Buffer',
};

export function consumeIntegrationCallbackFlash(
  allowedIntegrations: readonly string[]
): IntegrationCallbackFlash {
  if (typeof window === 'undefined') {
    return { message: null, error: null };
  }

  const params = new URLSearchParams(window.location.search);
  const integration = params.get('integration');
  if (!integration || !allowedIntegrations.includes(integration)) {
    return { message: null, error: null };
  }

  const integrationStatus = params.get('integration_status');
  const integrationMessage = params.get('integration_message');
  const label = INTEGRATION_LABELS[integration] ?? integration;

  let message: string | null = null;
  let error: string | null = null;

  if (integrationStatus === 'connected') {
    message = `${label} connected successfully.`;
  } else if (integrationStatus === 'error') {
    error = integrationMessage ?? `${label} login failed.`;
  } else {
    return { message: null, error: null };
  }

  params.delete('integration');
  params.delete('integration_status');
  params.delete('integration_message');
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);

  return { message, error };
}
