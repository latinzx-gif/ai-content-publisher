#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pagePath = path.join(root, 'src/app/page.tsx');
const lines = fs.readFileSync(pagePath, 'utf8').split('\n');

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function write(relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('wrote', relPath);
}

// --- Icons ---
const iconsBody = slice(8332, 8508)
  .replace(/^function /gm, 'export function ')
  .replace(/^function SettingsMenuIcon/gm, 'export function SettingsMenuIcon');

write(
  'src/features/prd/components/icons/prd-icons.tsx',
  `'use client';

import type { ComponentType } from 'react';
import { Archive, Bell, Bot, Filter, Settings, UploadCloud } from 'lucide-react';

${iconsBody}
`,
);

// --- Config files ---
write(
  'src/features/prd/config/analytics-display.ts',
  `import { Activity, FileText, MessageSquareText } from 'lucide-react';
import { MousePointerIcon } from '@/features/prd/components/icons/prd-icons';

${slice(1384, 1412)}
`,
);

write(
  'src/features/prd/config/content-library.ts',
  slice(1414, 1475) + '\n',
);

write(
  'src/features/prd/config/knowledge-base-display.ts',
  slice(1477, 1525) + '\n',
);

write(
  'src/features/prd/config/rules-brand.ts',
  slice(2089, 2107) + '\n',
);

write(
  'src/features/prd/config/settings-display.ts',
  `import {
  BufferIcon,
  DriveIcon,
  FacebookIcon,
  InstagramIcon,
  ObsidianIcon,
  TiktokIcon,
  YoutubeIcon,
} from '@/features/prd/components/icons/prd-icons';

${slice(2111, 2384)}
`,
);

write(
  'src/features/prd/config/create-post-workflow.ts',
  slice(4608, 4645) + '\n',
);

// --- Create post package lib ---
write(
  'src/features/prd/lib/create-post-package.ts',
  `import { languageCodeLabelMap, normalizeLanguageCodes } from '@/features/prd/lib/review-display';
import { normalizeTextValue } from '@/features/prd/lib/text';
import type { GeneratedAsset, GeneratedDraft, LanguageCode } from '@/features/prd/types/content';

${slice(1727, 2069)}
`,
);

// Add CreateReviewPackage to types
const reviewQueueTypesPath = path.join(root, 'src/features/prd/types/review-queue.ts');
let reviewQueueTypes = fs.readFileSync(reviewQueueTypesPath, 'utf8');
if (!reviewQueueTypes.includes('CreateReviewPackage')) {
  reviewQueueTypes = reviewQueueTypes.replace(
    'export type ReviewDecision',
    `export type CreateReviewPackage = Pick<ReviewQueueItem, 'title' | 'category' | 'risk'> & ReviewPackageMetadata;

export type ReviewDecision`,
  );
  fs.writeFileSync(reviewQueueTypesPath, reviewQueueTypes);
}

function viewFile(name, body, extraImports = '') {
  return `'use client';

import { useMemo, useState } from 'react';
${extraImports}

${body.replace(/^function ${name}/, `export function ${name}`)}
`;
}

// --- Views ---
write(
  'src/features/prd/views/AnalyticsView.tsx',
  viewFile(
    'AnalyticsView',
    slice(4485, 4606),
    `import { Archive, FileText } from 'lucide-react';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import {
  analyticsSummary,
  contentPerformance,
  languagePerformance,
  topicTrends,
} from '@/features/prd/config/analytics-display';`,
  ),
);

write(
  'src/features/prd/components/create/ManualCreatePanel.tsx',
  slice(6649, 7156).replace(/^function ManualCreatePanel/, 'export function ManualCreatePanel'),
);

write(
  'src/features/prd/components/create/QuickAiCreatePanel.tsx',
  slice(7157, 7333).replace(/^function QuickAiCreatePanel/, 'export function QuickAiCreatePanel'),
);

write(
  'src/features/prd/components/create/SourceSearchCreatePanel.tsx',
  slice(7334, 7582).replace(/^function SourceSearchCreatePanel/, 'export function SourceSearchCreatePanel'),
);

