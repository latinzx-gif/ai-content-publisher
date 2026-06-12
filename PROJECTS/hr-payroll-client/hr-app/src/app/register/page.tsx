import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { RegisterForm, RegisterShell } from "@/features/auth/RegisterForm"
import { LINE_REGISTER_COOKIE } from "@/lib/auth/register-cookie"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const pending = cookieStore.get(LINE_REGISTER_COOKIE)?.value
  if (!pending) {
    redirect("/login")
  }

  return (
    <RegisterShell>
      <RegisterForm />
    </RegisterShell>
  )
}
