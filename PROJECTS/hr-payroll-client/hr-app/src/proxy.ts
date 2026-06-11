import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Session refresh on all matched routes; /admin/* additionally requires a
// logged-in user. Role-level checks (hr/admin) live in admin/layout.tsx —
// they need a DB read, which stays out of the proxy hot path.
function publicOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl
  const origin = publicOrigin(request)

  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/admin", origin))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/liff/:path*", "/login"],
}
