import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  FileText,
  Home,
  Library,
  PenLine,
  Settings,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type MenuItem = {
  name: string;
  icon: ComponentType<{ className?: string }>;
};

export const navGroups: { group: string; items: MenuItem[] }[] = [
  {
    group: 'Command',
    items: [
      { name: 'Dashboard', icon: Home },
      { name: 'Calendar', icon: CalendarDays },
      { name: 'Publishing', icon: UploadCloud },
    ],
  },
  {
    group: 'Studio',
    items: [
      { name: 'Create Post', icon: PenLine },
      { name: 'Review Queue', icon: ShieldCheck },
      { name: 'Content Library', icon: Library },
    ],
  },
  {
    group: 'Intelligence',
    items: [{ name: 'Analytics', icon: BarChart3 }],
  },
  {
    group: 'System',
    items: [
      { name: 'Knowledge Base', icon: BookOpen },
      { name: 'Rules & Brand', icon: FileText },
      { name: 'Agents', icon: Bot },
      { name: 'Settings', icon: Settings },
      { name: 'Logs', icon: Activity },
    ],
  },
];

export type PageName = (typeof navGroups)[number]['items'][number]['name'];

export const pageMeta: Record<
  string,
  {
    group: string;
    title: string;
    description: string;
    tabs: string[];
  }
> = {
  Dashboard: {
    group: 'Command',
    title: 'Operations command center',
    description: "Today's publishing operations: readiness, stuck work, agent progress, and the next human action.",
    tabs: ['Today', 'Pipeline', 'Needs action'],
  },
  Calendar: {
    group: 'Command',
    title: 'Publishing calendar',
    description: 'Plan monthly, weekly, and daily publishing coverage across Thailand timezone.',
    tabs: ['Month', 'Week', 'Day'],
  },
  Publishing: {
    group: 'Command',
    title: 'Publishing queue',
    description: 'Operate approved posts from unscheduled to scheduled, failed, retried, and published.',
    tabs: ['Unscheduled', 'Scheduled', 'Failed', 'Published log'],
  },
  Analytics: {
    group: 'Intelligence',
    title: 'Analytics',
    description: 'Measure reach, engagement, content trends, and the learning loop for future briefs.',
    tabs: ['Performance', 'Languages', 'Learning loop'],
  },
  'Create Post': {
    group: 'Studio',
    title: 'Create',
    description: 'A guided studio flow from brief, rules, generation, image direction, QC, and review handoff.',
    tabs: ['Manual Setup', 'Quick AI Mode'],
  },
  'Content Library': {
    group: 'Studio',
    title: 'Content Library',
    description: 'Search, filter, reuse, and update all approved posts, drafts, media, and campaign assets.',
    tabs: ['All', 'Drafts', 'Approved', 'Archived'],
  },
  'Knowledge Base': {
    group: 'System',
    title: 'Sources & knowledge',
    description: 'Maintain approved legal and accounting sources that ground AI output and reduce hallucination.',
    tabs: ['Sources', 'Processing', 'Test RAG Knowledge'],
  },
  'Review Queue': {
    group: 'Studio',
    title: 'Review',
    description: 'Preview-first human control for approving, revising, regenerating, or scheduling content.',
    tabs: ['Awaiting review', 'Risk flagged', 'Approved'],
  },
  'Rules & Brand': {
    group: 'System',
    title: 'Rules & Brand',
    description: 'Set team permissions, brand voice, professional rules, target audiences, and forbidden terms.',
    tabs: ['Team Members', 'Law firm voice', 'Accounting voice'],
  },
  Agents: {
    group: 'System',
    title: 'Agents',
    description: 'Manage locked core agents, OpenAI model routing, and premium agent expansion.',
    tabs: ['Core agents', 'Agent routing', 'Upsell locked'],
  },
  Logs: {
    group: 'System',
    title: 'Logs',
    description: 'Trace system events, errors, bugs, agent runs, exports, and audit history.',
    tabs: ['Activity', 'Errors', 'Agent runs'],
  },
  Settings: {
    group: 'System',
    title: 'Settings',
    description: 'Connect platforms, manage credentials, local Codex settings, and operational preferences.',
    tabs: ['Profile', 'Integrations', 'Security'],
  },
};
