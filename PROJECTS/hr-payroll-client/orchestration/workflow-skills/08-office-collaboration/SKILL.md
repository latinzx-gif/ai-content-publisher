---
name: workflow-office-collaboration
description: >-
  Multi-agent collaborative workflow where agents "meet" and coordinate
  through TEAM_SYNC.md before implementing. Codex acts as Office Manager,
  spawning specialist agents who discuss, resolve conflicts, and iterate
  until consensus before final execution.
---

# Skill: Office-Style Agent Collaboration

## When to Use

สำหรับ tasks ที่มีความซับซ้อนสูง และต้องการให้ agents "ประชุม" กันก่อนเขียนโค้ด:

- **High complexity:** multiple schemas + routes + logic + RLS
- **Clear domain separation:** schema, API, UI, test layers
- **Integration dependencies:** agents need to agree on interfaces
- **Risk of conflicts:** design decisions affect multiple layers

**Example tasks:**
- T138 Kitchen Requisition (4-step workflow, 2 schemas, 3 routes, RLS)
- T141 Stock Count (complex state machine, variance logic)
- T145 Executive Dashboard (10 KPIs, 4 graphs, performance)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│            Codex (Office Manager)                    │
│  - Orchestrate ทั้งหมด                              │
│  - อ่าน + สรุป proposals จากทุก agent               │
│  - ตัดสินใจ conflict resolution                      │
│  - Integration final output                          │
└─────────────────────────────────────────────────────┘
          │
          ├──────┬──────────┬──────────┐
          ▼      ▼          ▼          ▼
     ┌────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
     │Schema  │ │ API     │ │   UI    │ │  Test    │
     │Agent   │ │ Agent   │ │  Agent  │ │  Agent   │
     └────────┘ └─────────┘ └─────────┘ └──────────┘
          │         │           │            │
          └─────────┴───────────┴────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  TEAM_SYNC.md        │
          │  (Shared discussion) │
          └──────────────────────┘
```

---

## Workflow Phases

### Phase 1: Setup (Codex)

**Codex creates discussion room:**

```markdown
# _agent/TEAM_SYNC.md

# [Task ID] — [Task Name]

## Discussion Round 1 — Initial Proposals

(Agents write proposals here with @mentions)

---

## Discussion Round 2 — Synthesis & Conflicts

(Codex writes synthesis here)

---

## Discussion Round 3 — Revisions (if needed)

(Agents revise proposals)

---

## Final Integration Plan

(Codex writes final plan after convergence)
```

---

### Phase 2: Parallel Proposals (Agents)

**Codex spawns 4 agents พร้อมกัน:**

```typescript
Task: Schema Agent (best-of-n-runner)
Prompt: "อ่าน CURRENT_TASK + TASK_PLAN → เขียน Schema proposal ใน _agent/TEAM_SYNC.md → ถามคำถามให้ @API @UI"

Task: API Agent (best-of-n-runner)
Prompt: "อ่าน CURRENT_TASK + TASK_PLAN → เขียน API proposal ใน _agent/TEAM_SYNC.md → ตอบ @Schema → ถาม @UI"

Task: UI Agent (best-of-n-runner)
Prompt: "อ่าน CURRENT_TASK + TASK_PLAN → เขียน UI proposal ใน _agent/TEAM_SYNC.md → ตอบ @API @Schema"

Task: Test Agent (generalPurpose)
Prompt: "อ่าน CURRENT_TASK + TASK_PLAN → เขียน Test proposal ใน _agent/TEAM_SYNC.md → ครอบคลุมทุก layer"
```

**Agent proposal format:**

```markdown
## [Agent Name] Proposal

**Responsibility:** [what this agent will implement]

**Files:**
- path/to/file1.ts (action: CREATE/MODIFY)
- path/to/file2.tsx (action: MODIFY)

**Design:**
[key design decisions, API contracts, types]

**Questions for Other Agents:**
- @AgentName: [question]
- @AgentName: [question]

**Responses to Questions:**
- @From: [answer]

**Dependencies:**
[which agents must finish first]
```

---

### Phase 3: Synthesis (Codex)

**Codex อ่าน TEAM_SYNC.md ทั้งหมด แล้วเขียน:**

```markdown
## Codex Synthesis — Round 2

**Agreements:**
✅ [list design decisions all agents agree on]

