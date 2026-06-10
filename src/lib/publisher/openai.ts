"use server";

import OpenAI from "openai";

import { isServerApiAuthBypassEnabled } from "@/lib/auth-bypass";
import { createServiceClient } from "@/lib/publisher/supabase/server";
import { persistImageToStorage } from "./image-storage";
import type { Brief } from "./brief-builder";
import type { GeneratedContent } from "./content-generator";
import type { ImagePrompt } from "./image-prompt-generator";
import type { QualityCheckResult, QualityStatus } from "./quality-checker";
import type { Rules } from "./rules-loader";

// ----- internal helpers -----

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

function model(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

async function serverLog(
  post_id: string,
  action: string,
  details: string,
  status: "success" | "warn" | "error",
  type: "generation" | "image" = "generation",
  agent: string = "Content Agent"
): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("acp_audit_logs").insert({
      type,
      action,
      post_id,
      details,
      status,
      agent,
    } as never);
  } catch {
    // fire-and-forget — never block generation on log failure
  }
}

function rulesContext(rules: unknown): string {
  if (!rules || typeof rules !== "object") return "";
  const r = rules as Partial<Rules>;
  const lines: string[] = [];
  if (r.brand_voice?.length) lines.push(`Brand voice: ${r.brand_voice.join("; ")}`);
  if (r.prohibited_claims?.length) lines.push(`Prohibited claims: ${r.prohibited_claims.join("; ")}`);
  if (r.language_style_guide?.register) lines.push(`Tone/register: ${r.language_style_guide.register}`);
  if (r.platform_limits?.max_length) lines.push(`Length guidance: ${r.platform_limits.max_length}`);
  if (r.platform_limits?.disclosure) lines.push(`Disclosure: ${r.platform_limits.disclosure}`);
  return lines.length ? `\n\nRules to follow:\n${lines.join("\n")}` : "";
}

// ----- exported Server Actions -----

export async function generateBriefAI(
  topic: string,
  brand: string,
  platform: string,
  language: string,
  post_id: string
): Promise<Brief> {
  const ai = getOpenAI();

  const response = await ai.chat.completions.create({
    model: model(),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a content strategist. Return a JSON object with exactly these fields: " +
          "headline (string), angle (string), key_points (array of 3 strings), " +
          "target_audience (string), tone (string), structure_notes (string).",
      },
      {
        role: "user",
        content: `Create a content brief.\nBrand: ${brand}\nPlatform: ${platform}\nLanguage: ${language}\nTopic: ${topic}`,
      },
    ],
    max_tokens: 600,
  });

  const raw = response.choices[0]?.message.content ?? "";
  let parsed: Brief;
  try {
    parsed = JSON.parse(raw) as Brief;
    if (!parsed.headline || !parsed.angle || !Array.isArray(parsed.key_points)) {
      throw new Error("Missing required fields");
    }
  } catch {
    await serverLog(post_id, "Brief Generated (AI)", `Parse error: ${raw.slice(0, 120)}`, "error");
    throw new Error("OpenAI response could not be parsed as a brief");
  }

  await serverLog(post_id, "Brief Generated (AI)", `Brief for ${brand} on ${platform} (${language})`, "success");
  return parsed;
}

export async function generateContentAI(
  brief: unknown,
  rules: unknown,
  primaryLang: string,
  secondaryLang: string,
  post_id: string
): Promise<GeneratedContent> {
  const ai = getOpenAI();

  const briefText = formatBrief(brief);
  const ruleText = rulesContext(rules);

  const versionShape =
    '{ "headline": "", "subheadline": "", "support_line": "", "long_form": "", "hashtags": "", "disclaimer": "" }';

  const response = await ai.chat.completions.create({
    model: model(),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `You are a dual-language content writer. Write post copy in ${primaryLang} for the primary field and ${secondaryLang} for the secondary field (first-comment angle).` +
          ` Return a JSON object with these fields: primary_language, secondary_language, primary, secondary.` +
          ` Each of primary and secondary has this shape: ${versionShape}.` +
          ` hashtags should be space-separated (e.g. "#tag1 #tag2"). disclaimer must be included and legally conservative.` +
          ruleText,
      },
      {
        role: "user",
        content: `Brief:\n${briefText}\n\nPrimary language: ${primaryLang}\nSecondary language: ${secondaryLang}`,
      },
    ],
    max_tokens: 1200,
  });

  const raw = response.choices[0]?.message.content ?? "";
  let parsed: GeneratedContent;
  try {
    parsed = normalizeGeneratedContent(parseJsonResponse(raw), primaryLang, secondaryLang);
    if (!parsed.primary.headline.trim()) {
      throw new Error("Missing primary headline");
    }
  } catch (error) {
    await serverLog(post_id, "Content Generated (AI)", `Parse error: ${raw.slice(0, 120)}`, "error");
    if (isServerApiAuthBypassEnabled()) {
      return buildFallbackContent(briefText, primaryLang, secondaryLang);
    }
    throw new Error(
      error instanceof Error ? error.message : "OpenAI response could not be parsed as generated content"
    );
  }

  parsed.generated_at = new Date().toISOString();
  await serverLog(
    post_id,
    "Content Generated (AI)",
    `${primaryLang} primary + ${secondaryLang} secondary content generated`,
    "success"
  );
  return parsed;
}