write(
  'src/features/prd/components/create/GenerationCreatePanel.tsx',
  slice(7583, 7808).replace(/^function GenerationCreatePanel/, 'export function GenerationCreatePanel'),
);

write(
  'src/features/prd/components/create/ReadyForReviewCreatePanel.tsx',
  slice(7809, 8101).replace(/^function ReadyForReviewCreatePanel/, 'export function ReadyForReviewCreatePanel'),
);

write(
  'src/features/prd/views/CreatePostView.tsx',
  `'use client';

import { ChevronRight, Filter, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CreateStep } from '@/features/prd/components/CreateStep';
import { GenerationCreatePanel } from '@/features/prd/components/create/GenerationCreatePanel';
import { ManualCreatePanel } from '@/features/prd/components/create/ManualCreatePanel';
import { QuickAiCreatePanel } from '@/features/prd/components/create/QuickAiCreatePanel';
import { ReadyForReviewCreatePanel } from '@/features/prd/components/create/ReadyForReviewCreatePanel';
import { SourceSearchCreatePanel } from '@/features/prd/components/create/SourceSearchCreatePanel';
import {
  createNextDraftWorkflowId,
  createWorkflowSteps,
  getFacebookLayoutGuideline,
  type CreateWorkflowStep,
} from '@/features/prd/config/create-post-workflow';
import { buildDraftPackageFromContext, normalizeStringList } from '@/features/prd/lib/create-post-package';
import { getLanguageDisplayLabels, normalizeLanguageCodes } from '@/features/prd/lib/review-display';
import { normalizeTextValue } from '@/features/prd/lib/text';
import { getReviewIdForWorkflowId } from '@/features/prd/lib/workflow-ids';
import type { LogEvent } from '@/features/prd/types/logs';
import type { CreateReviewPackage } from '@/features/prd/types/review-queue';

${slice(4647, 5080).replace(/^function CreatePostView/, 'export function CreatePostView')}
`,
);

write(
  'src/features/prd/components/LibraryRow.tsx',
  `'use client';

${slice(8102, 8161).replace(/^function LibraryRow/, 'export function LibraryRow')}
`,
);

write(
  'src/features/prd/views/ContentLibraryView.tsx',
  viewFile(
    'ContentLibraryView',
    slice(5082, 5239),
    `import { Archive, Filter, Library, PenLine, Search } from 'lucide-react';
import { LibraryRow } from '@/features/prd/components/LibraryRow';
import { contentCategories, libraryItems } from '@/features/prd/config/content-library';`,
  ),
);

write(
  'src/features/prd/components/KnowledgeSourceRow.tsx',
  `'use client';

${slice(8162, 8193).replace(/^function KnowledgeSourceRow/, 'export function KnowledgeSourceRow')}
`,
);

write(
  'src/features/prd/components/KnowledgeConnectionCard.tsx',
  `'use client';

${slice(8194, 8223).replace(/^function KnowledgeConnectionCard/, 'export function KnowledgeConnectionCard')}
`,
);

write(
  'src/features/prd/views/KnowledgeBaseView.tsx',
  viewFile(
    'KnowledgeBaseView',
    slice(5241, 5553),
    `import { BookOpen, GlobeIcon, Layers3, Link2, MessageSquareText, Search, UploadCloud } from 'lucide-react';
import { KnowledgeConnectionCard } from '@/features/prd/components/KnowledgeConnectionCard';
import { KnowledgeSourceRow } from '@/features/prd/components/KnowledgeSourceRow';
import { DriveIcon, ObsidianIcon } from '@/features/prd/components/icons/prd-icons';
import { knowledgeSources, ragRules } from '@/features/prd/config/knowledge-base-display';
import type { RagChatApiResponse } from '@/features/prd/types/api';`,
  ),
);

