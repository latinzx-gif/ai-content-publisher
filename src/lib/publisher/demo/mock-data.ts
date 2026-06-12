import type { DemoPost } from './types';

export const MOCK_POSTS: DemoPost[] = [
  // ── Week 1 ──────────────────────────────────────────────────────────────────
  {
    id: 'p11', title: 'Welcome June — DataClaw Tips', platform: 'facebook', status: 'published', brand: 'DataClaw',
    caption: '🌟 มิถุนายนมาแล้ว! มาดู tips ที่จะช่วยให้ธุรกิจคุณดีขึ้นในเดือนนี้',
    tags: ['Tips'], scheduledAt: '2026-06-01T10:00:00Z', createdAt: '2026-05-30T10:00:00Z', comments: [],
  },
  {
    id: 'p12', title: 'Weekly Payroll Reminder', platform: 'linkedin', status: 'published', brand: 'DataClaw',
    caption: 'อย่าลืม! สิ้นสัปดาห์นี้คือวันตัดเงินเดือน เตรียมพร้อมกับ DataClaw',
    tags: ['Payroll'], scheduledAt: '2026-06-02T09:00:00Z', createdAt: '2026-05-30T10:00:00Z', comments: [],
  },
  {
    id: 'p13', title: 'IMS Feature Spotlight', platform: 'instagram', status: 'published', brand: 'DataClaw',
    caption: 'ฟีเจอร์ใหม่ใน IMS: real-time stock alerts แจ้งเตือนอัตโนมัติทันที 🔔',
    tags: ['IMS', 'Feature'], scheduledAt: '2026-06-03T11:00:00Z', createdAt: '2026-06-01T10:00:00Z', comments: [],
  },
  {
    id: 'p14', title: 'Customer Story — Retail Chain', platform: 'facebook', status: 'published', brand: 'DataClaw',
    caption: 'ร้านค้าปลีก 50 สาขา จัดการสินค้าทั้งหมดผ่าน DataClaw IMS ได้จริง',
    tags: ['CustomerStory'], scheduledAt: '2026-06-04T10:00:00Z', createdAt: '2026-06-02T10:00:00Z', comments: [],
  },
  {
    id: 'p15', title: 'Thursday Throwback — Founding Story', platform: 'instagram', status: 'published', brand: 'DataClaw',
    caption: '#ThrowbackThursday เรื่องราวการก่อตั้ง DataClaw จากไอเดียเล็กๆ สู่ SaaS ชั้นนำ',
    tags: ['Throwback'], scheduledAt: '2026-06-05T14:00:00Z', createdAt: '2026-06-03T10:00:00Z', comments: [],
  },
  {
    id: 'p16', title: 'Friday Quick Poll', platform: 'facebook', status: 'published', brand: 'DataClaw',
    caption: 'Poll: ปัญหาที่ใหญ่ที่สุดของคุณตอนนี้คืออะไร? A) Payroll B) Inventory C) Accounting',
    tags: ['Poll'], scheduledAt: '2026-06-06T09:00:00Z', createdAt: '2026-06-04T10:00:00Z', comments: [],
  },
  // ── Week 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'p17', title: 'Monday Motivation — SME Growth', platform: 'linkedin', status: 'scheduled', brand: 'DataClaw',
    caption: 'SME ที่เติบโตเร็วที่สุดในไทยมีสิ่งเดียวกัน: ระบบหลังบ้านที่ดี 💼',
    tags: ['SME', 'Growth'], scheduledAt: '2026-06-15T09:00:00Z', createdAt: '2026-06-10T10:00:00Z', comments: [],
  },
  {
    id: 'p18', title: 'Instagram Reel — Quick Demo', platform: 'instagram', status: 'creative_approved', brand: 'DataClaw',
    caption: '30-second demo ของ DataClaw Dashboard ที่คุณต้องดู ✨',
    tags: ['Demo', 'Reel'],
    imageOptions: [{ id: 'img-j', label: 'Reel Cover', color: '#ede9fe' }],
    scheduledAt: '2026-06-16T18:00:00Z', createdAt: '2026-06-10T10:00:00Z', comments: [],
  },
  {
    id: 'p19', title: 'Blog Post — Tax Planning Q3', platform: 'facebook', status: 'text_approved', brand: 'DataClaw',
    caption: 'เริ่มวางแผนภาษีไตรมาส 3 ได้แล้วตอนนี้ อย่ารอให้สิ้นปี!',
    tags: ['Tax', 'Blog'], scheduledAt: '2026-06-17T10:00:00Z', createdAt: '2026-06-11T08:00:00Z', comments: [],
  },
  {
    id: 'p20', title: 'Webinar Announcement', platform: 'linkedin', status: 'text_generated', brand: 'DataClaw',
    caption: '📣 Webinar: "Automate Your SME Finances" — 25 มิถุนายน 14:00 น.',
    tags: ['Webinar', 'Event'], scheduledAt: '2026-06-18T09:00:00Z', createdAt: '2026-06-11T09:00:00Z', comments: [],
  },
  {
    id: 'p21', title: 'Product Update v2.4', platform: 'facebook', status: 'draft', brand: 'DataClaw',
    caption: 'DataClaw v2.4 มาแล้ว! ฟีเจอร์ใหม่ที่รอคอย: bulk import, dark mode, และอื่นๆ',
    tags: ['ProductUpdate'], scheduledAt: '2026-06-19T10:00:00Z', createdAt: '2026-06-11T10:00:00Z', comments: [],
  },
  // ── Week 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'p22', title: 'Case Study — Restaurant Chain', platform: 'instagram', status: 'draft', brand: 'DataClaw',
    caption: 'เชนร้านอาหาร 20 สาขา บริหาร inventory ได้อย่างไรด้วย DataClaw',
    tags: ['CaseStudy'], scheduledAt: '2026-06-22T10:00:00Z', createdAt: '2026-06-12T10:00:00Z', comments: [],
  },
  {
    id: 'p23', title: 'LinkedIn Article — Finance Automation', platform: 'linkedin', status: 'draft', brand: 'DataClaw',
    caption: 'บทความ: Finance automation ทำไมถึงสำคัญสำหรับ SME ในปี 2026',
    tags: ['Article', 'Finance'], scheduledAt: '2026-06-23T09:00:00Z', createdAt: '2026-06-12T09:00:00Z', comments: [],
  },
  {
    id: 'p24', title: 'Webinar Follow-up Post', platform: 'facebook', status: 'draft', brand: 'DataClaw',
    caption: 'ขอบคุณทุกท่านที่เข้าร่วม Webinar เมื่อวาน! สรุปประเด็นสำคัญมาให้แล้ว',
    tags: ['Webinar'], scheduledAt: '2026-06-26T10:00:00Z', createdAt: '2026-06-12T09:00:00Z', comments: [],
  },
  {
    id: 'p25', title: 'End of Month Recap', platform: 'instagram', status: 'draft', brand: 'DataClaw',
    caption: 'สรุปมิถุนายน 2026 กับ DataClaw: ตัวเลขที่ทำให้ยิ้มได้ 📈',
    tags: ['Recap', 'EOMonth'], scheduledAt: '2026-06-30T16:00:00Z', createdAt: '2026-06-12T10:00:00Z', comments: [],
  },
  {
    id: 'p01', title: 'HR System Launch Announcement', platform: 'facebook', status: 'draft', brand: 'DataClaw',
    caption: 'ระบบ HR ใหม่ที่ช่วยลดเวลาจัดการพนักงานลงถึง 60% เหมาะสำหรับธุรกิจ SME ทุกขนาด 🚀 ลองใช้ฟรีได้แล้ววันนี้',
    tags: ['HR', 'SME', 'Launch'], campaign: 'Q2 Launch', createdAt: '2026-06-10T08:00:00Z', comments: [],
  },
  {
    id: 'p02', title: 'Payroll FAQ — Top 5 Questions', platform: 'linkedin', status: 'text_approved', brand: 'DataClaw',
    caption: '5 คำถามที่พบบ่อยที่สุดเกี่ยวกับการทำ Payroll ที่ทุกธุรกิจต้องรู้ก่อนสิ้นเดือน...',
    tags: ['Payroll', 'FAQ'],
    imageOptions: [
      { id: 'img-a', label: 'Option A — Clean Office', color: '#dbeafe' },
      { id: 'img-b', label: 'Option B — Dashboard UI', color: '#ede9fe' },
      { id: 'img-c', label: 'Option C — Abstract Shapes', color: '#fce7f3' },
    ],
    campaign: 'Education Series', createdAt: '2026-06-10T09:00:00Z',
    comments: [
      { id: 'c1', author: 'Content Creator', role: 'creator', text: 'Text ready for review', createdAt: '2026-06-10T09:30:00Z' },
      { id: 'c2', author: 'Client', role: 'client', text: 'Looks good! Please add more CTA at the end', createdAt: '2026-06-10T10:00:00Z' },
    ],
  },
  {
    id: 'p03', title: 'Inventory System Case Study', platform: 'linkedin', status: 'changes_requested', brand: 'DataClaw',
    caption: 'กรณีศึกษา: บริษัท X ลดต้นทุนคลังสินค้าได้ 40% ด้วยระบบ IMS อัตโนมัติ...',
    tags: ['CaseStudy', 'Inventory'], campaign: 'Q2 Launch', createdAt: '2026-06-09T11:00:00Z',
    comments: [
      { id: 'c3', author: 'Approver', role: 'approver', text: 'ขอปรับ tone ให้เป็นทางการขึ้นกว่านี้', createdAt: '2026-06-09T14:00:00Z' },
    ],
  },
  {
    id: 'p04', title: 'Service CTA — Accounting', platform: 'facebook', status: 'creative_approved', brand: 'DataClaw',
    caption: 'ลดภาระงานบัญชีด้วย AI ที่เข้าใจกฎหมายไทย ปิดงบเร็วขึ้น ผิดพลาดน้อยลง',
    tags: ['Accounting', 'CTA'],
    imageOptions: [
      { id: 'img-d', label: 'Option A — Professional', color: '#d1fae5' },
      { id: 'img-e', label: 'Option B — Bold Red', color: '#fee2e2' },
    ],
    selectedImageId: 'img-d',
    campaign: 'Q2 Launch', createdAt: '2026-06-09T08:00:00Z',
    comments: [{ id: 'c4', author: 'Creative', role: 'approver', text: 'Creative approved ✓', createdAt: '2026-06-09T16:00:00Z' }],
  },
  {
    id: 'p05', title: 'Promo Post — June Discount', platform: 'instagram', status: 'scheduled', brand: 'DataClaw',
    caption: '🎉 มิถุนายนนี้ ใช้งาน DataClaw ฟรี 30 วัน ไม่ต้องใช้บัตรเครดิต สมัครได้เลย!',
    tags: ['Promo', 'June'],
    imageOptions: [{ id: 'img-f', label: 'Promo Banner', color: '#fef3c7' }],
    selectedImageId: 'img-f',
    scheduledAt: '2026-06-13T09:00:00Z',
    campaign: 'June Promo', createdAt: '2026-06-08T10:00:00Z', comments: [],
  },
  {
    id: 'p06', title: 'TikTok — AI explainer', platform: 'tiktok', status: 'image_ready', brand: 'DataClaw',
    caption: 'AI ช่วยทำงานบัญชียังไง? อธิบายให้เข้าใจใน 60 วินาที 🤖',
    tags: ['AI', 'Education'],
    imageOptions: [
      { id: 'img-g', label: 'Option A — Bright', color: '#fde68a' },
      { id: 'img-h', label: 'Option B — Dark', color: '#1e293b' },
      { id: 'img-i', label: 'Option C — Gradient', color: '#a5b4fc' },
    ],
    campaign: 'Education Series', createdAt: '2026-06-10T14:00:00Z', comments: [],
  },
  {
    id: 'p07', title: 'Facebook — Client Testimonial', platform: 'facebook', status: 'published', brand: 'DataClaw',
    caption: '"DataClaw ช่วยให้ทีมบัญชีของเราทำงานได้เร็วขึ้น 3 เท่า" — คุณสมชาย, CEO บริษัท ABC',
    tags: ['Testimonial'], scheduledAt: '2026-06-08T08:00:00Z',
    campaign: 'Social Proof', createdAt: '2026-06-07T10:00:00Z', comments: [],
  },
  {
    id: 'p08', title: 'LinkedIn — Demo Script Preview', platform: 'linkedin', status: 'published', brand: 'DataClaw',
    caption: 'ดู demo สด: วิธีที่ DataClaw จัดการงาน payroll 500 คนได้ใน 10 นาที',
    tags: ['Demo', 'LinkedIn'], scheduledAt: '2026-06-09T09:00:00Z',
    campaign: 'Q2 Launch', createdAt: '2026-06-07T11:00:00Z', comments: [],
  },
  {
    id: 'p09', title: 'Instagram — Product Feature Reel', platform: 'instagram', status: 'failed', brand: 'DataClaw',
    caption: 'ฟีเจอร์ใหม่: dashboard ที่ดูข้อมูลทั้งบริษัทได้ในหน้าเดียว 📊',
    tags: ['Feature', 'Reel'], scheduledAt: '2026-06-10T18:00:00Z',
    campaign: 'Product Update', createdAt: '2026-06-09T12:00:00Z', comments: [],
  },
  {
    id: 'p10', title: 'Blog — Year-End Tax Guide', platform: 'facebook', status: 'text_generated', brand: 'DataClaw',
    caption: 'คู่มือปิดงบปลายปี 2026 ฉบับสมบูรณ์: เช็กลิสต์ 20 ข้อที่นักบัญชีต้องทำก่อนสิ้นปี',
    tags: ['Tax', 'Guide', 'Blog'],
    campaign: 'Education Series', createdAt: '2026-06-11T07:00:00Z', comments: [],
  },
];

export function getPostsByStatus(statuses: string[]): DemoPost[] {
  return MOCK_POSTS.filter((p) => statuses.includes(p.status));
}

export function getPostById(id: string): DemoPost | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}
