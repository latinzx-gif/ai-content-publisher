'use client';

import { CalendarDays } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { CalendarPost } from '@/features/prd/components/CalendarPost';
import { LegendDot } from '@/features/prd/components/LegendDot';
import {
  buildPostsByHour,
  calendarWeekdayNames,
  formatCalendarDateLabel,
  formatFocusTime,
  formatHourLabel,
  getCalendarTimelineHours,
  getCalendarWeekCoverage,
  toAppDateKey,
  toBangkokDateParts,
  toDateParts,
  toLocalDateKeyFromDate,
  toWeekdayIndex,
} from '@/features/prd/lib/calendar-display';
import type {
  CalendarCapacity,
  CalendarDay,
  CalendarDayPost,
  CalendarFocusPost,
} from '@/features/prd/types/api';


export function CalendarView({
  calendarDays,
  focusDayPosts,
  focusLabel,
  loading,
  error,
  onMovePost,
  viewMode,
  onModeChange,
  dailySlots,
  onNoopAction,
  monthOffset,
  onPrevMonth,
  onNextMonth,
}: {
  calendarDays: CalendarDay[];
  focusDayPosts: CalendarFocusPost[];
  focusLabel: string;
  loading?: boolean;
  error?: string;
  dailySlots?: Record<string, CalendarCapacity>;
  viewMode: 'Month' | 'Week' | 'Day';
  onModeChange: (mode: 'Month' | 'Week' | 'Day') => void;
  onMovePost?: (contentItemId: string, targetDate: string, targetHour?: number) => void;
  onNoopAction: (message: string) => void;
  monthOffset?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}) {
  const calendarDaysMapWarning = dailySlots || {};
  const inferDefaultDateKey = useCallback(() => {
    const focusedDates = focusDayPosts
      .map((post) => {
        if (!post.scheduledAt) {
          return null;
        }

        return toAppDateKey(post.scheduledAt);
      })
      .filter((value): value is string => Boolean(value));

    const fromFocus = focusedDates.find((dateKey) => calendarDays.some((day) => day.dateKey === dateKey));
    if (fromFocus) {
      return fromFocus;
    }

    const todayKey = toLocalDateKeyFromDate(new Date());
    if (calendarDays.some((day) => day.dateKey === todayKey)) {
      return todayKey;
    }

    return calendarDays.find((day) => !day.muted)?.dateKey ?? calendarDays[0]?.dateKey;
  }, [calendarDays, focusDayPosts]);
  const [manualSelectedDateKey, setManualSelectedDateKey] = useState<string | undefined>(inferDefaultDateKey);
  const selectedDateKey = useMemo(() => {
    const inferred = inferDefaultDateKey();
    if (!manualSelectedDateKey) {
      return inferred;
    }

    if (calendarDays.some((day) => day.dateKey === manualSelectedDateKey)) {
      return manualSelectedDateKey;
    }

    return inferred;
  }, [calendarDays, inferDefaultDateKey, manualSelectedDateKey]);
  const [calendarDensity, setCalendarDensity] = useState<'Compact' | 'Comfortable'>('Compact');
  const [selectedReschedulePost, setSelectedReschedulePost] = useState<CalendarDayPost | null>(null);
  const [calendarFallbackNotice, setCalendarFallbackNotice] = useState('Tap a content block to reschedule without drag-and-drop.');

  const selectedDateIndex = selectedDateKey ? calendarDays.findIndex((day) => day.dateKey === selectedDateKey) : -1;
  const normalizedSelectedIndex = selectedDateIndex >= 0 ? selectedDateIndex : 0;
  const selectedWeekday = selectedDateKey ? toWeekdayIndex(selectedDateKey) : normalizedSelectedIndex % 7;
  const selectedWeekdaySafe = selectedWeekday >= 0 ? selectedWeekday : normalizedSelectedIndex % 7;
  const weekStartIndex = Math.max(0, Math.min(normalizedSelectedIndex - selectedWeekdaySafe, Math.max(0, calendarDays.length - 7)));
  const selectedDay = calendarDays[normalizedSelectedIndex] ?? calendarDays[0];
  const selectedDayPosts = useMemo(() => selectedDay?.posts ?? [], [selectedDay]);
  const selectedDayLabel = selectedDay ? formatCalendarDateLabel(selectedDay.dateKey, focusLabel) : focusLabel;
  const visiblePostsLimit = calendarDensity === 'Compact' ? 2 : 4;
  const weekCoverage = getCalendarWeekCoverage(calendarDays, weekStartIndex);
  const dayGap = weekCoverage.filter((item) => !item.covered).length;
  const selectedDayPostsWithTime = selectedDayPosts.map((post) => ({
    ...post,
    time: formatFocusTime(post.scheduledAt),
  }));
  const calendarDisplayDays = useMemo(() => {
    if (viewMode === 'Month') {
      return calendarDays;
    }

    if (viewMode === 'Week') {
      return calendarDays.slice(weekStartIndex, weekStartIndex + 7);
    }

    return selectedDay ? [selectedDay] : [];
  }, [calendarDays, viewMode, weekStartIndex, selectedDay]);
  const calendarTimelineHours = useMemo(() => getCalendarTimelineHours(calendarDisplayDays), [calendarDisplayDays]);
  const dayPostsByHour = useMemo(() => buildPostsByHour(selectedDayPosts, calendarTimelineHours), [selectedDayPosts, calendarTimelineHours]);
  const weekPostsByDay = useMemo(
    () =>
      calendarDisplayDays.map((day) => ({
        day,
        postsByHour: buildPostsByHour(day.posts, calendarTimelineHours),
      })),
    [calendarDisplayDays, calendarTimelineHours],
  );
  const daySlotVisibleLimit = calendarDensity === 'Compact' ? 1 : 2;
  const weekSlotVisibleLimit = calendarDensity === 'Compact' ? 1 : 2;

  const getDayPostsLimit = (day: CalendarDay) => {
    const slot = day.dateKey ? calendarDaysMapWarning[day.dateKey] : undefined;
    const count = slot?.count ?? day.posts.length;
    const isNotice = slot ? slot.warning === 'notice' : count >= 3 && count < 5;
    const isCritical = slot ? slot.warning === 'critical' : count >= 5;

    if (count <= 2) {
      return null;
    }

    return {
      countText: `${count}/5`,
      tone: isCritical ? 'critical' : isNotice ? 'notice' : 'ok',
    };
  };

  const handleDrop = (
    event: { dataTransfer: DataTransfer; preventDefault: () => void },
    targetDate: string | undefined,
    targetHour?: number,
  ) => {
    if (!onMovePost || !targetDate) {
      return;
    }

    event.preventDefault();

    const payload = event.dataTransfer.getData('application/json');
    if (!payload) {
      return;
    }

    try {
      const parsed = JSON.parse(payload) as { contentItemId?: string };
      if (!parsed?.contentItemId) {
        return;
      }

      onMovePost(parsed.contentItemId, targetDate, targetHour);
    } catch {
      return;
    }
  };

  const handleDragOver = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const selectDate = (dateKey: string | undefined) => {
    if (!dateKey) {
      return;
    }

    setManualSelectedDateKey(dateKey);
  };

  const selectPostForReschedule = (post: CalendarDayPost) => {
    setSelectedReschedulePost(post);
    setCalendarFallbackNotice(`${post.title} selected. Choose a target slot from the fallback panel.`);
  };

  const rescheduleSelectedPost = (targetHour?: number) => {
    if (!selectedReschedulePost || !selectedDay?.dateKey) {
      setCalendarFallbackNotice('Select a content block and target day before rescheduling.');
      return;
    }

    if (!onMovePost) {
      setCalendarFallbackNotice('Live reschedule is unavailable until calendar API is connected.');
      return;
    }

    onMovePost(selectedReschedulePost.id, selectedDay.dateKey, targetHour);
    setCalendarFallbackNotice(
      `${selectedReschedulePost.title} moved to ${formatCalendarDateLabel(selectedDay.dateKey, selectedDay.date)}${targetHour ? ` at ${formatHourLabel(targetHour)}` : ''}.`,
    );
  };

  return (
    <div className="grid gap-4">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Calendar</h2>
              <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">
                Publishing calendar
              </span>
              <span className="rounded-full border border-[#d9e0ef] bg-[#f4f7fd] px-2 py-0.5 text-[11px] font-semibold text-[#2f4f7f]">
                Timezone locked: Thailand
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Drag content blocks or tap Reschedule to move publish date and time.</p>
            {error && <p className="mt-1 text-[11px] font-semibold text-rose-700">{error}</p>}
            {loading && <p className="mt-1 text-[11px] font-semibold text-[#6e6e68]">Loading live calendar data...</p>}
          </div>

          <div className="flex items-center gap-2">
            {onPrevMonth ? (
              <button
                onClick={onPrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#6e6e68] hover:bg-[#f6f6f2] hover:text-[#171717]"
                type="button"
                aria-label="Previous month"
              >
                ‹
              </button>
            ) : null}
            <span className="text-xs font-semibold text-[#4f4f49]">
              {monthOffset === 0 ? 'This month' : monthOffset === -1 ? 'Last month' : monthOffset === 1 ? 'Next month' : `${monthOffset > 0 ? '+' : ''}${monthOffset}mo`}
            </span>
            {onNextMonth ? (
              <button
                onClick={onNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#6e6e68] hover:bg-[#f6f6f2] hover:text-[#171717]"
                type="button"
                aria-label="Next month"
              >
                ›
              </button>
            ) : null}
          </div>

          <div className="flex items-center rounded-xl border border-[#deded8] bg-[#f4f4f2] p-1">
            {['Compact', 'Comfortable'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCalendarDensity(view as 'Compact' | 'Comfortable');
                  onNoopAction(`Switched calendar density to ${view}`);
                }}
                className={`h-8 rounded-lg px-3 text-xs font-medium ${
                  view === calendarDensity ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'Month' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 border-b border-[#e8e8e4] bg-[#fbfbfa]">
                {calendarWeekdayNames.map((day) => (
                  <div
                    key={day}
                    className="border-r border-[#e8e8e4] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82] last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-[#fbfbfa]">
                {calendarDisplayDays.map((day, index) => {
                  const dayCapacity = day ? getDayPostsLimit(day) : null;
                  const isSelected = day.dateKey ? day.dateKey === selectedDateKey : false;
                  const dayIndex = day.date ? Number(day.date) : index + 1;

                  return (
                    <div
                      key={`${day.date}-${day.dateKey ?? dayIndex}`}
                      className={`min-h-[132px] border-r border-b border-[#e8e8e4] bg-white p-2 last:border-r-0 ${
                        onMovePost ? 'cursor-pointer' : ''
                      } ${isSelected ? 'ring-2 ring-[#4f6f9f] bg-[#f4f7ff]' : 'hover:bg-[#fbfdff]'}`}
                      onDrop={(event) => handleDrop(event, day.dateKey)}
                      onDragOver={handleDragOver}
                      onClick={() => selectDate(day.dateKey)}
                    >
                      <div
                        className={`mb-2 flex items-center justify-between text-xs font-semibold ${day.muted ? 'text-[#b4b4ad]' : 'text-[#4f4f49]'}`}
                      >
                        <span>{day.date}</span>
                        {dayCapacity && dayCapacity.tone !== 'ok' ? (
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              dayCapacity.tone === 'critical'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {dayCapacity.countText}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1.5">
                        {day.posts.slice(0, visiblePostsLimit).map((post) => (
                          <CalendarPost key={`${day.date}-${post.id}`} post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                        ))}
                        {day.posts.length > visiblePostsLimit && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onNoopAction(`Open full day post list for ${formatCalendarDateLabel(day.dateKey, day.date)}`);
                            }}
                            className="w-full rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[11px] font-semibold text-[#6e6e68] hover:bg-white"
                            type="button"
                          >
                            +{day.posts.length - visiblePostsLimit} more posts
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === 'Week' ? (
          <div className="grid max-h-[820px] overflow-auto border border-[#ecece8] bg-[#fbfbfa]">
            {weekPostsByDay.every(({ day }) => day.posts.length === 0) && !loading ? (
              <p className="px-4 py-6 text-center text-xs text-[#8a8a82]">No posts scheduled this week.</p>
            ) : null}
            <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-[#e8e8e4] bg-[#fbfbfa]">
              <div className="border-r border-[#e8e8e4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a8a82]">Time</div>
              {weekPostsByDay.map(({ day }, dayIndex) => {
                const dateKey = day.dateKey;
                const weekdayIndex = dateKey ? toWeekdayIndex(dateKey) : dayIndex;
                const isSelected = dateKey ? dateKey === selectedDateKey : false;
                const dayCapacity = getDayPostsLimit(day);

                return (
                  <div
                    key={`${day.dateKey ?? day.date}-${day.date}`}
                    className={`border-r border-[#e8e8e4] px-3 py-2 last:border-r-0 ${isSelected ? 'bg-[#f4f7ff]' : 'bg-[#fbfbfa]'}`}
                  >
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        day.muted ? 'text-[#b4b4ad]' : 'text-[#6e6e68]'
                      }`}
                    >
                      {calendarWeekdayNames[Math.min(Math.max(weekdayIndex, 0), 6)] ?? 'Day'}
                    </div>
                    <div
                      className={`mt-1 flex items-center justify-between text-sm font-semibold ${day.muted ? 'text-[#b4b4ad]' : 'text-[#171717]'}`}
                    >
                      <span>{day.date}</span>
                      {dayCapacity && dayCapacity.tone !== 'ok' ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            dayCapacity.tone === 'critical'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {dayCapacity.countText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {calendarTimelineHours.map((hour) => {
              return (
                <div
                  key={`hour-row-${hour}`}
                  className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-[#ecece8] last:border-b-0"
                >
                  <div className="border-r border-[#ecece8] bg-[#f3f3ef] px-2 py-2 text-right text-[10px] font-semibold text-[#86867f]">
                    <span className="inline-block rounded-md border border-[#deded8] bg-white px-2 py-1">{formatHourLabel(hour)}</span>
                  </div>
                  {weekPostsByDay.map(({ day, postsByHour }) => {
                    const selectedSlot = postsByHour.find((slot) => slot.hour === hour);
                    const hasAny = (selectedSlot?.posts.length ?? 0) > 0;
                    const isSelected = day.dateKey ? day.dateKey === selectedDateKey : false;
                    const now = new Date();
                    const nowParts = toBangkokDateParts(now);
                    const todaySlot = nowParts ? nowParts.hour === hour && day.dateKey === `${nowParts.year}-${toDateParts(nowParts.month)}-${toDateParts(nowParts.day)}` : false;
                    return (
                      <div
                        key={`${day.date}-${hour}`}
                        className={`border-r border-[#e8e8e4] bg-white px-2 py-1 last:border-r-0 ${isSelected ? 'bg-[#f4f7ff]/55' : ''} ${todaySlot ? 'bg-[#f8fbff]' : ''}`}
                        onDrop={(event) => handleDrop(event, day.dateKey, hour)}
                        onDragOver={handleDragOver}
                        onClick={() => selectDate(day.dateKey)}
                      >
                        <div className="space-y-1">
                          {selectedSlot?.posts.slice(0, weekSlotVisibleLimit).map((post) => (
                            <CalendarPost key={`${day.date}-${post.id}`} post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                          ))}
                          {selectedSlot && selectedSlot.posts.length > weekSlotVisibleLimit ? (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onNoopAction(`Open full schedule for ${day.dateKey ? formatCalendarDateLabel(day.dateKey, day.date) : day.date}`);
                              }}
                              className="w-full rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[10px] font-semibold text-[#6e6e68] hover:bg-white"
                              type="button"
                            >
                              +{selectedSlot.posts.length - weekSlotVisibleLimit} more
                            </button>
                          ) : null}
                          {!hasAny && calendarDensity === 'Comfortable' ? <span className="text-[10px] text-[#b8b8af]">No posts</span> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : null}

        {viewMode === 'Day' ? (
          <div className="bg-[#fbfbfa]">
            <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
              <div className="text-xs text-[#8a8a82]">Daily timeline</div>
              <div className="mt-0.5 text-sm font-semibold text-[#171717]">
                {selectedDayLabel}
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto border-t border-[#e8e8e4]">
              <div className="divide-y divide-[#e8e8e4]">
                {dayPostsByHour.map((slot) => {
                  const hasPosts = slot.posts.length > 0;
                  const now = new Date();
                  const nowParts = toBangkokDateParts(now);
                  const isNow = nowParts ? nowParts.hour === slot.hour && selectedDay?.dateKey === `${nowParts.year}-${toDateParts(nowParts.month)}-${toDateParts(nowParts.day)}` : false;

                  return (
                    <div
                      key={`${selectedDay?.dateKey}-${slot.hour}`}
                      className={`grid grid-cols-[74px_1fr] bg-white ${isNow ? 'bg-[#f4f8ff]' : ''}`}
                      onDrop={(event) => handleDrop(event, selectedDay?.dateKey, slot.hour)}
                      onDragOver={handleDragOver}
                    >
                      <div className="border-r border-[#e8e8e4] bg-[#f3f3ef] px-2 py-3 text-right text-[11px] font-semibold text-[#86867f]">
                        <span className="inline-block rounded-md border border-[#deded8] bg-white px-2 py-1">{formatHourLabel(slot.hour)}</span>
                      </div>
                      <div className="min-h-[72px] space-y-1 px-2 py-2">
                        {slot.posts.slice(0, daySlotVisibleLimit).map((post) => {
                          const postTime = formatFocusTime(post.scheduledAt);
                          return (
                            <div
                              key={`${selectedDay?.dateKey}-${post.id}`}
                              className="grid grid-cols-[44px_1fr] gap-2"
                            >
                              <div className="pt-1 text-[11px] font-semibold text-[#8a8a82]">{postTime}</div>
                              <CalendarPost post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                            </div>
                          );
                        })}
                        {slot.posts.length > daySlotVisibleLimit ? (
                          <button
                            onClick={() => onNoopAction(`Open full day post list for ${selectedDayLabel}`)}
                            className="inline-flex rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[11px] font-semibold text-[#6e6e68] hover:bg-white"
                            type="button"
                          >
                            +{slot.posts.length - daySlotVisibleLimit} more posts
                          </button>
                        ) : null}
                        {!hasPosts ? (
                          <p className="text-[11px] text-[#b9b9b3]">{calendarDensity === 'Comfortable' ? 'No scheduled posts in this slot.' : '\u00a0'}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#171717]">Selected day</h2>
                <p className="mt-1 text-xs text-[#6e6e68]">
                  {selectedDayLabel} · {selectedDayPosts.length} posts scheduled
                </p>
              </div>
            <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
              {viewMode}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {selectedDayPosts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#d0d0ca] px-3 py-2 text-xs text-[#6e6e68]">No posts scheduled for this date.</p>
            ) : null}
            {selectedDayPostsWithTime.map((post) => (
              <div key={`${post.id}-${post.title}`} className="grid grid-cols-[44px_1fr] gap-3">
                <div className="pt-1 text-[11px] font-semibold text-[#8a8a82]">{post.time}</div>
                <CalendarPost post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Status legend</h2>
          <div className="mt-3 space-y-2">
            <LegendDot label="Queued / waiting to publish" tone="queued" />
            <LegendDot label="Posted successfully" tone="posted" />
            <LegendDot label="Draft / not ready" tone="draft" />
            <LegendDot label="Issue / needs attention" tone="issue" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f8fbff] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfd8ea] bg-white text-[#2f4f7f]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#171717]">Reschedule fallback</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Mobile and keyboard users can move posts without drag-and-drop.</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <div className="text-xs font-semibold text-[#171717]">
              {selectedReschedulePost ? selectedReschedulePost.title : 'No content selected'}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{calendarFallbackNotice}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                disabled={!selectedReschedulePost}
                onClick={() => rescheduleSelectedPost()}
                className="rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Move to selected day
              </button>
              <button
                disabled={!selectedReschedulePost}
                onClick={() => rescheduleSelectedPost(10)}
                className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Move to 10:00
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Weekly service coverage</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Checks whether this week covers the office service mix.</p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {dayGap} gap
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {weekCoverage.map((item) => (
              <div key={item.service} className="flex items-center justify-between rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div>
                  <div className="text-xs font-semibold text-[#171717]">{item.service}</div>
                  <div className="mt-0.5 text-[11px] text-[#6e6e68]">
                    {item.day} cadence · {item.actualCount}/{item.targetCount} planned
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    item.covered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.covered ? 'Covered' : 'Gap'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Drag & drop behavior</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            Drag a content block to reschedule it. The system updates the publish date, checks channel conflicts, and warns if service coverage becomes unbalanced.
          </p>
        </section>
      </aside>
    </div>
  );
}