write(
  'src/features/prd/components/BrandVoiceCard.tsx',
  `'use client';

${slice(8224, 8246).replace(/^function BrandVoiceCard/, 'export function BrandVoiceCard')}
`,
);

write(
  'src/features/prd/components/RulesPillPanel.tsx',
  `'use client';

${slice(8247, 8272).replace(/^function RulesPillPanel/, 'export function RulesPillPanel')}
`,
);

write(
  'src/features/prd/views/RulesBrandView.tsx',
  `'use client';

import { ShieldCheck } from 'lucide-react';
import { BrandVoiceCard } from '@/features/prd/components/BrandVoiceCard';
import { RulesPillPanel } from '@/features/prd/components/RulesPillPanel';
import {
  coreServices,
  imageGenerationConnector,
  prohibitedTerms,
  targetAudiences,
} from '@/features/prd/config/rules-brand';

${slice(5555, 5629).replace(/^function RulesBrandView/, 'export function RulesBrandView')}
`,
);

write(
  'src/features/prd/components/IntegrationAppCard.tsx',
  `'use client';

${slice(8273, 8330).replace(/^function IntegrationAppCard/, 'export function IntegrationAppCard')}
`,
);

// Settings children
const settingsImports = `import { useState } from 'react';
import {
  Archive,
  Bell,
  Bot,
  Check,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Home,
  Inbox,
  Layers3,
  Lock,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { IntegrationAppCard } from '@/features/prd/components/IntegrationAppCard';
import { SettingsMenuIcon } from '@/features/prd/components/icons/prd-icons';
import {
  backendApiContracts,
  backendDatabaseTables,
  backendEnvContracts,
  backendHandoffChecklist,
  backendImplementationHandoff,
  backendJobQueues,
  backendRlsPolicyHandoff,
  backendSecurityChecklist,
  integrationApps,
  providerKeyReadiness,
  releaseDeployPath,
  releaseOpenRisks,
  releaseReadinessGates,
  settingsGroups,
  settingsReadinessChecklist,
  teamMembers,
} from '@/features/prd/config/settings-display';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';
`;

write(
  'src/features/prd/views/settings/SettingsCodexConnection.tsx',
  `'use client';

import { Bot, Check, ChevronRight, Circle, Lock, UploadCloud } from 'lucide-react';
import { useState } from 'react';

${slice(5702, 5931).replace(/^function SettingsCodexConnection/, 'export function SettingsCodexConnection')}
`,
);

write(
  'src/features/prd/views/settings/SettingsProfile.tsx',
  `'use client';

import { PenLine, UsersIcon } from 'lucide-react';
import { teamMembers } from '@/features/prd/config/settings-display';

${slice(5932, 5985).replace(/^function SettingsProfile/, 'export function SettingsProfile')}
`,
);

write(
  'src/features/prd/views/settings/BackendReadinessMap.tsx',
  `'use client';

import { Layers3, ShieldCheck } from 'lucide-react';
import {
  backendApiContracts,
  backendDatabaseTables,
  backendEnvContracts,
  backendJobQueues,
  backendSecurityChecklist,
} from '@/features/prd/config/settings-display';

${slice(5986, 6125).replace(/^function BackendReadinessMap/, 'export function BackendReadinessMap')}
`,
);

write(
  'src/features/prd/views/settings/BackendImplementationHandoff.tsx',
  `'use client';

import { ChevronRight, FileText } from 'lucide-react';
import {
  backendHandoffChecklist,
  backendImplementationHandoff,
  backendRlsPolicyHandoff,
} from '@/features/prd/config/settings-display';

${slice(6126, 6197).replace(/^function BackendImplementationHandoff/, 'export function BackendImplementationHandoff')}
`,
);

write(
  'src/features/prd/views/settings/SettingsReleaseReadiness.tsx',
  `'use client';

import { Check, ChevronRight, ShieldCheck, UploadCloud } from 'lucide-react';
import { releaseDeployPath, releaseOpenRisks, releaseReadinessGates } from '@/features/prd/config/settings-display';

${slice(6198, 6283).replace(/^function SettingsReleaseReadiness/, 'export function SettingsReleaseReadiness')}
`,
);

