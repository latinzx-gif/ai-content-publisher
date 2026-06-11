export const planEntitlements = {
  name: 'Basic',
  customAgents: false,
  modelSelection: false,
  promptEditing: false,
  logExports: false,
  ragQueries: true,
  publishingIntegrations: true,
};

export const agentFeatureFlags = {
  showPlanBanner: !planEntitlements.customAgents && planEntitlements.name !== 'Basic',
  showRoutingPreview: true,
};

export const showAgentRouting = agentFeatureFlags.showRoutingPreview;
export const showPlanBanner = agentFeatureFlags.showPlanBanner;
