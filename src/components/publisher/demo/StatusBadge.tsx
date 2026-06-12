"use client";

import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type DemoPostStatus } from "@/lib/publisher/demo/types";

interface StatusBadgeProps {
  status: DemoPostStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        STATUS_COLORS[status],
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
