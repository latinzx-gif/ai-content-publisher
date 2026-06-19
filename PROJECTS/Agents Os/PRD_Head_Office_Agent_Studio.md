# PRD.md — Head Office Agent Studio

## 0. Document Control

| Field | Value |
|---|---|
| Product Name | Head Office Agent Studio |
| Product Type | Native macOS Desktop Application |
| Owner | Jakarin / Internal Use |
| Version | V1.0 |
| Status | Draft for Project Start |
| Target Platform | macOS |
| Commercial Intent | Internal tool, not for sale |
| Primary Use Case | AI Agent Team Control Room for project delivery |
| Last Updated | 2026-06-17 |

---

## 1. Product Summary

Head Office Agent Studio is a native macOS application for managing AI agent teams to support project delivery. The app allows the user to create a project, import a PRD, analyze scope, recommend or manually select agents, assign skills and runtimes, generate milestones/tasks via Taskmaster, run tasks through selected AI runtimes or coding agents, review/audit outputs, handle human requests, prepare demos, and close projects with handoff documentation.

This product is designed for solo founder/internal use, not for commercial SaaS distribution.

---

## 2. Core Goal

Build a native macOS application that acts as an AI project control room.

The app should support this full workflow:

```text
Create Project
→ Import PRD
→ Analyze PRD
→ Recommend / Select Agent Teams
→ Assign Skills + Runtime
→ Generate Milestones & Tasks via Taskmaster
→ Team Lead Assigns Task
→ Run Task
→ Review
→ Audit
→ Fix / Loop
→ Human Request Gate
→ Summary
→ Demo
→ Handoff
→ Close Project
```

---

## 3. Product Principles

### 3.1 Internal-first
This app is for personal/internal use. Do not prioritize commercial features such as billing, user accounts, marketplace, cloud sync, or multi-tenant permissions.

### 3.2 Native macOS first
The product must feel like a real Mac application, not a terminal script or browser-based web app.

### 3.3 Human-controlled automation
Agents can execute tasks, but critical decisions must pass through human review or approval.

### 3.4 File-based transparency
Every major project state should be saved as readable local files such as Markdown/YAML/JSON so work can be inspected, backed up, and reused outside the app.

### 3.5 Scope control
Agents must not freely edit or execute outside the allowed project scope. Each task should define allowed files, forbidden files, expected output, and acceptance criteria.

---

## 4. Target User

### Primary User
Solo founder / AI operator managing multiple client and internal projects.

### User Context
The user works across:
- Fastwork client delivery
- DataClaw research/intelligence assets
- ERP / HR / Payroll / Inventory systems
- AI automation and content systems
- Software/project documentation

### User Needs
- Central control room for AI agents
- Reusable agent teams and skills
- Clear task execution loop
- Local project memory
- Runtime/model selection per agent
- Demo and handoff readiness tracking
- Reduced terminal complexity

---

## 5. Out of Scope for V1

The following are not required for V1:

```text
- SaaS login system
- Multi-user collaboration
- Billing/subscription
- Public marketplace for agents/skills
- Cloud sync
- Mobile app
- Fully autonomous coding without approval
- Complex permission system
- Real-time multiplayer
- Full browser automation
- Public API
```

---

## 6. Product Scope V1

### Required Modules

```text
1. Project Dashboard
2. Create Project
3. PRD Import
4. PRD Analyzer
5. Agent Library
6. Skill Library
7. Team Builder
8. Runtime Manager
9. Taskmaster Board
10. Task Runner
11. Review Board
12. Audit Board
13. Human Request Inbox
14. Demo Center
15. Handoff / Close Project
16. Settings
```

---

## 7. Main User Flow

### 7.1 Project Creation Flow

```text
User opens app
→ Clicks "Create Project"
→ Enters project details
→ Selects local folder
→ App creates project structure
→ Project appears in dashboard
```

### Required Inputs
- Project name
- Project type
- Client/internal label
- Deadline
- Output goal
- Local folder path
- Priority

### Output
Local project folder:

```text
~/AgentStudio/Projects/{project-slug}/
├── 00_Input/
├── 01_PRD/
├── 02_PRD_Analysis/
├── 03_Taskmaster/
├── 04_Teams/
├── 05_Current_Task/
├── 06_Runs/
├── 07_Reviews/
├── 08_Audits/
├── 09_Requests/
├── 10_Demo/
├── 11_Handoff/
└── 12_Archive/
```

---

## 8. PRD Import Flow

### 8.1 Supported PRD Input Types

```text
- PDF
- DOCX
- Markdown
- TXT
- HTML
- Pasted text
```

### 8.2 PRD Import Steps

```text
Select Project
→ Click "Import PRD"
→ Choose file using macOS file picker
→ App copies file to project folder
→ App normalizes content to Markdown
→ App generates PRD analysis
```

### 8.3 Output Files

```text
01_PRD/
├── PRD_ORIGINAL.{ext}
├── PRD_NORMALIZED.md
└── PRD_IMPORT_LOG.md

02_PRD_Analysis/
├── PRD_ANALYSIS.md
├── MISSING_INFO.md
├── SCOPE_SUMMARY.md
├── MODULE_MAP.md
├── ROLE_MAP.md
└── RISK_REPORT.md
```

---

## 9. PRD Analyzer Requirements

### 9.1 Analyzer Must Extract

```text
- Project summary
- Business goal
- User roles
- Core modules
- Required pages/screens
- Required database entities
- Required integrations
- Required APIs/keys
- Deliverables
- Timeline assumptions
- Dependencies
- Missing information
- Risks
- Suggested agents
- Suggested teams
```

### 9.2 Missing Information Detection

The system must detect unknowns such as:

```text
- Missing API key
- Missing LINE Channel Secret
- Missing Supabase project details
- Missing design/logo asset
- Missing business rule
- Missing payroll formula
- Missing sample data
- Missing approval rule
- Missing report format
- Missing deployment target
```

### 9.3 PRD Analyzer Output Format

```markdown
# PRD Analysis

## Project Summary
...

## Scope
...

## Out of Scope
...

## Modules
...

## User Roles
...

## Required Screens
...

## Required Database
...

## Required Integrations
...

## Missing Information
...

## Risks
...

## Suggested Teams
...
```

---

## 10. Agent System

### 10.1 Agent Definition

An agent is a reusable role-based AI worker with:

```text
- Name
- Role
- Goal
- Runtime
- Model
- Skills
- Tools permission
- Memory scope
- Output contract
- Safety rules
```

### 10.2 Default Agents

V1 should include these default agents:

```text
1. PM Agent
2. Product Analyst Agent
3. UX / Sitemap Agent
4. Backend Agent
5. Frontend Agent
6. Database Architect Agent
7. Integration Agent
8. QA Agent
9. Audit Agent
10. Documentation Agent
11. Demo Agent
12. Handoff Agent
```

### 10.3 Agent File Format

Agents should be stored as YAML files.

Example:

```yaml
id: backend-agent
name: Backend Agent
role: Backend Developer
description: Designs and implements backend logic, APIs, database interactions, and integration flows.
runtime: codex-cli
model: default
skills:
  - api-design
  - supabase-schema
  - auth-flow
  - error-handling
tools:
  file_read: true
  file_write: true
  terminal: true
  web: false
memory:
  scope: project
permissions:
  require_human_approval_for:
    - deleting_files
    - modifying_env
    - running_migration
    - deployment
output_contract:
  format: markdown
  required_files:
    - TASK_RESULT.md
    - CHANGED_FILES.md
    - RISK_NOTES.md
```

---

## 11. Skill System

### 11.1 Skill Definition

A skill is a capability package attached to an agent.

A skill must include:

```text
- Name
- Type
- Instruction
- Workflow
- Checklist
- Output contract
- Required tools
```

### 11.2 Skill Types

```text
1. Prompt Skill
2. Tool Skill
3. Workflow Skill
4. Output Skill
5. Review Skill
6. Audit Skill
```

### 11.3 Default Skills

```text
- PRD Writer
- Scope Analyzer
- Task Breakdown
- Supabase Schema Designer
- RLS Policy Reviewer
- API Design
- Frontend Component Planner
- UX Flow Mapping
- QA Checklist
- Security Audit
- Demo Script Writer
- Handoff Document Writer
- Fastwork Proposal Writer
- DataClaw Research Scanner
- Inventory System Analyst
- HR Payroll Analyst
```

