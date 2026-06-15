import type { messagingApi } from "@line/bot-sdk"

import {
  brandedTitleHeader,
  cardBody,
  flexMessage,
  menuGuideBubble,
} from "@/lib/line/flex/base"
import { BRAND_RED } from "@/lib/line/brand"
import { t } from "@/lib/i18n/translate"
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/types"

function guide(
  altText: string,
  options: Parameters<typeof menuGuideBubble>[0]
): messagingApi.FlexMessage {
  return flexMessage(altText, menuGuideBubble(options))
}

export function welcomeFlex(locale: AppLocale = DEFAULT_LOCALE): messagingApi.FlexMessage {
  const welcomeBody: messagingApi.FlexComponent[] = [
          {
            type: "text",
            text: t("line.welcome.intro", locale),
            wrap: true,
            size: "sm",
            color: "#4B5563",
          },
          { type: "separator", margin: "lg" },
          {
            type: "text",
            text: t("line.welcome.menuTitle", locale),
            weight: "bold",
            size: "sm",
            color: "#111827",
          },
          ...menuItemRow("📍", t("line.welcome.checkin", locale), t("line.welcome.checkinDesc", locale)),
          ...menuItemRow("⏱️", t("line.welcome.ot", locale), t("line.welcome.otDesc", locale)),
          ...menuItemRow("📄", t("line.welcome.doc", locale), t("line.welcome.docDesc", locale)),
          ...menuItemRow("📅", t("line.welcome.leave", locale), t("line.welcome.leaveDesc", locale)),
          ...menuItemRow("📢", t("line.welcome.complaint", locale), t("line.welcome.complaintDesc", locale)),
          ...menuItemRow("🎧", t("line.welcome.contact", locale), t("line.welcome.contactDesc", locale)),
          { type: "separator", margin: "lg" },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FFF5F5",
            cornerRadius: "8px",
            paddingAll: "12px",
            contents: [
              {
                type: "text",
                text: t("line.welcome.tipMenu", locale),
                wrap: true,
                size: "xs",
                color: "#B71C1C",
              },
              {
                type: "text",
                text: t("line.welcome.tipStock", locale),
                wrap: true,
                size: "xs",
                color: "#B71C1C",
                margin: "sm",
              },
            ],
          },
  ]

  return flexMessage(t("line.welcome.alt", locale), {
    type: "bubble",
    header: brandedTitleHeader({
      title: t("line.welcome.title", locale),
      subtitle: t("line.welcome.subtitle", locale),
      accentColor: BRAND_RED,
      emoji: "🐼",
    }),
    body: cardBody(welcomeBody),
  })
}

function menuItemRow(
  emoji: string,
  label: string,
  desc: string
): messagingApi.FlexComponent[] {
  return [
    {
      type: "box",
      layout: "horizontal",
      spacing: "md",
      margin: "sm",
      contents: [
        {
          type: "text",
          text: emoji,
          size: "lg",
          flex: 0,
          gravity: "center",
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          contents: [
            {
              type: "text",
              text: label,
              weight: "bold",
              size: "sm",
              color: "#111827",
            },
            {
              type: "text",
              text: desc,
              size: "xs",
              color: "#6B7280",
              wrap: true,
            },
          ],
        },
      ],
    },
  ]
}

