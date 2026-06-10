export const teamMembers = [
  { name: 'Managing Partner', role: 'Admin', access: 'Post + approve + settings' },
  { name: 'Senior Lawyer', role: 'Lawyer', access: 'Legal review + approve' },
  { name: 'Accounting Lead', role: 'Accountant', access: 'Tax/accounting review' },
  { name: 'Content Manager', role: 'Editor', access: 'Create + edit drafts' },
];

export const prohibitedTerms = ['รับประกันผลลัพธ์', 'ดีที่สุดในประเทศ', 'ชนะทุกคดี', 'ลดภาษีได้แน่นอน', 'ไม่มีความเสี่ยง'];

export const targetAudiences = ['SME owners', 'Foreign investors', 'Startup founders', 'Japanese executives', 'Chinese investors'];

export const coreServices = ['Corporate Law', 'Accounting', 'Tax Advisory', 'PDPA Compliance', 'Labor Law', 'Visa & Work Permit'];

export const imageGenerationConnector = {
  provider: 'OpenAI Images API',
  defaultModel: 'gpt-image-2',
  lockedSnapshot: 'gpt-image-2-2026-04-21',
  thaiTextRule: 'Generate visual/background only; Thai text must be overlaid by the app composer.',
};
