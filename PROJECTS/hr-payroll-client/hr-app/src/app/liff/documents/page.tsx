import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DocumentRequestForm } from "@/features/documents/DocumentRequestForm"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function DocumentsLiffPage() {
  const employee = await getCurrentEmployee()

  if (!employee) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ขอเอกสาร</CardTitle>
            <CardDescription>กรุณาเข้าสู่ระบบก่อนใช้งาน</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <a href="/login" className="underline">
              เข้าสู่ระบบ
            </a>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>ขอเอกสาร</CardTitle>
          <CardDescription>{employee.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentRequestForm />
        </CardContent>
      </Card>
    </main>
  )
}