export async function runQualityChecksAI(
  content: unknown,
  rules: unknown,
  post_id: string
): Promise<QualityCheckResult[]> {
  const ai = getOpenAI();

  const contentText = flattenContentForQC(content);
  const ruleText = rulesContext(rules);

  const response = await ai.chat.completions.create({
    model: model(),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are a content quality reviewer. Review the content against the rules and return a JSON object with a "results" array. ' +
          'Each result has: check (string), status ("pass" | "warn" | "fail" | "note"), details (string). ' +
          "Cover exactly these 7 checks in order: " +
          "Prohibited Claims, Legal Sensitivity, Brand Consistency, Spelling & Grammar, Platform Limits, Hashtag Check, Image Readability. " +
          "Image Readability should always be status: note." +
          ruleText,
      },
      {
        role: "user",
        content: `Content to review:\n${contentText}`,
      },
    ],
    max_tokens: 800,
  });

  const raw = response.choices[0]?.message.content ?? "";
  let results: QualityCheckResult[];
  try {
    const parsed = JSON.parse(raw) as { results?: unknown[] };
    if (!Array.isArray(parsed.results)) throw new Error("results is not an array");
    results = (parsed.results as QualityCheckResult[]).map((item) => ({
      check: String(item.check ?? "Unknown"),
      status: toQualityStatus(item.status),
      details: String(item.details ?? ""),
    }));
    if (results.length === 0) throw new Error("Empty results array");
  } catch {
    await serverLog(post_id, "Quality Check Complete (AI)", `Parse error: ${raw.slice(0, 120)}`, "error");
    throw new Error("OpenAI response could not be parsed as quality check results");
  }

  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warn").length;
  const logStatus = failCount ? "warn" : "success";
  await serverLog(
    post_id,
    "Quality Check Complete (AI)",
    `${results.length} checks: ${results.filter((r) => r.status === "pass").length} pass, ${warnCount} warn, ${failCount} fail`,
    logStatus
  );
  return results;
}

// ----- private helpers -----

function parseJsonResponse(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(body);
}

function emptyContentVersion() {
  return {
    headline: "",
    subheadline: "",
    support_line: "",
    long_form: "",
    hashtags: "",
    disclaimer: "",
  };
}

function buildFallbackContent(
  briefText: string,
  primaryLang: string,
  secondaryLang: string
): GeneratedContent {
  const headline = briefText.split("\n")[0]?.replace(/^Headline:\s*/i, "").trim() || "Draft headline";
  return {
    primary_language: primaryLang,
    secondary_language: secondaryLang,
    primary: {
      headline,
      subheadline: "Draft subheadline for local review.",
      support_line: "Support line generated in dev fallback mode.",
      long_form: `${headline}\n\n${briefText}`.slice(0, 500),
      hashtags: "#HeadOffice #ContentOS",
      disclaimer: "This is draft content for workflow testing.",
    },
    secondary: {
      headline: `${headline} (EN)`,
      subheadline: "Secondary comment draft.",
      support_line: "First-comment support line.",
      long_form: "Secondary long-form draft for workflow testing.",
      hashtags: "#HeadOffice",
      disclaimer: "Review before publishing.",
    },
    generated_at: new Date().toISOString(),
  };
}

