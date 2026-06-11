import { AdminPageShell } from "@/components/brand/AdminPageShell"

export function AdminComingSoon({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <AdminPageShell title={title} description={description}>
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
          Coming soon
        </span>
        <p className="max-w-md text-sm text-muted-foreground">
          โมดูลนี้อยู่ในแผน UI ตาม mockup HR Admin Dashboard — จะเปิดใช้งานในเฟสถัดไป
        </p>
      </div>
    </AdminPageShell>
  )
}
