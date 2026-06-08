import type { SupabaseClient } from '@supabase/supabase-js';

const CONTENT_ASSET_BUCKET = 'content-assets';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type GeneratedImagePayload = {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
};

type AssetRowWithStorage = {
  id?: string | null;
  storage_path?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type DurableAssetPersistResult = {
  storagePath: string | null;
  fallbackUrl: string | null;
  durable: boolean;
  contentType: string | null;
  errorMessage: string | null;
};

export async function persistGeneratedAssetToStorage({
  supabase,
  contentItemId,
  agentRunId,
  sortOrder,
  image,
}: {
  supabase: SupabaseClient;
  contentItemId: string;
  agentRunId: string;
  sortOrder: number;
  image: GeneratedImagePayload | null | undefined;
}): Promise<DurableAssetPersistResult> {
  if (!image) {
    return {
      storagePath: null,
      fallbackUrl: null,
      durable: false,
      contentType: null,
      errorMessage: 'Image payload was empty.',
    };
  }

  let contentType = 'image/png';
  let extension = 'png';
  let bytes: Buffer | null = null;
  const fallbackUrl = typeof image.url === 'string' && image.url.length > 0 ? image.url : null;

  try {
    if (typeof image.b64_json === 'string' && image.b64_json.length > 0) {
      bytes = Buffer.from(image.b64_json, 'base64');
    } else if (fallbackUrl) {
      const response = await fetch(fallbackUrl);

      if (!response.ok) {
        return {
          storagePath: null,
          fallbackUrl,
          durable: false,
          contentType: null,
          errorMessage: `Image provider fetch failed with ${response.status}.`,
        };
      }

      const fetchedType = response.headers.get('content-type');
      if (fetchedType) {
        contentType = fetchedType;
      }

      extension = guessImageExtension(contentType, fallbackUrl);
      const buffer = await response.arrayBuffer();
      bytes = Buffer.from(buffer);
    }
  } catch (error) {
    return {
      storagePath: null,
      fallbackUrl,
      durable: false,
      contentType: null,
      errorMessage: error instanceof Error ? error.message : 'Image provider fetch failed.',
    };
  }

  if (!bytes || bytes.length === 0) {
    return {
      storagePath: null,
      fallbackUrl,
      durable: false,
      contentType: null,
      errorMessage: 'Image generation did not produce uploadable bytes.',
    };
  }

  const storagePath = `content-items/${contentItemId}/agent-runs/${agentRunId}/asset-${sortOrder + 1}.${extension}`;
  const { error } = await supabase.storage.from(CONTENT_ASSET_BUCKET).upload(storagePath, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    return {
      storagePath: null,
      fallbackUrl,
      durable: false,
      contentType,
      errorMessage: error.message,
    };
  }

  return {
    storagePath,
    fallbackUrl,
    durable: true,
    contentType,
    errorMessage: null,
  };
}

export async function attachSignedAssetUrls<T extends AssetRowWithStorage>(
  supabase: SupabaseClient,
  assets: T[],
): Promise<T[]> {
  const storagePaths = assets
    .map((asset) => (typeof asset.storage_path === 'string' && asset.storage_path.length > 0 ? asset.storage_path : null))
    .filter((asset): asset is string => Boolean(asset));

  if (storagePaths.length === 0) {
    return assets;
  }

  const signedUrlMap = new Map<string, string>();
  await Promise.all(
    storagePaths.map(async (path) => {
      const { data, error } = await supabase.storage.from(CONTENT_ASSET_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (!error && data?.signedUrl) {
        signedUrlMap.set(path, data.signedUrl);
      }
    }),
  );

  return assets.map((asset) => {
    const storagePath = typeof asset.storage_path === 'string' && asset.storage_path.length > 0 ? asset.storage_path : null;
    if (!storagePath) {
      return asset;
    }

    const signedUrl = signedUrlMap.get(storagePath);
    if (!signedUrl) {
      return asset;
    }

    return {
      ...asset,
      url: signedUrl,
    };
  });
}

function guessImageExtension(contentType: string | null, fallbackUrl: string | null) {
  const normalized = (contentType ?? '').toLowerCase();

  if (normalized.includes('webp')) {
    return 'webp';
  }

  if (normalized.includes('jpeg') || normalized.includes('jpg')) {
    return 'jpg';
  }

  if (normalized.includes('png')) {
    return 'png';
  }

  if (fallbackUrl) {
    const matched = fallbackUrl.match(/\.(png|jpe?g|webp)(?:\?|$)/i);
    if (matched?.[1]) {
      return matched[1].toLowerCase() === 'jpeg' ? 'jpg' : matched[1].toLowerCase();
    }
  }

  return 'png';
}