### 11.4 Skill File Format

```yaml
id: supabase-schema-designer
name: Supabase Schema Designer
type: technical
description: Designs Supabase/Postgres schema, relationships, indexes, and RLS considerations.
agent_roles:
  - Backend Agent
  - Database Architect Agent
capabilities:
  - design_tables
  - define_relationships
  - suggest_indexes
  - identify_rls_requirements
  - detect_schema_risks
workflow:
  - read_prd
  - identify_entities
  - map_relationships
  - propose_tables
  - propose_indexes
  - list_rls_policies
checklist:
  - tables_have_primary_keys
  - foreign_keys_defined
  - indexes_added_for_common_queries
  - sensitive_data_identified
  - rls_notes_included
output:
  format: markdown
  required_sections:
    - Schema Overview
    - Tables
    - Relationships
    - Indexes
    - RLS Notes
    - Risks
```

---

## 12. Team System

### 12.1 Team Definition

A team is a group of agents assigned to a project or milestone.

Each team has:
- Name
- Purpose
- Team lead
- Agents
- Workflow
- Review rules
- Runtime preferences

### 12.2 Default Team Templates

```text
1. HR Payroll Team
2. Inventory System Team
3. AI Content System Team
4. Research Report Team
5. Website Builder Team
6. Client Proposal Team
7. QA / Handoff Team
```

### 12.3 Team File Format

```yaml
id: hr-payroll-team
name: HR Payroll Builder Team
purpose: Build HR, attendance, leave, payroll, and approval systems.
leader: pm-agent
agents:
  - pm-agent
  - hr-payroll-analyst-agent
  - ux-agent
  - database-architect-agent
  - backend-agent
  - frontend-agent
  - qa-agent
  - documentation-agent
workflow:
  - analyze_prd
  - define_scope
  - generate_tasks
  - assign_tasks
  - run_task
  - review
  - audit
  - prepare_demo
approval:
  human_gate: true
runtime_preferences:
  planning: claude
  coding: codex-cli
  research: gemini
  local_draft: ollama
```

---

## 13. Runtime Manager

### 13.1 Runtime Definition

A runtime is an AI execution backend used by an agent.

### 13.2 Supported Runtime Types V1

```text
- Ollama local API
- LM Studio local API
- OpenAI-compatible API
- OpenAI API
- Claude API
- Gemini API
- Codex CLI bridge
- Claude Code CLI bridge
```

### 13.3 Runtime Configuration

Each runtime should include:

```text
- Runtime name
- Type
- Endpoint URL
- API key if required
- Default model
- Max context
- Cost mode
- Status
- Test connection action
```

### 13.4 Runtime Modes

```text
Local Mode:
- Uses Ollama / LM Studio / local endpoint
- Lower cost
- Lower quality for complex work

Cloud Mode:
- Uses OpenAI / Claude / Gemini
- Higher quality
- Requires API key
- Higher cost

Hybrid Mode:
- Local for drafts/simple tasks
- Cloud for planning/review/final output
- CLI agents for coding
```

---

## 14. Taskmaster Integration

### 14.1 Taskmaster Role

Taskmaster should only be used for milestone/task generation.

It should not be a persistent agent.

### 14.2 Taskmaster Flow

```text
PRD_NORMALIZED.md
→ Run Taskmaster
→ Generate milestones/tasks/dependencies/acceptance criteria
→ Team Lead selects task
```

### 14.3 Taskmaster Output Files

```text
03_Taskmaster/
├── MILESTONES.md
├── TASK_LIST.md
├── DEPENDENCY_MAP.md
├── PRIORITY_MAP.md
├── ACCEPTANCE_CRITERIA.md
└── TASKMASTER_LOG.md
```

### 14.4 Example Task Structure

```markdown
# TASK

Task ID: T2.1
Milestone: M2 Attendance Module
Title: Design Attendance Database Schema
Priority: High
Dependencies: T1.1 Project Setup

Description:
Design database schema for employee check-in/check-out with branch, GPS, timestamp, correction request, and approval status.

Acceptance Criteria:
- Supports check-in/check-out
- Supports branch_id
- Supports employee_id
- Supports GPS coordinates
- Supports correction request
- Includes audit timestamps
```

