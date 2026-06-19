# FEFO Dispatch — Agent Team

**App root:** `hr-app/`  
**Read first:** `orchestration/CURRENT_TASK.md`, `hr-app/reports/FEFO_GAP_AUDIT.md`

## Wave 1 prompt (FEFO-001–003)

```
Implement FEFO Wave 1 in hr-payroll-client/hr-app:

1. Migration: inv_stock_lots + alter inv_stock_movements (lot_id, qty_before, qty_after)
2. Migration: inv_skus flags (expiry_required, lot_tracking_required, default_issue_method, shelf_life_days, storage_type)
3. Update inv_approve_inbound_order to create lots + receive movements (keep balance sync)
4. Update SKU form/validator/types for new fields
5. Write hr-app/_agent/TASK_RESULT.md with files changed + migration filename
6. Do NOT commit, deploy, or db push

Follow existing patterns in:
- supabase/migrations/20260625100000_inbound_phase4.sql
- supabase/migrations/20260622100000_inventory_schema.sql
- src/features/inventory/actions/inbound.ts, validators/sku.ts
```

## Wave 2 prompt (FEFO-004–006, 013 partial)

```
After Wave 1 migration exists, implement:

1. inv_allocate_fefo(sku_id, warehouse_id, qty) RPC — FEFO sort, FIFO fallback, exclude expired/damaged
2. inv_requisition_issue_lines table for multi-lot issues
3. Unit tests: src/lib/inventory/fefo-allocate.test.ts (pure sort logic or RPC contract mocks)
4. TASK_RESULT.md update
```

## Wave 3a (FEFO-007–008)

```
Wire inv_issue_requisition + RequisitionDetailView to use FEFO allocator.
Wire inv_record_consumption + ConsumptionRecordForm.
Override: reason field + inv_can_override_fefo() permission helper.
```

## Wave 3b (FEFO-009–011)

```
Transfer RPCs: lot_id on items, preserve expiry on receive.
Damage: lot_id on inv_damage_items, approve updates lot status.
Stock count: lot_id on count items, finalize adjusts lots.
```

## Wave 3c (FEFO-012, 014)

```
expansion-data.ts: expiry alerts from inv_stock_lots.
Override audit: log table or query issue_lines with override_reason; report section.
```

## Review gates (Cursor)

```bash
cd hr-app && npm run build && npm run typecheck && npm run lint && npm test
```
