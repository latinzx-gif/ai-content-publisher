# CURRENT TASK: IMG-REDESIGN-01 — Infographic SVG Redesign

## Phase
PLAN → DISPATCH TO CODEX

## Project
law-ai-content-os (`/Users/jakarinosk/HEAD-OFFICE/PROJECTS/law-ai-content-os`)

## Goal
ทำให้ image generation ออกมาเป็น infographic สไตล์ professional Thai legal advisory
เหมือน reference images ที่ user ให้มา:
- **SIAMWEALTH style**: Navy/white, numbered 1-5, แต่ละ item มี title + sub-description 1 บรรทัด, CTA footer bar, firm logo บนซ้าย
- **Netithorn style**: minimal, headline ใหญ่, photo on right, ไม่ต้องการ
- เป้าหมายหลัก: SIAMWEALTH / Thailand Business Entry style (numbered list with subs)

---

## ไฟล์ที่แตะได้

```
lib/agents/image-brief.ts       ← เพิ่ม keyPointSubs field
lib/agents/image-svg.ts         ← redesign SVG template ทั้งหมด
lib/prompts/image-brief.ts      ← เพิ่ม keyPointSubs ใน JSON shape
```

## DO NOT TOUCH
- `lib/agents/image-gen.ts` — flow ไม่ต้องเปลี่ยน
- `lib/agents/image-composite.ts`
- `lib/agents/image-text-overlay.ts`
- `lib/agents/image-upload.ts`
- `app/` UI files ทั้งหมด

---

## Plan

### Step 1 — เพิ่ม `keyPointSubs` ใน ImageCreativeBrief

ใน `lib/agents/image-brief.ts` เพิ่ม field:
```ts
copy: {
  headline: string       // มีอยู่แล้ว
  subheadline: string    // มีอยู่แล้ว
  keyPoints: string[]    // มีอยู่แล้ว — title ของแต่ละ item (max 26 chars)
  keyPointSubs: string[] // เพิ่มใหม่ — sub-description แต่ละ item (max 42 chars)
  disclaimer: string     // มีอยู่แล้ว
}
```

ใน `normalizeBrief()`:
- เพิ่ม `keyPointSubs` field ใน return object
- fallback: ถ้า AI ไม่ส่งมา ให้ใช้ empty string

ใน `RawBriefSchema`:
- เพิ่ม `keyPointSubs: z.array(z.string()).optional()`

### Step 2 — อัพเดต image-brief.ts prompt

ใน `lib/prompts/image-brief.ts` เพิ่ม `keyPointSubs` ใน JSON shape:
```json
"copy": {
  "headline": "...",
  "subheadline": "...",
  "keyPoints": ["title max 26 chars", "..."],
  "keyPointSubs": ["sub-desc max 42 chars", "..."],
  "disclaimer": "..."
}
```
กำหนดให้ keyPointSubs มีจำนวนเท่ากับ keyPoints เสมอ

### Step 3 — Redesign `generateLegalSVGFromBrief` ใน image-svg.ts

ทำ SVG ขนาด **1080 × 1080** (square, Facebook-ready)

**Layout ตาม reference (SIAMWEALTH style):**

```
┌─────────────────────────────────────────────────────┐
│  [FIRM NAME]        LEGAL · ADVISORY                 │  ← header bar สูง 80px, navy bg
├─────────────────────────────────────────────────────┤
│                                                      │
│  ก่อนเซ็น Franchise Agreement                       │  ← headline ใหญ่ (42-52px)
│  เช็ก 5 จุดนี้                                      │
│                                                      │
│  ──────────────────────────────                      │  ← divider line accent color
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ■1  สิทธิพื้นที่ขาย                          │   │  ← numbered row
│  │     ตรวจสอบขอบเขตพื้นที่จำหน่าย...          │   │  ← sub-description
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ■2  เงื่อนไขต่ออายุ                         │   │
│  │     พิจารณาระยะเวลาและเงื่อนไข...           │   │
│  └──────────────────────────────────────────────┘   │
│  (3, 4, 5...)                                       │
│                                                      │
├─────────────────────────────────────────────────────┤
│  พลาดข้อเดียว อาจกระทบทั้งกำไรและสิทธิ            │  ← CTA bar navy bg, gold text
└─────────────────────────────────────────────────────┘
```

**Design spec:**
- Background: `#F7F8FA` (off-white) หรือ `brief.brand.palette.background`
- Header bar: navy (`brief.brand.palette.primary`) สูง 76px
  - ซ้าย: firmName สีขาว font-weight 700
  - ขวา: category badge สีทอง
- Headline zone: ใช้ `brief.copy.headline` font-size 48-54px สี navy, font-weight 900
- Divider: accent color, width 60px, height 4px
- Item rows: แต่ละ row มี
  - Number badge: วงกลม navy ขนาด 36px ตัวเลขสีขาว
  - Title: `brief.copy.keyPoints[i]` font-size 22-24px navy font-weight 700
  - Sub: `brief.copy.keyPointSubs[i]` font-size 16-17px สีเทา (#555)
  - เส้น divider บาง (#E0E0E0) ระหว่าง rows
- CTA bar: navy bg สูง 72px
  - Text: `brief.copy.subheadline` หรือ fallback "ปรึกษาผู้เชี่ยวชาญ ก่อนตัดสินใจ" สีทอง font-size 20px
- Disclaimer: ตัวอักษรเล็กมาก (#888, 11px) ก่อน CTA bar
- Font: `'Sarabun', 'Noto Sans Thai', Arial, sans-serif`

**จำนวน items:** render เท่าที่ brief มี (3-5 items)
  - ถ้า 3 items → row สูงขึ้น เพิ่ม padding
  - ถ้า 5 items → row เล็กลงหน่อย

**ยกเลิกฟังก์ชันเก่าที่ไม่ใช้:**
- `generateLegalSVG()` (non-brief version) ให้ call `fallbackImageCreativeBrief()` แล้ว forward ไปที่ `generateLegalSVGFromBrief()`
- ลบ templates เก่าออกถ้าไม่ได้ใช้ (`steps_numbered`, etc.)

---

## Quality Gate

```bash
npx tsc --noEmit   # ต้อง pass
npm run build      # ต้อง pass
```

ทดสอบ manual: เพิ่ม test script ชั่วคราวหรือ console.log URL ที่สร้าง

## STOP WHEN
redesign ครบ → `npx tsc --noEmit` pass → เขียน `_agent/TASK_RESULT.md` → STOP ✋
