import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const envPath = resolve(root, ".env.local")

let loaded = false

export function loadEnv() {
  if (loaded) return
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
    loaded = true
  } catch {
    throw new Error("Missing .env.local — run from hr-app/ with supabase configured")
  }
}

export function requireEnv(...keys) {
  loadEnv()
  const missing = keys.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`)
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}
