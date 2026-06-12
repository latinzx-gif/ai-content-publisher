import type { messagingApi } from "@line/bot-sdk"

import {
  brandedTitleHeader,
  cardBody,
  flexMessage,
  menuGuideBubble,
} from "@/lib/line/flex/base"
import { BRAND_RED } from "@/lib/line/brand"

function guide(
  altText: string,
  options: Parameters<typeof menuGuideBubble>[0]
): messagingApi.FlexMessage {
  return flexMessage(altText, menuGuideBubble(options))
}

export function welcomeFlex(): messagingApi.FlexMessage {
  const welcomeBody: messagingApi.FlexComponent[] = [
          {
            type: "text",
            text: "เลือกเมนูด้านล่างเพื่อใช้งานได้ทันที ระบบจะช่วยบันทึกเวลา จัดการลา และติดต่อ HR ให้สะดวกขึ้น",
            wrap: true,
            size: "sm",
            color: "#4B5563",
          },
          { type: "separator", margin: "lg" },
          {
            type: "text",
            text: "เมนูหลัก",
            weight: "bold",
            size: "sm",
            color: "#111827",
          },
          ...menuItemRow("📍", "เช็คอินเข้างาน", "บันทึกเวลาเข้างานและเลิกงาน"),
          ...menuItemRow("⏱️", "ขอ OT", "ยื่นคำขอทำงานล่วงเวลา"),
          ...menuItemRow("📄", "ยื่นเอกสาร", "ขอหนังสือรับรอง / เอกสาร HR"),
          ...menuItemRow("📦", "คลังสินค้า", "สแกน barcode รับเข้าสินค้า"),
          ...menuItemRow("💬", "ข้อเสนอแนะ", "แจ้งปัญหาหรือร้องเรียน"),
          ...menuItemRow("🎧", "ติดต่อ HR", "สอบถามหรือติดต่อทีม HR"),
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
                text: "💡 กดปุ่ม \"เมนู HR\" ด้านล่างแชท แล้วเลือกบริการที่ต้องการ",
                wrap: true,
                size: "xs",
                color: "#B71C1C",
              },
            ],
          },
  ]

  return flexMessage("ยินดีต้อนรับสู่ระบบ HR", {
    type: "bubble",
    header: brandedTitleHeader({
      title: "ยินดีต้อนรับ!",
      subtitle: "ระบบ HR & Payroll — ChineseVibe",
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

function leavePickerAction(liffId?: string): messagingApi.Action {
  if (liffId) {
    return {
      type: "uri",
      label: "🏖️ ขอลา",
      uri: `https://liff.line.me/${liffId}`,
    }
  }
  return {
    type: "postback",
    label: "🏖️ ขอลา",
    data: "action=leave",
  }
}

export function attendancePickerFlex(liffId?: string): messagingApi.FlexMessage {
  return flexMessage("บันทึกเวลา — เข้างาน / เลิกงาน / ขอลา", {
    type: "bubble",
    header: brandedTitleHeader({
      title: "บันทึกเวลา",
      subtitle: "เข้างาน · เลิกงาน · ขอลา",
      accentColor: BRAND_RED,
      emoji: "⏱️",
    }),
    body: cardBody([
        {
          type: "text",
          text: "วันละ 1 ครั้งต่อประเภท — เข้างานตอนเริ่มงาน เลิกงานตอนออก",
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
                  text: "เข้างาน",
                  weight: "bold",
                  size: "sm",
                  color: "#065F46",
                  align: "center",
                  margin: "xs",
                },
                {
                  type: "text",
                  text: "แชร์ตำแหน่ง",
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
                  text: "เลิกงาน",
                  weight: "bold",
                  size: "sm",
                  color: "#1E40AF",
                  align: "center",
                  margin: "xs",
                },
                {
                  type: "text",
                  text: "บันทึกทันที",
                  size: "xxs",
                  color: "#2563EB",
                  align: "center",
                },
              ],
            },
          ],
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#FFF7ED",
          cornerRadius: "8px",
          paddingAll: "12px",
          margin: "sm",
          contents: [
            { type: "text", text: "🏖️", size: "lg", align: "center" },
            {
              type: "text",
              text: "ขอลา",
              weight: "bold",
              size: "sm",
              color: "#9A3412",
              align: "center",
              margin: "xs",
            },
            {
              type: "text",
              text: "ยื่นคำขอลาออนไลน์",
              size: "xxs",
              color: "#EA580C",
              align: "center",
            },
          ],
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
            label: "🟢 เข้างาน",
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
            label: "🔴 เลิกงาน",
            data: "action=checkout",
          },
        },
        {
          type: "button",
          style: "secondary",
          height: "sm",
          action: leavePickerAction(liffId),
        },
      ],
    },
  })
}

