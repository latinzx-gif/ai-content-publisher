import type { messagingApi } from "@line/bot-sdk"

import { attendancePickerFlex } from "@/lib/line/flex/menu-guide"

// Rich menu "เช็คอิน" → เข้างาน / เลิกงาน (สต็อก: พิมพ์ /stock เมื่อ HR เปิด LINE_STOCK_COMMAND_ENABLED).
export function checkinAction(): messagingApi.Message[] {
  return [attendancePickerFlex(process.env.NEXT_PUBLIC_LINE_LIFF_ID)]
}
