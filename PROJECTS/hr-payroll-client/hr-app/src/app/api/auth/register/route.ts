import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { PENDING_REGISTRATION_PATH } from "@/lib/auth/employee-access"
import { mintLineUserSession } from "@/lib/auth/line-session"
import {
  LINE_REGISTER_COOKIE,
  LINE_REGISTER_COOKIE_OPTS,
} from "@/lib/auth/register-cookie"
import { notifyRegistrationPending } from "@/lib/line/notify-registration"
import { defaultPayTypeForBranchCode } from "@/lib/payroll/pay-type"

type RegisterBody = {
  name?: string
  phone?: string | null
  branch_id?: string | null
}

const PHONE_RE = /^[0-9+\-\s()]{8,20}$/

export async function POST(request: NextRequest) {
  const lineUserId = request.cookies.get(LINE_REGISTER_COOKIE)?.value
  if (!lineUserId || !lineUserId.startsWith("U")) {
    return NextResponse.json(
      { error: "registration session expired — login with LINE again" },
      { status: 401 }
    )
  }

  let body: RegisterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const name = body.name?.trim()
  const phone = body.phone?.trim() ?? ""
  const branchId = body.branch_id?.trim() ?? ""

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "กรุณากรอกเบอร์ติดต่อที่ถูกต้อง" },
      { status: 400 }
    )
  }
  if (!branchId) {
    return NextResponse.json({ error: "กรุณาเลือกสาขา" }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: branch } = await admin
    .from("hr_branches")
    .select("id, code")
    .eq("id", branchId)
    .maybeSingle()

  if (!branch) {
    return NextResponse.json({ error: "สาขาไม่ถูกต้อง" }, { status: 400 })
  }

  const { data: existing } = await admin
    .from("hr_employees")
    .select("id, role, status, leave_blacklisted")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (existing?.leave_blacklisted) {
    return NextResponse.json(
      { error: "บัญชี LINE นี้อยู่ใน Leave Blacklist — ติดต่อ HR" },
      { status: 403 }
    )
  }

  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "บัญชี LINE นี้ลงทะเบียนและอนุมัติแล้ว" },
      { status: 409 }
    )
  }

  const baseRow = {
    line_user_id: lineUserId,
    name,
    phone,
    branch_id: branchId,
    pay_type: defaultPayTypeForBranchCode(branch.code as string | null),
    role: "employee" as const,
    status: "inactive" as const,
  }

  let employeeId: string

  if (existing) {
    const { error: updateError } = await admin
      .from("hr_employees")
      .update(baseRow)
      .eq("id", existing.id)

    if (updateError) {
      const msg =
        updateError.code === "23505"
          ? updateError.message.includes("employee_code")
            ? "รหัสพนักงานนี้มีในระบบแล้ว"
            : "บัญชี LINE นี้ลงทะเบียนแล้ว"
          : updateError.message
      return NextResponse.json({ error: msg }, { status: 500 })
    }
    employeeId = existing.id
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("hr_employees")
      .insert({
        ...baseRow,
        employee_code: null,
        department: null,
        position: null,
      })
      .select("id")
      .single()

    if (insertError || !inserted) {
      const msg =
        insertError?.code === "23505"
          ? insertError.message.includes("employee_code")
            ? "รหัสพนักงานนี้มีในระบบแล้ว"
            : "บัญชี LINE นี้ลงทะเบียนแล้ว"
          : (insertError?.message ?? "insert failed")
      return NextResponse.json({ error: msg }, { status: 500 })
    }
    employeeId = inserted.id as string
  }

  const response = NextResponse.json({ redirect: PENDING_REGISTRATION_PATH })

  try {
    await mintLineUserSession(request, response, lineUserId)
  } catch (error) {
    console.error("register session mint failed", error)
    return NextResponse.json(
      { error: "ส่งคำขอแล้ว แต่เข้าระบบไม่สำเร็จ — ลอง login LINE อีกครั้ง" },
      { status: 500 }
    )
  }

  response.cookies.set(LINE_REGISTER_COOKIE, "", {
    ...LINE_REGISTER_COOKIE_OPTS,
    maxAge: 0,
  })

  void notifyRegistrationPending(employeeId).catch((err) => {
    console.error("register notify HR failed:", err)
  })

  return response
}
