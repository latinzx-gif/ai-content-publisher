import { languageCodeLabelMap, normalizeLanguageCode, normalizeLanguageCodes } from '@/features/prd/lib/review-display';
import { normalizeTextValue } from '@/features/prd/lib/text';
import type { GeneratedAsset, GeneratedDraft, LanguageCode } from '@/features/prd/types/content';

export function normalizeStringList(values: string[] | undefined, unique = false) {
  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);

  if (!unique) {
    return normalized;
  }

  return normalized.filter((item, index, self) => self.indexOf(item) === index);
}

export function getDraftTextByLanguage(params: {
  languageCode: LanguageCode;
  category: string;
  targetAudience: string;
  brandVoice: string;
  categoryContext: string;
  citationStrictness: string;
  cta: string;
  sourceConnectors: string[];
}) {
  const { languageCode, category, targetAudience, brandVoice, categoryContext, citationStrictness, cta, sourceConnectors } = params;

  if (languageCode === 'th') {
    return `ร่างข้อความภาษาไทยในโทน${brandVoice} เกี่ยวกับ ${categoryContext} สำหรับกลุ่ม${targetAudience} เน้นความชัดเจนเรื่องข้อปฏิบัติ การเตือนความเสี่ยง และการอ้างอิงแหล่งข้อมูล ${sourceConnectors.join(', ')} ตาม ${citationStrictness} พร้อม CTA: ${cta}.`;
  }

  if (languageCode === 'zh') {
    return `一份面向${targetAudience} 的“${category}”初稿，采用${brandVoice}语气，先说明关键点与合规边界，再给出操作建议。引用来源采用${citationStrictness}，并附上 CTA: ${cta}。`;
  }

  if (languageCode === 'ja') {
    return `対象${targetAudience}向けに「${category}」を${brandVoice}トーンで要点を整理したドラフトです。` +
      `${citationStrictness}を満たす根拠ソースを明示し、CTAは「${cta}」で導線を統一します。`;
  }

  return `A ${brandVoice.toLowerCase()} draft about ${categoryContext} for ${targetAudience}, written with compliant ${citationStrictness}, practical guidance, and CTA: ${cta}.`;
}

export function mapGeneratedDraftsFromMetadata(value: unknown): GeneratedDraft[] | undefined {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return undefined;
    }
  }

  if (
    rawValue &&
    typeof rawValue === 'object' &&
    !Array.isArray(rawValue) &&
    Array.isArray((rawValue as { generatedDrafts?: unknown }).generatedDrafts)
  ) {
    rawValue = (rawValue as { generatedDrafts?: unknown }).generatedDrafts;
  }

  if (!Array.isArray(rawValue)) {
    return undefined;
  }

  const mapped = rawValue
    .map((entry): GeneratedDraft | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const entryRecord = entry as Record<string, unknown>;
      const languageText =
        typeof entryRecord.language === 'string'
          ? entryRecord.language
          : typeof entryRecord.languageCode === 'string'
            ? entryRecord.languageCode
            : typeof entryRecord.lang === 'string'
              ? entryRecord.lang
              : typeof entryRecord.language_code === 'string'
                ? entryRecord.language_code
                : '';
      const languageCode = normalizeLanguageCode(languageText);
      if (!languageCode) {
        return null;
      }

      const languageLabel = languageCodeLabelMap[languageCode];
      const title =
        typeof entryRecord.title === 'string' && entryRecord.title.trim() ? entryRecord.title.trim() : typeof entryRecord.topic === 'string' && entryRecord.topic.trim() ? entryRecord.topic.trim() : undefined;
      const body =
        (typeof entryRecord.body === 'string' && entryRecord.body.trim()) ||
        (typeof entryRecord.text === 'string' && entryRecord.text.trim()) ||
        (typeof entryRecord.content === 'string' && entryRecord.content.trim()) ||
        '';

      if (!body) {
        return null;
      }

      return {
        languageCode,
        languageLabel,
        title: title ?? `${languageCodeLabelMap[languageCode]} draft`,
        body,
      };
    })
    .filter((draft): draft is GeneratedDraft => draft !== null);

  return mapped.length > 0 ? mapped : undefined;
}

