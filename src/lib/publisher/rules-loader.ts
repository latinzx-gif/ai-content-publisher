import { addLog } from "@/lib/publisher/log-system";

export type Rules = {
  brand_voice: string[];
  prohibited_claims: string[];
  platform_limits: {
    platform: string;
    max_length: string;
    formatting: string;
    disclosure: string;
  };
  image_style_guide: {
    composition: string;
    color: string;
    text_overlay: string;
  };
  language_style_guide: {
    language: string;
    register: string;
    localization: string;
  };
};

export function loadRules(
  brand: string,
  platform: string,
  language: string,
  post_id = "unknown"
): Rules {
  const cleanBrand = brand.trim() || "Selected brand";
  const cleanPlatform = platform.trim() || "selected platform";
  const cleanLanguage = language.trim() || "Thai";

  const rules = {
    brand_voice: [
      `${cleanBrand} should sound practical, calm, and expert-led.`,
      "Use direct claims only when they can be supported by source material.",
      "Prefer specific audience benefits over broad promotional language.",
    ],
    prohibited_claims: [
      "Do not promise guaranteed outcomes, cures, earnings, or legal results.",
      "Do not imply endorsement by regulators, platforms, or public agencies.",
      "Do not use competitor comparisons without verified evidence.",
    ],
    platform_limits: {
      platform: cleanPlatform,
      max_length: "Keep primary copy concise enough for feed preview.",
      formatting: "Use short paragraphs and avoid excessive hashtags.",
      disclosure: "Add disclosures when content includes offers, advice, or sponsored context.",
    },
    image_style_guide: {
      composition: "Use clean product or people-centered framing with obvious subject hierarchy.",
      color: "Stay close to brand colors and avoid low-contrast text treatments.",
      text_overlay: "Limit image text to one short message that remains readable on mobile.",
    },
    language_style_guide: {
      language: cleanLanguage,
      register: "Professional, plain-language, and locally natural.",
      localization: "Adapt idioms, date formats, and calls to action to the selected language.",
    },
  };
  addLog(
    "generation",
    "Rules Loaded",
    post_id,
    `Brand rules for ${cleanBrand} on ${cleanPlatform} (${cleanLanguage})`,
    "success",
    "System"
  );
  return rules;
}
