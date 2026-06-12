"use client";

import { useEffect, useRef } from "react";
import { useDemoStore } from "./store";
import type { DemoPost } from "./types";

export function useDemoScheduler() {
  const { posts, publishPost } = useDemoStore();

  // Keep refs fresh so the interval closure always sees latest data
  const postsRef = useRef<DemoPost[]>(posts);
  const publishRef = useRef<(id: string) => void>(publishPost);

  useEffect(() => { postsRef.current = posts; }, [posts]);
  useEffect(() => { publishRef.current = publishPost; }, [publishPost]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date().toISOString();
      postsRef.current
        .filter(
          (p) => p.status === "scheduled" && p.scheduledAt != null && p.scheduledAt <= now
        )
        .forEach((p) => publishRef.current(p.id));
    }, 5000);
    return () => clearInterval(id);
  }, []); // mount once — reads fresh refs each tick
}

export function DemoSchedulerGate() {
  useDemoScheduler();
  return null;
}
