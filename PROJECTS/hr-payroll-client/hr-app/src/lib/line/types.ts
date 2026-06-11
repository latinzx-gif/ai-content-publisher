export const RICH_MENU_ACTIONS = [
  "checkin",
  "checkin_in",
  "checkout",
  "checkout_confirm",
  "leave",
  "overtime",
  "document",
  "complaint",
  "announcement",
  "contact_hr",
] as const

export type RichMenuPostbackAction = (typeof RICH_MENU_ACTIONS)[number]

export function parsePostbackAction(
  data: string
): RichMenuPostbackAction | null {
  const action = new URLSearchParams(data).get("action")
  if (
    action !== null &&
    (RICH_MENU_ACTIONS as readonly string[]).includes(action)
  ) {
    return action as RichMenuPostbackAction
  }
  return null
}
