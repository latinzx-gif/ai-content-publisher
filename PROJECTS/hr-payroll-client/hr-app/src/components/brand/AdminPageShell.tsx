import { PageHeader } from "@/components/brand/PageHeader"

export function AdminPageShell({
  title,
  description,
  badge,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        badge={badge}
        action={action}
      />
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-6">
        {children}
      </div>
    </div>
  )
}
