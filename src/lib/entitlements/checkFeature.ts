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

export type FeatureCheckResult = {
  enabled: boolean;
  planSlug: string | null;
  limitValue: number | null;
};

export async function checkFeature(featureKey: FeatureKey): Promise<FeatureCheckResult> {
  const supabase = createSupabaseServerClient();

  const { data: planSlug, error: planError } = await supabase.rpc('current_plan_slug');

  if (planError) {
    throw new Error(planError.message);
  }

  const { data: hasFeature, error: featureError } = await supabase.rpc('has_feature', {
    feature_key_input: featureKey,
  });

  if (featureError) {
    throw new Error(featureError.message);
  }

  const { data: entitlement } = await supabase
    .from('feature_entitlements')
    .select('limit_value, plans!inner(slug)')
    .eq('feature_key', featureKey)
    .eq('plans.slug', planSlug ?? '')
    .maybeSingle();

  return {
    enabled: Boolean(hasFeature),
    planSlug: (planSlug as string | null) ?? null,
    limitValue: typeof entitlement?.limit_value === 'number' ? entitlement.limit_value : null,
  };
}

export async function requireFeature(featureKey: FeatureKey) {
  const result = await checkFeature(featureKey);

  if (!result.enabled) {
    const error = new Error(`Feature "${featureKey}" is not enabled for the current plan.`);
    error.name = 'FeatureLockedError';
    throw error;
  }

  return result;
}
