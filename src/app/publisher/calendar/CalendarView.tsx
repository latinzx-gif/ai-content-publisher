"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/publisher/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import { Select } from "@/components/publisher/ui/select";
import { getScheduledPosts, type PostSummary } from "@/lib/publisher/calendar-data";
import { upsertPost } from "@/lib/publisher/db";

const APP_TIMEZONE = "Asia/Bangkok";
const DAILY_WARNING_THRESHOLD = 3;
const DAILY_MAX_CAPACITY = 5;
type CalendarMode = "month" | "week" | "day";

type CalendarDragPayload = {
  postId: string;
  sourceDate: string;
  sourceHour?: number;
  sourceMinute?: string;
};

export default function CalendarView() {
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [brand, setBrand] = useState("all");
  const [viewMode, setViewMode] = useState<CalendarMode>("month");
  const [focusDate, setFocusDate] = useState(() => getBangkokToday());
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragMessage, setDragMessage] = useState<string | null>(null);

  const grouped = useMemo(() => groupByDate(posts), [posts]);
  const groupedByHour = useMemo(() => groupByDateAndHour(posts), [posts]);
  const groupedEntries = useMemo(
    () =>
      Object.entries(grouped).sort((a, b) =>
        compareDateGroupKeys(a[0], b[0])
      ),
    [grouped]
  );
  const calendarWindow = useMemo(() => getCalendarWindow(viewMode, focusDate), [viewMode, focusDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getScheduledPosts({ status: status as never, platform, brand })
        .then((result) => {
          setPosts(result);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [brand, platform, status]);

  const platforms = useMemo(() => unique(posts.map((post) => post.platform)), [posts]);
  const brands = useMemo(() => unique(posts.map((post) => post.brand)), [posts]);

  const windowTitle = getWindowTitle(viewMode, focusDate);

  function updateStatus(value: string) {
    setLoading(true);
    setStatus(value);
  }

  function updatePlatform(value: string) {
    setLoading(true);
    setPlatform(value);
  }

  function updateBrand(value: string) {
    setLoading(true);
    setBrand(value);
  }

  function updateViewMode(value: CalendarMode) {
    setLoading(true);
    setViewMode(value);
    setLoading(false);
  }

  function moveWindow(direction: number) {
    if (viewMode === "day") setFocusDate(shiftDateByDays(focusDate, direction));
    else if (viewMode === "week") setFocusDate(shiftDateByDays(focusDate, direction * 7));
    else setFocusDate(shiftDateByMonths(focusDate, direction));
  }

  function jumpToToday() {
    setFocusDate(getBangkokToday());
  }

  function setScheduledDate(postId: string, value: string) {
    upsertPost({ post_id: postId, scheduled_at: value }).catch((err) =>
      console.error("CalendarView.setScheduledDate:", err)
    );
    setPosts((current) =>
      current.map((post) =>
        post.post_id === postId ? { ...post, scheduled_at: value } : post
      )
    );
  }

  function clearDragMessage() {
    setDragMessage(null);
  }

  function handleDrop(targetDate: string, targetHour?: number) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!targetDate) {
        setDragMessage("ไม่สามารถย้ายโพสต์ได้: กรุณาเลือกวันปลายทาง");
        return;
      }

      const raw = event.dataTransfer.getData("application/json");
      if (!raw) {
        setDragMessage("ไม่สามารถย้ายโพสต์ได้: ข้อมูลไม่ครบ");
        return;
      }

      let payload: CalendarDragPayload | null = null;
      try {
        payload = JSON.parse(raw) as CalendarDragPayload;
      } catch {
        setDragMessage("ไม่สามารถย้ายโพสต์ได้: ข้อมูลที่ลากไม่ถูกต้อง");
      }
      if (!payload?.postId) return;

      const source = payload.sourceDate || "";
      const isSameDate = source === targetDate;
      const targetCount = grouped[targetDate]?.length || 0;
      if (!isSameDate && targetCount >= DAILY_MAX_CAPACITY) {
        setDragMessage(`วันที่ ${targetDate} เต็มแล้ว (${targetCount}/${DAILY_MAX_CAPACITY})`);
        return;
      }

      const hour = typeof targetHour === "number" ? targetHour : payload.sourceHour || 9;
      const minute = payload.sourceMinute || "00";
      const nextValue = createBangkokDateTime(targetDate, hour, minute);
      setScheduledDate(payload.postId, nextValue);
      setDragMessage(`ย้ายโพสต์เรียบร้อย: ${targetDate} ${formatClock(nextValue)}`);
    };
  }

  function allowDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
          Phase 1
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">Calendar</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Approved and scheduled posts grouped by publishing date.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[auto_auto_auto_auto_1fr]">
          <Field label="Calendar">
            <div className="flex flex-wrap gap-2">
              {(["month", "week", "day"] as CalendarMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                    viewMode === item
                      ? "border-[var(--emerald)] bg-[var(--emerald)]/15 text-[var(--emerald)]"
                      : "border-[var(--line)] text-[var(--text-subtle)] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                  }`}
                  onClick={() => updateViewMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Move">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                onClick={() => moveWindow(-1)}
              >
                {"<"}
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                onClick={() => moveWindow(1)}
              >
                {">"}
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                onClick={jumpToToday}
              >
                Today
              </button>
            </div>
          </Field>
          <Field label="Window">
            <p className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-black text-[var(--navy)]">
              {windowTitle}
            </p>
          </Field>
        </CardContent>
      </Card>

      {dragMessage ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">{dragMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="Status">
            <Select value={status} onChange={(event) => updateStatus(event.target.value)}>
              {["all", "approved", "scheduled", "published", "failed"].map((item) => (
                <option key={item} value={item}>{label(item)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Platform">
            <Select value={platform} onChange={(event) => updatePlatform(event.target.value)}>
              <option value="all">All Platforms</option>
              {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Brand">
            <Select value={brand} onChange={(event) => updateBrand(event.target.value)}>
              <option value="all">All Brands</option>
              {brands.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--success-ink)]" />
            โพสต์แล้ว
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--info-ink)]" />
            รอโพสต์
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger-ink)]" />
            มีปัญหา
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning-ink)]" />
            รอตรวจ/ค้าง
          </span>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">Loading scheduled posts...</p>
          </CardContent>
        </Card>
      ) : groupedEntries.length ? (
        <div className="space-y-5">
          {viewMode === "month" ? (
            groupedEntries.map(([date, datePosts]) => {
              const capacity = calculateCapacity(datePosts.length, DAILY_WARNING_THRESHOLD, DAILY_MAX_CAPACITY);
              return (
                <Card key={date}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <CardTitle>{formatDateLabel(date) || "Unscheduled"}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={capacity.badgeClass}>{capacity.label}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    className="space-y-3"
                    onDrop={handleDrop(date)}
                    onDragOver={allowDrop}
                  >
                    {capacity.blocked ? (
                      <div className="rounded-[calc(var(--radius)*0.5)] border border-[var(--danger-soft)] bg-[var(--danger-surface)] p-3 text-sm text-[var(--danger-ink)]">
                        วันที่นี้มีจำนวนโพสต์ถึงเพดานสูงสุดแล้ว ({datePosts.length}/{DAILY_MAX_CAPACITY}) ควรเลื่อนโพสต์ที่เกินหรือปรับเวลาส่งใหม่
                      </div>
                    ) : capacity.atCapacity ? (
                      <div className="rounded-[calc(var(--radius)*0.5)] border border-[var(--warning-soft)] bg-[var(--warning-surface)] p-3 text-sm text-[var(--warning-ink)]">
                        คำเตือน: วันนี้มีโพสต์สูง ({datePosts.length}/{DAILY_MAX_CAPACITY})
                      </div>
                    ) : null}

                    {datePosts.map((post) => {
                      const source = getBangkokDateParts(post.scheduled_at);
                      return (
                        <CalendarPostLink
                          key={post.post_id}
                          post={post}
                          sourceDate={date}
                          sourceHour={source?.hour}
                          sourceMinute={source?.minute}
                          compact={false}
                          onDragStart={clearDragMessage}
                          onDropClear={clearDragMessage}
                        />
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{windowTitle}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid rounded-[calc(var(--radius)*0.5)] border border-[var(--line)]" style={{ gridTemplateColumns: `80px repeat(${calendarWindow.length}, minmax(150px, 1fr))` }}>
                    <div className="border-b border-r border-[var(--line)] p-2 text-xs font-bold text-[var(--text-subtle)]" />
                    {calendarWindow.map((dateKey) => {
                      const datePosts = grouped[dateKey] || [];
                      const capacity = calculateCapacity(datePosts.length, DAILY_WARNING_THRESHOLD, DAILY_MAX_CAPACITY);
                      return (
                        <div key={`h-header-${dateKey}`} className="border-b border-[var(--line)] p-2 text-xs">
                          <p className="font-black text-[var(--navy)]">{formatDateHeaderLabel(dateKey)}</p>
                          <Badge className={capacity.badgeClass}>{capacity.label}</Badge>
                        </div>
                      );
                    })}

                    {calendarHours.map((hour) => (
                      <Fragment key={`row-${hour}`}>
                        <div className="border-r border-b border-[var(--line)] p-2 text-xs font-black text-[var(--text-subtle)]">
                          {formatHourLabel(hour)}
                        </div>
                        {calendarWindow.map((dateKey) => {
                          const hourPosts = groupedByHour[dateKey]?.[hour] || [];
                          return (
                            <div
                              key={`${dateKey}-${hour}`}
                              className="min-h-24 border-r border-b border-[var(--line)] p-2 text-xs"
                              onDrop={handleDrop(dateKey, hour)}
                              onDragOver={allowDrop}
                            >
                              {hourPosts.map((post) => {
                                const source = getBangkokDateParts(post.scheduled_at);
                                return (
                                  <div key={post.post_id} className="mb-2 last:mb-0">
                                    <CalendarPostLink
                                      post={post}
                                      sourceDate={dateKey}
                                      sourceHour={source?.hour}
                                      sourceMinute={source?.minute}
                                      compact
                                      onDragStart={clearDragMessage}
                                      onDropClear={clearDragMessage}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              No approved or scheduled posts found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CalendarPostLink({
  post,
  compact = false,
  sourceDate,
  sourceHour,
  sourceMinute = "00",
  onDragStart,
  onDropClear,
}: {
  post: PostSummary;
  compact?: boolean;
  sourceDate: string;
  sourceHour?: number;
  sourceMinute?: string;
  onDragStart: () => void;
  onDropClear: () => void;
}) {
  const payload: CalendarDragPayload = {
    postId: post.post_id,
    sourceDate,
    sourceHour,
    sourceMinute,
  };

  return (
    <Link
      className={`block rounded-[calc(var(--radius)*0.45)] border border-[var(--line)] transition hover:border-[var(--navy)] ${
        compact ? "p-2" : "p-4"
      }`}
      href={`/review?post_id=${post.post_id}`}
      draggable
      onDragStart={(event) => {
        onDragStart();
        event.dataTransfer.setData("application/json", JSON.stringify(payload));
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        onDropClear();
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={`${compact ? "text-[0.75rem]" : "text-sm"} font-black text-[var(--navy)]`}>
          {truncate(post.headline)}
        </p>
        <div className="flex flex-wrap gap-1">
          {compact ? null : (
            <Badge className="bg-[var(--warning-soft)] text-[var(--warning-ink)]">
              {formatClock(post.scheduled_at)}
            </Badge>
          )}
        </div>
      </div>
      <div className={`${compact ? "text-[0.7rem]" : "text-xs"} mt-1 flex flex-wrap gap-2 text-[var(--text-muted)]`}>
        <span>{post.platform}</span>
        <span>·</span>
        <span>{post.brand}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        <Badge className={statusClass(post.status)}>
          {statusLabel(post.status)}
        </Badge>
        {post.warnings.length ? (
          <Badge className="bg-[var(--warning-soft)] text-[var(--warning-ink)]">⚠️ {post.warnings.length}</Badge>
        ) : null}
      </div>
    </Link>
  );
}

function compareDateGroupKeys(a: string, b: string) {
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function calculateCapacity(count: number, warningThreshold: number, maxCapacity: number) {
  if (count > maxCapacity) {
    return {
      badgeClass: "bg-[var(--danger-soft)] text-[var(--danger-ink)]",
      label: `Over capacity ${count}/${maxCapacity}`,
      blocked: true,
      atCapacity: false,
    };
  }
  if (count >= warningThreshold) {
    return {
      badgeClass: "bg-[var(--warning-soft)] text-[var(--warning-ink)]",
      label: `High load ${count}/${maxCapacity}`,
      blocked: false,
      atCapacity: true,
    };
  }
  return {
    badgeClass: "bg-[var(--success-soft)] text-[var(--success-ink)]",
    label: `${count}/${maxCapacity} slots`,
    blocked: false,
    atCapacity: false,
  };
}

function statusClass(status: PostSummary["status"]) {
  if (status === "published") return "bg-[var(--success-soft)] text-[var(--success-ink)]";
  if (status === "failed" || status === "rejected") return "bg-[var(--danger-soft)] text-[var(--danger-ink)]";
  if (status === "approved" || status === "scheduled") return "bg-[var(--info-soft)] text-[var(--info-ink)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-ink)]";
}

function statusLabel(status: PostSummary["status"]) {
  if (status === "approved") return "พร้อมโพสต์";
  if (status === "scheduled") return "รอโพสต์";
  if (status === "published") return "โพสต์แล้ว";
  if (status === "failed") return "มีปัญหา";
  if (status === "rejected") return "ถูกปฏิเสธ";
  if (status === "revision_requested") return "รอแก้ไข";
  if (status === "publishing") return "กำลังโพสต์";
  if (status === "draft") return "ร่าง";
  return statusLabelFallback(status);
}

function statusLabelFallback(value: string) {
  return value.replace(/_/g, " ").toUpperCase();
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-[var(--text-subtle)]">{label}</span>
      {children}
    </label>
  );
}

function groupByDate(posts: PostSummary[]) {
  return posts.reduce<Record<string, PostSummary[]>>((groups, post) => {
    const key = post.scheduled_at ? toBangkokDateKey(post.scheduled_at) : "";
    groups[key] = [...(groups[key] || []), post];
    return groups;
  }, {});
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function truncate(value: string) {
  return value.length > 96 ? `${value.slice(0, 93)}...` : value;
}

function formatDateLabel(dateKey: string) {
  if (!dateKey) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function toBangkokDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getBangkokDateParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).formatToParts(date).reduce<Record<string, string>>((next, item) => {
    next[item.type] = item.value;
    return next;
  }, {});

  if (!parts.year || !parts.month || !parts.day || !parts.hour || !parts.minute) {
    return null;
  }

  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: parts.minute,
  };
}

function groupByDateAndHour(posts: PostSummary[]) {
  return posts.reduce<Record<string, Record<number, PostSummary[]>>>((groups, post) => {
    const parts = getBangkokDateParts(post.scheduled_at);
    if (!parts) return groups;
    const current = groups[parts.dateKey] ?? {};
    current[parts.hour] = [...(current[parts.hour] || []), post];
    groups[parts.dateKey] = current;
    return groups;
  }, {});
}

function shiftDateByDays(baseDate: string, days: number) {
  const date = parseBangkokKey(baseDate);
  date.setDate(date.getDate() + days);
  return toBangkokKey(date);
}

function shiftDateByMonths(baseDate: string, months: number) {
  const date = parseBangkokKey(baseDate);
  date.setMonth(date.getMonth() + months);
  return toBangkokKey(date);
}

function parseBangkokKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toBangkokKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getBangkokToday() {
  return toBangkokKey(new Date());
}

function getCalendarWindow(mode: CalendarMode, focus: string) {
  if (mode === "day") return [focus];
  const baseDate = parseBangkokKey(focus);
  if (mode === "week") {
    const mondayOffset = (baseDate.getDay() + 6) % 7;
    const start = new Date(baseDate);
    start.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 7 }, (_, i) => toBangkokKey(addDays(start, i)));
  }
  return [];
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const calendarHours = Array.from({ length: 24 }, (_, index) => index);

function formatHourLabel(value: number) {
  return `${String(value).padStart(2, "0")}:00`;
}

function formatDateHeaderLabel(dateKey: string) {
  if (!dateKey) return "Unscheduled";
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

function getWindowTitle(mode: CalendarMode, focus: string) {
  const [year, month] = focus.split("-").map(Number);
  const date = parseBangkokKey(focus);

  if (mode === "day") {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  }

  if (mode === "week") {
    const window = getCalendarWindow(mode, focus);
    const start = parseBangkokKey(window[0]);
    const end = parseBangkokKey(window[window.length - 1]);
    return `${start.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })} - ${end.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} (${year}-${month})`;
  }

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
  });
}

function createBangkokDateTime(value: string, hour: number, minute = "00") {
  const safeHour = Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 9;
  const safeMinute = Number.isFinite(Number(minute))
    ? String(Math.min(59, Math.max(0, Number(minute)))).padStart(2, "0")
    : "00";
  return `${value}T${String(safeHour).padStart(2, "0")}:${safeMinute}:00+07:00`;
}

function formatClock(value: string) {
  const parts = getBangkokDateParts(value);
  if (!parts) return "";
  return `${parts.hour.toString().padStart(2, "0")}:${parts.minute}`;
}
