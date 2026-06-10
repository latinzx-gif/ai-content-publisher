# HEAD OFFICE — Demo Guide v1.6

> **Internal use only. Do not share externally.**
> Last updated: 2026-06-05

---

## 1. How to Run Locally

```bash
cd HEAD-OFFICE/head-office-app
npm install          # if not already done
npm run dev          # starts on http://localhost:3000
```

- Default view: **Dashboard** (isometric command center)
- Toggle to **3D Scene** via the button in the top-right corner
- All data is mock — no backend, no network calls

---

## 2. Dashboard Sections

### Left Sidebar Navigation

| Icon | Section | What it shows |
|---|---|---|
| 🏢 | **Office Overview** | Agent Live Map (default) |
| 💬 | **Chat Center** | Last message thread per agent |
| 🤖 | **Agents** | Directory of all 7 agents: role, queue, status |
| 🔀 | **Workflow Board** | 4-column Kanban: Blocked / In Progress / Pending / Done |
| 📖 | **Skills / SOP** | SOP library grouped by category + version |
| 📊 | **Reports** | Weekly Executive Review: 6 KPI tiles + exec notes |
| ⚙️ | **Settings** | Integration status + Config buttons |

### Top Integration Bar

Shows live status of 8 integrations (Codex, Hermes Brain, Obsidian, Drive, Gmail, Google Ads, Facebook, Telegram). Color-coded: green = live, yellow = warning, red = offline.

### Business KPI Row

Six primary business metrics displayed as cards:

| KPI | Meaning |
|---|---|
| 💰 Revenue Pipeline | Current total project revenue pipeline |
| 📦 Active Deliveries | Open client deliveries (with risk flag) |
| 📡 DataClaw Assets | Total data in DataClaw vault |
| 📈 Investment Risk | Portfolio risk level summary |
| ⏳ Pending Approvals | Items awaiting owner approval |
| 🤖 Agent Queue | Total tasks queued across all 7 agents |

> Click **⬇ SYS** button to reveal system-level metrics (audit events, secrets, release version).

### Agent Live Map

An isometric CSS floor-plan view of the office. Each room tile shows:
- **Room name + icon** (top left)
- **Agent status badge** (top right): Active / Busy / Review / Idle
- **Agent avatar** with initials + ping ring for active agents
- **Current task** (bottom fade)
- **Desk/console elements** (decorative, themed per accent color)

**Interactions:**
- **Hover a room** → tooltip shows room name and purpose
- **Click a room** → selects the agent, updates the Right Chat Panel

### Right Chat Panel

Always visible on the right side (320px wide). Shows:
- **Agent switcher strip** (top): click to switch between any of the 7 agents
- **Selected agent card**: name, role, status pill, queue, risk level, current task, tools
- **Task list**: all 3 tasks per agent with status icons (✓ done, ◉ active, ○ pending, ✕ blocked)
- **Chat thread**: 3 seed messages per agent + your typed messages
- **Command input**: press Enter to send (Shift+Enter for newline)
- **Action buttons**: Ask Hermes / Ask Codex / Ask Gemini / Save to Brain / Next Task

---

## 3. Demo Talking Points

### Business Narrative
> "This is the Head Office Command Center — a single dashboard that gives me a real-time view of every AI agent, project, and business metric across the company."

### Agent Live Map
> "Each room on this map is a department. I can see at a glance which agents are active, busy, or blocked. When I click on the DataClaw lab, I can see it's processing 22 scraping tasks right now."

### Hermes Orchestration
> "Hermes is our orchestrator — he routes work between all the other agents. If something is blocked, Hermes escalates it automatically. Right now he's managing 14 active tasks."

### Fastwork Delivery Risk
> "Fastwork is showing 'Review' status and HIGH risk — the Acme Corp delivery is blocked waiting for a client response. I can message the team directly from here."

### DataClaw Lab
> "DataClaw is our intelligence engine. It's currently running 22 scraping jobs and has 4.2 TB of market data across 156 live datasets."

### Business KPIs
> "The top row always shows me the business metrics that matter: pipeline value, active deliveries, data assets, investment risk, and pending approvals — all in one row."

### Workflow Board
> "The Workflow Board shows all tasks across agents in a Kanban view. I can see what's blocked, in progress, pending, and done — without opening any other tool."

---

## 4. Agents Reference

| Agent | Role | Status | Key Tools |
|---|---|---|---|
| **P. Jakari** | Executive Director | Active | Obsidian, Drive, Telegram |
| **Hermes** | Orchestrator | Busy | All Agents, Brain Memory |
| **Codex** | Code Build | Active | VS Code, GitHub, Terminal |
| **Gemini** | Research | Active | Google Search, Obsidian |
| **DataClaw** | Intelligence Lab | Busy | Playwright, Python, Redis |
| **Fastwork Team** | Project Delivery | Review | Fastwork, Notion, Figma |
| **Client Review** | Client Interface | Idle | Zoom, Drive, Fastwork |

---

## 5. Known Limitations (V1.6)

| # | Limitation | Impact |
|---|---|---|
| 1 | **All data is mock** — no Supabase, no live integrations | No real-time updates |
| 2 | **Chat responses are templated** — the agent reply just echoes your input | Not a real AI chat |
| 3 | **Action buttons (Ask Hermes / Codex / Gemini)** are visual only — no routing logic | Clicks do nothing yet |
| 4 | **SOP documents** are stubs — clicking them does not open a document | Navigation only |
| 5 | **No mobile layout** — dashboard is desktop-first (min ~1200px recommended) | Mobile unusable |
| 6 | **3D Scene** is preserved but not connected to dashboard state | Separate context |
| 7 | **Integration Config buttons** are visual only — no settings logic | Display only |

---

## 6. Next Phase Recommendations

### Phase 2 — Live Data Layer
- Connect KPI cards to real data: Fastwork API, Google Ads API, DataClaw vault metrics
- Replace mock messages with Telegram bot relay + agent event stream
- Add Supabase for persistent agent task state and approvals queue

### Phase 3 — Real Agent Commands
- Wire "Ask Hermes / Codex / Gemini" buttons to actual agent endpoints
- Add real-time WebSocket updates for agent status and task progress
- Implement approval workflow: Owner clicks "Approve" → triggers agent action

### Phase 4 — Expanded Views
- Isometric map: animate agent movement between rooms during task handoffs
- Workflow Board: drag-and-drop cards between columns
- Reports: pull live weekly summaries from Hermes Brain memory
- Mobile-first responsive layout for on-the-go access

### Phase 5 — Multi-user
- Add team member accounts with role-based access (Owner / Manager / Observer)
- Real-time cursors and collaborative annotations on the map
- Audit log with full event trail

---

*Built with Next.js 16, React Three Fiber, Zustand, TailwindCSS, lucide-react.*
*Architecture: head-office-app / src/components/dashboard/*
