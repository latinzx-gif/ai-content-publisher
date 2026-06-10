import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full rounded-[calc(var(--radius)*0.55)] border border-[var(--input-line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--text-placeholder)] focus:border-[var(--navy)] focus:ring-3 focus:ring-[color-mix(in_srgb,var(--navy),transparent_88%)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
