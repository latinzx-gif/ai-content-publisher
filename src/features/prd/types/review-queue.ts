import type { GeneratedAsset, GeneratedDraft } from '@/features/prd/types/content';
import type { BoardItem } from '@/features/prd/types/board';

export type ReviewPackageMetadata = {
  approvalStatusLabel?: string;
  approvalRecommendation?: string;
  approvalSummary?: string;
  assetComposerStatus?: string;
  assetLayoutPlan?: string[];
  brandVoice?: string;
  createdAt?: number;
  createdBy?: string;
  citationStrictness?: string;
  contentGoal?: string;
  contentItemStatus?: string;
  creativeSummary?: string;
  cta?: string;
  contentPreview?: string;
  bodyPreview?: string;
  caption?: string;
  hashtags?: string[];
  degradedMessage?: string;
  officialSourceLinks?: string[];
  complianceStatus?: string;
  imageCount?: number;
  issuesFound?: string[];
  autoPipeline?: boolean;
  languages?: string[];
  layout?: string;
  mode?: 'manual' | 'quick';
  platforms?: string[];
  postCount?: number;
  readinessStatus?: string;
  requiredFix?: string;
  nextActionLabel?: string;
  platform?: string;
  selectedAssets?: string[];
  sourceConnectors?: string[];
  targetAudience?: string;
  subtitle?: string;
  updatedAtLabel?: string;
  visualBrief?: string;
  wordCount?: number;
  workflowId?: string;
  generatedDrafts?: GeneratedDraft[];
  generatedAssets?: GeneratedAsset[];
};

export type CreateReviewPackage = Pick<ReviewQueueItem, 'title' | 'category' | 'risk'> & ReviewPackageMetadata;

export type ReviewDecision = 'approved' | 'rejected' | 'queued';

export type ReviewQueueItem = ReviewPackageMetadata & {
  id: string;
  title: string;
  owner: string;
  status: string;
  risk: BoardItem['risk'];
  category: string;
  due: string;
  workflowId?: string;
  publishingId?: string;
  sourceIds?: string[];
};
