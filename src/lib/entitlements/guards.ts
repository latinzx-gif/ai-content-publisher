import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type FeatureKey =
  | 'custom_agents'
  | 'model_selection'
  | 'agent_routes'
  | 'agent_prompt_editing'
  | 'log_exports'
  | 'rag_queries'
  | 'publishing_integrations'
  | 'advanced_analytics';

type EntitlementCheck = {
  allowed: boolean;
  featureKey: FeatureKey;
  upgradeRequired: boolean;
};

export async function checkFeature(featureKey: FeatureKey): Promise<EntitlementCheck> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('has_feature', {
    feature_key_input: featureKey,
  });

  if (error) {
    throw new Error(`Unable to check entitlement "${featureKey}": ${error.message}`);
  }

  return {
    allowed: Boolean(data),
    featureKey,
    upgradeRequired: !data,
  };
}

export async function requireFeature(featureKey: FeatureKey) {
  const check = await checkFeature(featureKey);
  return check.allowed ? null : featureLockedResponse(check.featureKey);
}

export function featureLockedResponse(featureKey: FeatureKey) {
  return NextResponse.json(
    {
      error: 'Feature locked',
      feature: featureKey,
      upgradeRequired: true,
      message: `This feature is not available on the current plan: ${featureKey}`,
    },
    { status: 402 },
  );
}
