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
}