export function attendancePickerFlex(
  locale: AppLocale = DEFAULT_LOCALE
): messagingApi.FlexMessage {
  return flexMessage(t("line.attendancePicker.alt", locale), {
    type: "bubble",
    header: brandedTitleHeader({
      title: t("line.attendancePicker.title", locale),
      subtitle: t("line.attendancePicker.subtitle", locale),
      accentColor: BRAND_RED,
      emoji: "⏱️",
    }),
    body: cardBody([
        {
          type: "text",
          text: t("line.attendancePicker.desc", locale),
          wrap: true,
          size: "sm",
          color: "#4B5563",
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          margin: "md",
          contents: [
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              backgroundColor: "#ECFDF5",
              cornerRadius: "8px",
              paddingAll: "12px",
              contents: [
                { type: "text", text: "🟢", size: "lg", align: "center" },
                {
                  type: "text",
                  text: t("line.attendancePicker.checkin", locale),
                  weight: "bold",
                  size: "sm",
                  color: "#065F46",
                  align: "center",
                  margin: "xs",
                },
                {
                  type: "text",
                  text: t("line.attendancePicker.shareLocation", locale),
                  size: "xxs",
                  color: "#059669",
                  align: "center",
                },
              ],
            },
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              backgroundColor: "#EFF6FF",
              cornerRadius: "8px",
              paddingAll: "12px",
              contents: [
                { type: "text", text: "🔴", size: "lg", align: "center" },
                {
                  type: "text",
                  text: t("line.attendancePicker.checkout", locale),
                  weight: "bold",
                  size: "sm",
                  color: "#1E40AF",
                  align: "center",
                  margin: "xs",
                },
                {
                  type: "text",
                  text: t("line.attendancePicker.shareLocation", locale),
                  size: "xxs",
                  color: "#2563EB",
                  align: "center",
                },
              ],
            },
          ],
        },
        {
          type: "text",
          text: t("line.attendancePicker.footer", locale),
          wrap: true,
          size: "xxs",
          color: "#9CA3AF",
          margin: "sm",
        },
    ]),
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "12px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#06C755",
          height: "sm",
          action: {
            type: "postback",
            label: t("line.attendancePicker.btnCheckin", locale),
            data: "action=checkin_in",
          },
        },
        {
          type: "button",
          style: "primary",
          color: "#1E6FD9",
          height: "sm",
          action: {
            type: "postback",
            label: t("line.attendancePicker.btnCheckout", locale),
            data: "action=checkout",
          },
        },
      ],
    },
  })
}

export function checkinGuideFlex(
  locale: AppLocale = DEFAULT_LOCALE
): messagingApi.FlexMessage {
  return guide(t("line.checkinGuide.alt", locale), {
    emoji: "🟢",
    title: t("line.checkinGuide.title", locale),
    subtitle: t("line.checkinGuide.subtitle", locale),
    accentColor: "#06C755",
    description: t("line.checkinGuide.desc", locale),
    steps: [
      t("line.checkinGuide.step1", locale),
      t("line.checkinGuide.step2", locale),
      t("line.checkinGuide.step3", locale),
    ],
    tip: t("line.checkinGuide.tip", locale),
  })
}

export function checkoutGuideFlex(
  locale: AppLocale = DEFAULT_LOCALE
): messagingApi.FlexMessage {
  return guide(t("line.checkoutGuide.alt", locale), {
    emoji: "🔴",
    title: t("line.checkoutGuide.title", locale),
    subtitle: t("line.checkoutGuide.subtitle", locale),
    accentColor: "#1E6FD9",
    description: t("line.checkoutGuide.desc", locale),
    steps: [
      t("line.checkoutGuide.step1", locale),
      t("line.checkoutGuide.step2", locale),
      t("line.checkoutGuide.step3", locale),
    ],
    tip: t("line.checkoutGuide.tip", locale),
  })
}

export function outsideGeofenceFlex({
  distanceM,
  limitM,
  locale = DEFAULT_LOCALE,
}: {
  distanceM: number
  limitM: number
  locale?: AppLocale
}): messagingApi.FlexMessage {
  const dist = Math.round(distanceM)
  return guide(t("line.geofence.alt", locale), {
    emoji: "📍",
    title: t("line.geofence.title", locale),
    subtitle: t("line.geofence.desc", locale, { distance: dist, limit: limitM }),
    accentColor: "#EF4444",
    description: t("line.geofence.desc", locale, { distance: dist, limit: limitM }),
    steps: [t("line.geofence.tip", locale)],
    tip: t("line.geofence.tip", locale),
  })
}

