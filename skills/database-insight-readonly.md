# SKILL: DATABASE INSIGHT READONLY

## GOAL
See database state. No touch table.

## INPUTS
- `supabase/migrations/` (Schema knowledge).
- Task ID.

## STEPS
1. Read migrations. Know what table exist.
2. Formulate SQL query (If possible) or search mock data.
3. Map relationship between `content_items` and `agent_runs`.
4. Identify if data follow `taskTrace` format.

## OUTPUT
- Schema map for task.
- Data integrity report.
- Potential migration need.

## STOP CONDITIONS
- DO NOT EDIT MIGRATIONS.
- DO NOT RUN DESTRUCTIVE SQL.
- READONLY ONLY.
