import { NextResponse } from 'next/server';
import { requireActiveTeamMember, requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CalendarSlot = {
  date: string;
  count: number;
  warning: 'ok' | 'notice' | 'critical';
};

type ScheduledContentItem = {
  id: string;
  title: string | null;
  service_area: string | null;
  status: string;
  risk_level: string | null;
  scheduled_at: string;
  metadata: Record<string, unknown>;
};

type AcpPostRow = {
  post_id: string;
  brand: string | null;
  platform: string | null;
  status: string;
  scheduled_at: string;
  metadata: Record<string, unknown>;
};

function mapAcpPostToCalendarItem(row: AcpPostRow): ScheduledContentItem {
  return {
    id: row.post_id,
    title: null,
    service_area: row.brand,
    status: row.status,
    risk_level: null,
    scheduled_at: row.scheduled_at,
    metadata: row.metadata,
  };
}

type MoveContentBody = {
  contentItemId?: string;
  scheduledAt?: string;
};

const DAILY_NOTICE = 3;
const DAILY_CAPACITY = 5;

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireActiveTeamMember(supabase, actor);

    if (forbidden) {
      return forbidden;
    }

    const { start, end } = extractCalendarQuery(request.url);
    const { data: rawPosts, error } = await supabase
      .from('acp_posts')
      .select('post_id,brand,platform,status,scheduled_at,metadata')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', start)
      .lt('scheduled_at', end)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const scheduledItems = (rawPosts ?? []).map((row) => mapAcpPostToCalendarItem(row as AcpPostRow));
    const dailySlots = summarizeCalendarSlots(scheduledItems);

    return NextResponse.json({
      window: { start, end },
      items: scheduledItems,
      dailySlots,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_publish');

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json()) as MoveContentBody;

    if (!body.contentItemId || !body.scheduledAt) {
      return NextResponse.json({ error: 'contentItemId and scheduledAt are required' }, { status: 400 });
    }

    if (!isIsoDateTime(body.scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    const { data: acpPost, error: fetchError } = await supabase
      .from('acp_posts')
      .select('post_id,status,brand')
      .eq('post_id', body.contentItemId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!acpPost) {
      return NextResponse.json({ error: 'content item not found' }, { status: 404 });
    }

    if (acpPost.status === 'published' || acpPost.status === 'publishing') {
      return NextResponse.json({ error: 'Published or in-progress content cannot be rescheduled' }, { status: 409 });
    }

    const nextStatus = ['draft', 'revision_requested', 'approved', 'rejected', 'failed'].includes(acpPost.status)
      ? 'scheduled'
      : acpPost.status;
    const scheduledIso = new Date(body.scheduledAt).toISOString();

    const { data: updatedPost, error: updateError } = await supabase
      .from('acp_posts')
      .update({ scheduled_at: scheduledIso, status: nextStatus })
      .eq('post_id', body.contentItemId)
      .select('post_id,brand,platform,status,scheduled_at,metadata')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const sameDayWindow = getDayWindow(scheduledIso);
    const { count: sameDayCount, error: countError } = await supabase
      .from('acp_posts')
      .select('post_id', { count: 'exact', head: true })
      .not('post_id', 'eq', body.contentItemId)
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', sameDayWindow.start)
      .lt('scheduled_at', sameDayWindow.end);

    if (countError) {
      throw new Error(countError.message);
    }

    const sameDayTotal = (sameDayCount ?? 0) + 1;
    const warning = sameDayTotal > DAILY_CAPACITY ? 'critical' : sameDayTotal >= DAILY_NOTICE ? 'notice' : 'ok';

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'calendar.item_rescheduled',
      targetType: 'acp_post',
      targetId: acpPost.post_id,
      metadata: {
        previousStatus: acpPost.status,
        nextStatus,
        scheduledAt: scheduledIso,
        sameDayTotal,
      },
    });

    return NextResponse.json({
      item: updatedPost ? mapAcpPostToCalendarItem(updatedPost as AcpPostRow) : null,
      capacity: {
        date: scheduledIso.slice(0, 10),
        count: sameDayTotal,
        warning,
      },
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Calendar move failed',
      source: 'calendar_slots_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function extractCalendarQuery(url: string): { start: string; end: string } {
  const parsed = new URL(url);
  const params = parsed.searchParams;

  const today = new Date();
  const startInput = params.get('start');
  const endInput = params.get('end');
  const start = startInput ? normalizeDate(startInput, true) : toDateTime(startOfDayOffset(today, -7));
  const end = endInput ? normalizeDate(endInput, false) : toDateTime(startOfDayOffset(today, 30));

  return { start, end };
}

function summarizeCalendarSlots(items: ScheduledContentItem[]): CalendarSlot[] {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.scheduled_at?.slice(0, 10) ?? 'unassigned';

    if (!acc[key]) {
      acc[key] = 0;
    }

    acc[key] += 1;
    return acc;
  }, {});

  return Object.entries(totals)
    .filter(([date]) => date !== 'unassigned')
    .map(([date, count]) => {
      const warning: CalendarSlot['warning'] = count > DAILY_CAPACITY
        ? 'critical'
        : count >= DAILY_NOTICE
          ? 'notice'
          : 'ok';

      return {
        date,
        count,
        warning,
      };
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

function getDayWindow(isoDate: string) {
  const start = new Date(isoDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function startOfDayOffset(reference: Date, offsetDays: number) {
  const value = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  value.setUTCDate(value.getUTCDate() + offsetDays);
  return value;
}

function toDateTime(date: Date) {
  return date.toISOString();
}

function normalizeDate(date: string, clampStart: boolean) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    const fallback = clampStart ? startOfDayOffset(now, -7) : startOfDayOffset(now, 30);
    return fallback.toISOString();
  }

  if (clampStart) {
    parsed.setUTCHours(0, 0, 0, 0);
  } else {
    parsed.setUTCHours(23, 59, 59, 999);
  }

  return parsed.toISOString();
}

function isIsoDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}
