export type LanguageCode = 'th' | 'en' | 'zh' | 'ja';

export type GeneratedDraft = {
  languageCode: LanguageCode;
  languageLabel: string;
  title: string;
  body: string;
};

export type GeneratedAsset = {
  assetType: string;
  layoutType?: string;
  url?: string;
  storagePath?: string;
  altText?: string;
  source?: string;
  sortOrder?: number;
  isPlaceholder?: boolean;
  availabilityStatus?: 'generated' | 'stored' | 'pending' | 'failed';
  errorMessage?: string;
};
