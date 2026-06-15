import type { AppLocale } from "@/lib/i18n/types"

type MessageCatalog = Record<string, string>

const th: MessageCatalog = {
  "lang.th": "ไทย",
  "lang.en": "English",
  "lang.zh": "中文",
  "lang.my": "မြန်မာ",
  "lang.label": "ภาษา",

  "portal.title": "Employee Portal",
  "portal.logout": "ออกจากระบบ",
  "portal.nav.home": "หน้าหลัก",
  "portal.nav.profile": "โปรไฟล์",
  "portal.nav.attendance": "การเข้างาน",
  "portal.nav.schedule": "ตารางงาน",
  "portal.nav.leave": "ขอลา",
  "portal.nav.documents": "เอกสาร",
  "portal.nav.announcements": "ประกาศ",
  "portal.nav.payslips": "สลิปเงินเดือน",
  "portal.nav.inbound": "รับเข้า",
  "portal.nav.stock": "เช็คสต็อก",
  "portal.home.greeting": "สวัสดี, {name}",
  "portal.home.subtitle": "สรุปวันนี้และทางลัดไปยังบริการ HR",
  "portal.home.todayStatus": "สถานะเช็คอินวันนี้",
  "portal.home.checkIn": "เข้า {time} น.",
  "portal.home.late": "(สาย)",
  "portal.home.checkOut": "ออก {time} น.",
  "portal.home.hours": " · {hours} ชม.",
  "portal.home.inProgress": "กำลังทำงาน — ยังไม่เช็คเอาท์",
  "portal.home.notCheckedIn": "ยังไม่ได้เช็คอินวันนี้ — สแกน QR หรือใช้ลิงก์ด้านล่าง",
  "portal.home.leaveBalance": "วันลาคงเหลือ",
  "portal.home.days": "{count} วัน",
  "portal.home.announcements": "ประกาศล่าสุด",
  "portal.home.noAnnouncements": "ยังไม่มีประกาศ",
  "portal.home.viewAll": "ดูทั้งหมด",
  "portal.home.shortcuts": "ทางลัด LIFF",
  "portal.home.shortcutLeave": "ขอลา",
  "portal.home.shortcutManualTime": "บันทึกเวลาเอง",
  "portal.home.shortcutQr": "QR เช็คอิน",
  "portal.home.shortcutDoc": "ขอเอกสาร",
  "portal.home.shortcutOt": "ขอ OT",
  "portal.home.shortcutComplaint": "ร้องเรียน",
  "portal.home.shortcutInbound": "สแกนรับเข้า",
  "portal.home.shortcutStock": "เช็คสต็อก",
  "portal.home.footerHint":
    "เช็คอินด้วย QR ประจำวัน — ดาวน์โหลดจากหน้าโปรไฟล์ · ประกาศจาก HR ส่งทาง LINE",

  "line.error.noUser":
    "ไม่สามารถระบุผู้ใช้ได้ กรุณาเช็คอินจากแชทส่วนตัวกับ OA",
  "line.error.unknownMenu":
    "ขออภัย ไม่รู้จักเมนูนี้ กรุณาลองใหม่จากเมนูด้านล่าง",
  "line.error.gate":
    "ไม่สามารถระบุผู้ใช้ได้ กรุณาใช้เมนูจากแชทส่วนตัวกับ OA",

  "line.checkin.title": "✅ เข้างานสำเร็จ",
  "line.checkin.lateTitle": "⏰ เข้างานสำเร็จ (มาสาย)",
  "line.checkin.alt": "เช็คอินสำเร็จ {time}",
  "line.checkin.employee": "พนักงาน",
  "line.checkin.time": "เวลา",
  "line.checkin.timeValue": "{time} น.",
  "line.checkin.status": "สถานะ",
  "line.checkin.onTime": "ตรงเวลา",
  "line.checkin.late": "สาย {minutes} นาที",

  "line.checkout.title": "🔴 เลิกงานสำเร็จ",
  "line.checkout.alt": "เลิกงานสำเร็จ {time}",
  "line.checkout.checkIn": "เข้างาน",
  "line.checkout.checkOut": "เลิกงาน",
  "line.checkout.total": "รวมเวลา",
  "line.checkout.footer":
    "บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว ไม่ต้องรออนุมัติ",
  "line.checkout.footerOt":
    "เกินเวลามาตรฐาน {duration} — หากต้องการขอ OT ให้ใช้เมนูขอ OT",

  "line.duration.hours": "{h} ชม.",
  "line.duration.hoursMinutes": "{h} ชม. {m} นาที",

  "line.alreadyCheckedIn.alt": "เช็คอินแล้ววันนี้",
  "line.alreadyCheckedIn.title": "เช็คอินแล้ว",
  "line.alreadyCheckedIn.desc": "คุณเช็คอินวันนี้แล้ว เวลา {time} น.",
  "line.alreadyCheckedOut.alt": "เช็คเอาท์แล้ววันนี้",
  "line.alreadyCheckedOut.title": "เลิกงานแล้ว",
  "line.alreadyCheckedOut.desc": "คุณเช็คเอาท์วันนี้แล้ว เวลา {time} น.",
  "line.notCheckedIn.alt": "ยังไม่เช็คอิน",
  "line.notCheckedIn.title": "ยังไม่เช็คอิน",
  "line.notCheckedIn.desc": "กรุณาเช็คอินก่อนเลิกงาน",

  "line.geofence.alt": "อยู่นอกพื้นที่สาขา",
  "line.geofence.title": "อยู่นอกพื้นที่สาขา",
  "line.geofence.desc":
    "ตำแหน่งของคุณห่างจากสาขา {distance} ม. (อนุญาตไม่เกิน {limit} ม.)",
  "line.geofence.tip": "กรุณาเข้าใกล้สาขาแล้วแชร์ตำแหน่งอีกครั้ง",

  "line.submit.saved": "บันทึกเวลาเรียบร้อยแล้ว",
  "line.submit.alreadySaved": "บันทึกเวลาเรียบร้อยแล้ว ไม่ต้องยื่นซ้ำ",
  "line.submit.notCheckedIn": "ยังไม่มีการเช็คอินวันนี้",
  "line.submit.notCheckedOut": "กรุณาเช็คเอาท์ก่อนบันทึกเวลา",

  "line.stock.disabled":
    "คำสั่ง /stock ปิดใช้งานชั่วคราว — ใช้ Rich Menu หรือติดต่อ HR",

  "line.welcome.alt": "ยินดีต้อนรับสู่ระบบ HR",
  "line.welcome.title": "ยินดีต้อนรับ!",
  "line.welcome.subtitle": "ระบบ HR & Payroll — ChineseVibe",
  "line.welcome.intro":
    "เลือกเมนูด้านล่างเพื่อใช้งานได้ทันที ระบบจะช่วยบันทึกเวลา จัดการลา และติดต่อ HR ให้สะดวกขึ้น",
  "line.welcome.menuTitle": "เมนูหลัก",
  "line.welcome.checkin": "เช็คอิน / เช็คเอาท์",
  "line.welcome.checkinDesc": "บันทึกเวลาเข้างานและเลิกงาน",
  "line.welcome.ot": "ขอ OT",
  "line.welcome.otDesc": "ยื่นคำขอทำงานล่วงเวลา",
  "line.welcome.doc": "ขอเอกสาร",
  "line.welcome.docDesc": "ขอหนังสือรับรอง / เอกสาร HR",
  "line.welcome.leave": "ขอลา",
  "line.welcome.leaveDesc": "ยื่นคำขอลาออนไลน์",
  "line.welcome.complaint": "ร้องเรียน",
  "line.welcome.complaintDesc": "แจ้งปัญหาหรือข้อเสนอแนะ",
  "line.welcome.contact": "ติดต่อ HR",
  "line.welcome.contactDesc": "สอบถามหรือติดต่อทีม HR",
  "line.welcome.tipMenu":
    "💡 กดปุ่ม \"เมนู HR\" ด้านล่างแชท (6 ปุ่ม) แล้วเลือกบริการที่ต้องการ",
  "line.welcome.tipStock":
    "📦 คลังสินค้า: พิมพ์ /stock หรือ /inbound (เมื่อ HR เปิดใช้)",

  "line.notRegistered.alt": "ไม่พบข้อมูลพนักงานในระบบ",
  "line.notRegistered.title": "ไม่พบข้อมูล",
  "line.notRegistered.subtitle": "ยังไม่ได้ลงทะเบียนในระบบ",
  "line.notRegistered.desc":
    "บัญชี LINE ของคุณยังไม่ได้ลงทะเบียน จึงไม่สามารถใช้เมนู HR ได้",
  "line.notRegistered.step1": "กดปุ่ม \"ลงทะเบียนพนักงาน\" ด้านล่าง",
  "line.notRegistered.step2":
    "Login ด้วย LINE แล้วกรอกรหัสพนักงาน ชื่อ เบอร์ และสาขา",
  "line.notRegistered.step3": "รอ HR อนุมัติก่อนใช้งานเมนู HR",
  "line.notRegistered.tip": "หรือกดเมนู \"ติดต่อ HR\" แล้วเลือกลงทะเบียน",
  "line.notRegistered.button": "ลงทะเบียนพนักงาน",

  "line.pending.alt": "รอ HR อนุมัติการลงทะเบียน",
  "line.pending.title": "รอการอนุมัติ",
  "line.pending.subtitle": "ส่งคำขอลงทะเบียนแล้ว",
  "line.pending.desc":
    "ทีม HR กำลังตรวจสอบข้อมูลของคุณ ยังไม่สามารถเช็คอิน ขอลา หรือยื่นเอกสารได้",
  "line.pending.step1": "รอ HR อนุมัติในระบบ (โดยปกติภายใน 1–2 วันทำการ)",
  "line.pending.step2":
    "ตรวจสอบสถานะได้ทาง LINE — กดเมนู \"ติดต่อ HR\" เพื่อสอบถาม",
  "line.pending.step3":
    "เมื่ออนุมัติแล้ว ใช้เมนู HR ในแชทนี้ หรือ Portal พนักงาน (ถ้ามีสิทธิ์)",
  "line.pending.tip":
    "ระบบจะแจ้งผลอนุมัติทาง LINE — ไม่จำเป็นต้องเข้า Dashboard HR",

  "line.menuHint.alt": "เลือกเมนู HR ด้านล่าง",
  "line.menuHint.title": "สวัสดีครับ",
  "line.menuHint.subtitle": "ระบบ HR & Payroll",
  "line.menuHint.desc":
    "กรุณาเลือกบริการจากเมนู \"เมนู HR\" ด้านล่างแชท — 6 ปุ่ม: เช็คอิน, OT, เอกสาร, ลา, ร้องเรียน, ติดต่อ HR",
  "line.menuHint.step1": "กดปุ่ม \"เมนู HR\" ด้านล่างแชท แล้วเลือกบริการ",
  "line.menuHint.step2":
    "หรือพิมพ์คำสั่ง เช่น /leave /ot /doc /complaint /stock /inbound",
  "line.menuHint.step3": "ทำตามคำแนะนำในการ์ดที่ระบบส่งให้",
  "line.menuHint.tip": "คลังสินค้าใช้ /stock หรือ /inbound (เมื่อ HR เปิดใช้)",
}

