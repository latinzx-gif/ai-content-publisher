import type { messagingApi } from "@line/bot-sdk"

import { t } from "@/lib/i18n/translate"
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types"
import { BRAND_RED } from "@/lib/line/brand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

export function complaintSubmitConfirmFlex(options: {
  ticketCode: string
  isAnonymous: boolean
  locale?: AppLocale
}): messagingApi.FlexMessage {
  const locale = options.locale ?? DEFAULT_LOCALE
  return flexMessage(
    t("line.complaintSubmit.alt", locale),
    simpleBubble({
      title: t("line.complaintSubmit.title", locale),
      accentColor: "#F57C00",
      rows: [
        { label: t("line.common.ticket", locale), value: options.ticketCode },
        {
          label: t("line.common.mode", locale),
          value: options.isAnonymous
            ? t("line.status.anonymous", locale)
            : t("line.status.identified", locale),
        },
        {
          label: t("line.common.status", locale),
          value: t("line.status.open", locale),
          valueColor: "#F59E0B",
        },
      ],
      footerNote: t("line.complaintSubmit.footer", locale),
    })
  )
}

export function complaintSubmitHrNotifyFlex(options: {
  ticketCode: string
  subject: string
  isAnonymous: boolean
  employeeName?: string
  adminUrl?: string
  locale?: AppLocale
}): messagingApi.FlexMessage {
  const locale = options.locale ?? DEFAULT_LOCALE
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const adminUrl =
    options.adminUrl ?? (baseUrl ? `${baseUrl}/admin/complaints` : undefined)

  return flexMessage(
    t("line.complaintHr.alt", locale, { ticketCode: options.ticketCode }),
    simpleBubble({
      title: t("line.complaintHr.title", locale),
      accentColor: BRAND_RED,
      rows: [
        { label: t("line.common.ticket", locale), value: options.ticketCode },
        { label: t("line.common.subject", locale), value: options.subject },
        {
          label: t("line.common.reporter", locale),
          value: options.isAnonymous
            ? t("line.status.anonymous", locale)
            : (options.employeeName ?? "—"),
        },
      ],
      button: adminUrl
        ? { label: t("line.complaintHr.button", locale), uri: adminUrl }
        : undefined,
    })
  )
}

export function complaintReplyFlex(options: {
  ticketCode: string
  subject: string
  message: string
  closed: boolean
  locale?: AppLocale
}): messagingApi.FlexMessage {
  const locale = options.locale ?? DEFAULT_LOCALE
  return flexMessage(
    t("line.complaintReply.alt", locale, { ticketCode: options.ticketCode }),
    simpleBubble({
      title: t("line.complaintReply.title", locale),
      accentColor: "#F57C00",
      rows: [
        { label: t("line.common.ticket", locale), value: options.ticketCode },
        { label: t("line.common.subject", locale), value: options.subject },
        { label: t("line.common.message", locale), value: options.message },
        {
          label: t("line.common.status", locale),
          value: options.closed
            ? t("line.status.closed", locale)
            : t("line.status.replied", locale),
        },
      ],
    })
  )
}
