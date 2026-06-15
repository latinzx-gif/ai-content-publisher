import { messages, type MessageKey } from "@/lib/i18n/messages"
import { coerceLocale, type AppLocale } from "@/lib/i18n/types"

export type { MessageKey }

export function t(
  key: MessageKey,
  locale?: AppLocale,
  vars?: Record<string, string | number>
): string {
  const loc = coerceLocale(locale)
  const template =
    messages[loc][key] ?? messages.th[key] ?? (key as string)

  if (!vars) return template

  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  )
}
