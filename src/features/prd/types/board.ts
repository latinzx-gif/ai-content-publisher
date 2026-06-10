import type { PrdDebugModel, PrdPresentationModel } from '@/lib/prdPresentation';

import type { GeneratedAsset, GeneratedDraft } from './content';

export type BoardRisk = 'Low' | 'Medium' | 'High';

export type BoardItem = {
  id: string;
  title: string;
  owner: string;
  channel: string;
  due: string;
  risk: BoardRisk;
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  stage?: string;
  contentItemStatus?: string;
  generatedDrafts?: GeneratedDraft[];
  generatedAssets?: GeneratedAsset[];
  imageCount?: number;
  selectedAssets?: string[];
  assetLayoutPlan?: string[];
  layout?: string;
  visualBrief?: string;
  wordCount?: number;
  presentation?: PrdPresentationModel;
  debug?: PrdDebugModel;
};

export function normalizeBoardRisk(risk: string | null | undefined): BoardRisk {
  return risk === 'High' || risk === 'Medium' || risk === 'Low' ? risk : 'Low';
}
