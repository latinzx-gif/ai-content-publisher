import Link from "next/link"

export function WidgetCard({
  title,
  href,
  actionLabel = "View All",
  compact = false,
  children,
}: {
  title: string
  href?: string
  actionLabel?: string
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div
        className={
          compact
            ? "flex shrink-0 items-center justify-between border-b px-3 py-2"
            : "flex shrink-0 items-center justify-between border-b px-4 py-3"
        }
      >
        <h3 className={compact ? "text-sm font-semibold" : "text-base font-semibold"}>
          {title}
        </h3>
        {href ? (
          <Link
            href={href}
            className="text-[11px] font-medium text-brand-red hover:underline"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div
        className={
          compact
            ? "min-h-0 flex-1 overflow-y-auto p-3"
            : "min-h-0 flex-1 overflow-y-auto p-4"
        }
      >
        {children}
      </div>
    </div>
  )
}