function normalizeGeneratedContent(
  value: unknown,
  primaryLang: string,
  secondaryLang: string
): GeneratedContent {
  const record = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const primary = {
    ...emptyContentVersion(),
    ...((record.primary as Record<string, unknown> | undefined) ?? {}),
  };
  const secondary = {
    ...emptyContentVersion(),
    ...((record.secondary as Record<string, unknown> | undefined) ?? {}),
  };

  for (const version of [primary, secondary]) {
    for (const key of Object.keys(version) as Array<keyof typeof primary>) {
      if (version[key] != null) version[key] = String(version[key]);
    }
  }

  if (!secondary.headline.trim()) {
    secondary.headline = primary.headline;
    secondary.long_form = secondary.long_form || primary.long_form;
  }

  return {
    primary_language: String(record.primary_language ?? primaryLang),
    secondary_language: String(record.secondary_language ?? secondaryLang),
    primary,
    secondary,
    generated_at: new Date().toISOString(),
  };
}

function formatBrief(brief: unknown): string {
  if (!brief || typeof brief !== "object") return "No brief provided.";
  const b = brief as Record<string, unknown>;
  const inner = (b.brief as Record<string, unknown> | undefined) ?? b;
  const lines: string[] = [];
  if (inner.headline) lines.push(`Headline: ${inner.headline}`);
  if (inner.angle) lines.push(`Angle: ${inner.angle}`);
  if (Array.isArray(inner.key_points)) lines.push(`Key points: ${(inner.key_points as string[]).join("; ")}`);
  if (inner.target_audience) lines.push(`Target audience: ${inner.target_audience}`);
  if (inner.tone) lines.push(`Tone: ${inner.tone}`);
  if (inner.structure_notes) lines.push(`Structure: ${inner.structure_notes}`);
  return lines.length ? lines.join("\n") : "No brief details provided.";
}

function flattenContentForQC(content: unknown): string {
  if (!content || typeof content !== "object") return "No content provided.";
  const c = content as Record<string, unknown>;
  const fields: string[] = [];
  for (const version of ["primary", "secondary"]) {
    const v = c[version] as Record<string, unknown> | undefined;
    if (!v) continue;
    for (const key of ["headline", "subheadline", "support_line", "long_form", "hashtags", "disclaimer"]) {
      if (v[key]) fields.push(String(v[key]));
    }
  }
  return fields.join("\n") || "No content to review.";
}

function toQualityStatus(value: unknown): QualityStatus {
  if (value === "pass" || value === "warn" || value === "fail" || value === "note") {
    return value;
  }
  return "note";
}

// ----- image generation -----

export async function generateImageAI(
  prompt: ImagePrompt,
  post_id: string,
  type: "primary" | "secondary",
  version: number
): Promise<string> {
  const ai = getOpenAI();

  const promptText = [
    `A ${prompt.mood} editorial photograph for ${prompt.text_language} social media.`,
    prompt.hero_object,
    `Layout: ${prompt.layout}.`,
    `Color palette: ${prompt.color_palette}.`,
    "No text overlays. Clean, high quality, professional.",
  ].join(" ");

  const response = await ai.images.generate({
    model: "dall-e-3",
    prompt: promptText,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const url = response.data?.[0]?.url;
  if (!url) {
    await serverLog(post_id, `Image Generated (AI) — ${type} v${version}`, "OpenAI returned no image URL", "error", "image", "Image Composer Agent");
    throw new Error("OpenAI returned no image URL");
  }

  // DALL-E URLs expire in ~1-2h; persist to Supabase Storage when possible.
  const durableUrl = await persistImageToStorage(url, post_id, type, version);

  await serverLog(
    post_id,
    `Image Generated (AI) — ${type} v${version}`,
    `DALL-E 3 image generated for ${type} (visual_concept_id: ${prompt.visual_concept_id})${durableUrl ? " — stored" : " — ephemeral URL only"}`,
    "success",
    "image",
    "Image Composer Agent"
  );
  return durableUrl ?? url;
}

export type GeneratedImageResult = {
  image_url: string;
  is_placeholder: boolean;
  error?: string;
};

export async function generateImageAIWithFallback(
  prompt: ImagePrompt,
  post_id: string,
  type: "primary" | "secondary",
  version: number
): Promise<GeneratedImageResult> {
  try {
    const image_url = await generateImageAI(prompt, post_id, type, version);
    return { image_url, is_placeholder: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    const placeholder = `https://placehold.co/1024x1024/e8f5e9/1b5e20/png?text=${encodeURIComponent(`${type} v${version}`)}`;
    await serverLog(
      post_id,
      `Image Generated (AI) — ${type} v${version}`,
      `${message}. Degraded: placeholder slot saved instead of real output.`,
      "error",
      "image",
      "Image Composer Agent"
    );
    return { image_url: placeholder, is_placeholder: true, error: message };
  }
}
