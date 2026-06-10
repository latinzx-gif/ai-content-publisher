export const knowledgeSources = [
  {
    name: 'Revenue Department VAT Update 2026.pdf',
    type: 'PDF',
    category: 'Tax',
    status: 'Indexed',
    chunks: 42,
    updated: '2 days ago',
  },
  {
    name: 'PDPA Client Advisory Guideline',
    type: 'Internal Guideline',
    category: 'PDPA',
    status: 'Indexed',
    chunks: 28,
    updated: '1 week ago',
  },
  {
    name: 'Corporate Registration SOP',
    type: 'Company SOP',
    category: 'Corporate Law',
    status: 'Processing',
    chunks: 19,
    updated: 'Today',
  },
  {
    name: 'Labor Protection Act Reference Notes',
    type: 'Link',
    category: 'Labor Law',
    status: 'Needs review',
    chunks: 33,
    updated: '3 weeks ago',
  },
  {
    name: 'Monthly Accounting Close Checklist',
    type: 'Template',
    category: 'Accounting',
    status: 'Indexed',
    chunks: 16,
    updated: 'Yesterday',
  },
];

export const ragRules = [
  'AI must cite at least one indexed source before drafting legal or accounting claims.',
  'If no matching source is found, AI must ask for upload/link instead of guessing.',
  'Claims marked high-risk are routed to Review Queue automatically.',
  'Outdated sources trigger an update warning before generation.',
];