---

## 15. Team Lead Task Assignment

### 15.1 Team Lead Responsibility

The team lead agent must:

```text
- Read Taskmaster output
- Select next task
- Check dependencies
- Assign task to appropriate agent
- Define allowed files
- Define forbidden files
- Define expected output
- Define acceptance criteria
- Create CURRENT_TASK.md
```

### 15.2 CURRENT_TASK.md Format

```markdown
# CURRENT_TASK

Task ID: T2.1
Task Name: Design Attendance Database Schema

Project:
HR Payroll System

Assigned Team:
Backend Team

Assigned Agent:
Database Architect Agent

Objective:
Design database schema for attendance check-in/check-out.

Allowed Files:
- docs/database/
- supabase/migrations/

Forbidden Files:
- app/frontend/
- deployment/
- .env

Expected Output:
- attendance_schema.md
- migration_sql_draft.sql
- risk_notes.md

Acceptance Criteria:
- supports check-in/check-out
- supports branch
- supports employee
- supports GPS
- supports correction request
- includes created_at/updated_at
- includes RLS notes

Stop Conditions:
- Missing business rule
- Missing required API key
- Need human decision
```

---

## 16. Task Runner

### 16.1 Run Task Flow

```text
User clicks Run Task
→ App reads CURRENT_TASK.md
→ App selects assigned agent/runtime
→ App sends task instruction
→ Agent works
→ App captures output/log
→ App saves result files
→ Status moves to Review
```

### 16.2 Run Folder Structure

```text
06_Runs/
└── run-001/
    ├── CURRENT_TASK.md
    ├── AGENT_INPUT.md
    ├── AGENT_LOG.md
    ├── TASK_RESULT.md
    ├── CHANGED_FILES.md
    ├── ERROR_LOG.md
    └── RUN_METADATA.json
```

### 16.3 Run Status

```text
queued
running
completed
failed
blocked
cancelled
```

---

## 17. Review System

### 17.1 Review Purpose

Review checks whether the task was completed correctly according to the task objective and acceptance criteria.

### 17.2 Review Checklist

```text
- Task objective completed
- Acceptance criteria passed
- Output files created
- Scope not exceeded
- No unrelated files changed
- No forbidden files changed
- Risks documented
- Next step clear
```

### 17.3 Review Result Types

```text
PASS
NEED_FIX
BLOCKED
NEED_HUMAN_INPUT
```

### 17.4 Review Output Format

```markdown
# REVIEW_RESULT

Task ID:
Reviewer:
Status:

Summary:
...

Checks:
- [ ] Task objective completed
- [ ] Acceptance criteria passed
- [ ] Output files created
- [ ] No unrelated files changed
- [ ] No forbidden files changed
- [ ] Risks documented

Issues:
1. ...

Required Fix:
...

Next Action:
...
```

---

## 18. Audit System

### 18.1 Audit Purpose

Audit checks broader risks beyond task completion.

Audit focuses on:
- Security
- Architecture
- Data model risk
- Cost risk
- UX risk
- Regression risk
- Client demo readiness

### 18.2 Audit Result Types

```text
APPROVED
WARNING
CRITICAL
```

### 18.3 Audit Checklist

```text
- Security risk checked
- Data privacy risk checked
- Architecture consistency checked
- Runtime/cost risk checked
- UX consistency checked
- Regression risk checked
- Demo readiness impact checked
```

### 18.4 Audit Output Format

```markdown
# AUDIT_RESULT

Task ID:
Auditor:
Status:

Summary:
...

Risk Level:
Low / Medium / High

Findings:
1. ...

Required Action:
...

Can Proceed:
Yes / No
```

---

## 19. Loop System

### 19.1 Task Loop

```text
Run Task
→ Review
→ Audit
→ If Pass/Approved: Mark Done
→ If Need Fix: Create Fix Task
→ If Blocked: Create Human Request
→ Continue Next Task
```

### 19.2 Task Status

```text
todo
assigned
running
review
audit
need_fix
blocked
need_human_input
done
cancelled
```

