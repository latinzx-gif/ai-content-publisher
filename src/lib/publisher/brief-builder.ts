import { generateBriefAI } from "./openai";

export type Brief = {
  headline: string;
  angle: string;
  key_points: string[];
  target_audience: string;
  tone: string;
  structure_notes: string;
};

export async function generateBrief(
  topic: string,
  brand: string,
  platform: string,
  language: string,
  post_id = "unknown"
): Promise<Brief> {
  return generateBriefAI(topic, brand, platform, language, post_id);
}