**Conflicts:**
⚠️ [list contradictions or mismatches]
   → **Decision:** [Codex's ruling with rationale]

**Missing pieces:**
❌ [gaps that need addressing]
   → **Action:** [which agent should revise]

**Dependencies resolved:**
1. [execution order]
2. ...

**Next:** [agent to resume, or proceed to execution]
```

---

### Phase 4: Iteration (if needed)

**ถ้ามี conflicts หรือ missing:**

```typescript
// Codex resumes specific agent
Task resume: [Agent ID]
Prompt: "ตาม TEAM_SYNC.md synthesis, [issue] — กรุณา revise proposal ของคุณ"
```

**Agent เขียน Revision:**

```markdown
## [Agent Name] Proposal — Revision 1

**Changes:**
- [what changed from original]

**Resolved:**
- @AgentName conflict resolved by [solution]

**Updated Design:**
[revised design]
```

**Codex checks convergence:**
- ถ้า converged → Phase 5
- ถ้ายังมี conflicts → Iteration รอบใหม่ (max 3 rounds)

---

### Phase 5: Final Execution (Codex)

**Codex เขียน final integration plan:**

```markdown
## Final Integration Plan

**Execution Order:**
1. Schema Agent → [files]
2. API Agent → [files] (depends: Schema)
3. UI Agent → [files] (depends: API)
4. Test Agent → [files] (depends: all)

**Integration Points:**
✅ [list all agreed interfaces, types, contracts]

**File Write Plan:**
[complete list of files to write/modify]

**Quality Gates:**
- npm run build
- npm run typecheck
- npm run lint
- [acceptance tests]

**Ready to execute.**
```

**Codex เขียนโค้ดจริง:**
- ตาม execution order
- รวม outputs จาก agents (ใช้เฉพาะ approved parts)
- รัน quality gates
- เขียน TASK_RESULT.md

---

## Communication Rules

**Tag format:** `@AgentName` (Schema, API, UI, Test, Codex)

**Decision markers:**
- ✅ Agreement
- ⚠️ Conflict
- ❌ Blocker
- 💡 Suggestion

**Question format:**
```
@AgentName: [question]?
```

**Answer format:**
```
@From: [answer]
```

---

## Codex Responsibilities

**As Office Manager:**
1. ✅ Spawn all agents พร้อมกัน (parallel)
2. ✅ รอ agents เขียน proposals ครบ
3. ✅ อ่าน TEAM_SYNC.md ทั้งหมด
4. ✅ เขียน synthesis: agreements, conflicts, missing
5. ✅ Resume agents ที่ต้อง revise (ถ้ามี)
6. ✅ ตรวจ convergence (agents ตกลงกันหรือยัง)
7. ✅ เขียน final integration plan
8. ✅ Implement ตาม plan
9. ✅ Quality gates
10. ✅ เขียน TASK_RESULT.md

**Conflict Resolution:**
- ถ้า agents ไม่เห็นด้วย → Codex ตัดสิน (พร้อม rationale)
- Rationale ต้องอ้างอิง: acceptance criteria, best practices, performance, maintainability

---

## Agent Responsibilities

**Schema Agent:**
- ออกแบบ tables, columns, types, constraints
- เขียน migration SQL
- ระบุ RLS policies
- ถามคำถาม @API, @UI เรื่อง fields ที่ต้องการ

**API Agent:**
- ออกแบบ server actions, validators
- ระบุ input/output types
- ถามคำถาม @Schema เรื่อง queries
- ถามคำถาม @UI เรื่อง form data

**UI Agent:**
- ออกแบบ routes, components, forms
- ระบุ state management, validation
- ถามคำถาม @API เรื่อง action signatures
- ถามคำถาม @Schema เรื่อง display fields

**Test Agent:**
- ออกแบบ test cases ครอบคลุม schema, API, UI
- ระบุ edge cases
- ถามคำถาม ทุก agent เรื่อง validation rules

---

## Quality Criteria

**Good proposal:**
- ✅ Clear responsibility scope
- ✅ Complete file list with actions
- ✅ Key design decisions explained
- ✅ Questions for dependencies
- ✅ Answers to questions from others

**Good synthesis:**
- ✅ All proposals summarized
- ✅ Conflicts identified with decisions
- ✅ Missing pieces flagged
- ✅ Clear next action

**Convergence signs:**
- ✅ No new conflicts in latest round
- ✅ All questions answered
- ✅ Dependencies clear
- ✅ Agents confirm agreement (optional)

---

## Output Files

**_agent/TEAM_SYNC.md** — discussion log
**_agent/TASK_PLAN.md** — standard plan (still required)
**_agent/TASK_RESULT.md** — standard result (still required)

---

## Comparison: Standard vs Office Pattern

| Aspect | Standard Parallel | Office-Style |
|--------|-------------------|--------------|
| Agents spawn | Parallel, isolated | Parallel, shared discussion |
| Communication | None (Codex integrates) | Via TEAM_SYNC.md |
| Conflict detection | After implementation | Before implementation |
| Iteration | Whole task retry | Targeted agent revisions |
| Transparency | Final outputs only | Full discussion visible |
| Best for | Independent layers | Interdependent layers |

---

*Created: 2026-06-13*  
*Owner: Cursor orchestrator*  
*Use for: High-complexity tasks with clear agent boundaries*
