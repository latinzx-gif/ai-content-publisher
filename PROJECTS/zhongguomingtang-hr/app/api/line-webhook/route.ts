/**
 * POST /api/line-webhook — Line OA Webhook
 * รับ event จาก Line และ respond ด้วย LIFF URL
 */
import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'

const LIFF_URL = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest('base64')
  return hash === signature
}

async function replyMessage(replyToken: string, messages: object[]) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-line-signature') || ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const events = body.events || []

  for (const event of events) {
    if (event.type === 'follow') {
      // ผู้ใช้เพิ่ม OA เป็นเพื่อน → ส่งเมนูหลัก
      await replyMessage(event.replyToken, [mainMenuFlex()])
    }

    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim()
      if (['เมนู', 'menu', 'ก่อน', 'help'].includes(text.toLowerCase())) {
        await replyMessage(event.replyToken, [mainMenuFlex()])
      }
    }

    if (event.type === 'postback') {
      const data = new URLSearchParams(event.postback.data)
      const action = data.get('action')
      const liffPath = getLiffPath(action || '')
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: `กดลิงก์ด้านล่างเพื่อเปิดระบบ`,
      }, {
        type: 'template',
        altText: `เปิดระบบ HR`,
        template: {
          type: 'buttons',
          text: `เปิดหน้า${getLabelThai(action || '')}`,
          actions: [{ type: 'uri', label: `เปิดเลย`, uri: liffPath }],
        },
      }])
    }
  }

  return NextResponse.json({ ok: true })
}

function getLiffPath(action: string): string {
  const paths: Record<string, string> = {
    clock: `${LIFF_URL}/employee/clock`,
    leave: `${LIFF_URL}/employee/leave`,
    ot: `${LIFF_URL}/employee/ot`,
    doc: `${LIFF_URL}/employee/documents`,
    complaint: `${LIFF_URL}/employee/complaint`,
  }
  return paths[action] || LIFF_URL
}

function getLabelThai(action: string): string {
  const labels: Record<string, string> = {
    clock: 'บันทึกเวลา', leave: 'ขอลา', ot: 'ขอ OT',
    doc: 'ขอเอกสาร', complaint: 'ร้องเรียน',
  }
  return labels[action] || 'HR Portal'
}

function mainMenuFlex() {
  return {
    type: 'flex',
    altText: 'เมนู HR Portal 中国名堂',
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical',
        backgroundColor: '#C41E3A',
        contents: [
          { type: 'text', text: '🐼 中国名堂 HR', color: '#FFFFFF', weight: 'bold', size: 'lg' },
          { type: 'text', text: 'ระบบจัดการพนักงาน', color: '#FFCCCC', size: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          menuBtn('⏰ บันทึกเวลาเข้า-ออก', 'clock'),
          menuBtn('📋 ขอลาหยุด', 'leave'),
          menuBtn('⌚ ขอทำ OT', 'ot'),
          menuBtn('📄 ขอเอกสาร', 'doc'),
          menuBtn('📢 แจ้งเรื่องร้องเรียน', 'complaint'),
        ],
      },
    },
  }
}

function menuBtn(label: string, action: string) {
  return {
    type: 'button', style: 'secondary', margin: 'sm',
    action: { type: 'postback', label, data: `action=${action}` },
  }
}
