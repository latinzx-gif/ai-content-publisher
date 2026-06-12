import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { PENDING_REGISTRATION_PATH } from "@/lib/auth/employee-access"
import { mintLineUserSession } from "@/lib/auth/line-session"
import {
  LINE_REGISTER_COOKIE,
  LINE_REGISTER_COOKIE_OPTS,
} from "@/lib/auth/register-cookie"
import { notifyRegistrationPending } from "@/lib/line/notify-registration"

type RegisterBody = {
  employee_code?: string | null
  name?: string
  phone?: string | null
  branch_id?: string | null
  department?: string | null
  position?: string | null
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

  const employeeCode = body.employee_code?.trim() ?? ""
  const name = body.name?.trim()
  const phone = body.phone?.trim() ?? ""
  const branchId = body.branch_id?.trim() ?? ""

  if (!employeeCode) {
    return NextResponse.json({ error: "กรุณากรอกรหัสพนักงาน" }, { status: 400 })
  }
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
    .select("id")
    .eq("id", branchId)
    .maybeSingle()

  if (!branch) {
    return NextResponse.json({ error: "สาขาไม่ถูกต้อง" }, { status: 400 })
  }

  const { data: existing } = await admin
    .from("hr_employees")
    .select("id, role, status")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "บัญชี LINE นี้ลงทะเบียนและอนุมัติแล้ว" },
      { status: 409 }
    )
  }

  const row = {
    line_user_id: lineUserId,
    employee_code: employeeCode,
    name,
    phone,
    branch_id: branchId,
    department: body.department?.trim() || null,
    position: body.position?.trim() || null,
    role: "employee" as const,
    status: "inactive" as const,
  }

  let employeeId: string

  if (existing) {
    const { error: updateError } = await admin
      .from("hr_employees")
      .update(row)
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
      .insert(row)
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
