'use client';

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

export function CreatePostView({
  onNoopAction,
  onSendToReviewQueue,
  onWorkflowAuditEvent,
  defaultCreatorName,
}: {
  onNoopAction: (message: string) => void;
  onSendToReviewQueue: (packageItem: CreateReviewPackage) => void;
  onWorkflowAuditEvent: (event: Omit<LogEvent, 'time'>) => void;
  defaultCreatorName?: string;
}) {
  const [mode, setMode] = useState<'manual' | 'quick'>('manual');
  const [createDraftWorkflowId, setCreateDraftWorkflowId] = useState(createNextDraftWorkflowId);
  const [currentCreateStep, setCurrentCreateStep] = useState<CreateWorkflowStep>(1);
  const [topicBrief, setTopicBrief] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['Thai (ไทย)', 'English']);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook', 'LinkedIn']);
  const [selectedImageLayout, setSelectedImageLayout] = useState('Carousel');
  const [selectedWordCount, setSelectedWordCount] = useState(500);
  const [selectedPostCount, setSelectedPostCount] = useState(1);
  const [selectedImageCount, setSelectedImageCount] = useState(6);
  const [selectedAssetIds, setSelectedAssetIds] = useState(['Image 1', 'Image 2', 'Image 3']);
  const [selectedCategory, setSelectedCategory] = useState('Tax');
  const [selectedContentGoal, setSelectedContentGoal] = useState('Educate & Lead');
  const [selectedTargetAudience, setSelectedTargetAudience] = useState('SME Owners');
  const [selectedCta, setSelectedCta] = useState('Book consultation');
  const [selectedBrandVoice, setSelectedBrandVoice] = useState('Legal advisory');
  const [selectedCitationStrictness, setSelectedCitationStrictness] = useState('Strict citations');
  const [selectedSourceConnectors, setSelectedSourceConnectors] = useState(['Knowledge Base', 'Official Link']);
  const [officialSourceLinks, setOfficialSourceLinks] = useState<string[]>(['']);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState('');
  const effectiveSelectedAssets = selectedAssetIds.filter((asset) => Number(asset.replace(/\D/g, '')) <= selectedImageCount);
  const selectedAssetsForPackage = effectiveSelectedAssets;
  const selectedLanguageLabels = getLanguageDisplayLabels(selectedLanguages);
  const payloadLanguageCodes = normalizeLanguageCodes(selectedLanguages, ['th', 'en']);
  const normalizedSourceConnectors = useMemo(() => normalizeStringList(selectedSourceConnectors, true), [selectedSourceConnectors]);
  const normalizedOfficialSourceLinks = officialSourceLinks.map((link) => link.trim()).filter((link) => link.length > 0);
  const normalizedDraftSources = useMemo(
    () => (normalizedSourceConnectors.length > 0 ? normalizedSourceConnectors : ['Knowledge Base']),
    [normalizedSourceConnectors],
  );
  const generatedDrafts = useMemo(
    () =>
      buildDraftPackageFromContext({
        topic: topicBrief,
        category: selectedCategory,
        targetAudience: selectedTargetAudience,
        brandVoice: selectedBrandVoice,
        citationStrictness: selectedCitationStrictness,
        cta: selectedCta,
        languages: payloadLanguageCodes,
        sourceConnectors: normalizedDraftSources,
        contentGoal: selectedContentGoal,
      }),
    [
      topicBrief,
      selectedCategory,
      selectedTargetAudience,
      selectedBrandVoice,
      selectedCitationStrictness,
      selectedCta,
      payloadLanguageCodes,
      normalizedDraftSources,
      selectedContentGoal,
    ],
  );
  const hasMinimumCreateSettings = selectedLanguages.length > 0 && selectedPlatforms.length > 0 && Boolean(selectedImageLayout);
  const hasSourceConnectors = selectedSourceConnectors.length > 0;
  const requiresOfficialLinks = selectedSourceConnectors.includes('Official Link');
  const hasReadySourceContext = hasSourceConnectors && (!requiresOfficialLinks || normalizedOfficialSourceLinks.length > 0);
  const manualRequiredChecks = [
    { label: 'topic brief', ready: Boolean(topicBrief.trim()) },
    { label: 'source connector', ready: selectedSourceConnectors.length > 0 },
    { label: 'language', ready: payloadLanguageCodes.length > 0 },
    { label: 'platform', ready: selectedPlatforms.length > 0 },
    { label: 'image layout', ready: Boolean(selectedImageLayout) },
    { label: 'citation rule', ready: Boolean(selectedCitationStrictness) },
  ];
  const missingManualRequirements = manualRequiredChecks.filter((item) => !item.ready).map((item) => item.label);
  const isCreateReady = mode === 'quick' ? hasMinimumCreateSettings : missingManualRequirements.length === 0;
  const selectedFacebookLayoutGuideline = getFacebookLayoutGuideline(selectedImageLayout, selectedPlatforms);
  const createValidationMessage = isCreateReady
    ? mode === 'manual'
      ? `Manual production ready: ${selectedPostCount} post(s), ${selectedLanguageLabels.length} language(s), ${selectedPlatforms.length} platform(s), ${selectedSourceConnectors.length} source connector(s), ${selectedImageCount} image option(s).`
      : `Ready: ${selectedPostCount} post(s), ${selectedLanguageLabels.length} language(s), ${selectedPlatforms.length} platform(s), ${selectedImageCount} image option(s), ${selectedImageLayout} layout.`
    : mode === 'quick'
      ? 'Choose at least one language, one platform, and one image layout before AI generation.'
      : `Manual setup missing: ${missingManualRequirements.join(', ')}.`;
  const canContinueCreate =
    currentCreateStep === 2 ? hasReadySourceContext : currentCreateStep === 1 ? isCreateReady : currentCreateStep === 3 ? generatedDrafts.length > 0 : true;
  const createFooterMessage =
    currentCreateStep === 1
      ? createValidationMessage
      : currentCreateStep === 2
        ? hasReadySourceContext
          ? 'Sources are ready for citation checking. Continue when the reference set looks safe.'
          : requiresOfficialLinks
            ? 'Official Link is selected. Add at least one official URL before generating text.'
            : 'Select at least one source connector before starting Source Search.'
        : currentCreateStep === 3
          ? 'Drafts and image layout are prepared. Continue to package the post for human review.'
          : 'Ready to send this package to Review Queue for compliance approval.';
  const createPrimaryActionLabel =
    currentCreateStep === 1
      ? 'Start Source Search'
      : currentCreateStep === 2
        ? 'Generate Text First'
        : currentCreateStep === 3
          ? 'Build Review Package'
          : 'Send to Review Queue';
  const createPrimaryActionNote =
    currentCreateStep === 1
      ? 'Source search started'
      : currentCreateStep === 2
        ? 'Text generation started before image work'
        : currentCreateStep === 3
          ? 'Review package built from text, images, and layout'
          : 'Package sent to Review Queue';
  const handleSourceConnectorsChange = (values: string[]) => {
    setSelectedSourceConnectors(values);

    if (!values.includes('Official Link')) {
      setOfficialSourceLinks([]);
      return;
    }

    setOfficialSourceLinks((links) => (links.length > 0 ? links : ['']));
  };
  const recordCreateWorkflowEvent = (type: string, status: string, message: string, relatedId?: string, severity: LogEvent['severity'] = 'Low') => {
    onWorkflowAuditEvent({
      type,
      source: 'Create Post',
      severity,
      message,
      itemId: createDraftWorkflowId,
      relatedId,
      status,
    });
  };
  const saveCreateDraft = () => {
    const draftTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLastDraftSavedAt(draftTime);
    onNoopAction(`Create Post draft saved at ${draftTime}: ${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}, step ${currentCreateStep}`);
    recordCreateWorkflowEvent(
      'Draft saved',
      `Step ${currentCreateStep}`,
      `${createDraftWorkflowId} draft saved at step ${currentCreateStep} (${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'})`,
    );
  };
  const goToPreviousCreateStep = () => {
    if (currentCreateStep <= 1) {
      return;
    }

    const previousStep = (currentCreateStep - 1) as CreateWorkflowStep;
    setCurrentCreateStep(previousStep);
    recordCreateWorkflowEvent('Step back', `Step ${previousStep}`, `${createDraftWorkflowId} moved back from step ${currentCreateStep} to step ${previousStep}`);
  };
  const goToNextCreateStep = () => {
    if (!canContinueCreate) {
      return;
    }

    if (currentCreateStep < 4) {
      const nextStep = (currentCreateStep + 1) as CreateWorkflowStep;
      if (currentCreateStep === 2) {
        recordCreateWorkflowEvent('Text draft generated', 'Text Generation', `${createDraftWorkflowId} updated draft package for ${selectedCategory}`);
      }
      const nextStatus = currentCreateStep === 1 ? 'Source Search' : currentCreateStep === 2 ? 'Text Generation' : 'Review Package';
      recordCreateWorkflowEvent(
        currentCreateStep === 1 ? 'Source search started' : currentCreateStep === 2 ? 'Text generation started' : 'Review package built',
        nextStatus,
        `${createDraftWorkflowId} ${createPrimaryActionNote}: ${selectedCategory}, ${selectedLanguageLabels.join(', ')}, ${selectedPlatforms.join(', ')}`,
      );
      setCurrentCreateStep(nextStep);
      onNoopAction(`${createPrimaryActionNote}: moved to step ${nextStep}`);
      return;
    }

    const reviewId = getReviewIdForWorkflowId(createDraftWorkflowId);
    const draftPayload = generatedDrafts;
    recordCreateWorkflowEvent(
      'Create handoff requested',
      'Ready for Review',
      `${createDraftWorkflowId} → ${reviewId} package ready for Review Queue (${selectedLanguageLabels.join(', ')} / ${selectedPlatforms.join(', ')})`,
      reviewId,
    );
    const creatorName = normalizeTextValue(defaultCreatorName);
    onSendToReviewQueue({
      workflowId: createDraftWorkflowId,
      title: topicBrief.trim() || `${selectedCategory} content package from ${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}`,
      category: selectedCategory,
      risk: selectedCategory === 'PDPA' || selectedCategory === 'Corporate Law' ? 'Medium' : 'Low',
      createdBy: creatorName || (mode === 'quick' ? 'Quick Mode' : 'Manual Mode'),
      assetComposerStatus: 'Assets reviewed and ready for human approval',
      assetLayoutPlan: [
        ...selectedPlatforms.map((platform, index) => `${platform}: ${selectedImageLayout} crop ${index + 1} ready`),
        ...(selectedFacebookLayoutGuideline
          ? [
              `Facebook layout enforcement: ${selectedFacebookLayoutGuideline.title}`,
              `Facebook required sizes: ${selectedFacebookLayoutGuideline.size}`,
              `Facebook guardrail: ${selectedFacebookLayoutGuideline.guardrail}`,
            ]
          : []),
      ],
      brandVoice: selectedBrandVoice,
      citationStrictness: selectedCitationStrictness,
      contentGoal: selectedContentGoal,
      cta: selectedCta,
      imageCount: selectedImageCount,
      languages: payloadLanguageCodes,
      layout: selectedImageLayout,
      mode,
      platforms: selectedPlatforms,
      postCount: selectedPostCount,
      selectedAssets: selectedAssetsForPackage,
      sourceConnectors: selectedSourceConnectors,
      officialSourceLinks: normalizedOfficialSourceLinks,
      targetAudience: selectedTargetAudience,
      visualBrief: `Visual brief from generated text: ${selectedCategory} advisory concept for ${selectedTargetAudience}, ${selectedBrandVoice.toLowerCase()} tone, CTA focus on ${selectedCta.toLowerCase()}, ${selectedImageLayout.toLowerCase()} layout, avoid exaggerated claims.`,
      wordCount: selectedWordCount,
      generatedDrafts: draftPayload,
    });
    setCreateDraftWorkflowId(createNextDraftWorkflowId());
    setCurrentCreateStep(1);
    setLastDraftSavedAt('');
    setSelectedAssetIds([]);
  };
  const setCreateMode = (nextMode: typeof mode) => {
    setMode(nextMode);
    setCurrentCreateStep(1);
    recordCreateWorkflowEvent(
      'Mode changed',
      'Brief Created',
      `${createDraftWorkflowId} mode changed to ${nextMode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}`,
    );
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex min-h-12 items-center gap-2 overflow-x-auto border-b border-[#deded8] bg-[#fbfbfa] px-3 py-2 sm:gap-4 sm:px-4">
        <h2 className="shrink-0 text-sm font-semibold text-[#171717]">Create Post</h2>
        <div className="flex shrink-0 items-center rounded-xl border border-[#deded8] bg-[#f6f6f2] p-1">
          {[
            { label: 'Manual Setup', value: 'manual' as const, icon: Filter },
            { label: 'Quick AI Mode', value: 'quick' as const, icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const active = mode === item.value;

            return (
              <button
                key={item.value}
                aria-pressed={active}
                onClick={() => setCreateMode(item.value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${
                  active ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="h-5 w-px bg-[#deded8]" />
        {createWorkflowSteps.map((step, stepIndex) => (
          <div key={step.index} className="flex shrink-0 items-center gap-4">
            <CreateStep completed={currentCreateStep > step.index} index={step.index} label={step.label} active={currentCreateStep === step.index} />
            {stepIndex < createWorkflowSteps.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-[#c2c2ba]" /> : null}
          </div>
        ))}
      </div>

      <div className="min-h-[560px] lg:min-h-[690px]">
        <section className="flex min-w-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
	            {currentCreateStep === 1 ? (
	              mode === 'quick' ? (
	                <QuickAiCreatePanel
                    imageCount={selectedImageCount}
                    languages={selectedLanguages}
                    layout={selectedImageLayout}
                    onImageCountChange={setSelectedImageCount}
                    onLanguagesChange={setSelectedLanguages}
                    onLayoutChange={setSelectedImageLayout}
                    onPlatformsChange={setSelectedPlatforms}
                    onPostCountChange={setSelectedPostCount}
                    platforms={selectedPlatforms}
                    postCount={selectedPostCount}
                  />
	              ) : (
	                <ManualCreatePanel
	                  category={selectedCategory}
                    citationStrictness={selectedCitationStrictness}
                    contentGoal={selectedContentGoal}
                    cta={selectedCta}
                    imageCount={selectedImageCount}
                    languages={selectedLanguages}
                    layout={selectedImageLayout}
                    brandVoice={selectedBrandVoice}
	                  onCategoryChange={setSelectedCategory}
                    onCitationStrictnessChange={setSelectedCitationStrictness}
                    onContentGoalChange={setSelectedContentGoal}
                    onCtaChange={setSelectedCta}
                    onImageCountChange={setSelectedImageCount}
                    onLanguagesChange={setSelectedLanguages}
                    onLayoutChange={setSelectedImageLayout}
                    onPlatformsChange={setSelectedPlatforms}
                    onPostCountChange={setSelectedPostCount}
                    onBrandVoiceChange={setSelectedBrandVoice}
                    onSourceConnectorsChange={handleSourceConnectorsChange}
                    onTargetAudienceChange={setSelectedTargetAudience}
	                  onTopicChange={setTopicBrief}
	                  onWordCountChange={setSelectedWordCount}
                    platforms={selectedPlatforms}
	                  postCount={selectedPostCount}
                    sourceConnectors={selectedSourceConnectors}
                    targetAudience={selectedTargetAudience}
	                  topic={topicBrief}
	                  wordCount={selectedWordCount}
	                />
	              )
	            ) : currentCreateStep === 2 ? (
	              <SourceSearchCreatePanel
                  brandVoice={selectedBrandVoice}
                  category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
                  languages={selectedLanguages}
                  mode={mode}
                  onSourceConnectorsChange={handleSourceConnectorsChange}
                  onOfficialSourceLinksChange={setOfficialSourceLinks}
                  platforms={selectedPlatforms}
                  officialSourceLinks={officialSourceLinks}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
                  topic={topicBrief}
                />
	            ) : currentCreateStep === 3 ? (
	              <GenerationCreatePanel
                  brandVoice={selectedBrandVoice}
                  category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
                  imageCount={selectedImageCount}
                  languages={selectedLanguages}
                  generatedDrafts={generatedDrafts}
                  layout={selectedImageLayout}
                  platforms={selectedPlatforms}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
                  topic={topicBrief}
                  wordCount={selectedWordCount}
                />
	            ) : (
	              <ReadyForReviewCreatePanel
                  brandVoice={selectedBrandVoice}
                  generatedDrafts={generatedDrafts}
	                category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
	                imageCount={selectedImageCount}
	                languages={selectedLanguages}
	                layout={selectedImageLayout}
	                mode={mode}
	                onEditAssets={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction('Returned to Generation for asset editing');
	                }}
	                onEditText={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction('Returned to Generation for text editing');
	                }}
	                onRegenerateImage={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction(`Regenerating ${selectedImageCount} image option(s) from visual brief`);
	                }}
	                platforms={selectedPlatforms}
	                postCount={selectedPostCount}
                  selectedAssets={selectedAssetsForPackage}
                  onSelectedAssetsChange={setSelectedAssetIds}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
	                topic={topicBrief}
	                wordCount={selectedWordCount}
	              />
	            )}
	          </div>

	          <div className="flex min-h-14 flex-col items-stretch justify-between gap-3 border-t border-[#deded8] bg-[#fbfbfa] px-3 py-3 sm:flex-row sm:items-center sm:px-4">
	            <div className="min-w-0 sm:flex-1">
	              <p className={`text-xs font-semibold ${canContinueCreate ? 'text-emerald-700' : 'text-amber-700'}`}>{createFooterMessage}</p>
	              <p className="mt-0.5 text-[11px] font-medium text-[#8a8a82]">
                  Workflow {createDraftWorkflowId} · Step {currentCreateStep} of 4{lastDraftSavedAt ? ` · Draft saved ${lastDraftSavedAt}` : ''}
                </p>
	            </div>
	            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
                <button
                  onClick={saveCreateDraft}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] shadow-sm hover:bg-[#f6f6f2] sm:w-auto"
                  type="button"
                >
                  Save Draft
                </button>
	              {currentCreateStep > 1 ? (
	                <button
	                  onClick={goToPreviousCreateStep}
	                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] shadow-sm hover:bg-[#f6f6f2] sm:w-auto"
	                  type="button"
	                >
	                  Back
	                </button>
	              ) : null}
	              <button
	                disabled={!canContinueCreate}
	                onClick={goToNextCreateStep}
	                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1f5eff] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#194bd1] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
	                type="button"
	              >
	                {createPrimaryActionLabel}
	                <ChevronRight className="h-4 w-4" />
	              </button>
	            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
