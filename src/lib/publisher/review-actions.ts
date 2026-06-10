import { addLog } from "./log-system";
import { upsertPost } from "@/lib/publisher/db";

export type ReviewStatus =
  | "approved"
  | "rejected"
  | "revision_requested"
  | "draft"
  | "publishing"
  | "scheduled"
  | "published"
  | "failed";

export async function approvePost(post_id: string) {
  return saveStatus(post_id, "approved", "Approve");
}

export async function rejectPost(post_id: string) {
  return saveStatus(post_id, "rejected", "Reject");
}

export async function requestRevision(post_id: string) {
  return saveStatus(post_id, "revision_requested", "Request Revision");
}

export async function saveDraft(post_id: string) {
  return saveStatus(post_id, "draft", "Save as Draft");
}

async function saveStatus(post_id: string, status: ReviewStatus, action: string) {
  await upsertPost({ post_id, status: status as import("@/lib/publisher/supabase/types").AcpPostStatus });
  addLog(
    "generation",
    action,
    post_id,
    `Review status changed to ${status}.`,
    "success",
    "Manual Reviewer"
  );
  return status;
}
