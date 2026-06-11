import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { getAdminClient } from "@/lib/auth/admin-client"

export default async function AdminSettingsPage() {
  const admin = getAdminClient()
  const { data: configRows } = await admin.from("hr_runtime_config").select("key, value, updated_at")

  const groupId =
    configRows?.find((r) => r.key === "hr_line_group_id")?.value ?? process.env.HR_LINE_GROUP_ID ?? "—"

  const checks = [
    { label: "Supabase URL", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { label: "LINE Channel", ok: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN) },
    { label: "Public Base URL", ok: Boolean(process.env.NEXT_PUBLIC_BASE_URL) },
    { label: "HR LINE Group", ok: Boolean(groupId && groupId !== "—") },
  ]

  return (
    <AdminPageShell title="Settings" description="สถานะการตั้งค่าระบบและ LINE OA">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold">เวลาทำงาน (env)</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>เริ่มงาน</dt>
              <dd>
                {process.env.WORK_START_HOUR ?? "9"}:
                {(process.env.WORK_START_MINUTE ?? "0").padStart(2, "0")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>LINE User Chat</dt>
              <dd>{process.env.LINE_USER_CHAT_ENABLED === "true" ? "เปิด" : "ปิด"}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold">HR Group</h3>
          <p className="break-all font-mono text-xs text-muted-foreground">{groupId}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            บอทจะ capture group id เมื่อถูกเชิญเข้ากลุ่ม — ใช้ scripts/sync-hr-group-from-db.mjs
          </p>
        </section>
        <section className="col-span-full rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold">Health checks</h3>
          <ul className="space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex justify-between">
                <span>{c.label}</span>
                <span className={c.ok ? "text-green-600" : "text-amber-600"}>
                  {c.ok ? "OK" : "Missing"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminPageShell>
  )
}