### 19.3 Fix Task Format

```markdown
# FIX_TASK

Original Task ID:
Issue Source:
Review / Audit / Error

Problem:
...

Required Fix:
...

Assigned Agent:
...

Acceptance Criteria:
...
```

---

## 20. Human Request Gate

### 20.1 Purpose

Agents must not guess when required information is missing. The system should create a human request.

### 20.2 Human Request Triggers

```text
- Missing API key
- Missing access token
- Missing design file
- Missing business rule
- Missing approval decision
- Missing sample data
- Missing deployment permission
- Conflicting requirements
- Scope decision needed
- Cost decision needed
```

### 20.3 Human Request Status

```text
open
answered
resolved
cancelled
```

### 20.4 Human Request Output Format

```markdown
# HUMAN_REQUEST

Request ID:
Project:
Related Task:
Priority:
Blocking: Yes / No

Need:
...

Reason:
...

Impact if Missing:
...

Options:
1. ...
2. ...
3. ...

Recommended Option:
...

User Response:
...
```

### 20.5 Notification Rules

Notify the user when:
```text
- Task is blocked
- Human input is required
- Build/test failed
- Audit is critical
- Demo is ready
- Deadline risk detected
- Project is ready for handoff
```

---

## 21. Demo Center

### 21.1 Demo Readiness Checklist

```text
- App runs successfully
- Login works
- Main flows work
- Demo data exists
- Critical bugs fixed
- Error messages acceptable
- Known limitations documented
- Demo script prepared
- Client path prepared
```

### 21.2 Demo Output Files

```text
10_Demo/
├── DEMO_CHECKLIST.md
├── DEMO_SCRIPT.md
├── DEMO_DATA.md
├── KNOWN_LIMITATIONS.md
└── CLIENT_NOTES.md
```

### 21.3 Demo Status

```text
not_ready
preparing
ready
sent
revision_requested
```

---

## 22. Handoff / Close Project

### 22.1 Close Project Requirements

Before closing project:

```text
- All required tasks completed
- Critical audit issues resolved
- Demo delivered
- Handoff docs generated
- Known limitations documented
- Support scope documented
- Project archived
```

### 22.2 Handoff Files

```text
11_Handoff/
├── CLIENT_USER_GUIDE.md
├── ADMIN_GUIDE.md
├── SETUP_GUIDE.md
├── SUPPORT_SCOPE.md
├── CHANGELOG.md
├── FINAL_REPORT.md
└── CREDENTIAL_CHECKLIST.md
```

### 22.3 Project Close Status

```text
handoff_ready
closed
archived
```

---

## 23. macOS Application Requirements

### 23.1 Platform

```text
Native macOS application
Target: macOS 14+
Recommended framework: SwiftUI
Alternative: Tauri if faster implementation is required
```

### 23.2 macOS Features

The app should use:

```text
- Native window
- Sidebar navigation
- Toolbar actions
- File picker
- Local notifications
- Local file access
- Background workers
- Menu bar commands
- Settings panel
```

### 23.3 Main Navigation

```text
Sidebar:
- Dashboard
- Projects
- Agents
- Skills
- Teams
- Runtimes
- Taskmaster
- Runs
- Reviews
- Audits
- Requests
- Demo Center
- Settings
```

---

## 24. Suggested UI Screens

### 24.1 Project Dashboard

Purpose:
Show all projects and current status.

Elements:
```text
- Project cards/list
- Status badge
- Deadline
- Current milestone
- Blocked request count
- Demo readiness
```

### 24.2 Create Project

Purpose:
Create new project and local folder.

Fields:
```text
- Project name
- Project type
- Client/internal
- Deadline
- Priority
- Output goal
- Folder path
```

### 24.3 PRD Import / Analyzer

Purpose:
Import PRD and analyze scope.

Elements:
```text
- Import button
- File preview
- Analysis result
- Missing info list
- Suggested teams
```

### 24.4 Agent Library

Purpose:
Create, edit, duplicate agents.

Elements:
```text
- Agent list
- Role
- Runtime
- Skills
- Permissions
- Test agent button
```

### 24.5 Skill Library

Purpose:
Manage reusable skills.

