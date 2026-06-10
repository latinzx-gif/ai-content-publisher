import { Activity, FileText, MessageSquareText } from 'lucide-react';
import { MousePointerIcon } from '@/features/prd/components/icons/prd-icons';

export const analyticsSummary = [
  { label: 'Total reach', value: '128.4K', change: '+18.2%', icon: Activity },
  { label: 'Engagement', value: '9.7K', change: '+11.4%', icon: MessageSquareText },
  { label: 'Clicks', value: '3.2K', change: '+7.8%', icon: MousePointerIcon },
  { label: 'Partner reports', value: '6', change: 'Ready to export', icon: FileText },
];

export const contentPerformance = [
  { title: 'PDPA compliance checklist', language: 'TH', reach: '32.1K', engagement: '2.8K', clicks: '814', topic: 'PDPA' },
  { title: 'Foreign investor company guide', language: 'ZH', reach: '28.4K', engagement: '2.1K', clicks: '1,126', topic: 'Corporate Law' },
  { title: 'VAT filing mistakes for SMEs', language: 'TH', reach: '21.7K', engagement: '1.5K', clicks: '492', topic: 'Accounting' },
  { title: 'BOI incentive comparison', language: 'EN', reach: '18.9K', engagement: '1.1K', clicks: '417', topic: 'Investment' },
  { title: 'Hiring your first employee', language: 'TH', reach: '14.3K', engagement: '927', clicks: '256', topic: 'Labor Law' },
];

export const languagePerformance = [
  { language: 'Thai', audience: 'SME owners', reach: 58, note: 'Best for accounting and tax reminders' },
  { language: 'Chinese', audience: 'Investors', reach: 74, note: 'Strongest investor reach and click intent' },
  { language: 'English', audience: 'Foreign founders', reach: 46, note: 'Works well for BOI and company setup' },
  { language: 'Japanese', audience: 'Executives', reach: 31, note: 'Niche but high-quality consultation leads' },
];

export const topicTrends = [
  { topic: 'Corporate Law', score: 86, trend: '+24%' },
  { topic: 'Accounting', score: 74, trend: '+18%' },
  { topic: 'PDPA', score: 69, trend: '+12%' },
  { topic: 'Tax', score: 63, trend: '+9%' },
  { topic: 'Labor Law', score: 48, trend: '+4%' },
];
