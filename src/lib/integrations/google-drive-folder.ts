export function resolveGoogleDriveFolderId(input: {
  envFolderId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const envFolderId = input.envFolderId?.trim();
  if (envFolderId) {
    return envFolderId;
  }

  const metadataFolderId = typeof input.metadata?.folderId === 'string' ? input.metadata.folderId.trim() : '';
  return metadataFolderId || null;
}
