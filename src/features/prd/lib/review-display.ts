import type { LanguageCode } from '@/features/prd/types/content';
import { normalizeTextValue } from '@/features/prd/lib/text';

export function buildReviewDraftTitle(category: string | undefined, title: string | undefined) {
  const normalizedCategory = normalizeTextValue(category);
  const normalizedTitle = normalizeTextValue(title);

  if (normalizedTitle) {
    return normalizedTitle;
  }

  return normalizedCategory ? `${normalizedCategory} draft` : 'Review draft';
}

export const languageCodeLabelMap: Record<LanguageCode, string> = {
  th: 'Thai (ไทย)',
  en: 'English',
  zh: 'Chinese (中文)',
  ja: 'Japanese (日本語)',
};

export const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: 'th', label: languageCodeLabelMap.th },
  { code: 'en', label: languageCodeLabelMap.en },
  { code: 'zh', label: languageCodeLabelMap.zh },
  { code: 'ja', label: languageCodeLabelMap.ja },
];

export const languageDisplayLabels = languageOptions.map((item) => item.label);

export function normalizeLanguageCode(value: string): LanguageCode | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'th' || normalized === 'thai' || normalized.includes('thai') || normalized.includes('ไทย')) {
    return 'th';
  }

  if (normalized === 'en' || normalized === 'english' || normalized.includes('english')) {
    return 'en';
  }

  if (normalized === 'zh' || normalized === 'cn' || normalized.includes('zh') || normalized.includes('chinese') || normalized.includes('中文')) {
    return 'zh';
  }

  if (normalized === 'ja' || normalized === 'jp' || normalized.includes('ja') || normalized.includes('japanese') || normalized.includes('日本')) {
    return 'ja';
  }

  return null;
}

export function normalizeLanguageCodes(values: string[] | undefined, fallback: readonly LanguageCode[] = ['th', 'en']) {
  if (!Array.isArray(values) || values.length === 0) {
    return [...fallback];
  }

  const normalized = values.map(normalizeLanguageCode).filter((item): item is LanguageCode => item !== null);
  const deduped = normalized.filter((item, index, self) => self.indexOf(item) === index);

  return deduped.length ? deduped : [...fallback];
}

export function getLanguageDisplayLabels(values: string[] | undefined, fallback: readonly LanguageCode[] = ['th']) {
  return normalizeLanguageCodes(values, fallback).map((language) => languageCodeLabelMap[language]);
}
