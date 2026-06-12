import type { messagingApi } from "@line/bot-sdk"

import { BRAND_RED, cardBody, brandedTitleHeader } from "@/lib/line/flex/base"

export type RegistrationNotifyPayload = {
  employeeId: string
  employeeCode: string | null
  name: string
  phone: string | null
  branchName: string | null
  department: string | null
  position: string | null
}

function detailRow(label: string, value: string): messagingApi.FlexComponent {
  return {
    type: "box",
    layout: "horizontal",
    margin: "sm",
    contents: [
      {
        type: "text",
        text: label,
        size: "xs",
        color: "#6B7280",
        flex: 2,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: "#111111",
        flex: 5,
        wrap: true,
      },
    ],
  }
}

export function registrationPendingFlex(
  payload: RegistrationNotifyPayload
): messagingApi.FlexMessage {
  const { employeeId, employeeCode, name, phone, branchName, department, position } =
    payload

  return {
    type: "flex",
    altText: `พนักงานใหม่ลงทะเบียน: ${name}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: brandedTitleHeader({
        title: "พนักงานใหม่ลงทะเบียน",
        subtitle: "รอ HR อนุมัติเข้าใช้งาน",
        accentColor: BRAND_RED,
        emoji: "📝",
        statusLabel: "รออนุมัติ",
      }),
      body: cardBody([
        detailRow("รหัสพนักงาน", employeeCode ?? "—"),
        detailRow("ชื่อ", name),
        detailRow("เบอร์", phone ?? "—"),
        detailRow("สาขา", branchName ?? "—"),
        ...(department ? [detailRow("แผนก", department)] : []),
        ...(position ? [detailRow("ตำแหน่ง", position)] : []),
        {
          type: "text",
          text: "กดอนุมัติหรือปฏิเสธได้จาก LINE โดยตรง",
          size: "xs",
          color: "#6B7280",
          margin: "lg",
          wrap: true,
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: BRAND_RED,
              height: "sm",
              flex: 1,
              action: {
                type: "postback",
                label: "อนุมัติ",
                data: `action=approve_registration&emp_id=${employeeId}`,
                displayText: "อนุมัติการลงทะเบียน",
              },
            },
            {
              type: "button",
              style: "secondary",
              height: "sm",
              flex: 1,
              action: {
                type: "postback",
                label: "ปฏิเสธ",
                data: `action=reject_registration&emp_id=${employeeId}`,
                displayText: "ปฏิเสธการลงทะเบียน",
              },
            },
          ],
        },
      ]),
    },
  }
}