const en: MessageCatalog = {
  "lang.th": "ไทย",
  "lang.en": "English",
  "lang.zh": "中文",
  "lang.my": "မြန်မာ",
  "lang.label": "Language",

  "portal.title": "Employee Portal",
  "portal.logout": "Sign out",
  "portal.nav.home": "Home",
  "portal.nav.profile": "Profile",
  "portal.nav.attendance": "Attendance",
  "portal.nav.schedule": "Schedule",
  "portal.nav.leave": "Leave",
  "portal.nav.documents": "Documents",
  "portal.nav.announcements": "Announcements",
  "portal.nav.payslips": "Payslips",
  "portal.nav.inbound": "Inbound",
  "portal.nav.stock": "Stock check",
  "portal.home.greeting": "Hello, {name}",
  "portal.home.subtitle": "Today's summary and HR shortcuts",
  "portal.home.todayStatus": "Today's check-in status",
  "portal.home.checkIn": "In {time}",
  "portal.home.late": "(late)",
  "portal.home.checkOut": "Out {time}",
  "portal.home.hours": " · {hours} hrs",
  "portal.home.inProgress": "Working — not checked out yet",
  "portal.home.notCheckedIn":
    "Not checked in today — scan QR or use the links below",
  "portal.home.leaveBalance": "Leave balance",
  "portal.home.days": "{count} days",
  "portal.home.announcements": "Latest announcements",
  "portal.home.noAnnouncements": "No announcements yet",
  "portal.home.viewAll": "View all",
  "portal.home.shortcuts": "LIFF shortcuts",
  "portal.home.shortcutLeave": "Request leave",
  "portal.home.shortcutManualTime": "Manual time entry",
  "portal.home.shortcutQr": "Check-in QR",
  "portal.home.shortcutDoc": "Request document",
  "portal.home.shortcutOt": "Request OT",
  "portal.home.shortcutComplaint": "Complaint",
  "portal.home.shortcutInbound": "Scan inbound",
  "portal.home.shortcutStock": "Check stock",
  "portal.home.footerHint":
    "Daily QR check-in — download from Profile · HR announcements via LINE",

  "line.error.noUser":
    "Cannot identify user. Please check in from a private chat with the OA.",
  "line.error.unknownMenu":
    "Sorry, unknown menu. Please try again from the menu below.",
  "line.error.gate":
    "Cannot identify user. Please use the menu from a private chat with the OA.",

  "line.checkin.title": "✅ Check-in successful",
  "line.checkin.lateTitle": "⏰ Check-in successful (late)",
  "line.checkin.alt": "Check-in successful {time}",
  "line.checkin.employee": "Employee",
  "line.checkin.time": "Time",
  "line.checkin.timeValue": "{time}",
  "line.checkin.status": "Status",
  "line.checkin.onTime": "On time",
  "line.checkin.late": "Late {minutes} min",

  "line.checkout.title": "🔴 Check-out successful",
  "line.checkout.alt": "Check-out successful {time}",
  "line.checkout.checkIn": "Check in",
  "line.checkout.checkOut": "Check out",
  "line.checkout.total": "Total time",
  "line.checkout.footer":
    "Attendance recorded. No approval required.",
  "line.checkout.footerOt":
    "Over standard time by {duration} — use OT menu to request overtime",

  "line.duration.hours": "{h} hrs",
  "line.duration.hoursMinutes": "{h} hrs {m} min",

  "line.alreadyCheckedIn.alt": "Already checked in today",
  "line.alreadyCheckedIn.title": "Already checked in",
  "line.alreadyCheckedIn.desc": "You already checked in today at {time}.",
  "line.alreadyCheckedOut.alt": "Already checked out today",
  "line.alreadyCheckedOut.title": "Already checked out",
  "line.alreadyCheckedOut.desc": "You already checked out today at {time}.",
  "line.notCheckedIn.alt": "Not checked in",
  "line.notCheckedIn.title": "Not checked in",
  "line.notCheckedIn.desc": "Please check in before checking out.",

  "line.geofence.alt": "Outside branch area",
  "line.geofence.title": "Outside branch area",
  "line.geofence.desc":
    "Your location is {distance} m from the branch (limit {limit} m).",
  "line.geofence.tip": "Please move closer to the branch and share location again.",

  "line.submit.saved": "Time recorded successfully.",
  "line.submit.alreadySaved": "Time already recorded. No need to submit again.",
  "line.submit.notCheckedIn": "No check-in recorded today.",
  "line.submit.notCheckedOut": "Please check out before recording time.",

  "line.stock.disabled":
    "/stock is temporarily disabled — use Rich Menu or contact HR.",

  "line.welcome.alt": "Welcome to HR system",
  "line.welcome.title": "Welcome!",
  "line.welcome.subtitle": "HR & Payroll — ChineseVibe",
  "line.welcome.intro":
    "Choose a menu below to record time, manage leave, and contact HR easily.",
  "line.welcome.menuTitle": "Main menu",
  "line.welcome.checkin": "Check in / out",
  "line.welcome.checkinDesc": "Record work start and end time",
  "line.welcome.ot": "Request OT",
  "line.welcome.otDesc": "Submit overtime request",
  "line.welcome.doc": "Documents",
  "line.welcome.docDesc": "Request HR certificates / documents",
  "line.welcome.leave": "Leave",
  "line.welcome.leaveDesc": "Submit leave request online",
  "line.welcome.complaint": "Complaint",
  "line.welcome.complaintDesc": "Report issues or suggestions",
  "line.welcome.contact": "Contact HR",
  "line.welcome.contactDesc": "Ask or contact the HR team",
  "line.welcome.tipMenu":
    "💡 Tap \"HR Menu\" below the chat (6 buttons) and choose a service.",
  "line.welcome.tipStock":
    "📦 Inventory: type /stock or /inbound (when enabled by HR)",

  "line.notRegistered.alt": "Employee not found",
  "line.notRegistered.title": "Not registered",
  "line.notRegistered.subtitle": "Not registered in the system",
  "line.notRegistered.desc":
    "Your LINE account is not registered yet, so HR menus are unavailable.",
  "line.notRegistered.step1": "Tap \"Register employee\" below",
  "line.notRegistered.step2":
    "Log in with LINE and fill employee ID, name, phone, and branch",
  "line.notRegistered.step3": "Wait for HR approval before using HR menus",
  "line.notRegistered.tip": "Or tap \"Contact HR\" to register",
  "line.notRegistered.button": "Register employee",

  "line.pending.alt": "Waiting for HR registration approval",
  "line.pending.title": "Pending approval",
  "line.pending.subtitle": "Registration submitted",
  "line.pending.desc":
    "HR is reviewing your information. Check-in, leave, and documents are not available yet.",
  "line.pending.step1": "Wait for HR approval (usually 1–2 business days)",
  "line.pending.step2":
    "Check status via LINE — tap \"Contact HR\" to inquire",
  "line.pending.step3":
    "After approval, use HR menus here or Employee Portal (if eligible)",
  "line.pending.tip":
    "You will be notified on LINE — no need to open HR Dashboard",

  "line.menuHint.alt": "Choose HR menu below",
  "line.menuHint.title": "Hello",
  "line.menuHint.subtitle": "HR & Payroll system",
  "line.menuHint.desc":
    "Choose a service from \"HR Menu\" below — 6 buttons: check-in, OT, documents, leave, complaint, contact HR",
  "line.menuHint.step1": "Tap \"HR Menu\" below and choose a service",
  "line.menuHint.step2":
    "Or type commands such as /leave /ot /doc /complaint /stock /inbound",
  "line.menuHint.step3": "Follow the cards sent by the system",
  "line.menuHint.tip": "Inventory: /stock or /inbound (when enabled by HR)",
}

