#!/usr/bin/env node
/**
 * Register an HR admin/manager for LINE login (local dev).
 *
 * Usage:
 *   node scripts/seed-admin.mjs <LINE_USER_ID> [name] [admin|hr]
 *
 * Example:
 *   node scripts/seed-admin.mjs U1234567890abcdef "Jakarin" admin
 */

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const envPath = resolve(root, ".env.local")

function loadEnv() {
  try {
    const raw = readFileSync(envPath, "utf8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq)
      const value = trimmed.slice(eq + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.error("Missing .env.local — run from hr-app/")
    process.exit(1)
  }
}

loadEnv()

const lineUserId = process.argv[2]
const name = process.argv[3] ?? "Admin Owner"
const role = process.argv[4] ?? "admin"

if (!lineUserId || !lineUserId.startsWith("U")) {
  console.error(
    "Usage: node scripts/seed-admin.mjs <LINE_USER_ID> [name] [admin|hr]"
  )
  process.exit(1)
}

if (role !== "admin" && role !== "hr") {
  console.error("Role must be admin or hr")
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
  process.exit(1)
}

const body = {
  line_user_id: lineUserId,
  name,
  role,
  status: "active",
  department: "Management",
  position: role === "admin" ? "Owner" : "Manager",
}

const res = await fetch(`${url}/rest/v1/hr_employees`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(body),
})

const data = await res.json()

if (!res.ok) {
  console.error("Insert failed:", data)
  process.exit(1)
}

console.log("Registered employee for LINE login:")
console.log(JSON.stringify(Array.isArray(data) ? data[0] : data, null, 2))
console.log("\nRetry login at your ngrok /login URL.")
