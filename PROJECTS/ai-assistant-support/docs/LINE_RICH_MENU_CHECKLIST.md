# LINE Rich Menu Setup Checklist

Purpose: quick operator checklist for taking AI Assistant Support live in the real LINE OA.

## Live constants

| Item | Value |
|------|-------|
| Production app | `https://support-app-brown.vercel.app` |
| Webhook | `https://support-app-brown.vercel.app/api/line/webhook` |
| LIFF ID | `2010416723-q3dOdIyS` |
| LIFF base | `https://liff.line.me/2010416723-q3dOdIyS` |
| Ticket intake | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket` |
| Status lookup | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket/status` |

## Menu spec

| Slot | Label | Action | URL | Expected result |
|------|-------|--------|-----|-----------------|
| Left (x:0..1249, y:0..1685) | แจ้งปัญหา / เปิดคำร้อง | URI | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket` | Opens ticket intake LIFF |
| Right (x:1250..2499, y:0..1685) | ติดตามสถานะ | URI | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket/status` | Opens ticket status LIFF |

## Design content (สำหรับทำภาพใหม่)

- ขนาด image: 2500 x 1686 px
- Chat bar text: `Support Menu`
- v3 JSON label (action text): `Open Ticket`, `Track Status`

### Left slot content
- หัวข้อใหญ่: `แจ้งปัญหา`
- Subtitle: `Open Ticket`
- คำอธิบาย: `Bug • Error • Complaint • Question`
- CTA ภายในการ์ด: `แตะเพื่อเปิดแบบฟอร์ม` + `สร้าง Ticket ใหม่ทันที`
- จุดกดหลัก: ครอบทั้งซีกซ้าย (0..1249)

### Right slot content
- หัวข้อใหญ่: `ติดตามสถานะ`
- Subtitle: `Track Status`
- คำอธิบาย: `เช็กด้วยรหัส AAS-XXXXXX`
- CTA ภายในการ์ด: `แตะเพื่อตรวจสอบคำร้อง` + `ดูความคืบหน้าได้ทันที`
- จุดกดหลัก: ครอบทั้งซีกขวา (1250..2499)

## Preflight

- [ ] Correct Support OA channel selected
- [ ] Webhook URL set to production
- [ ] Webhook usage enabled
- [ ] LIFF app ID matches `2010416723-q3dOdIyS`
- [ ] Vercel env uses matching `NEXT_PUBLIC_LIFF_ID`
- [ ] Vercel env uses matching `NEXT_PUBLIC_LIFF_ENDPOINT`

## Rich Menu creation

- [ ] Create a new Rich Menu with 2 tap areas
- [ ] Left action set to ticket intake URL
- [ ] Right action set to status lookup URL
- [ ] Upload artwork if required
- [ ] Save menu successfully
- [ ] Assign menu as default

## Real-device verification

- [ ] Rich Menu is visible in the OA chat
- [ ] Left tap opens ticket intake
- [ ] Right tap opens status lookup
- [ ] Test ticket can be submitted
- [ ] Confirmation Flex message received
- [ ] Linear issue created for the test ticket
- [ ] Status lookup works for the created ticket

## Evidence log

| Check | Evidence |
|------|----------|
| Rich Menu visible | screenshot path / note |
| Intake tap works | screenshot/video |
| Status tap works | screenshot/video |
| Test ticket code | `AAS-......` |
| Linear issue | issue URL |

## Release gate

Only after every item above is complete:
- update T10 / taskmaster status
- update `GROUND_TRUTH.md`
- call Phase 1 fully LIVE
