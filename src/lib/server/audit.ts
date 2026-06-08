import type { SupabaseClient } from '@supabase/supabase-js';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';

type AuditEventInput = {
  actorProfileId: string | null;
  eventType: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditEvent(supabase: SupabaseClient, event: AuditEventInput) {
  const { error } = await supabase.from('audit_events').insert({
    actor_profile_id: event.actorProfileId,
    event_type: event.eventType,
    target_type: event.targetType ?? null,
    target_id: event.targetId ?? null,
    metadata: event.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  await writeSystemLogBestEffort(supabase, {
    actorProfileId: event.actorProfileId,
    eventType: event.eventType,
    source: 'audit',
    status: 'audit',
    targetType: event.targetType,
    targetId: event.targetId,
    message: `Audit event recorded: ${event.eventType}`,
    metadata: event.metadata,
  });
}
