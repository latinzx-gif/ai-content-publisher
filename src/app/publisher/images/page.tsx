import ImageGenerator from "./ImageGenerator";
import { PostIdEmptyState } from "@/components/publisher/post-id-empty-state";

type SearchParams = Promise<{ post_id?: string | string[] }>;

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const postId = Array.isArray(params.post_id)
    ? params.post_id[0] ?? ""
    : params.post_id ?? "";

  if (!postId.trim()) {
    return <PostIdEmptyState />;
  }

  return <ImageGenerator initialPostId={postId} />;
}
