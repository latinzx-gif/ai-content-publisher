import Link from "next/link"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { WidgetCard } from "@/components/brand/WidgetCard"

export default function PortalSchedulePage() {
  return (
    <AdminPageShell title="ตารางงาน" description="My Schedule (T102 lite)">
      <WidgetCard title="ตารางงาน">
        <p className="text-sm text-muted-foreground">
          โมดูล shift/calendar จะมาใน Phase 10 — ตอนนี้ดูการเข้างานได้ที่{" "}
          <Link href="/portal/attendance" className="text-brand-red underline">
            การเข้างาน
          </Link>
        </p>
      </WidgetCard>
    </AdminPageShell>
  )
}
