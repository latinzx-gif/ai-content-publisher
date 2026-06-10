import { generateContentAI } from "./openai";

export type Language = "Thai" | "English" | "Chinese" | "Japanese" | "Korean";

export type GeneratedContentVersion = {
  headline: string;
  subheadline: string;
  support_line: string;
  long_form: string;
  hashtags: string;
  disclaimer: string;
};

export type GeneratedContent = {
  post_id?: string;
  primary_language: string;
  secondary_language: string;
  primary: GeneratedContentVersion;
  secondary: GeneratedContentVersion;
  generated_at: string;
};

export async function generateContent(
  briefInput: unknown,
  rulesInput: unknown,
  primaryLang: string,
  secondaryLang: string,
  post_id = "unknown"
): Promise<GeneratedContent> {
  return generateContentAI(briefInput, rulesInput, primaryLang, secondaryLang, post_id);
}
