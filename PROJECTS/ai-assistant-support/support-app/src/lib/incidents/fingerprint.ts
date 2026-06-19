import { createHash } from "node:crypto";

/**
 * Normalize a string for fingerprint derivation:
 * - trim leading/trailing whitespace
 * - collapse internal whitespace to single space
 * - lowercase
 */
export function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Derive a stable fingerprint for an operational incident.
 *
 * Based on `clientSlug` (or "system" if absent), `service`, `severity`,
 * and the normalized `subject`. Stable across casing and whitespace-only
 * differences so repeated reports of the same real incident resolve to
 * the same fingerprint.
 *
 * @param clientSlug - optional client slug (falls back to "system")
 * @param service    - service name
 * @param severity   - severity level (P0-P3)
 * @param subject    - incident subject line
 * @returns SHA-256 hex digest of the canonical fingerprint string
 */
export function deriveIncidentFingerprint(
  clientSlug: string | null | undefined,
  service: string,
  severity: string,
  subject: string,
): string {
  const slug = (clientSlug?.trim() ? clientSlug.trim().toLowerCase() : "system");
  const normService = normalize(service);
  const normSeverity = normalize(severity);
  const normSubject = normalize(subject);

  const canonical = `${slug}:${normService}:${normSeverity}:${normSubject}`;
  return createHash("sha256").update(canonical, "utf-8").digest("hex");
}