export function alreadyCheckedInFlex(
  timeText: string,
  locale: AppLocale = DEFAULT_LOCALE
): messagingApi.FlexMessage {
  return guide(t("line.alreadyCheckedIn.alt", locale), {
    emoji: "✅",
    title: t("line.alreadyCheckedIn.title", locale),
    subtitle: t("line.checkin.timeValue", locale, { time: timeText }),
    accentColor: "#059669",
    description: t("line.alreadyCheckedIn.desc", locale, { time: timeText }),
    steps: [t("line.alreadyCheckedIn.desc", locale, { time: timeText })],
    tip: t("line.alreadyCheckedIn.desc", locale, { time: timeText }),
  })
}

export function notCheckedInFlex(locale: AppLocale = DEFAULT_LOCALE): messagingApi.FlexMessage {
  return guide(t("line.notCheckedIn.alt", locale), {
    emoji: "⚠️",
    title: t("line.notCheckedIn.title", locale),
    subtitle: t("line.notCheckedIn.title", locale),
    accentColor: "#F59E0B",
    description: t("line.notCheckedIn.desc", locale),
    steps: [t("line.notCheckedIn.desc", locale)],
    tip: t("line.notCheckedIn.desc", locale),
    postbackButton: {
      label: "🟢 Check-in",
      data: "action=checkin_in",
    },
  })
}

export function alreadyCheckedOutFlex(
  timeText: string,
  locale: AppLocale = DEFAULT_LOCALE
): messagingApi.FlexMessage {
  return guide(t("line.alreadyCheckedOut.alt", locale), {
    emoji: "🏁",
    title: t("line.alreadyCheckedOut.title", locale),
    subtitle: t("line.checkin.timeValue", locale, { time: timeText }),
    accentColor: "#6366F1",
    description: t("line.alreadyCheckedOut.desc", locale, { time: timeText }),
    steps: [t("line.alreadyCheckedOut.desc", locale, { time: timeText })],
    tip: t("line.alreadyCheckedOut.desc", locale, { time: timeText }),
  })
}

export function leaveGuideFlex(formUrl?: string): messagingApi.FlexMessage {
  const hasLiff = Boolean(formUrl)

  return guide(
    hasLiff ? "ขอลา — เปิดแบบฟอร์ม" : "ขอลา — เตรียมเปิดใช้งาน",
    {
      emoji: "📅",
      title: "ขอลา",
      subtitle: "ยื่นคำขอลาออนไลน์",
      accentColor: "#1E6FD9",
      description: hasLiff
        ? "กรอกแบบฟอร์มขอลา ระบบจะแสดงวันลาคงเหลือและส่งคำขอให้ HR อนุมัติ"
        : "แบบฟอร์มขอลากำลังเตรียมเปิดใช้งาน กรุณาติดต่อ HR ชั่วคราว",
      steps: hasLiff
        ? [
            "กดปุ่ม \"เปิดแบบฟอร์มขอลา\" ด้านล่าง",
            "เลือกประเภทลา วันที่ และเหตุผล",
            "กดส่งคำขอ แล้วรอ HR อนุมัติ",
          ]
        : [
            "ติดต่อ HR ผ่านเมนู \"ติดต่อ HR\"",
            "แจ้งวันที่และประเภทลาที่ต้องการ",
            "รอการยืนยันจากทีม HR",
          ],
      tip: "แนะนำยื่นลาล่วงหน้าอย่างน้อย 1 วันทำการ",
      ...(hasLiff
        ? {
            button: {
              label: "เปิดแบบฟอร์มขอลา",
              uri: formUrl!,
            },
          }
        : { statusLabel: "⏳ เร็วๆ นี้" }),
    }
  )
}

