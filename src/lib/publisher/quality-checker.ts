import { runQualityChecksAI } from "./openai";

export type QualityStatus = "pass" | "warn" | "fail" | "note";

export type QualityCheckResult = {
  check: string;
  status: QualityStatus;
  details: string;
};

export async function runQualityChecks(
  contentInput: unknown,
  rulesInput: unknown,
  post_id = "unknown"
): Promise<QualityCheckResult[]> {
  return runQualityChecksAI(contentInput, rulesInput, post_id);
}
