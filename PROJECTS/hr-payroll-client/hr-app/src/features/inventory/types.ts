export type InvSku = {
  id: string
  code: string
  name: string
  category: string | null
  unit_id: string | null
  barcode: string | null
  min_stock: number
  max_stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvSupplier = {
  id: string
  code: string
  name: string
  address: string | null
  contact: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvBranch = {
  id: string
  code: string
  name: string
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvWarehouse = {
  id: string
  code: string
  name: string
  branch_id: string
  type: "main" | "sub"
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvWarehouseWithBranch = InvWarehouse & {
  inv_branches: { name: string } | { name: string }[] | null
}

export type InvUnit = {
  id: string
  name: string
  abbreviation: string | null
}

export type InventoryActionState = {
  success: boolean
  error?: string
  id?: string
}

export type InvInboundStatus = "draft" | "pending" | "approved" | "cancelled"

export type InvInboundOrder = {
  id: string
  supplier_id: string | null
  warehouse_id: string | null
  status: InvInboundStatus
  received_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type InvInboundOrderRow = InvInboundOrder & {
  supplier_name: string
  warehouse_name: string
  item_count: number
}

export type InvInboundItem = {
  id: string
  inbound_order_id: string
  sku_id: string | null
  quantity: number
  cost_per_unit: number | null
  lot_number: string | null
  expiry_date: string | null
  created_at: string
}

export type InvInboundItemRow = InvInboundItem & {
  sku_code: string
  sku_name: string
}