export function overtimeGuideFlex(formUrl?: string): messagingApi.FlexMessage {
  const hasForm = Boolean(formUrl)

  return guide(
    hasForm ? "ขอ OT — เปิดแบบฟอร์ม" : "ขอ OT — เตรียมเปิดใช้งาน",
    {
      emoji: "⏰",
      title: "ขอ OT",
      subtitle: "ยื่นคำขอทำงานล่วงเวลา",
      accentColor: "#E65100",
      description: hasForm
        ? "กรอกวันที่ เวลา และเหตุผล — ส่งให้ HR อนุมัติ"
        : "แบบฟอร์ม OT กำลังเตรียมเปิดใช้งาน",
      steps: hasForm
        ? [
            "กดปุ่ม \"เปิดแบบฟอร์มขอ OT\" ด้านล่าง",
            "ระบุวันที่และช่วงเวลา",
            "รอ HR อนุมัติทาง LINE",
          ]
        : ["ติดต่อ HR ผ่านเมนู \"ติดต่อ HR\""],
      tip: "แนะนำยื่นล่วงหน้าก่อนวันทำ OT",
      ...(hasForm && formUrl
        ? { button: { label: "เปิดแบบฟอร์มขอ OT", uri: formUrl } }
        : { statusLabel: "⏳ เร็วๆ นี้" }),
    }
  )
}

export function documentGuideFlex(formUrl?: string): messagingApi.FlexMessage {
  const hasForm = Boolean(formUrl)

  return guide(
    hasForm ? "ขอเอกสาร — เปิดแบบฟอร์ม" : "ขอเอกสาร — เตรียมเปิดใช้งาน",
    {
      emoji: "📄",
      title: "ขอเอกสาร",
      subtitle: "หนังสือรับรอง / เอกสาร HR",
      accentColor: "#7B1FA2",
      description: hasForm
        ? "กรอกแบบฟอร์มขอเอกสาร ระบบจะส่งคำขอให้ HR ดำเนินการ"
        : "แบบฟอร์มขอเอกสารกำลังเตรียมเปิดใช้งาน",
      steps: hasForm
        ? [
            "กดปุ่ม \"เปิดแบบฟอร์มขอเอกสาร\" ด้านล่าง",
            "เลือกประเภท จำนวนชุด และวัตถุประสงค์",
            "รอ HR แจ้งเมื่อเอกสารพร้อมรับ",
          ]
        : [
            "ติดต่อ HR ผ่านเมนู \"ติดต่อ HR\"",
            "แจ้งประเภทเอกสารที่ต้องการ",
            "รอการยืนยันจากทีม HR",
          ],
      tip: "แนะนำยื่นคำขอล่วงหน้า 3–5 วันทำการ",
      ...(hasForm && formUrl
        ? {
            button: { label: "เปิดแบบฟอร์มขอเอกสาร", uri: formUrl },
          }
        : { statusLabel: "⏳ เร็วๆ นี้" }),
    }
  )
}

export function complaintGuideFlex(formUrl?: string): messagingApi.FlexMessage {
  const hasForm = Boolean(formUrl)

  return guide(
    hasForm ? "ร้องเรียน — เปิดแบบฟอร์ม" : "ร้องเรียน — เตรียมเปิดใช้งาน",
    {
      emoji: "📢",
      title: "ร้องเรียน",
      subtitle: "แจ้งปัญหาและข้อเสนอแนะ",
      accentColor: "#F57C00",
      description: hasForm
        ? "ส่งเรื่องร้องเรียนหรือข้อเสนอแนะ — เลือกได้ว่าจะไม่เปิดเผยตัวตน"
        : "ช่องทางแจ้งปัญหากำลังเตรียมเปิดใช้งาน",
      steps: hasForm
        ? [
            "กดปุ่ม \"เปิดแบบฟอร์มร้องเรียน\" ด้านล่าง",
            "กรอกหัวข้อและรายละเอียด",
            "เก็บเลขที่อ้างอิงเพื่อติดตาม",
          ]
        : [
            "ติดต่อ HR ผ่านเมนู \"ติดต่อ HR\"",
            "แจ้งเรื่องที่ต้องการร้องเรียน",
            "รอการติดตามจากทีม HR",
          ],
      tip: "ข้อมูลจะถูกเก็บเป็นความลับ",
      ...(hasForm && formUrl
        ? {
            button: { label: "เปิดแบบฟอร์มร้องเรียน", uri: formUrl },
          }
        : { statusLabel: "⏳ เร็วๆ นี้" }),
    }
  )
}