export function checkinGuideFlex(): messagingApi.FlexMessage {
  return guide("เข้างาน — แชร์ตำแหน่งเพื่อบันทึกเวลา", {
    emoji: "🟢",
    title: "เข้างาน",
    subtitle: "บันทึกเวลาเข้างานประจำวัน",
    accentColor: "#06C755",
    description:
      "ระบบจะบันทึกเวลาเข้างานพร้อมตำแหน่งของคุณ ใช้ได้วันละ 1 ครั้ง",
    steps: [
      "กดปุ่ม \"แชร์ตำแหน่ง\" ด้านล่างข้อความนี้",
      "อนุญาตให้ LINE ใช้ตำแหน่งของคุณ",
      "รอรับการยืนยันเข้างานสำเร็จในแชท",
    ],
    tip: "ควรบันทึกเมื่อถึงที่ทำงานหรือพื้นที่ที่บริษัทกำหนด",
  })
}

export function checkoutGuideFlex(): messagingApi.FlexMessage {
  return guide("เลิกงาน — บันทึกเวลาออก", {
    emoji: "🔴",
    title: "เลิกงาน",
    subtitle: "บันทึกเวลาเลิกงานประจำวัน",
    accentColor: "#1E6FD9",
    description:
      "ระบบจะบันทึกเวลาเลิกงานและสรุปชั่วโมงทำงานของวันนี้ให้อัตโนมัติ",
    steps: [
      "ต้องเข้างานแล้วก่อนจึงจะเลิกงานได้",
      "กดปุ่ม \"ยืนยันเลิกงาน\" ด้านล่าง",
      "รับสรุปเวลาเข้า-ออกและชั่วโมงทำงาน",
    ],
    tip: "ใช้ได้วันละ 1 ครั้ง — หลังเลิกงานแล้วไม่สามารถบันทึกซ้ำได้",
    postbackButton: {
      label: "✅ ยืนยันเลิกงาน",
      data: "action=checkout_confirm",
    },
  })
}

export function alreadyCheckedInFlex(timeText: string): messagingApi.FlexMessage {
  return guide(`เข้างานแล้วเมื่อ ${timeText} น.`, {
    emoji: "✅",
    title: "เข้างานแล้ววันนี้",
    subtitle: `เวลา ${timeText} น.`,
    accentColor: "#059669",
    description: "คุณบันทึกเวลาเข้างานวันนี้แล้ว หากต้องการออกจากงานให้กดเลิกงาน",
    steps: [
      "กดปุ่ม \"ยืนยันเลิกงาน\" ด้านล่าง",
      "ระบบจะบันทึกเวลาเลิกงานทันที",
      "รับสรุปชั่วโมงทำงานของวัน",
    ],
    tip: "หากบันทึกผิดพลาด กรุณาติดต่อ HR",
    postbackButton: {
      label: "🔴 ยืนยันเลิกงาน",
      data: "action=checkout_confirm",
    },
  })
}

export function notCheckedInFlex(): messagingApi.FlexMessage {
  return guide("ยังไม่ได้เข้างานวันนี้", {
    emoji: "⚠️",
    title: "ยังไม่ได้เข้างาน",
    subtitle: "ไม่สามารถเลิกงานได้",
    accentColor: "#F59E0B",
    description: "วันนี้ยังไม่มีการบันทึกเวลาเข้างาน กรุณาเข้างานก่อนเลิกงาน",
    steps: [
      "กดเมนู \"เช็คอิน\" จาก Rich Menu",
      "เลือก \"เข้างาน\"",
      "แชร์ตำแหน่งเพื่อบันทึกเวลาเข้างาน",
    ],
    tip: "ต้องเข้างานก่อนจึงจะเลิกงานได้",
    postbackButton: {
      label: "🟢 ไปเข้างาน",
      data: "action=checkin_in",
    },
  })
}

