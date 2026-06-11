import type { messagingApi } from "@line/bot-sdk"

import { attendancePickerFlex } from "@/lib/line/flex/menu-guide"

// Rich menu "เช็คอิน" → เข้างาน / เลิกงาน / ขอลา (LIFF).
export function checkinAction(): messagingApi.Message[] {
  return [attendancePickerFlex(process.env.NEXT_PUBLIC_LINE_LIFF_ID)]
}
