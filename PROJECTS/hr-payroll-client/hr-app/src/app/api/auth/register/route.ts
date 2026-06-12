import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { PENDING_REGISTRATION_PATH } from "@/lib/auth/employee-access"
import { mintLineUserSession } from "@/lib/auth/line-session"
import {
  LINE_REGISTER_COOKIE,
  LINE_REGISTER_COOKIE_OPTS,
} from "@/lib/auth/register-cookie"

type RegisterBody = {
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
    name,
    phone,
    branch_id: branchId,
    department: body.department?.trim() || null,
    position: body.position?.trim() || null,
    role: "employee" as const,
    status: "inactive" as const,
  }

  if (existing) {
    const { error: updateError } = await admin
      .from("hr_employees")
      .update(row)
      .eq("id", existing.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
  } else {
    const { error: insertError } = await admin.from("hr_employees").insert(row)

    if (insertError) {
      const msg =
        insertError.code === "23505"
          ? "บัญชี LINE นี้ลงทะเบียนแล้ว"
          : insertError.message
      return NextResponse.json({ error: msg }, { status: 500 })
    }
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
  return response
}
