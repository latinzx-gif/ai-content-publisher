import type { RichMenuPostbackAction } from "@/lib/line/types"

/** Slash/text shortcuts — work even when LINE_USER_CHAT_ENABLED=false */
const SLASH_COMMANDS: Record<string, RichMenuPostbackAction> = {
  "/stock": "check_stock",
  "/สต็อก": "check_stock",
  "/inbound": "inventory",
  "/รับเข้า": "inventory",
}

export function isStockCommandEnabled(): boolean {
  return process.env.LINE_STOCK_COMMAND_ENABLED === "true"
}

export function parseSlashCommand(text: string): RichMenuPostbackAction | null {
  const key = text.trim().toLowerCase()
  return SLASH_COMMANDS[key] ?? SLASH_COMMANDS[text.trim()] ?? null
}

export function stockCommandDisabledMessage(): { type: "text"; text: string } {
  return {
    type: "text",
    text: "คำสั่ง /stock ปิดใช้งานชั่วคราว — ใช้ Rich Menu หรือติดต่อ HR",
  }
}