Elements:
```text
- Skill list
- Type
- Attached agents
- Checklist
- Output contract
```

### 24.6 Team Builder

Purpose:
Build project team from agents.

Elements:
```text
- Team templates
- Agent cards
- Team lead selection
- Skill visibility
- Runtime mapping
```

### 24.7 Runtime Manager

Purpose:
Manage model/runtime connections.

Elements:
```text
- Runtime list
- Endpoint
- Model
- API key status
- Test connection
- Cost mode
```

### 24.8 Taskmaster Board

Purpose:
Show generated milestones and tasks.

Elements:
```text
- Milestone columns
- Task cards
- Priority
- Dependencies
- Acceptance criteria
```

### 24.9 Task Runner

Purpose:
Run selected task.

Elements:
```text
- Current task
- Assigned agent
- Runtime
- Run button
- Live log
- Result files
```

### 24.10 Review / Audit Board

Purpose:
Inspect outputs and decide next action.

Elements:
```text
- Review status
- Audit status
- Issues
- Fix task button
- Approve button
```

### 24.11 Human Request Inbox

Purpose:
Manage blocked items and required inputs.

Elements:
```text
- Request list
- Priority
- Blocking status
- Required input
- Recommended option
- Response field
```

### 24.12 Demo / Handoff Center

Purpose:
Prepare final delivery.

Elements:
```text
- Demo checklist
- Demo script
- Known limitations
- Handoff docs
- Close project button
```

---

## 25. Data Model V1

### 25.1 Tables / Entities

```text
projects
prd_files
prd_analyses
agents
skills
agent_skills
teams
team_agents
runtimes
tasks
task_runs
reviews
audits
human_requests
demo_packages
handoff_packages
settings
```

### 25.2 Project Entity

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "type": "string",
  "client_name": "string",
  "deadline": "date",
  "priority": "low|medium|high",
  "status": "draft|prd_uploaded|prd_analyzed|team_selected|task_generated|in_progress|demo_ready|closed",
  "folder_path": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 25.3 Agent Entity

