import {
  DAY_IN_MS,
  createBangkokDateTime,
  formatFocusTime,
  monthLabels,
  toAppDateKey,
  toBangkokDateParts,
  toDateParts,
} from '@/features/prd/lib/calendar-display';
import type {
  CalendarApiResponse,
  CalendarCapacity,
  CalendarDay,
  CalendarFocusPost,
  CalendarPayload,
  CalendarPostStatus,
} from '@/features/prd/types/api';

export function toIsoDate(date: Date) {
  return toAppDateKey(date) ?? '';
}


export function getCalendarWindow() {
  const now = new Date();
  const nowParts = toBangkokDateParts(now);
  if (!nowParts) {
    return {
      start: now,
      end: new Date(now.getTime() + 34 * DAY_IN_MS),
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  }

  const monthStart = createBangkokDateTime(nowParts.year, nowParts.month, 1);
  const monthStartParts = toBangkokDateParts(monthStart);
  const mondayOffset = monthStartParts ? (monthStartParts.weekday + 6) % 7 : 0;
  const start = new Date(monthStart.getTime() - mondayOffset * DAY_IN_MS);
  const end = new Date(start.getTime() + 34 * DAY_IN_MS);

  return {
    start,
    end,
    month: nowParts.month - 1,
    year: nowParts.year,
  };
}

export function mapCalendarStatus(status: string | null): CalendarPostStatus {
  const normalized = (status ?? '').toLowerCase();

  if (normalized === 'published' || normalized === 'posted') {
    return 'posted';
  }

  if (normalized === 'error' || normalized === 'failed' || normalized === 'cancelled') {
    return 'issue';
  }

  if (normalized === 'draft' || normalized === 'source_search' || normalized === 'research') {
    return 'draft';
  }

  return 'queued';
}


export function mapCalendarPayload(payload: CalendarApiResponse): CalendarPayload {
  const { items, dailySlots } = payload;
  const byDate = new Map<string, CalendarFocusPost[]>();
  const focusKey = toAppDateKey(new Date()) ?? toIsoDate(new Date());
  const { start, month } = getCalendarWindow();

  items.forEach((item) => {
    if (!item.scheduled_at) return;

    const scheduledAt = item.scheduled_at;
    const key = toAppDateKey(scheduledAt);
    if (!key) {
      return;
    }
    const post: CalendarFocusPost = {
      id: item.id,
      time: formatFocusTime(item.scheduled_at),
      title: item.title ?? 'Untitled content',
      service: item.service_area ?? 'General',
      status: mapCalendarStatus(item.status),
      scheduledAt,
    };

    const current = byDate.get(key) ?? [];
    current.push(post);
    byDate.set(key, current);
  });

  const days: CalendarDay[] = [];
  for (let index = 0; index < 35; index += 1) {
    const value = new Date(start.getTime() + index * DAY_IN_MS);
    const valueParts = toBangkokDateParts(value);
    if (!valueParts) {
      continue;
    }

    const key = `${valueParts.year}-${toDateParts(valueParts.month)}-${toDateParts(valueParts.day)}`;
    const posts = byDate.get(key) ?? [];

    days.push({
      date: String(valueParts.day),
      dateKey: key,
      muted: valueParts.month - 1 !== month,
      posts: posts.map((entry) => ({
        id: entry.id,
        title: entry.title,
        service: entry.service,
        status: entry.status,
        scheduledAt: entry.scheduledAt,
      })),
    });
  }

  const focusPosts = byDate.get(focusKey)?.slice(0, 6) ?? [];
  const focusedKey = focusPosts.length ? focusKey : toAppDateKey(new Date()) ?? toIsoDate(new Date());
  const focusedParts = focusedKey?.split('-').map(Number) ?? [];
  const focusLabel = focusedParts.length === 3 && !Number.isNaN(focusedParts[0]) && !Number.isNaN(focusedParts[1]) && !Number.isNaN(focusedParts[2]) && focusedParts[1] >= 1 && focusedParts[1] <= 12
    ? `${monthLabels[focusedParts[1] - 1]} ${focusedParts[2]}`
    : 'June 15';

  return {
    dailySlotsByDate: dailySlots.reduce(
      (acc, slot) => {
        const slotDate = toAppDateKey(slot.date) ?? toAppDateKey(`${slot.date}T00:00:00`);
        if (slotDate) {
          acc[slotDate] = slot;
        }
        return acc;
      },
      {} as Record<string, CalendarCapacity>,
    ),
    days,
    focusPosts: focusPosts.length
      ? focusPosts
      : Array.from(byDate.entries())
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .find(() => true)?.[1]
          ?.slice(0, 6) ?? [],
    focusLabel,
  };
}

export const fallbackCalendarDays: CalendarDay[] = [];
export const fallbackFocusDayPosts: CalendarFocusPost[] = [];