export function mapGeneratedAssetsFromMetadata(value: unknown): GeneratedAsset[] | undefined {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return undefined;
    }
  }

  if (
    rawValue &&
    typeof rawValue === 'object' &&
    !Array.isArray(rawValue) &&
    Array.isArray((rawValue as { generatedAssets?: unknown }).generatedAssets)
  ) {
    rawValue = (rawValue as { generatedAssets?: unknown }).generatedAssets;
  }

  if (!Array.isArray(rawValue)) {
    return undefined;
  }

  const mapped = rawValue
    .map((entry): GeneratedAsset | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const entryRecord = entry as Record<string, unknown>;
      const assetType =
        normalizeTextValue(entryRecord.assetType as string | undefined) ||
        normalizeTextValue(entryRecord.asset_type as string | undefined) ||
        normalizeTextValue(entryRecord.type as string | undefined) ||
        'image';
      const url = normalizeTextValue(entryRecord.url as string | undefined) || normalizeTextValue(entryRecord.imageUrl as string | undefined) || normalizeTextValue(entryRecord.image_url as string | undefined);
      const storagePath = normalizeTextValue(entryRecord.storagePath as string | undefined) || normalizeTextValue(entryRecord.storage_path as string | undefined);
      const altText = normalizeTextValue(entryRecord.altText as string | undefined) || normalizeTextValue(entryRecord.alt_text as string | undefined);
      const layoutType = normalizeTextValue(entryRecord.layoutType as string | undefined) || normalizeTextValue(entryRecord.layout_type as string | undefined);
      const source = normalizeTextValue(entryRecord.source as string | undefined);
      const sortOrder = typeof entryRecord.sortOrder === 'number' ? entryRecord.sortOrder : typeof entryRecord.sort_order === 'number' ? entryRecord.sort_order : undefined;
      const metadata =
        entryRecord.metadata && typeof entryRecord.metadata === 'object' && !Array.isArray(entryRecord.metadata)
          ? (entryRecord.metadata as Record<string, unknown>)
          : null;
      const isPlaceholder =
        typeof entryRecord.generatedAssetPlaceholder === 'boolean'
          ? entryRecord.generatedAssetPlaceholder
          : typeof metadata?.generatedAssetPlaceholder === 'boolean'
            ? metadata.generatedAssetPlaceholder
            : false;
      const errorMessage =
        normalizeTextValue(entryRecord.errorMessage as string | undefined) ||
        normalizeTextValue(entryRecord.error_message as string | undefined) ||
        normalizeTextValue(metadata?.failureReason as string | undefined);
      const hasRealAssetReference = Boolean(url || storagePath) && !isPlaceholder;
      const availabilityStatus: GeneratedAsset['availabilityStatus'] = errorMessage
        ? 'failed'
        : hasRealAssetReference
          ? url
            ? 'generated'
            : 'stored'
          : 'pending';

      if (!url && !storagePath && !altText) {
        return null;
      }

      return {
        assetType,
        layoutType,
        url,
        storagePath,
        altText,
        source,
        sortOrder,
        isPlaceholder,
        availabilityStatus,
        errorMessage,
      };
    })
    .filter((asset): asset is GeneratedAsset => asset !== null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return mapped.length > 0 ? mapped : undefined;
}

export function buildDraftPackageFromContext({
  topic,
  category,
  targetAudience,
  brandVoice,
  citationStrictness,
  cta,
  languages,
  sourceConnectors,
  contentGoal,
}: {
  topic: string;
  category: string;
  targetAudience: string;
  brandVoice: string;
  citationStrictness: string;
  cta: string;
  languages: string[];
  sourceConnectors: string[];
  contentGoal: string;
}) {
  const activeLanguages = normalizeLanguageCodes(languages, ['th', 'en']);
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const topicContext = topic.trim() || `${category} content package for ${contentGoal}`;

  return activeLanguages.map((languageCode) => ({
    languageCode,
    languageLabel: languageCodeLabelMap[languageCode],
    title: `${category}: ${topicContext}`,
    body: getDraftTextByLanguage({
      languageCode,
      category,
      targetAudience,
      brandVoice,
      categoryContext: topicContext,
      citationStrictness,
      cta,
      sourceConnectors: activeSources,
    }),
  }));
}

export function buildDraftPackageSignature({
  topic,
  category,
  targetAudience,
  brandVoice,
  citationStrictness,
  cta,
  languages,
  sourceConnectors,
  contentGoal,
  officialSourceLinks = [],
}: {
  topic: string;
  category: string;
  targetAudience: string;
  brandVoice: string;
  citationStrictness: string;
  cta: string;
  languages: string[];
  sourceConnectors: string[];
  contentGoal: string;
  officialSourceLinks?: string[];
}) {
  return JSON.stringify({
    topic: topic.trim().toLowerCase(),
    category: category.trim().toLowerCase(),
    targetAudience: targetAudience.trim().toLowerCase(),
    brandVoice: brandVoice.trim().toLowerCase(),
    citationStrictness: citationStrictness.trim().toLowerCase(),
    cta: cta.trim().toLowerCase(),
    contentGoal: contentGoal.trim().toLowerCase(),
    languages: normalizeLanguageCodes(languages, ['th', 'en']).sort().join('|'),
    sourceConnectors: normalizeStringList(sourceConnectors, true).sort().join('|'),
    officialSourceLinks: normalizeStringList(officialSourceLinks, true)
      .map((link) => link.toLowerCase())
      .sort()
      .join('|'),
  });
}

export function normalizeContextText(value: string) {
  return value.trim().toLowerCase();
}

export function deriveBrandVoice({
  topic,
  category,
  targetAudience,
}: {
  topic: string;
  category: string;
  targetAudience: string;
}): string {
  const normalizedTopic = normalizeContextText(topic);
  const normalizedCategory = normalizeContextText(category);
  const normalizedAudience = normalizeContextText(targetAudience);

  if (
    normalizedCategory === 'tax' ||
    normalizedCategory === 'accounting' ||
    normalizedTopic.includes('ภาษี') ||
    normalizedTopic.includes('tax')
  ) {
    return 'Accounting advisory';
  }

  if (
    normalizedCategory === 'corporate law' ||
    normalizedCategory === 'pdpa' ||
    normalizedCategory === 'labor law' ||
    normalizedCategory === 'visa & work permit' ||
    normalizedTopic.includes('กฎหมาย') ||
    normalizedTopic.includes('legal')
  ) {
    return 'Legal advisory';
  }

  if (
    normalizedAudience.includes('japanese') ||
    normalizedAudience.includes('foreign') ||
    normalizedAudience.includes('investors') ||
    normalizedAudience.includes('founders') ||
    normalizedTopic.includes('executive') ||
    normalizedTopic.includes('board')
  ) {
    return 'Executive summary';
  }

  if (
    normalizedTopic.includes('เข้าใจง่าย') ||
    normalizedTopic.includes('เริ่มต้น') ||
    normalizedTopic.includes('สำหรับคนใหม่') ||
    normalizedTopic.includes('basic') ||
    normalizedTopic.includes('for beginners')
  ) {
    return 'Plain-language educator';
  }

  return 'Legal advisory';
}
