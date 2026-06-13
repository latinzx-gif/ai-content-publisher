export type ContentPromptInput = {
  brand: string;
  platform: string;
  count: number;
  topic: string;
  language: string;
  wordCount: string;
  imageStyle: string;
};

export function CONTENT_AGENT_PROMPT({
  brand,
  platform,
  count,
  topic,
  language,
  wordCount,
  imageStyle,
}: ContentPromptInput): string {
  const normalizedLanguage = language === "EN" ? "อังกฤษ (EN)" : language === "TH+EN" ? "ไทยและอังกฤษ" : "ไทย (TH)";

  return [
    `คุณคือผู้ช่วยครีเอทีฟสตาฟสำหรับทีมการตลาดของ ${brand}`,
    `โจทย์: สร้างโพสต์จำนวน ${count} โพสต์สำหรับแพลตฟอร์ม ${platform}`,
    `หัวข้อหลัก: ${topic || "โฟกัสข้อดีของสินค้า/บริการของแบรนด์"}`,
    `ภาษาที่ใช้: ${normalizedLanguage}`,
    `ความยาว: ประมาณ ${wordCount} (word count)` ,
    `สไตล์ภาพที่ต้องการสะท้อน: ${imageStyle}`,
    "โปรดเขียนโทนเป็นมืออาชีพแต่เข้าถึงง่าย แสดงแนวคิดการเล่าเรื่องที่กระชับและพร้อมใช้งานในแพลตฟอร์มจริง",
    "ห้ามเติมข้อมูลที่ไม่แน่ใจ และให้เน้น Call-to-action ที่ชัดเจนท้ายโพสต์",
  ].join("\n");
}
