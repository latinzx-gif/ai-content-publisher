// ─── Types ─────────────────────────────────────────────────────────────────

export type AgentStatus       = 'active' | 'idle' | 'busy' | 'offline' | 'review';
export type RiskLevel         = 'low' | 'medium' | 'high';
export type IntegrationStatus = 'connected' | 'warning' | 'offline';
export type TaskStatus        = 'done' | 'in-progress' | 'pending' | 'blocked';
export type NavSection        = 'overview' | 'chat' | 'agents' | 'workflow' | 'sops' | 'reports' | 'settings';

export interface ChatMessage {
  id: string;
  from: 'user' | 'agent';
  text: string;
  time: string;
}

export interface AgentTask {
  id: string;
  label: string;
  status: TaskStatus;
  assignee?: string;
}

export interface DashboardAgent {
  id: string;
  name: string;
  role: string;
  roomId: string;
  status: AgentStatus;
  initials: string;
  accentColor: string;
  currentTask: string;
  queue: number;
  risk: RiskLevel;
  tools: string[];
  tasks: AgentTask[];
  messages: ChatMessage[];
}

export interface DashboardRoom {
  id: string;
  name: string;
  shortName: string;
  agentIds: string[];
  bgColor: string;
  accent: string;
  gridArea: string;
  tooltip: string;
  icon: string;
  /** Decorative desk/console elements to render inside the room tile */
  desks: number;
}

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  category: 'business' | 'system';
}

export interface IntegrationData {
  id: string;
  name: string;
  status: IntegrationStatus;
  icon: string;
  lastSync: string;
}

export interface WorkflowItem {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
}

export interface SOPItem {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  version: string;
}

export interface ReportSection {
  id: string;
  title: string;
  value: string;
  trend: string;
  color: string;
}

// ─── Business KPI Cards (primary) ──────────────────────────────────────────

export const businessKPIs: KPICardData[] = [
  {
    id: 'revenue-pipeline',
    label: 'Revenue Pipeline',
    value: '฿1.24M',
    sub: '+18% vs last month',
    color: '#22c55e',
    icon: '💰',
    trend: 'up',
    category: 'business',
  },
  {
    id: 'active-deliveries',
    label: 'Active Deliveries',
    value: 8,
    sub: '1 at risk',
    color: '#06b6d4',
    icon: '📦',
    trend: 'stable',
    category: 'business',
  },
  {
    id: 'dataclaw-assets',
    label: 'DataClaw Assets',
    value: '4.2 TB',
    sub: '156 datasets live',
    color: '#3b82f6',
    icon: '📡',
    trend: 'up',
    category: 'business',
  },
  {
    id: 'investment-risk',
    label: 'Investment Risk',
    value: 'Medium',
    sub: 'Portfolio: $2.4M',
    color: '#f59e0b',
    icon: '📈',
    trend: 'stable',
    category: 'business',
  },
  {
    id: 'pending-approvals',
    label: 'Pending Approvals',
    value: 5,
    sub: '2 urgent today',
    color: '#eab308',
    icon: '⏳',
    trend: 'up',
    category: 'business',
  },
  {
    id: 'agent-queue',
    label: 'Agent Queue',
    value: 47,
    sub: 'Across 7 agents',
    color: '#a855f7',
    icon: '🤖',
    trend: 'up',
    category: 'business',
  },
];

// ─── System KPI Cards (secondary) ──────────────────────────────────────────

export const systemKPIs: KPICardData[] = [
  {
    id: 'sources',
    label: 'Read-only Sources',
    value: 12,
    sub: 'All stable',
    color: '#06b6d4',
    icon: '📂',
    trend: 'stable',
    category: 'system',
  },
  {
    id: 'audit',
    label: 'Audit Events',
    value: 47,
    sub: 'Last 24h',
    color: '#a855f7',
    icon: '🔍',
    trend: 'up',
    category: 'system',
  },
  {
    id: 'secrets',
    label: 'Secrets Exposed',
    value: 0,
    sub: 'Clean ✓',
    color: '#22c55e',
    icon: '🔐',
    trend: 'stable',
    category: 'system',
  },
  {
    id: 'release',
    label: 'Production Release',
    value: 'v2.4.1',
    sub: 'Stable',
    color: '#3b82f6',
    icon: '🚀',
    trend: 'stable',
    category: 'system',
  },
];

