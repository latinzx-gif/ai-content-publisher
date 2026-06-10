export type AgentPositionId =
  | "orchestrator"
  | "content_agent"
  | "qc_agent"
  | "image_prompt_agent"
  | "image_composer_agent"
  | "publish_agent"
  | "manual_reviewer";

export type AgentPosition = {
  id: AgentPositionId;
  name: string;
  shortName: string;
  role: string;
  queueName: string;
  phaseLabel: string;
  description: string;
};

export const AGENT_PIPELINE: readonly AgentPosition[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    shortName: "OPS",
    role: "Workflow Control",
    queueName: "review-pipeline",
    phaseLabel: "ควบคุมคิวงานกลาง",
    description:
      "ติดตามโพสต์ผ่านทุกเฟส, ตรวจ prerequisite, เลือกงานถัดไป และสลับสถานะให้ตรงกับความคืบหน้า",
  },
  {
    id: "content_agent",
    name: "Content Agent",
    shortName: "A",
    role: "Content Production",
    queueName: "content-queue",
    phaseLabel: "Draft → Content Ready",
    description:
      "สร้างข้อความคอนเทนต์จาก Brief + Rules และจัดรูปแบบเป็นภาษาที่กำหนด",
  },
  {
    id: "qc_agent",
    name: "Quality Agent",
    shortName: "B",
    role: "Quality Gate",
    queueName: "qc-queue",
    phaseLabel: "QC & Compliance",
    description:
      "เช็กคุณภาพเนื้อหา, เหมาะสมกับแบรนด์, หา risk/คำต้องห้าม, และป้ายสถานะ",
  },
  {
    id: "image_prompt_agent",
    name: "Image Prompt Agent",
    shortName: "C",
    role: "Visual Planning",
    queueName: "prompt-queue",
    phaseLabel: "Prompt Generation",
    description:
      "ออกแบบ Visual Prompt ตามแนวคิดโพสต์ + brand guideline เพื่อคิวงานสร้างภาพต่อไป",
  },
  {
    id: "image_composer_agent",
    name: "Image Composer Agent",
    shortName: "D",
    role: "Image Composer",
    queueName: "compose-queue",
    phaseLabel: "Compose Assets",
    description:
      "สร้างภาพตาม prompt ทีละเวอร์ชัน, คอยยืนยันว่าพร้อมนำไปใช้ในแพลตฟอร์ม",
  },
  {
    id: "publish_agent",
    name: "Publish Agent",
    shortName: "E",
    role: "Distribution",
    queueName: "publish-queue",
    phaseLabel: "Publish Dispatch",
    description:
      "ส่งงานที่ผ่าน QC และมีภาพแล้วเข้า queue เผยแพร่/กำหนดเวลา publish ต่อแพลตฟอร์ม",
  },
  {
    id: "manual_reviewer",
    name: "Manual Reviewer",
    shortName: "Human",
    role: "Human Approval",
    queueName: "manual-queue",
    phaseLabel: "Final Approval",
    description:
      "ผู้ใช้กดยืนยัน / แก้ไข / ตีกลับก่อนเผยแพร่จริงในขั้น Review",
  },
] as const;

export const AGENT_NAME_BY_ID = AGENT_PIPELINE.reduce<Record<AgentPositionId, string>>(
  (acc, role) => {
    acc[role.id] = role.name;
    return acc;
  },
  {
    orchestrator: "Orchestrator",
    content_agent: "Content Agent",
    qc_agent: "Quality Agent",
    image_prompt_agent: "Image Prompt Agent",
    image_composer_agent: "Image Composer Agent",
    publish_agent: "Publish Agent",
    manual_reviewer: "Manual Reviewer",
  }
);

export const AGENT_NAME_LIST = AGENT_PIPELINE.map((role) => role.name);