export function alreadyCheckedOutFlex(timeText: string): messagingApi.FlexMessage {
  return guide(`เลิกงานแล้วเมื่อ ${timeText} น.`, {
    emoji: "🏁",
    title: "เลิกงานแล้ววันนี้",
    subtitle: `เวลา ${timeText} น.`,
    accentColor: "#6366F1",
    description: "คุณบันทึกเวลาเลิกงานวันนี้ครบแล้ว พรุ่งนี้สามารถเข้างานใหม่ได้",
    steps: [
      "ตรวจสอบสรุปชั่วโมงทำงานในข้อความก่อนหน้า",
      "หากมีข้อผิดพลาด ติดต่อ HR",
      "พรุ่งนี้กลับมาเข้างานตามปกติ",
    ],
    tip: "ขอบคุณที่ทำงานวันนี้!",
  })
}

export function leaveGuideFlex(liffId?: string): messagingApi.FlexMessage {
  const hasLiff = Boolean(liffId)

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
              uri: `https://liff.line.me/${liffId}`,
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

export function notRegisteredFlex(): messagingApi.FlexMessage {
  const registerUrl = lineRegisterUrl()
  return guide("ไม่พบข้อมูลพนักงานในระบบ", {
    emoji: "⚠️",
    title: "ไม่พบข้อมูล",
    subtitle: "ยังไม่ได้ลงทะเบียนในระบบ",
    accentColor: "#EF4444",
    description:
      "บัญชี LINE ของคุณยังไม่ได้ลงทะเบียน จึงไม่สามารถใช้เมนู HR ได้",
    steps: [
      "กดปุ่ม \"ลงทะเบียนพนักงาน\" ด้านล่าง",
      "Login ด้วย LINE แล้วกรอกรหัสพนักงาน ชื่อ เบอร์ และสาขา",
      "รอ HR อนุมัติก่อนใช้งานเมนู HR",
    ],
    tip: "หรือกดเมนู \"ติดต่อ HR\" แล้วเลือกลงทะเบียน",
    button: { label: "ลงทะเบียนพนักงาน", uri: registerUrl },
  })
}

export function pendingApprovalFlex(): messagingApi.FlexMessage {
  return guide("รอ HR อนุมัติการลงทะเบียน", {
    emoji: "⏳",
    title: "รอการอนุมัติ",
    subtitle: "ส่งคำขอลงทะเบียนแล้ว",
    accentColor: "#F59E0B",
    description:
      "ทีม HR กำลังตรวจสอบข้อมูลของคุณ ยังไม่สามารถเช็คอิน ขอลา หรือยื่นเอกสารได้",
    steps: [
      "รอ HR อนุมัติในระบบ (โดยปกติภายใน 1–2 วันทำการ)",
      "เมื่ออนุมัติแล้ว กลับมากดเมนู HR ในแชทนี้",
      "ใช้งานผ่าน LINE OA — ไม่ต้องเข้า Web Dashboard",
    ],
    tip: "กดเมนู \"ติดต่อ HR\" เพื่อสอบถามสถานะ",
  })
}

export function menuHintFlex(): messagingApi.FlexMessage {
  return guide("เลือกเมนู HR ด้านล่าง", {
    emoji: "👋",
    title: "สวัสดีครับ",
    subtitle: "ระบบ HR & Payroll",
    accentColor: BRAND_RED,
    description:
      "กรุณาเลือกบริการจากเมนู \"เมนู HR\" ด้านล่างแชท เช่น เช็คอิน OT หรือติดต่อ HR",
    steps: [
      "กดปุ่ม \"เมนู HR\" ด้านล่างแชท",
      "เลือกบริการที่ต้องการ",
      "ทำตามคำแนะนำในการ์ดที่ระบบส่งให้",
    ],
    tip: "หากเพิ่งเพิ่มเพื่อน ลองกดเมนูใดเมนูหนึ่งเพื่อดูวิธีใช้งาน",
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