export function announcementGuideFlex(): messagingApi.FlexMessage {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  const portalUrl = base ? `${base}/portal` : undefined

  return guide("ประกาศ — จาก HR", {
    emoji: "📣",
    title: "ประกาศ",
    subtitle: "ข่าวสารจาก HR",
    accentColor: "#00897B",
    description:
      "ประกาศสำคัญจะถูกส่งมาทางแชท LINE โดยตรงเมื่อ HR กดส่ง — ดูย้อนหลังได้ที่ Portal หน้าหลัก",
    steps: [
      "รอการแจ้งจาก HR ในแชท LINE",
      "เปิด Portal หน้าหลักเพื่อดูประกาศล่าสุด",
      "ติดต่อ HR หากมีคำถาม",
    ],
    tip: "ไม่มีปุ่มประกาศในเมนู OA — HR เป็นผู้ส่งประกาศ",
    ...(portalUrl
      ? { button: { label: "เปิด Portal", uri: portalUrl } }
      : { statusLabel: "Portal" }),
  })
}

export function checkStockGuideFlex(options: {
  stockUrl?: string
  inboundUrl?: string
}): messagingApi.FlexMessage {
  const { stockUrl, inboundUrl } = options
  const hasStock = Boolean(stockUrl)
  const hasInbound = Boolean(inboundUrl)

  const footerButtons: messagingApi.FlexComponent[] = []
  if (hasStock) {
    footerButtons.push({
      type: "button",
      style: "primary",
      color: "#4F46E5",
      height: "sm",
      action: { type: "uri", label: "ดูยอดสต็อก", uri: stockUrl! },
    })
  }
  if (hasInbound) {
    footerButtons.push({
      type: "button",
      style: "secondary",
      height: "sm",
      action: { type: "uri", label: "สแกนรับเข้า", uri: inboundUrl! },
    })
  }

  return flexMessage(
    hasStock ? "เช็คสต็อก — ดูยอดคงเหลือ" : "เช็คสต็อก — เตรียมเปิดใช้งาน",
    {
      type: "bubble",
      header: brandedTitleHeader({
        title: "เช็คสต็อก",
        subtitle: "ยอดคงเหลือ · รับเข้าสินค้า",
        accentColor: "#4F46E5",
        emoji: "📦",
      }),
      body: cardBody([
        {
          type: "text",
          text: hasStock
            ? "ดูยอดสต็อกตาม SKU และคลัง หรือสแกน barcode รับเข้าตามใบที่ Inventory เปิดไว้"
            : "ระบบคลังสินค้ากำลังเตรียมเปิดใช้งาน",
          wrap: true,
          size: "sm",
          color: "#4B5563",
        },
      ]),
      ...(footerButtons.length > 0
        ? {
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              paddingAll: "12px",
              contents: footerButtons,
            },
          }
        : {}),
    }
  )
}

export function inventoryGuideFlex(portalUrl?: string): messagingApi.FlexMessage {
  const hasPortal = Boolean(portalUrl)

  return guide(
    hasPortal ? "คลังสินค้า — สแกนรับเข้า" : "คลังสินค้า — เตรียมเปิดใช้งาน",
    {
      emoji: "📦",
      title: "คลังสินค้า",
      subtitle: "สแกน barcode รับเข้าสินค้า",
      accentColor: "#1565C0",
      description: hasPortal
        ? "เลือกใบรับเข้าที่ Inventory สร้างแล้ว สแกน barcode เพิ่มรายการ"
        : "ระบบคลังสินค้ากำลังเตรียมเปิดใช้งาน",
      steps: hasPortal
        ? [
            "กดปุ่ม \"เปิดรายการรับเข้า\" ด้านล่าง",
            "เลือกใบที่เปิดรับสแกน",
            "สแกนหรือพิมพ์ barcode แล้วบันทึก — Inventory ตรวจอนุมัติทีหลัง",
          ]
        : ["ติดต่อ HR ผ่านเมนู \"ติดต่อ HR\""],
      tip: "Inventory สร้างใบแล้วสแกนได้ทันที — สต็อกเพิ่มเมื่อ Inventory อนุมัติ",
      ...(hasPortal && portalUrl
        ? { button: { label: "เปิดรายการรับเข้า", uri: portalUrl } }
        : { statusLabel: "⏳ เร็วๆ นี้" }),
    }
  )
}

function lineRegisterUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() ?? ""
  return baseUrl
    ? `${baseUrl}/api/auth/line/start`
    : "/api/auth/line/start"
}

export function notRegisteredFlex(locale: AppLocale = DEFAULT_LOCALE): messagingApi.FlexMessage {
  const registerUrl = lineRegisterUrl()
  return guide(t("line.notRegistered.alt", locale), {
    emoji: "⚠️",
    title: t("line.notRegistered.title", locale),
    subtitle: t("line.notRegistered.subtitle", locale),
    accentColor: "#EF4444",
    description: t("line.notRegistered.desc", locale),
    steps: [
      t("line.notRegistered.step1", locale),
      t("line.notRegistered.step2", locale),
      t("line.notRegistered.step3", locale),
    ],
    tip: t("line.notRegistered.tip", locale),
    button: { label: t("line.notRegistered.button", locale), uri: registerUrl },
  })
}

export function pendingApprovalFlex(locale: AppLocale = DEFAULT_LOCALE): messagingApi.FlexMessage {
  return guide(t("line.pending.alt", locale), {
    emoji: "⏳",
    title: t("line.pending.title", locale),
    subtitle: t("line.pending.subtitle", locale),
    accentColor: "#F59E0B",
    description: t("line.pending.desc", locale),
    steps: [
      t("line.pending.step1", locale),
      t("line.pending.step2", locale),
      t("line.pending.step3", locale),
    ],
    tip: t("line.pending.tip", locale),
  })
}

export function menuHintFlex(locale: AppLocale = DEFAULT_LOCALE): messagingApi.FlexMessage {
  return guide(t("line.menuHint.alt", locale), {
    emoji: "👋",
    title: t("line.menuHint.title", locale),
    subtitle: t("line.menuHint.subtitle", locale),
    accentColor: BRAND_RED,
    description: t("line.menuHint.desc", locale),
    steps: [
      t("line.menuHint.step1", locale),
      t("line.menuHint.step2", locale),
      t("line.menuHint.step3", locale),
    ],
    tip: t("line.menuHint.tip", locale),
  })
}

export function contactHrGuideFlex(): messagingApi.FlexMessage {
  const registerUrl = lineRegisterUrl()
  return guide("ติดต่อ HR", {
    emoji: "🎧",
    title: "ติดต่อ HR",
    subtitle: "ช่องทางติดต่อทีม HR",
    accentColor: "#5C6BC0",
    description:
      "สอบถาม HR หรือลงทะเบียนพนักงานใหม่ — ระบบจะแจ้งทีม HR และติดต่อกลับผ่าน LINE OA นี้",
    steps: [
      "ยังไม่เคยลงทะเบียน? กด \"ลงทะเบียนพนักงาน\" ด้านล่าง",
      "ต้องการคุยกับ HR? กด \"แจ้งทีม HR\"",
      "เรื่องเร่งด่วน แจ้งหัวหน้างานโดยตรงด้วย",
    ],
    tip: "เวลาทำการ จ–ศ 09:00–18:00 น. (ยกเว้นวันหยุดนักขัตฤกษ์)",
    postbackButton: {
      label: "แจ้งทีม HR",
      data: "action=contact_hr_notify",
    },
    button: { label: "ลงทะเบียนพนักงาน", uri: registerUrl },
  })
}