const zh: MessageCatalog = {
  ...en,
  "lang.label": "语言",
  "portal.logout": "退出登录",
  "portal.nav.home": "首页",
  "portal.nav.profile": "个人资料",
  "portal.nav.attendance": "考勤",
  "portal.nav.schedule": "排班",
  "portal.nav.leave": "请假",
  "portal.nav.documents": "文件",
  "portal.nav.announcements": "公告",
  "portal.nav.payslips": "工资单",
  "portal.nav.inbound": "入库",
  "portal.nav.stock": "库存查询",
  "portal.home.greeting": "您好，{name}",
  "portal.home.subtitle": "今日摘要与 HR 快捷入口",
  "portal.home.todayStatus": "今日签到状态",
  "portal.home.checkIn": "上班 {time}",
  "portal.home.late": "（迟到）",
  "portal.home.checkOut": "下班 {time}",
  "portal.home.hours": " · {hours} 小时",
  "portal.home.inProgress": "工作中 — 尚未签退",
  "portal.home.notCheckedIn": "今日尚未签到 — 请扫码或使用下方链接",
  "portal.home.leaveBalance": "剩余假期",
  "portal.home.days": "{count} 天",
  "portal.home.announcements": "最新公告",
  "portal.home.noAnnouncements": "暂无公告",
  "portal.home.viewAll": "查看全部",
  "portal.home.shortcuts": "LIFF 快捷方式",
  "portal.home.shortcutLeave": "请假",
  "portal.home.shortcutManualTime": "手动录入时间",
  "portal.home.shortcutQr": "签到 QR",
  "portal.home.shortcutDoc": "申请文件",
  "portal.home.shortcutOt": "申请加班",
  "portal.home.shortcutComplaint": "投诉",
  "portal.home.shortcutInbound": "扫描入库",
  "portal.home.shortcutStock": "查库存",
  "portal.home.footerHint": "每日 QR 签到 — 在个人资料页下载 · HR 公告通过 LINE 发送",

  "line.error.noUser": "无法识别用户，请在与 OA 的私聊中签到。",
  "line.error.unknownMenu": "抱歉，未知菜单，请从下方菜单重试。",
  "line.error.gate": "无法识别用户，请在与 OA 的私聊中使用菜单。",
  "line.checkin.title": "✅ 签到成功",
  "line.checkin.lateTitle": "⏰ 签到成功（迟到）",
  "line.checkin.onTime": "准时",
  "line.checkin.late": "迟到 {minutes} 分钟",
  "line.checkout.title": "🔴 签退成功",
  "line.checkout.footer": "考勤已记录，无需审批。",
  "line.checkout.footerOt": "超出标准工时 {duration} — 如需加班请使用 OT 菜单",
  "line.submit.saved": "时间已成功记录。",
  "line.submit.alreadySaved": "时间已记录，无需重复提交。",
  "line.welcome.title": "欢迎！",
  "line.welcome.subtitle": "HR 与薪资系统 — ChineseVibe",
  "line.welcome.intro": "选择下方菜单即可记录考勤、请假并联系 HR。",
  "line.notRegistered.title": "未注册",
  "line.notRegistered.button": "员工注册",
  "line.pending.title": "等待审批",
  "line.menuHint.title": "您好",
}

