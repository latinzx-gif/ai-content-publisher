// ── Demo Feature Types ─────────────────────────────────────────────────────
// Isolated from production types. Used only in src/app/publisher/demo/** and
// src/components/publisher/demo/**

export type DemoPostStatus =
  | 'draft'
  | 'text_generated'
  | 'text_approved'
  | 'image_pending'
  | 'image_ready'
  | 'creative_approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'changes_requested'
  | 'rejected'
  | 'archived';

export type DemoPlatform =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok';

export type DemoImageOption = {
  id: string;
  label: string;
  color: string; // hex or tailwind-compatible color for placeholder
};

export type DemoComment = {
  id: string;
  author: string;
  role: 'creator' | 'approver' | 'client';
  text: string;
  createdAt: string;
};

export type DemoPost = {
  id: string;
  title: string;
  caption: string;
  platform: DemoPlatform;
  status: DemoPostStatus;
  brand: string;
  imageOptions?: DemoImageOption[];
  selectedImageId?: string;
  scheduledAt?: string;
  campaign?: string;
  tags: string[];
  createdAt: string;
  comments: DemoComment[];
};

export type DemoKanbanColumn = {
  id: string;
  label: string;
  statuses: DemoPostStatus[];
  accentClass: string;
};

export const DEMO_KANBAN_COLUMNS: DemoKanbanColumn[] = [
  { id: 'draft',    label: 'Draft',             statuses: ['draft', 'text_generated'],       accentClass: 'bg-slate-500' },
  { id: 'review',   label: 'Text Review',        statuses: ['text_approved'],                 accentClass: 'bg-blue-500' },
  { id: 'image',    label: 'Image',              statuses: ['image_pending', 'image_ready'],  accentClass: 'bg-yellow-500' },
  { id: 'creative', label: 'Creative Review',    statuses: ['creative_approved'],             accentClass: 'bg-purple-500' },
  { id: 'sched',    label: 'Scheduled',          statuses: ['scheduled'],                     accentClass: 'bg-emerald-500' },
  { id: 'done',     label: 'Published / Failed', statuses: ['published', 'failed'],           accentClass: 'bg-rose-500' },
];

export const STATUS_LABELS: Record<DemoPostStatus, string> = {
  draft:              'Draft',
  text_generated:     'Text Generated',
  text_approved:      'Text Approved',
  image_pending:      'Image Pending',
  image_ready:        'Image Ready',
  creative_approved:  'Creative Approved',
  scheduled:          'Scheduled',
  published:          'Published',
  failed:             'Failed',
  changes_requested:  'Changes Requested',
  rejected:           'Rejected',
  archived:           'Archived',
};

export const STATUS_COLORS: Record<DemoPostStatus, string> = {
  draft:              'bg-slate-100 text-slate-700',
  text_generated:     'bg-blue-50 text-blue-700',
  text_approved:      'bg-blue-100 text-blue-800',
  image_pending:      'bg-yellow-50 text-yellow-700',
  image_ready:        'bg-yellow-100 text-yellow-800',
  creative_approved:  'bg-purple-100 text-purple-800',
  scheduled:          'bg-emerald-100 text-emerald-800',
  published:          'bg-green-100 text-green-800',
  failed:             'bg-red-100 text-red-800',
  changes_requested:  'bg-orange-100 text-orange-800',
  rejected:           'bg-red-100 text-red-700',
  archived:           'bg-gray-100 text-gray-600',
};
