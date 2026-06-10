import ReviewDashboard from "./ReviewDashboard";
import { PostIdEmptyState } from "@/components/publisher/post-id-empty-state";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ post_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const postId = Array.isArray(params.post_id)
    ? params.post_id[0] ?? ""
    : params.post_id ?? "";

  if (!postId.trim()) {
    return <PostIdEmptyState />;
  }

  return <ReviewDashboard initialPostId={postId} />;
}