write(
  'src/features/prd/views/settings/SettingsApiTokens.tsx',
  `'use client';

import { Eye, EyeOff, KeyIcon, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { providerKeyReadiness, settingsReadinessChecklist } from '@/features/prd/config/settings-display';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';

${slice(6284, 6589).replace(/^function SettingsApiTokens/, 'export function SettingsApiTokens')}
`,
);

write(
  'src/features/prd/views/settings/SettingsIntegrations.tsx',
  `'use client';

import { PlugIcon } from '@/features/prd/components/icons/prd-icons';
import { IntegrationAppCard } from '@/features/prd/components/IntegrationAppCard';
import { integrationApps } from '@/features/prd/config/settings-display';

${slice(6590, 6648).replace(/^function SettingsIntegrations/, 'export function SettingsIntegrations')}
`,
);

write(
  'src/features/prd/views/SettingsView.tsx',
  `'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { SettingsMenuIcon } from '@/features/prd/components/icons/prd-icons';
import { settingsGroups } from '@/features/prd/config/settings-display';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';
import { SettingsApiTokens } from '@/features/prd/views/settings/SettingsApiTokens';
import { SettingsCodexConnection } from '@/features/prd/views/settings/SettingsCodexConnection';
import { SettingsIntegrations } from '@/features/prd/views/settings/SettingsIntegrations';
import { SettingsProfile } from '@/features/prd/views/settings/SettingsProfile';
import { SettingsReleaseReadiness } from '@/features/prd/views/settings/SettingsReleaseReadiness';

${slice(5631, 5699).replace(/^function SettingsView/, 'export function SettingsView')}
`,
);

// --- PrdPageClient ---
const headerImports = slice(1, 180);
const prdClientBody = slice(181, 4474);

// Remove constants moved to config (lines 1384-1412, 1414-1475, 1477-1525, 2089-2384 relative to original)
// and create-post helpers moved to lib (1727-2069) and duplicate types (1681-1724, 2070-2082)
const prdClientLines = prdClientBody.split('\n');
const filteredPrdClient = prdClientLines
  .filter((_, i) => {
    const lineNo = 181 + i;
    if (lineNo >= 1384 && lineNo <= 1525) return false;
    if (lineNo >= 1681 && lineNo <= 1724) return false;
    if (lineNo >= 1727 && lineNo <= 2082) return false;
    if (lineNo >= 2089 && lineNo <= 2384) return false;
    return true;
  })
  .join('\n')
  .replace(/^function PrdPageClient/, 'export function PrdPageClient');

write(
  'src/features/prd/PrdPageClient.tsx',
  `${headerImports}
import { AnalyticsView } from '@/features/prd/views/AnalyticsView';
import { CreatePostView } from '@/features/prd/views/CreatePostView';
import { ContentLibraryView } from '@/features/prd/views/ContentLibraryView';
import { KnowledgeBaseView } from '@/features/prd/views/KnowledgeBaseView';
import { RulesBrandView } from '@/features/prd/views/RulesBrandView';
import { SettingsView } from '@/features/prd/views/SettingsView';
import type { CreateReviewPackage } from '@/features/prd/types/review-queue';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';
import { buildDraftPackageFromContext, buildDraftPackageSignature, deriveBrandVoice, normalizeStringList } from '@/features/prd/lib/create-post-package';

${filteredPrdClient}
`,
);

// --- Thin page.tsx ---
write(
  'src/app/page.tsx',
  `'use client';

import { Suspense } from 'react';
import { PrdPageLoadingFallback } from '@/features/prd/components/PrdPageLoadingFallback';
import { PrdPageClient } from '@/features/prd/PrdPageClient';

export default function PrdPage() {
  return (
    <Suspense fallback={<PrdPageLoadingFallback />}>
      <PrdPageClient />
    </Suspense>
  );
}
`,
);

console.log('Extraction complete. Run typecheck to fix imports.');