const my: MessageCatalog = {
  ...en,
  "lang.label": "ဘာသာစကား",
  "portal.logout": "ထွက်ရန်",
  "portal.nav.home": "ပင်မစာမျက်နှာ",
  "portal.nav.profile": "ကိုယ်ရေးအချက်အလက်",
  "portal.nav.attendance": "ရုံးတက်မှတ်တမ်း",
  "portal.nav.schedule": "အချိန်ဇယား",
  "portal.nav.leave": "ခွင့်တောင်း",
  "portal.nav.documents": "စာရွက်စာတမ်း",
  "portal.nav.announcements": "ကြေညာချက်များ",
  "portal.nav.payslips": "လစာစ-slip",
  "portal.nav.inbound": "ကုန်သွင်း",
  "portal.nav.stock": "စတော့စစ်ဆေး",
  "portal.home.greeting": "မင်္ဂလာပါ {name}",
  "portal.home.subtitle": "ယနေ့အကျဉ်းချုပ်နှင့် HR အတိုလမ်းများ",
  "portal.home.todayStatus": "ယနေ့ check-in အခြေအနေ",
  "portal.home.checkIn": "ဝင် {time}",
  "portal.home.late": "(နောက်ကျ)",
  "portal.home.checkOut": "ထွက် {time}",
  "portal.home.hours": " · {hours} နာရီ",
  "portal.home.inProgress": "အလုပ်လုပ်နေသည် — မထွက်ရသေး",
  "portal.home.notCheckedIn":
    "ယနေ့ မဝင်ရောက်ရသေးပါ — QR သို့မဟုတ် အောက်ပါ link",
  "portal.home.leaveBalance": "ခွင့်ကျန်ရှိ",
  "portal.home.days": "{count} ရက်",
  "portal.home.announcements": "နောက်ဆုံးကြေညာချက်",
  "portal.home.noAnnouncements": "ကြေညာချက် မရှိသေးပါ",
  "portal.home.viewAll": "အားလုံးကြည့်",
  "portal.home.shortcuts": "LIFF အတိုလမ်းများ",
  "portal.home.shortcutLeave": "ခွင့်တောင်း",
  "portal.home.shortcutManualTime": "အချိန်ကိုယ်တိုင်မှတ်ပါ",
  "portal.home.shortcutQr": "Check-in QR",
  "portal.home.shortcutDoc": "စာရွက်တောင်း",
  "portal.home.shortcutOt": "OT တောင်း",
  "portal.home.shortcutComplaint": "တိုင်ကြား",
  "portal.home.shortcutInbound": "ကုန်သွင်းစкан",
  "portal.home.shortcutStock": "စတော့စစ်",
  "portal.home.footerHint":
    "နေ့စဉ် QR check-in — Profile မှ download · HR ကြေညာချက် LINE ဖြင့်",

  "line.error.noUser":
    "အသုံးပြုသူ မသိရပါ။ OA နဲ့ private chat မှ check-in လုပ်ပါ။",
  "line.checkin.title": "✅ Check-in အောင်မြင်",
  "line.checkin.lateTitle": "⏰ Check-in အောင်မြင် (နောက်ကျ)",
  "line.checkout.title": "🔴 Check-out အောင်မြင်",
  "line.checkout.footer": "အချိန်မှတ်ပြီး။ အတည်ပြုမလို။",
  "line.submit.saved": "အချိန်မှတ်ပြီးပါပြီ။",
  "line.welcome.title": "ကြိုဆိုပါတယ်!",
  "line.welcome.intro":
    "အောက်ပါ menu မှ အချိန်မှတ်၊ ခွင့်တောင်း၊ HR ဆက်သွယ်နိုင်ပါသည်။",
  "line.notRegistered.title": "မမှတ်ရသေးပါ",
  "line.notRegistered.button": "พนักงาน မှတ်ပါ",
  "line.pending.title": "အတည်ပြုခံရန်",
  "line.menuHint.title": "မင်္ဂလာပါ",
}

export const messages: Record<AppLocale, MessageCatalog> = { th, en, zh, my }

export type MessageKey = keyof typeof th
