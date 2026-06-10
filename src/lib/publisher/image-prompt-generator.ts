import type { GeneratedContent } from "./content-generator";
import type { Rules } from "./rules-loader";
import { addLog } from "@/lib/publisher/log-system";

export type ImagePrompt = {
  visual_concept_id: string;
  layout: string;
  mood: string;
  hero_object: string;
  color_palette: string;
  text_language: string;
};

export type ImagePromptSet = {
  post_id: string;
  visual_concept_id: string;
  primary: ImagePrompt;
  secondary: ImagePrompt;
  generated_at: string;
};

export function generateImagePrompts(
  contentInput: unknown,
  brandRulesInput: unknown,
  imageRulesInput: unknown
): ImagePromptSet {
  const content = unwrapContent(contentInput);
  const rules = unwrapRules(brandRulesInput);
  const imageRules = unwrapRules(imageRulesInput);
  const postId = content.post_id || "post_missing";
  const visualConceptId = `vc_${postId}`;
  const shared = {
    visual_concept_id: visualConceptId,
    layout:
      imageRules.image_style_guide?.composition ||
      "Editorial feed layout with a strong headline area, one central subject, and generous mobile-safe margins.",
    mood: buildMood(rules),
    hero_object: content.primary?.headline
      ? `Visual metaphor for: ${content.primary.headline}`
      : "Clean workspace with a focused campaign planning board",
    color_palette:
      imageRules.image_style_guide?.color ||
      "Navy, white, muted green, and warm neutral accent colors with high contrast.",
  };

  const promptSet: ImagePromptSet = {
    post_id: postId,
    visual_concept_id: visualConceptId,
    primary: {
      ...shared,
      text_language: content.primary_language || "Thai",
    },
    secondary: {
      ...shared,
      text_language: content.secondary_language || "English",
    },
    generated_at: new Date().toISOString(),
  };
  addLog(
    "image",
    "Image Prompts Generated",
    postId,
    `Visual concept ${visualConceptId} — primary + secondary prompts ready`,
    "success",
    "Image Prompt Agent"
  );
  return promptSet;
}

function buildMood(rules: Partial<Rules>) {
  const voice = rules.brand_voice?.[0] || "calm, practical, and expert-led";
  return `Confident, polished, and ${voice.toLowerCase()}`;
}

function unwrapContent(input: unknown): Partial<GeneratedContent> {
  if (!input || typeof input !== "object") return {};
  return input as Partial<GeneratedContent>;
}

function unwrapRules(input: unknown): Partial<Rules> {
  if (!input || typeof input !== "object") return {};
  const maybe = input as { rules?: Partial<Rules> };
  return maybe.rules || (input as Partial<Rules>);
}
