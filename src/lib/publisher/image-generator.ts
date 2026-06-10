import type { ImagePrompt } from "./image-prompt-generator";
import { generateImageAIWithFallback } from "./openai";
import { getPostImages } from "@/lib/publisher/db";
import type { AcpPostImage } from "@/lib/publisher/supabase/types";

export type ImageType = "primary" | "secondary";

export type GeneratedImage = {
  post_id: string;
  type: ImageType;
  version: number;
  image_url: string;
  is_placeholder: boolean;
  prompt: ImagePrompt;
  generated_at: string;
};

export type ImageHistory = {
  post_id: string;
  primary: GeneratedImage[];
  secondary: GeneratedImage[];
  saved_at?: string;
};

// currentHistory is required — callers load it via getImageHistory() before calling generateImage()
export async function generateImage(
  prompt: ImagePrompt,
  post_id: string,
  type: ImageType,
  currentHistory: ImageHistory
): Promise<GeneratedImage> {
  const version = (currentHistory[type]?.length || 0) + 1;
  const result = await generateImageAIWithFallback(prompt, post_id, type, version);

  return {
    post_id,
    type,
    version,
    image_url: result.image_url,
    is_placeholder: result.is_placeholder,
    prompt,
    generated_at: new Date().toISOString(),
  };
}

export async function getImageHistory(post_id: string): Promise<ImageHistory> {
  const rows = await getPostImages(post_id);
  return dbRowsToHistory(post_id, rows);
}

function dbRowsToHistory(post_id: string, rows: AcpPostImage[]): ImageHistory {
  const primary: GeneratedImage[] = rows
    .filter((r) => r.type === "primary")
    .sort((a, b) => a.version - b.version)
    .map(dbRowToImage);

  const secondary: GeneratedImage[] = rows
    .filter((r) => r.type === "secondary")
    .sort((a, b) => a.version - b.version)
    .map(dbRowToImage);

  return { post_id, primary, secondary };
}

function dbRowToImage(row: AcpPostImage): GeneratedImage {
  return {
    post_id: row.post_id,
    type: row.type,
    version: row.version,
    image_url: row.image_url,
    is_placeholder: row.is_placeholder,
    prompt: (row.prompt ?? {}) as ImagePrompt,
    generated_at: row.generated_at,
  };
}

export function emptyHistory(post_id: string): ImageHistory {
  return {
    post_id,
    primary: [],
    secondary: [],
  };
}