// ─── Integrations ──────────────────────────────────────────────────────────

export const integrations: IntegrationData[] = [
  { id: 'codex',    name: 'Codex',        status: 'connected', icon: '⌨️',  lastSync: '1m ago'  },
  { id: 'hermes',   name: 'Hermes Brain', status: 'connected', icon: '🧠',  lastSync: '30s ago' },
  { id: 'obsidian', name: 'Obsidian',     status: 'connected', icon: '💎',  lastSync: '5m ago'  },
  { id: 'gdrive',   name: 'Drive',        status: 'connected', icon: '📁',  lastSync: '2m ago'  },
  { id: 'gmail',    name: 'Gmail',        status: 'warning',   icon: '📧',  lastSync: '18m ago' },
  { id: 'gads',     name: 'Google Ads',   status: 'connected', icon: '📊',  lastSync: '10m ago' },
  { id: 'facebook', name: 'Facebook',     status: 'offline',   icon: '📱',  lastSync: 'Offline' },
  { id: 'telegram', name: 'Telegram',     status: 'connected', icon: '✈️',  lastSync: 'Live'    },
];

// ─── Agents ────────────────────────────────────────────────────────────────

export const dashboardAgents: DashboardAgent[] = [
  {
    id: 'owner',
    name: 'P. Jakari (Owner)',
    role: 'Executive Director',
    roomId: 'executive',
    status: 'active',
    initials: 'PJ',
    accentColor: '#0ea5e9',
    currentTask: 'Q3 Review — 5 approvals pending',
    queue: 3,
    risk: 'low',
    tools: ['Obsidian', 'Google Drive', 'Telegram'],
    tasks: [
      { id: 't1', label: 'Approve Fastwork Acme Corp proposal #8',   status: 'pending',     assignee: 'Owner' },
      { id: 't2', label: 'Review & sign Q3 OKRs document',            status: 'in-progress', assignee: 'Owner' },
      { id: 't3', label: 'Investment DCA order: BTC ฿15K + ETF ฿8K', status: 'pending',     assignee: 'Owner' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Q3 review deck is ready — 5 items await your approval.',    time: '09:14' },
      { id: 'm2', from: 'user',  text: 'Send me the priority items first.',                          time: '09:15' },
      { id: 'm3', from: 'agent', text: 'Fastwork #8 is highest priority — Acme Corp deadline today.', time: '09:15' },
    ],
  },
  {
    id: 'hermes',
    name: 'Hermes',
    role: 'Orchestrator Agent',
    roomId: 'hermes-ops',
    status: 'busy',
    initials: 'HM',
    accentColor: '#06b6d4',
    currentTask: 'Routing 14 tasks across 6 agents',
    queue: 14,
    risk: 'medium',
    tools: ['All Agents', 'Telegram', 'Brain Memory'],
    tasks: [
      { id: 't1', label: 'Route DataClaw scrape → vault export',    status: 'in-progress', assignee: 'Hermes' },
      { id: 't2', label: 'Compile weekly agent performance digest', status: 'pending',     assignee: 'Hermes' },
      { id: 't3', label: 'Escalate Fastwork Acme Corp blockage',    status: 'blocked',     assignee: 'Hermes' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Currently routing 14 tasks. Fastwork Acme Corp is blocked — client silent 48h.', time: '08:50' },
      { id: 'm2', from: 'user',  text: 'Send escalation via Telegram now.',                                              time: '08:52' },
      { id: 'm3', from: 'agent', text: 'Telegram escalation sent to Fastwork team. Awaiting reply.',                     time: '08:53' },
    ],
  },
  {
    id: 'codex',
    name: 'Codex',
    role: 'Code Build Agent',
    roomId: 'codex-build',
    status: 'active',
    initials: 'CX',
    accentColor: '#22c55e',
    currentTask: 'Auth module refactor — 60% complete',
    queue: 5,
    risk: 'low',
    tools: ['VS Code', 'GitHub', 'Terminal'],
    tasks: [
      { id: 't1', label: 'Refactor auth module (JWT + refresh tokens)', status: 'in-progress', assignee: 'Codex' },
      { id: 't2', label: 'Write unit + integration tests for API v2',   status: 'pending',     assignee: 'Codex' },
      { id: 't3', label: 'Deploy v2.4.1 staging → production',          status: 'done',        assignee: 'Codex' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Auth refactor at 60%. JWT implementation done, refresh tokens in progress.', time: '09:00' },
      { id: 'm2', from: 'user',  text: 'Run full test suite before pushing to staging.',                           time: '09:01' },
      { id: 'm3', from: 'agent', text: 'Test suite running — 142/180 tests passing. ETA clean: ~90 min.',          time: '09:02' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    role: 'Research Agent',
    roomId: 'gemini-research',
    status: 'active',
    initials: 'GM',
    accentColor: '#a855f7',
    currentTask: 'SaaS market + AI agent competitor deep dive',
    queue: 8,
    risk: 'low',
    tools: ['Google Search', 'Obsidian', 'Brain Memory'],
    tasks: [
      { id: 't1', label: 'SaaS tools competitor matrix (14 companies)', status: 'in-progress', assignee: 'Gemini' },
      { id: 't2', label: 'AI agent market trends 2026 — summary done', status: 'done',       assignee: 'Gemini' },
      { id: 't3', label: 'Draft weekly intelligence report for Owner', status: 'pending',    assignee: 'Gemini' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Found 14 competitor product updates in 48h — 3 are high signal.', time: '09:05' },
      { id: 'm2', from: 'user',  text: 'Flag the high-signal ones and save to Obsidian.',                 time: '09:06' },
      { id: 'm3', from: 'agent', text: 'Saved to /HERMES-BRAIN/intel/2026-06. Flagged: Lindy, dust.tt, n8n.', time: '09:07' },
    ],
  },
  {
    id: 'dataclaw',
    name: 'DataClaw',
    role: 'Intelligence Lab',
    roomId: 'dataclaw-lab',
    status: 'busy',
    initials: 'DC',
    accentColor: '#3b82f6',
    currentTask: 'Scraping Lazada + Shopee — 400 items/min',
    queue: 22,
    risk: 'medium',
    tools: ['Playwright', 'Python', 'Redis'],
    tasks: [
      { id: 't1', label: 'Scrape Lazada + Shopee product listings (22 jobs)', status: 'in-progress', assignee: 'DataClaw' },
      { id: 't2', label: 'Signal deduplication + quality scoring',            status: 'pending',     assignee: 'DataClaw' },
      { id: 't3', label: 'Export cleaned dataset to DataClaw vault (4.2 TB)', status: 'pending',     assignee: 'DataClaw' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: '22 scraping jobs active. Processing 400 items/min. Vault at 4.2 TB.', time: '08:40' },
      { id: 'm2', from: 'user',  text: 'Alert me via Telegram when export is complete.',                     time: '08:42' },
      { id: 'm3', from: 'agent', text: 'Telegram alert configured. ETA export complete: ~3 hours.',           time: '08:43' },
    ],
  },
  {
    id: 'fastwork',
    name: 'Fastwork Team',
    role: 'Project Delivery',
    roomId: 'fastwork-delivery',
    status: 'review',
    initials: 'FW',
    accentColor: '#f59e0b',
    currentTask: 'BLOCKED: Acme Corp awaiting client reply (48h)',
    queue: 1,
    risk: 'high',
    tools: ['Fastwork', 'Notion', 'Figma'],
    tasks: [
      { id: 't1', label: 'Submit Acme Corp deliverable sprint #3',  status: 'blocked',  assignee: 'Fastwork' },
      { id: 't2', label: 'Process client revision feedback (round 3)', status: 'pending', assignee: 'Fastwork' },
      { id: 't3', label: 'Issue invoice ฿34,500 upon approval',     status: 'pending', assignee: 'Fastwork' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Acme Corp client unresponsive 48h. Sprint #3 deliverable blocked. Revenue at risk.', time: '09:10' },
      { id: 'm2', from: 'user',  text: 'Escalate via Telegram immediately. CC me.',                                          time: '09:11' },
      { id: 'm3', from: 'agent', text: 'Escalation sent. Hermes routing follow-up. If no reply by 15:00, flag as high risk.',  time: '09:12' },
    ],
  },
  {
    id: 'client',
    name: 'Client Review',
    role: 'Client Interface',
    roomId: 'client-review',
    status: 'idle',
    initials: 'CR',
    accentColor: '#ec4899',
    currentTask: 'Meeting at 14:00',
    queue: 0,
    risk: 'low',
    tools: ['Zoom', 'Google Drive', 'Fastwork'],
    tasks: [
      { id: 't1', label: 'Prepare Acme Corp demo',    status: 'done',    assignee: 'Client' },
      { id: 't2', label: '14:00 client review call',  status: 'pending', assignee: 'Client' },
      { id: 't3', label: 'Collect post-call feedback', status: 'pending', assignee: 'Client' },
    ],
    messages: [
      { id: 'm1', from: 'agent', text: 'Meeting set for 14:00. Demo ready.', time: '09:00' },
      { id: 'm2', from: 'user',  text: 'Who will present?',                  time: '09:01' },
      { id: 'm3', from: 'agent', text: 'You + Fastwork team. I handle slides.', time: '09:01' },
    ],
  },
];

// ─── Rooms ─────────────────────────────────────────────────────────────────

export const dashboardRooms: DashboardRoom[] = [
  {
    id: 'executive',
    name: 'Owner / Executive',
    shortName: 'EXEC',
    agentIds: ['owner'],
    bgColor: '#071524',
    accent: '#0ea5e9',
    gridArea: '1 / 2 / 2 / 4',
    tooltip: 'Strategic command & decision making',
    icon: '👑',
    desks: 1,
  },
  {
    id: 'hermes-ops',
    name: 'Hermes Ops',
    shortName: 'HERMES',
    agentIds: ['hermes'],
    bgColor: '#051a1a',
    accent: '#06b6d4',
    gridArea: '2 / 1 / 3 / 3',
    tooltip: 'AI orchestrator & task routing',
    icon: '🧠',
    desks: 3,
  },
  {
    id: 'codex-build',
    name: 'Codex Build',
    shortName: 'CODEX',
    agentIds: ['codex'],
    bgColor: '#041a08',
    accent: '#22c55e',
    gridArea: '2 / 3 / 3 / 5',
    tooltip: 'Code generation & deployment',
    icon: '⌨️',
    desks: 2,
  },
  {
    id: 'gemini-research',
    name: 'Gemini Research',
    shortName: 'GEMINI',
    agentIds: ['gemini'],
    bgColor: '#100520',
    accent: '#a855f7',
    gridArea: '3 / 1 / 4 / 3',
    tooltip: 'Market research & intelligence',
    icon: '🔭',
    desks: 2,
  },
  {
    id: 'dataclaw-lab',
    name: 'DataClaw Lab',
    shortName: 'DATACLAW',
    agentIds: ['dataclaw'],
    bgColor: '#050e28',
    accent: '#3b82f6',
    gridArea: '3 / 3 / 4 / 5',
    tooltip: 'Data scraping & signal processing',
    icon: '📡',
    desks: 3,
  },
  {
    id: 'fastwork-delivery',
    name: 'Fastwork Delivery',
    shortName: 'FASTWORK',
    agentIds: ['fastwork'],
    bgColor: '#1a1200',
    accent: '#f59e0b',
    gridArea: '4 / 1 / 5 / 3',
    tooltip: 'Client project delivery & proposals',
    icon: '📦',
    desks: 2,
  },
  {
    id: 'client-review',
    name: 'Client Review',
    shortName: 'CLIENT',
    agentIds: ['client'],
    bgColor: '#1a0510',
    accent: '#ec4899',
    gridArea: '4 / 3 / 5 / 5',
    tooltip: 'Client meeting & presentation room',
    icon: '🤝',
    desks: 1,
  },
];

// ─── Sidebar section mock data ──────────────────────────────────────────────

export const workflowItems: WorkflowItem[] = [
  // ── Blocked ────────────────────────────────────────────────────────────────
  { id: 'w1', title: 'Acme Corp Fastwork proposal #8 approval', status: 'blocked',     assignee: 'Owner',    priority: 'high',   due: 'Today'  },
  { id: 'w2', title: 'Facebook Ads reconnect (OAuth expired)',   status: 'blocked',     assignee: 'Settings', priority: 'medium', due: 'Jun 6'  },
  // ── In Progress ────────────────────────────────────────────────────────────
  { id: 'w3', title: 'DataClaw: Lazada + Shopee signal scrape', status: 'in-progress', assignee: 'DataClaw', priority: 'high',   due: 'Today'  },
  { id: 'w4', title: 'Codex: Auth module refactor (60% done)',  status: 'in-progress', assignee: 'Codex',    priority: 'high',   due: 'Today'  },
  { id: 'w5', title: 'Gemini: SaaS competitor analysis',       status: 'in-progress', assignee: 'Gemini',   priority: 'medium', due: 'Jun 6'  },
  { id: 'w6', title: 'Hermes: Route 14 cross-agent tasks',     status: 'in-progress', assignee: 'Hermes',   priority: 'high',   due: 'Today'  },
  // ── Pending ────────────────────────────────────────────────────────────────
  { id: 'w7', title: 'Investment DCA order review (BTC + ETF)', status: 'pending',     assignee: 'Owner',    priority: 'medium', due: 'Jun 8'  },
  { id: 'w8', title: 'Acme Corp invoice ฿34,500 processing',   status: 'pending',     assignee: 'Fastwork', priority: 'high',   due: 'Jun 7'  },
  { id: 'w9', title: 'Hermes: Weekly agent log summary',       status: 'pending',     assignee: 'Hermes',   priority: 'low',    due: 'Jun 7'  },
  { id: 'w10', title: 'Deploy v2.4.1 to production',           status: 'pending',     assignee: 'Codex',    priority: 'medium', due: 'Jun 6'  },
  // ── Done ──────────────────────────────────────────────────────────────────
  { id: 'w11', title: 'Client meeting prep (14:00 Acme Corp)', status: 'done',        assignee: 'Client',   priority: 'high',   due: 'Today'  },
  { id: 'w12', title: 'Codex: Deploy v2.4.1 to staging',       status: 'done',        assignee: 'Codex',    priority: 'medium', due: 'Jun 5'  },
  { id: 'w13', title: 'Gemini: AI market trends summary',      status: 'done',        assignee: 'Gemini',   priority: 'low',    due: 'Jun 4'  },
];

export const sopItems: SOPItem[] = [
  { id: 's1', title: 'Hermes Agent Briefing Protocol',      category: 'Agent Ops',    lastUpdated: '2026-06-01', version: 'v3.2' },
  { id: 's2', title: 'DataClaw Scraping Runbook',           category: 'DataClaw',     lastUpdated: '2026-05-28', version: 'v2.1' },
  { id: 's3', title: 'Client Delivery Checklist',           category: 'Fastwork',     lastUpdated: '2026-06-03', version: 'v1.8' },
  { id: 's4', title: 'Codex Code Review Standards',         category: 'Engineering',  lastUpdated: '2026-05-20', version: 'v4.0' },
  { id: 's5', title: 'Investment Risk Assessment Template', category: 'Investment',   lastUpdated: '2026-06-02', version: 'v1.3' },
  { id: 's6', title: 'Weekly Executive Review Format',      category: 'Executive',    lastUpdated: '2026-06-04', version: 'v2.0' },
  { id: 's7', title: 'Brain Memory Save Protocol',          category: 'Agent Ops',    lastUpdated: '2026-05-15', version: 'v1.1' },
];

export const weeklyReportSections: ReportSection[] = [
  { id: 'r1', title: 'Revenue Generated',   value: '฿124,500',  trend: '+18% MoM',   color: '#22c55e' },
  { id: 'r2', title: 'Projects Delivered',  value: '3 / 5',     trend: 'On track',   color: '#06b6d4' },
  { id: 'r3', title: 'Agent Uptime',        value: '99.4%',     trend: 'Stable',     color: '#a855f7' },
  { id: 'r4', title: 'Data Assets Created', value: '14 TB',     trend: '+8 datasets', color: '#3b82f6' },
  { id: 'r5', title: 'Approval Backlog',    value: '5 items',   trend: '↑ from 2',   color: '#f59e0b' },
  { id: 'r6', title: 'Investment ROI',      value: '+14.2%',    trend: 'Portfolio ↑', color: '#22c55e' },
];

// ─── Quick lookup maps ──────────────────────────────────────────────────────

export const agentsById = Object.fromEntries(dashboardAgents.map(a => [a.id, a]));
export const roomsById  = Object.fromEntries(dashboardRooms.map(r => [r.id, r]));
