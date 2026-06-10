import type { CalendarDay, CalendarDayPost, CalendarWeekCoverageItem } from '@/features/prd/types/api';

export const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const APP_TIMEZONE = 'Asia/Bangkok';
export const APP_TIMEZONE_OFFSET = '+07:00';
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export function toDateParts(value: number) {
  return String(value).padStart(2, '0');
}

export function toBangkokDateParts(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, hour, minute, weekday };
}

export function createBangkokDateTime(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  return new Date(`${toDateParts(year)}-${toDateParts(month)}-${toDateParts(day)}T${toDateParts(hour)}:${toDateParts(minute)}:${toDateParts(second)}${APP_TIMEZONE_OFFSET}`);
}

export function toAppDateKey(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const parts = toBangkokDateParts(value);
    if (!parts) {
      return null;
    }

    return `${parts.year}-${toDateParts(parts.month)}-${toDateParts(parts.day)}`;
  }

  if (isIsoDateKey(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const parts = toBangkokDateParts(parsed);
  if (!parts) {
    return null;
  }

  return `${parts.year}-${toDateParts(parts.month)}-${toDateParts(parts.day)}`;
}
export function toLocalDateKeyFromDate(date: Date) {
  return toAppDateKey(date) ?? '';
}
export function formatFocusTime(value: string | null) {
  if (!value) {
    return '--:--';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '--:--';
  }

  return parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

export function parseCalendarMinutes(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parts = toBangkokDateParts(new Date(value));
  if (!parts) {
    return null;
  }

  return parts.hour * 60 + parts.minute;
}

export function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function getCalendarTimelineHours(days: CalendarDay[]) {
  const minutes = days.flatMap((day) => day.posts.map((post) => parseCalendarMinutes(post.scheduledAt)).filter((value): value is number => value !== null));

  if (minutes.length === 0) {
    return Array.from({ length: 14 }, (_, index) => 8 + index);
  }

  const minHour = Math.max(0, Math.floor(Math.min(...minutes) / 60) - 1);
  const maxHour = Math.min(23, Math.floor(Math.max(...minutes) / 60) + 1);

  return Array.from({ length: maxHour - minHour + 1 }, (_, index) => minHour + index);
}

export function buildPostsByHour(posts: CalendarDayPost[], timelineHours: number[]) {
  const buckets = new Map<number, CalendarDayPost[]>();
  timelineHours.forEach((hour) => {
    buckets.set(hour, []);
  });

  posts.forEach((post) => {
    const minutes = parseCalendarMinutes(post.scheduledAt);
    if (minutes === null) {
      const fallback = timelineHours[0] ?? 8;
      const bucket = buckets.get(fallback);
      if (bucket) {
        bucket.push(post);
      }

      return;
    }

    const hour = Math.floor(minutes / 60);
    const boundedHour = hour < timelineHours[0] ? timelineHours[0] : hour > timelineHours[timelineHours.length - 1] ? timelineHours[timelineHours.length - 1] : hour;
    const bucket = buckets.get(boundedHour);

    if (bucket) {
      bucket.push(post);
      return;
    }

    const fallback = timelineHours[0] ?? 8;
    const fallbackBucket = buckets.get(fallback);
    if (fallbackBucket) {
      fallbackBucket.push(post);
    }
  });

  return timelineHours.map((hour) => ({
    hour,
    posts: buckets.get(hour)?.slice().sort((a, b) => {
      const aMinutes = parseCalendarMinutes(a.scheduledAt) ?? 24 * 60;
      const bMinutes = parseCalendarMinutes(b.scheduledAt) ?? 24 * 60;
      return aMinutes - bMinutes;
    }) ?? [],
  }));
}

export function isIsoDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatCalendarDateLabel(dateKey: string | undefined, fallbackDate: string) {
  if (!dateKey || !isIsoDateKey(dateKey)) {
    return fallbackDate;
  }

  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) {
    return fallbackDate;
  }

  const [year, month, day] = parts;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12) {
    return fallbackDate;
  }

  return `${monthLabels[month - 1]} ${day}`;
}

export function toWeekdayIndex(dateKey: string | undefined): number {
  if (!dateKey || !isIsoDateKey(dateKey)) {
    return -1;
  }

  const parsed = dateKey.split('-').map(Number);
  if (parsed.length !== 3) {
    return -1;
  }

  const [year, month, day] = parsed;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return -1;
  }

  const utcDay = new Date(Date.UTC(year, month - 1, day));
  return (utcDay.getUTCDay() + 6) % 7;
}

export function toCalendarSlotIso(selectedDate: string | undefined, hour: number, minute: number) {
  if (!selectedDate) {
    return null;
  }

  if (!isIsoDateKey(selectedDate)) {
    return null;
  }

  const safeHour = Math.max(0, Math.min(hour, 23));
  const safeMinute = Math.max(0, Math.min(minute, 59));
  const localDateTime = new Date(
    `${selectedDate}T${toDateParts(safeHour)}:${toDateParts(safeMinute)}:00${APP_TIMEZONE_OFFSET}`,
  );

  if (Number.isNaN(localDateTime.getTime())) {
    return null;
  }

  return localDateTime.toISOString();
}
export function getCalendarWeekCoverage(calendarDays: CalendarDay[], weekStartIndex: number): CalendarWeekCoverageItem[] {
  const weekDays = calendarDays.slice(weekStartIndex, weekStartIndex + 7);
  const countsByWeekday = new Array(7).fill(0).map(() => new Map<string, number>());

  weekDays.forEach((day, localIndex) => {
    day.posts.forEach((post) => {
      const current = countsByWeekday[localIndex].get(post.service) ?? 0;
      countsByWeekday[localIndex].set(post.service, current + 1);
    });
  });

  return calendarServiceCoverageRules.map((rule) => {
    const servicesForWeekday = countsByWeekday[rule.dayIndex] ?? new Map<string, number>();
    const actualCount = servicesForWeekday.get(rule.service) ?? 0;

    return {
      service: rule.service,
      day: calendarWeekdayLongNames[rule.dayIndex] ?? 'Unknown',
      dayIndex: rule.dayIndex,
      targetCount: rule.targetCount,
      actualCount,
      covered: actualCount >= rule.targetCount,
    };
  });
}
export const calendarWeekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const calendarWeekdayLongNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const calendarServiceCoverageRules: Array<{ service: string; dayIndex: number; targetCount: number }> = [
  { service: 'Corporate Law', dayIndex: 0, targetCount: 1 },
  { service: 'Accounting', dayIndex: 2, targetCount: 1 },
  { service: 'Tax', dayIndex: 4, targetCount: 1 },
  { service: 'PDPA', dayIndex: 1, targetCount: 1 },
  { service: 'Labor Law', dayIndex: 3, targetCount: 1 },
  { service: 'BOI / Investment', dayIndex: 5, targetCount: 1 },
];
