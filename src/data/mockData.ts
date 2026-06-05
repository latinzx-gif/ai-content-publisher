import { RoomData } from '../types/office';

export const officeRooms: Record<string, RoomData> = {
  lobby: {
    id: 'lobby',
    name: 'Lobby',
    description: 'Main entrance and overview',
    position: [0, 0, 0],
    objects: [
      {
        id: 'lobby-hq',
        name: 'Central HQ Hub',
        description: 'Core command center terminal',
        type: 'table',
        position: [0, 0.5, 0],
        color: '#0ea5e9',
        data: { activeAgents: 12, openTasks: 45, systemHealth: '99.9%' }
      },
      {
        id: 'lobby-screen',
        name: 'Today Command',
        description: 'Daily operational overview',
        type: 'screen',
        position: [-3, 2, -4],
        color: '#3b82f6',
        data: { updates: ['Q3 Planning finalized', 'New Hermes model deployed'] }
      },
      {
        id: 'lobby-status',
        name: 'System Status',
        description: 'Global operations metrics',
        type: 'panel',
        position: [3, 1.5, -4],
        color: '#10b981',
        data: { cpu: '45%', memory: '2.4TB', network: 'Stable' }
      }
    ]
  },
  executive: {
    id: 'executive',
    name: 'Executive Command Room',
    description: 'High-level strategy and metrics',
    position: [0, 0, -15],
    objects: [
      {
        id: 'exec-dash',
        name: 'Wall Dashboard',
        description: 'Executive overview panels',
        type: 'dashboard',
        position: [0, 2, -4],
        color: '#06b6d4',
        data: { overallHealth: 'Excellent', sprintProgress: '85%' }
      },
      {
        id: 'exec-table',
        name: 'Decision Table',
        description: 'Pending executive approvals',
        type: 'table',
        position: [0, 0.5, 0],
        color: '#eab308',
        data: { pendingApprovals: 3, lastMeeting: '2 hours ago' }
      },
      {
        id: 'exec-rev',
        name: 'Revenue Screen',
        description: 'Real-time financial metrics',
        type: 'screen',
        position: [-3, 1.5, -3],
        color: '#22c55e',
        data: { mrr: '$124,500', target: '92%', burnRate: '$45,000' }
      },
      {
        id: 'exec-risk',
        name: 'Risk Screen',
        description: 'Identified strategic risks',
        type: 'screen',
        position: [3, 1.5, -3],
        color: '#ef4444',
        data: { high: 1, medium: 4, low: 12 }
      },
      {
        id: 'exec-review',
        name: 'Weekly Review',
        description: 'Current weekly notes',
        type: 'screen',
        position: [4, 1.5, 0],
        color: '#a855f7',
        data: { topic: 'Q3 Goal alignment', notes: 5 }
      }
    ]
  },
  fastwork: {
    id: 'fastwork',
    name: 'Fastwork Department',
    description: 'Client project delivery',
    position: [-15, 0, 0],
    objects: [
      {
        id: 'fw-wall',
        name: 'Project Board Wall',
        description: 'Active client engagements',
        type: 'board',
        position: [0, 1.5, -4],
        color: '#22c55e',
        data: { activeProjects: 8, delayed: 1 }
      },
      {
        id: 'fw-desk',
        name: 'Proposal Desk',
        description: 'Pending client proposals',
        type: 'desk',
        position: [-2, 0.5, 0],
        color: '#eab308',
        data: { proposalsOut: 5, winRate: '68%' }
      },
      {
        id: 'fw-shelf',
        name: 'SOP Shelf',
        description: 'Standard operating procedures',
        type: 'shelf',
        position: [-4, 1.5, -2],
        color: '#06b6d4',
        data: { sops: 42, recentUpdates: 3 }
      },
      {
        id: 'fw-tracker',
        name: 'Delivery Tracker',
        description: 'Sprint delivery timelines',
        type: 'board',
        position: [3, 1.5, -3],
        color: '#3b82f6',
        data: { currentSprint: 12, points: 145 }
      }
    ]
  },
  dataclaw: {
    id: 'dataclaw',
    name: 'DataClaw Intelligence Lab',
    description: 'Data engineering and scraping',
    position: [15, 0, 0],
    objects: [
      {
        id: 'dc-radar',
        name: 'Signal Radar',
        description: 'Incoming data streams',
        type: 'ring',
        position: [0, 0.5, 0],
        color: '#06b6d4',
        data: { streamsActive: 24, alerts: 2 }
      },
      {
        id: 'dc-vault',
        name: 'Dataset Vault',
        description: 'Stored data assets',
        type: 'vault',
        position: [-3, 1, -3],
        color: '#10b981',
        data: { size: '4.2 TB', datasets: 156 }
      },
      {
        id: 'dc-map',
        name: 'Market Map',
        description: 'Global competitor tracking',
        type: 'map',
        position: [3, 1.5, -2],
        color: '#3b82f6',
        data: { entitiesTracked: 1400, changes: 45 }
      },
      {
        id: 'dc-hologram',
        name: 'Insight Report',
        description: 'Daily intelligence brief',
        type: 'hologram',
        position: [0, 2, -4],
        color: '#a855f7',
        data: { topTrend: 'AI Agents', confidence: '94%' }
      }
    ]
  },
  investment: {
    id: 'investment',
    name: 'Investment War Room',
    description: 'Portfolio and market analysis',
    position: [15, 0, -15],
    objects: [
      {
        id: 'inv-monitor',
        name: 'Portfolio Monitor',
        description: 'Overall portfolio performance',
        type: 'board',
        position: [0, 2, -4],
        color: '#22c55e',
        data: { roi: '+14.2%', aum: '$2.4M' }
      },
      {
        id: 'inv-control',
        name: 'Risk Control',
        description: 'Exposure and hedges',
        type: 'panel',
        position: [-3, 1.5, -2],
        color: '#ef4444',
        data: { exposure: '65%', hedgeRatio: '1.2' }
      },
      {
        id: 'inv-grid',
        name: 'DCA Planning Table',
        description: 'Dollar-cost averaging grid',
        type: 'table',
        position: [0, 0.5, 0],
        color: '#06b6d4',
        data: { activeOrders: 14, nextBuy: 'BTC at $64K' }
      },
      {
        id: 'inv-desk',
        name: 'Trading Journal',
        description: 'Log of recent trades',
        type: 'desk',
        position: [3, 0.5, -2],
        color: '#eab308',
        data: { winRate: '62%', lastTrade: 'ETH Long' }
      }
    ]
  },
  agents: {
    id: 'agents',
    name: 'AI Agent Operations',
    description: 'Autonomous workforce management',
    position: [-15, 0, -15],
    objects: [
      {
        id: 'ag-hermes',
        name: 'Hermes Console',
        description: 'Orchestrator agent status',
        type: 'console',
        position: [0, 1, -2],
        color: '#3b82f6',
        data: { status: 'Idle', uptime: '99.99%', tasksProcessed: 1405 }
      },
      {
        id: 'ag-codex',
        name: 'Codex Terminal',
        description: 'Code agent status',
        type: 'console',
        position: [-3, 1, -3],
        color: '#10b981',
        data: { currentTask: 'Refactoring auth', linesWritten: 450 }
      },
      {
        id: 'ag-gemini',
        name: 'Gemini Terminal',
        description: 'Research agent status',
        type: 'console',
        position: [3, 1, -3],
        color: '#06b6d4',
        data: { currentTask: 'Market analysis', sourcesAnalyzed: 14 }
      },
      {
        id: 'ag-qa',
        name: 'QA Monitor',
        description: 'Automated testing status',
        type: 'screen',
        position: [-4, 2, -1],
        color: '#ef4444',
        data: { testsPassed: 402, failures: 1 }
      },
      {
        id: 'ag-queue',
        name: 'Approval Wall',
        description: 'Human-in-the-loop pending items',
        type: 'board',
        position: [0, 2, -5],
        color: '#eab308',
        data: { pending: 5, urgent: 1 }
      }
    ]
  },
  client: {
    id: 'client',
    name: 'Client Meeting Room',
    description: 'Virtual meeting space',
    position: [0, 0, 15],
    objects: [
      {
        id: 'cl-table',
        name: 'Meeting Table',
        description: 'Discussion area',
        type: 'table',
        position: [0, 0.5, 0],
        color: '#a855f7',
        data: { attendees: 4, feedbackItems: 2 }
      },
      {
        id: 'cl-board',
        name: 'Requirement Board',
        description: 'Current presentation',
        type: 'board',
        position: [0, 1.5, -4],
        color: '#0ea5e9',
        data: { currentClient: 'Acme Corp', nextMeeting: '14:00' }
      },
      {
        id: 'cl-review',
        name: 'Review Screen',
        description: 'Designs awaiting approval',
        type: 'screen',
        position: [-3, 1.5, -2],
        color: '#eab308',
        data: { screens: 5, approved: 3 }
      },
      {
        id: 'cl-handoff',
        name: 'Handoff Screen',
        description: 'Delivery package status',
        type: 'screen',
        position: [3, 1.5, -2],
        color: '#22c55e',
        data: { ready: true, assets: 42 }
      }
    ]
  }
};

export const roomList = Object.values(officeRooms);
