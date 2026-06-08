import type { SupabaseClient } from '@supabase/supabase-js';

export type SystemLogSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SystemLogStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'open' | 'resolved' | 'audit';

type SystemLogInput = {
  actorProfileId?: string | null;
  eventType: string;
  source?: string;
  severity?: SystemLogSeverity;
  status?: SystemLogStatus;
  targetType?: string | null;
  targetId?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function writeSystemLog(supabase: SupabaseClient, event: SystemLogInput) {
  const { error } = await supabase.from('system_logs').insert({
    actor_profile_id: event.actorProfileId ?? null,
    event_type: event.eventType,
    source: event.source ?? 'api',
    severity: event.severity ?? 'low',
    status: event.status ?? 'succeeded',
    target_type: event.targetType ?? null,
    target_id: event.targetId ?? null,
    message: event.message,
    metadata: event.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function writeSystemLogBestEffort(supabase: SupabaseClient, event: SystemLogInput) {
  try {
    await writeSystemLog(supabase, event);
  } catch {
    // system_logs is a compatibility table for the backend implementation stage.
    // Do not block the primary API mutation if the migration has not been applied yet.
  }
}
