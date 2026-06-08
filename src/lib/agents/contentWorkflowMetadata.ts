export function resetDownstreamWorkflowMetadata(
  metadata: Record<string, unknown> | null | undefined,
  overrides: Record<string, unknown> = {},
) {
  const next = { ...(metadata ?? {}) };

  delete next.draftGeneration;
  delete next.imageLayout;
  delete next.compliance;
  delete next.visualBrief;
  delete next.assetComposerStatus;
  delete next.generatedDrafts;

  return {
    ...next,
    ...overrides,
  };
}
