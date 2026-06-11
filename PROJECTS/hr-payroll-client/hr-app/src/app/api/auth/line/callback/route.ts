import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { adminLoginPath } from "@/lib/auth/roles"
import { exchangeCode, verifyIdToken } from "@/lib/auth/line-login"

const STATE_COOKIE = "line_login_state"

function publicOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  return configured || request.nextUrl.origin
}

function loginRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${error}`, publicOrigin(request))
  )
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const stateCookie = request.cookies.get(STATE_COOKIE)?.value
  const origin = publicOrigin(request)

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return loginRedirect(request, "invalid_state")
  }

  let lineUserId: string
  try {
    const idToken = await exchangeCode(code)
    const payload = await verifyIdToken(idToken)
    lineUserId = payload.sub
  } catch (error) {
    console.error("LINE login failed", error)
    return loginRedirect(request, "line_login_failed")
  }

  const admin = getAdminClient()

  const { data: employee } = await admin
    .from("hr_employees")
    .select("id, role, status")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (!employee || employee.status !== "active") {
    console.warn("LINE login not_registered", { lineUserId })
    const loginUrl = new URL("/login", origin)
    loginUrl.searchParams.set("error", "not_registered")
    if (process.env.NODE_ENV === "development") {
      loginUrl.searchParams.set("line_id", lineUserId)
    }
    return NextResponse.redirect(loginUrl)
  }

  const destination = adminLoginPath(employee.role)

  let response = NextResponse.redirect(new URL(destination, origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.redirect(new URL(destination, origin))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const email = `line_${lineUserId.toLowerCase()}@line.local`

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({ type: "magiclink", email })
    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError ?? new Error("generateLink returned no token")
    }

    const { error: metaError } = await admin.auth.admin.updateUserById(
      linkData.user.id,
      { app_metadata: { provider: "line", line_user_id: lineUserId } }
    )
    if (metaError) {
      throw metaError
    }

    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: linkData.properties.hashed_token,
    })
    if (otpError) {
      throw otpError
    }

    // Belt-and-suspenders: ensure SSR client persists session cookies on response.
    if (otpData.session) {
      const { error: setError } = await supabase.auth.setSession({
        access_token: otpData.session.access_token,
        refresh_token: otpData.session.refresh_token,
      })
      if (setError) {
        throw setError
      }
    }
  } catch (error) {
    console.error("Supabase session mint failed", error)
    return loginRedirect(request, "session_failed")
  }

  response.cookies.delete(STATE_COOKIE)
  return response
}
