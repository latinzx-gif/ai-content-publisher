import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { PENDING_REGISTRATION_PATH } from "@/lib/auth/employee-access"
import { mintLineUserSession } from "@/lib/auth/line-session"
import {
  LINE_REGISTER_COOKIE,
  LINE_REGISTER_COOKIE_OPTS,
} from "@/lib/auth/register-cookie"
import { adminLoginPath } from "@/lib/auth/roles"
import type { Employee } from "@/lib/auth/session"
import { notifyRegistrationPending } from "@/lib/line/notify-registration"

type RegisterBody = {
  employee_code?: string
  branch_id?: string
}

function isRealLineId(id: string | null | undefined): id is string {
  return typeof id === "string" && id.startsWith("U")
}

export async function POST(request: NextRequest) {
  const cookieLineId = request.cookies.get(LINE_REGISTER_COOKIE)?.value
  const hasRealLineCookie = isRealLineId(cookieLineId)

  let body: RegisterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const employeeCode = body.employee_code?.trim() ?? ""
  const branchId = body.branch_id?.trim() ?? ""

  if (!employeeCode) {
    return NextResponse.json(
      { error: "กรุณากรอกรหัสพนักงาน" },
      { status: 400 }
    )
  }
  if (!branchId) {
    return NextResponse.json({ error: "กรุณาเลือกสาขา" }, { status: 400 })
  }

  const admin = getAdminClient()

  let existingLineEmployeeId: string | undefined
  if (hasRealLineCookie) {
    const { data: lineEmployee, error: lineLookupError } = await admin
      .from("hr_employees")
      .select("id")
      .eq("line_user_id", cookieLineId)
      .maybeSingle()

    if (lineLookupError) {
      console.error("register line lookup failed", lineLookupError)
      return NextResponse.json(
        { error: "ลงทะเบียนไม่สำเร็จ" },
        { status: 500 }
      )
    }

    existingLineEmployeeId = lineEmployee?.id as string | undefined
  }

  const { data: employee, error: lookupError } = await admin
    .from("hr_employees")
    .select(
      "id, line_user_id, role, status, department, leave_blacklisted"
    )
    .eq("branch_id", branchId)
    .ilike("employee_code", employeeCode)
    .maybeSingle()

  if (lookupError) {
    console.error("register employee lookup failed", lookupError)
    return NextResponse.json({ error: "ลงทะเบียนไม่สำเร็จ" }, { status: 500 })
  }

  if (!employee) {
    return NextResponse.json(
      { error: "รหัสพนักงานหรือสาขาไม่ถูกต้อง — ติดต่อ HR" },
      { status: 400 }
    )
  }

  if (employee.leave_blacklisted) {
    return NextResponse.json(
      { error: "บัญชีอยู่ใน Leave Blacklist — ติดต่อ HR" },
      { status: 403 }
    )
  }

  if (
    hasRealLineCookie &&
    existingLineEmployeeId &&
    existingLineEmployeeId !== employee.id
  ) {
    return NextResponse.json(
      { error: "บัญชี LINE นี้ผูกกับพนักงานคนอื่นแล้ว" },
      { status: 409 }
    )
  }

  const existingLineId = employee.line_user_id as string | null
  const employeeHasRealLine = isRealLineId(existingLineId)

  if (
    employeeHasRealLine &&
    hasRealLineCookie &&
    existingLineId !== cookieLineId
  ) {
    return NextResponse.json(
      { error: "รหัสพนักงานนี้ถูกผูกกับบัญชีอื่นแล้ว" },
      { status: 409 }
    )
  }

  if (employeeHasRealLine && !hasRealLineCookie) {
    return NextResponse.json(
      {
        error:
          "รหัสพนักงานนี้ถูกผูกกับ LINE แล้ว — เข้าสู่ระบบด้วย LINE หรือรหัสพนักงาน",
      },
      { status: 409 }
    )
  }

  const role = employee.role as Employee["role"]
  const status = employee.status as Employee["status"]
  const department =
    typeof employee.department === "string" ? employee.department : null

  const hadRealLineBefore = employeeHasRealLine
  let sessionLineUserId = existingLineId

  if (hasRealLineCookie && existingLineId !== cookieLineId) {
    const { error: updateError } = await admin
      .from("hr_employees")
      .update({ line_user_id: cookieLineId })
      .eq("id", employee.id)

    if (updateError) {
      console.error("register line link failed", updateError)
      return NextResponse.json({ error: "ลงทะเบียนไม่สำเร็จ" }, { status: 500 })
    }
    sessionLineUserId = cookieLineId
  } else if (!existingLineId) {
    sessionLineUserId = `portal_${employee.id}`
    const { error: updateError } = await admin
      .from("hr_employees")
      .update({ line_user_id: sessionLineUserId })
      .eq("id", employee.id)

    if (updateError) {
      console.error("register portal id assign failed", updateError)
      return NextResponse.json({ error: "ลงทะเบียนไม่สำเร็จ" }, { status: 500 })
    }
  }

  const redirect =
    status === "active"
      ? adminLoginPath(role, status, department)
      : PENDING_REGISTRATION_PATH

  const response = NextResponse.json({ redirect })

  try {
    await mintLineUserSession(request, response, sessionLineUserId!)
  } catch (error) {
    console.error("register session mint failed", error)
    return NextResponse.json(
      { error: "ลงทะเบียนไม่สำเร็จ — กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    )
  }

  if (hasRealLineCookie) {
    response.cookies.set(LINE_REGISTER_COOKIE, "", {
      ...LINE_REGISTER_COOKIE_OPTS,
      maxAge: 0,
    })
  }

  const shouldNotify =
    status === "inactive" && hasRealLineCookie && !hadRealLineBefore

  if (shouldNotify) {
    void notifyRegistrationPending(employee.id as string).catch((err) => {
      console.error("register notify HR failed:", err)
    })
  }

  return response
}