```json
{
  "id": "uuid",
  "name": "string",
  "role": "string",
  "description": "string",
  "runtime_id": "uuid",
  "model": "string",
  "memory_scope": "global|project|none",
  "permissions": {},
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 25.4 Skill Entity

```json
{
  "id": "uuid",
  "name": "string",
  "type": "prompt|tool|workflow|output|review|audit",
  "description": "string",
  "instruction": "text",
  "workflow": [],
  "checklist": [],
  "output_contract": {},
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 25.5 Task Entity

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "task_code": "T2.1",
  "milestone": "string",
  "title": "string",
  "description": "text",
  "priority": "low|medium|high",
  "status": "todo|assigned|running|review|audit|need_fix|blocked|done",
  "assigned_agent_id": "uuid",
  "acceptance_criteria": [],
  "dependencies": [],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 25.6 Human Request Entity

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "task_id": "uuid",
  "title": "string",
  "need": "text",
  "reason": "text",
  "priority": "low|medium|high",
  "blocking": true,
  "status": "open|answered|resolved|cancelled",
  "recommended_option": "text",
  "user_response": "text",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 26. Project Status State Machine

```text
draft
→ prd_uploaded
→ prd_analyzed
→ team_selected
→ task_generated
→ in_progress
→ review
→ demo_ready
→ demo_sent
→ revision
→ handoff_ready
→ closed
```

---

## 27. Task Status State Machine

### Normal Flow

```text
todo
→ assigned
→ running
→ review
→ audit
→ done
```

### Fix Flow

```text
review
→ need_fix
→ running
→ review
→ audit
→ done
```

### Blocked Flow

```text
running
→ blocked
→ need_human_input
→ resolved
→ running
```

---

## 28. File Storage Strategy

### 28.1 App Base Folder

```text
~/AgentStudio/
├── Database/
├── Agents/
├── Skills/
├── TeamTemplates/
├── RuntimeConfigs/
├── Projects/
├── Logs/
└── Backups/
```

### 28.2 Project Folder

```text
~/AgentStudio/Projects/{project-slug}/
├── 00_Input/
├── 01_PRD/
├── 02_PRD_Analysis/
├── 03_Taskmaster/
├── 04_Teams/
├── 05_Current_Task/
├── 06_Runs/
├── 07_Reviews/
├── 08_Audits/
├── 09_Requests/
├── 10_Demo/
├── 11_Handoff/
└── 12_Archive/
```

---

## 29. Security and Safety Requirements

### 29.1 API Key Handling

```text
- Store API keys securely using macOS Keychain
- Do not write API keys into project files
- Do not show full API keys in UI
- Allow testing runtime connection
```

### 29.2 File Safety

```text
- Require allowed files per task
- Prevent accidental deletion
- Create backup before agent writes files
- Track changed files
- Show diff if possible
```

### 29.3 Dangerous Actions Requiring Approval

```text
- Delete files
- Modify .env
- Run database migration
- Deploy project
- Push git commit
- Install packages
- Execute shell command outside project folder
```

---

## 30. Runtime Execution Rules

### 30.1 Agent Must Receive

Every task execution must include:

```text
- Project context
- Current task
- Allowed files
- Forbidden files
- Expected output
- Acceptance criteria
- Stop conditions
```

### 30.2 Stop Conditions

Agent must stop and create human request if:

```text
- Missing required credential
- Requirement conflict
- File permission unclear
- Risk of deleting/modifying critical files
- Task requires business decision
- Task requires deployment
```

---

## 31. Default Internal Project Types

V1 should include project presets:

```text
1. HR Payroll System
2. Inventory Management System
3. AI Content System
4. Research Report
5. Website / Landing Page
6. Client Proposal
7. Internal Automation
8. DataClaw Insight Report
```

Each preset should suggest:
```text
- Team template
- Default agents
- Required skills
- Default output files
- Demo checklist
```

---

## 32. Example Project Preset: HR Payroll System

### Suggested Team

```text
- PM Agent
- HR Payroll Analyst
- UX Agent
- Database Architect
- Backend Agent
- Frontend Agent
- QA Agent
- Documentation Agent
```

### Common Modules

```text
- Employee Management
- Attendance
- Check-in / Check-out
- Leave Request
- OT Request
- Approval Flow
- Payroll Calculation
- Payslip
- Reports
- Settings
```

### Common Missing Info

```text
- Payroll formula
- OT formula
- Leave policy
- Branch list
- Employee sample data
- LINE OA credentials
- Payslip template
```

---

## 33. Example Project Preset: Inventory System

### Suggested Team

```text
- PM Agent
- Inventory Analyst
- UX Agent
- Database Architect
- Backend Agent
- Frontend Agent
- QA Agent
- Documentation Agent
```

### Common Modules

```text
- Product Master
- Receiving
- Stock Issue
- Stock Count
- Transfer
- Waste / Damage
- Reorder Alert
- Supplier / PO
- Reports
- Dashboard
```

### Common Missing Info

```text
- Branch list
- Product list
- Unit conversion rules
- Supplier list
- Reorder rule
- Barcode format
- Stock count process
```

---

## 34. Success Metrics

### V1 Success Criteria

```text
- User can create project from app
- User can import PRD
- App can create normalized PRD file
- App can generate PRD analysis
- User can select agents/team
- App can run Taskmaster and display tasks
- User can create CURRENT_TASK.md
- User can run an agent task
- App can save task result
- Review/audit loop works
- Human request can be created
- Demo checklist can be generated
- Project can be closed
```

### Practical Success

The app is successful if it reduces project setup and control friction for the user, even if some tasks still require manual review.

---

## 35. MVP Build Phases

### Phase 1 — Native App Shell

```text
- Create SwiftUI macOS app
- Sidebar navigation
- Project dashboard
- Create project
- Local folder structure
- SQLite/SwiftData persistence
```

### Phase 2 — PRD and Project Context

```text
- PRD import
- PRD file copy
- PRD normalization
- PRD analysis output
- Missing info detection
```

### Phase 3 — Agent / Skill / Team

```text
- Agent library
- Skill library
- Team templates
- Team builder
- Runtime selection per agent
```

### Phase 4 — Taskmaster and Task Board

```text
- Taskmaster runner
- Milestone/task parser
- Task board UI
- Current task generator
```

### Phase 5 — Task Execution

```text
- Runtime manager
- Run task button
- Agent output capture
- Run logs
- Task result files
```

### Phase 6 — Review / Audit / Loop

```text
- Review result
- Audit result
- Fix task generation
- Human request inbox
- Notification
```

### Phase 7 — Demo / Handoff

```text
- Demo checklist
- Demo script
- Known limitations
- Handoff docs
- Final report
- Close project
```

---

## 36. Recommended Technical Stack

### Primary Recommendation

```text
Language: Swift
UI: SwiftUI
Storage: SQLite or SwiftData
File Storage: Local file system
Secrets: macOS Keychain
Notifications: UserNotifications
Background Work: async/await + Process runner
Runtime APIs: URLSession
```

### Alternative Faster Build

```text
Tauri + React
SQLite
Local file system
Rust command bridge
```

### Not Recommended for This Requirement

```text
- Pure web app
- Terminal-only script
- SaaS-first architecture
- Electron if resource usage matters
```

---

## 37. Acceptance Criteria for V1

### Project
```text
- Can create project
- Can list projects
- Can update project status
- Can open project folder
```

### PRD
```text
- Can import PRD file
- Can save original PRD
- Can generate normalized Markdown
- Can generate PRD analysis
```

### Agent
```text
- Can view default agents
- Can create/edit agent
- Can assign runtime
- Can attach skills
```

### Skill
```text
- Can view default skills
- Can create/edit skill
- Can attach skill to agent
```

### Team
```text
- Can view team templates
- Can create project team
- Can assign team lead
- Can map runtime per agent
```

### Taskmaster
```text
- Can generate milestone/task files
- Can parse task list
- Can display task board
```

### Runner
```text
- Can create CURRENT_TASK.md
- Can run selected agent/runtime
- Can save TASK_RESULT.md
- Can capture logs
```

### Review/Audit
```text
- Can create review result
- Can create audit result
- Can mark pass/fix/blocked
```

### Human Request
```text
- Can create request
- Can mark request answered/resolved
- Can notify user
```

### Demo/Handoff
```text
- Can generate demo checklist
- Can generate handoff package
- Can close project
```

---

## 38. Cursor / Codex Implementation Instruction

Use this instruction to start building:

```text
Build a native macOS application named Head Office Agent Studio.

The app is not a web app and not a terminal-only tool. It must be a macOS desktop application for internal use.

Start with V1:
1. SwiftUI macOS app shell
2. Sidebar navigation
3. Project Dashboard
4. Create Project form
5. Local folder structure generator
6. SQLite or SwiftData persistence
7. PRD import screen
8. Agent Library screen
9. Skill Library screen
10. Team Builder screen
11. Runtime Manager screen
12. Task Board screen
13. Run Log screen
14. Human Request Inbox
15. Demo / Handoff Center

Do not implement full autonomous agent execution first.
First implement data model, UI flow, local file structure, and manual/mock run loop.
Use mock data where runtime integration is not ready.
```

---

## 39. V1 Development Priority

Build in this order:

```text
1. App shell + navigation
2. Project model + create project
3. Local folder generation
4. PRD import
5. Agent/skill/team models
6. Default seed data
7. Task board model
8. Current task generator
9. Run log model
10. Review/audit model
11. Human request model
12. Demo/handoff model
13. Runtime manager mock
14. Real runtime integration
```

---

## 40. Open Questions

These can be decided later:

```text
1. Use SwiftData or raw SQLite?
2. Use Ollama first or LM Studio first?
3. Should Codex/Claude CLI be called from app in V1 or V2?
4. Should the app support Git diff in V1?
5. Should PRD parsing be local only or use cloud model?
6. Should Taskmaster be external CLI or internal task generator?
7. Should project files be synced to Obsidian vault?
```

---

## 41. Final V1 Scope Statement

Head Office Agent Studio V1 is a native macOS desktop application for internal project delivery control. It lets the user create a project, import a PRD, define AI agents and skills, assemble agent teams, generate and manage tasks, run controlled task loops, review/audit outputs, handle human requests, prepare demos, and close projects with handoff documentation.

The first version should prioritize workflow control, project structure, file transparency, and review/audit loops over full autonomy.
