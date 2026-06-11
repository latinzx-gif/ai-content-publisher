import Link from "next/link"

import { BrandMark } from "@/components/brand/BrandMark"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { adminLoginPath } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

const ERROR_MESSAGES: Record<string, string> = {
  not_registered:
    "บัญชี LINE ของคุณยังไม่ได้ลงทะเบียนเป็นพนักงาน กรุณาติดต่อ HR",
  forbidden: "บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้",
  invalid_state: "การเข้าสู่ระบบหมดอายุ กรุณาลองใหม่อีกครั้ง",
  line_login_failed: "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  session_failed:
    "เซสชันไม่สมบูรณ์ (cookie เก่าหรือบัญชียังไม่ผูกกับพนักงาน) — กดล้าง session แล้ว login ใหม่",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; line_id?: string }>
}) {
  const { error, line_id: lineId } = await searchParams
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.line_login_failed)
    : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const employee = user && !error ? await getCurrentEmployee() : null
  const dashboardPath = employee ? adminLoginPath(employee.role) : null

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  const lineStartUrl = baseUrl
    ? `${baseUrl}/api/auth/line/start`
    : "/api/auth/line/start"

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="relative overflow-hidden bg-brand-red px-6 py-10 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, #fff 0, transparent 45%), radial-gradient(circle at 80% 80%, #fff 0, transparent 40%)",
            }}
          />
          <div className="relative">
            <BrandMark variant="login" onDark />
            <p className="mt-4 text-sm font-medium text-white/90">
              HR Admin Portal
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-center text-sm text-muted-foreground">
            เข้าสู่ระบบสำหรับ Owner / Manager
          </p>
          {errorMessage ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {employee && dashboardPath ? (
            <Link
              href={dashboardPath}
              className={cn(
                buttonVariants({ size: "default" }),
                "w-full bg-brand-red text-white hover:bg-brand-red/90"
              )}
            >
              เข้าสู่ Dashboard
            </Link>
          ) : null}
          {error === "not_registered" && lineId ? (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">LINE User ID (dev)</p>
              <p className="mt-1 break-all font-mono text-brand-red">{lineId}</p>
              <p className="mt-2">ลงทะเบียนใน local DB:</p>
              <code className="mt-1 block break-all rounded bg-background p-2 text-[10px]">
                node scripts/seed-admin.mjs {lineId} &quot;Your Name&quot; dev
              </code>
            </div>
          ) : null}
          {!employee || error ? (
            <Button
              render={<a href={lineStartUrl} />}
              className="w-full bg-[#06C755] hover:bg-[#06C755]/80"
            >
              เข้าสู่ระบบด้วย LINE
            </Button>
          ) : null}
          {user || error ? (
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="outline" className="w-full">
                ล้าง session / cookie
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  )
}
