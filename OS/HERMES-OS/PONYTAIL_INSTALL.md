# PONYTAIL_INSTALL.md — ติดตั้ง Ponytail

> Ponytail = ruleset บังคับให้ agent คิดแบบ "senior dev ที่เขียนน้อยที่สุด แต่ยังถูกต้อง"
> Source: https://github.com/DietrichGebert/ponytail (13.6k ⭐)

**Last Updated:** 2026-06-18
**Version:** v4.6.0

---

## ทำไมต้องใช้ Ponytail

| Metric | Without | With Ponytail |
|--------|---------|---------------|
| Lines of code | baseline | **80-94% less** |
| Speed | baseline | **3-6x faster** |
| Cost | baseline | **47-77% cheaper** |

---

## Status ปัจจุบัน

| Runtime | Status | วิธี install |
|---------|--------|-------------|
| **Codex CLI** | ⬜ ยังไม่ install | ดู Section 1 |
| **Gemini CLI** | ⬜ ยังไม่ install | ดู Section 2 |
| **Antigravity** | ⬜ ยังไม่ install | ดู Section 3 |
| **Cursor** | ⬜ optional | ดู Section 4 |

> อัปเดต status เป็น ✅ หลัง install แต่ละ runtime

---

## Section 1: Codex CLI

```bash
# ติดตั้ง plugin
codex plugin marketplace add DietrichGebert/ponytail

# เปิด Codex → /plugins → เลือก Ponytail marketplace → Install
# เปิด /hooks → review และ trust 2 lifecycle hooks
# เริ่ม thread ใหม่

# ทดสอบ
codex
# พิมพ์: /ponytail
# ควรเห็น: "Ponytail active — full mode"
```

**หมายเหตุ:** Codex อ่าน `AGENTS.md` ที่ root อัตโนมัติ — Ponytail rules ใน `HEAD-OFFICE/AGENTS.md` จึง active แม้ไม่ install plugin

---

## Section 2: Gemini CLI

```bash
# ติดตั้ง extension
gemini extensions install https://github.com/DietrichGebert/ponytail

# ทดสอบ
gemini
# พิมพ์: /ponytail
# ควรเห็น: "Ponytail active — full mode"
```

---

## Section 3: Antigravity (agy)

```bash
# ติดตั้ง plugin
agy plugin install https://github.com/DietrichGebert/ponytail

# ทดสอบ (Antigravity ใช้ chat แทน slash menu)
# พิมพ์ใน chat: /ponytail-review
```

**หมายเหตุ:** Antigravity แปลง `/ponytail` commands เป็น skills อัตโนมัติ

---

## Section 4: Cursor (optional)

```bash
# copy rules file ไปที่ .cursor/rules/
cp <ponytail-checkout>/.cursor/rules/ponytail.mdc .cursor/rules/

# หรือ clone แล้ว symlink
```

---

## Ponytail Modes

| Mode | เมื่อใช้ |
|------|---------|
| `lite` | งานเล็กน้อย / prototype / draft |
| `full` | **default** — งานปกติทุกวัน |
| `ultra` | codebase ที่ bloat มาก / refactor session |
| `off` | ปิดชั่วคราว (ไม่แนะนำ) |

```bash
# เปลี่ยน mode
/ponytail ultra     # ใน Codex/Gemini
/ponytail lite      # ใน Codex/Gemini

# set default ทุก session
export PONYTAIL_DEFAULT_MODE=full
```

---

## Commands ที่ใช้บ่อย

| Command | ทำอะไร |
|---------|--------|
| `/ponytail` | ดู mode ปัจจุบัน |
| `/ponytail-review` | review diff ปัจจุบัน — หา over-engineering |
| `/ponytail-audit` | audit ทั้ง repo |
| `/ponytail-debt` | harvest `ponytail:` comments → technical debt ledger |

---

## ตรวจสอบว่า Ponytail ทำงาน

เมื่อ agent เริ่ม session จะเห็น:
```
Ponytail v4.6.0 — full mode active
The best code is the code you never wrote.
```

และในโค้ดที่ agent เขียนจะมี comment แบบนี้:
```javascript
// ponytail: using native Date API → upgrade to date-fns if timezone support needed
<input type="date">  // ponytail: browser has one → add flatpickr if custom UI needed
```
