import BriefBuilder from "./BriefBuilder";
import { PostIdEmptyState } from "@/components/publisher/post-id-empty-state";

type BriefsPageProps = {
  searchParams: Promise<{ post_id?: string | string[] }>;
};

export default async function BriefsPage({ searchParams }: BriefsPageProps) {
  const params = await searchParams;
  const postId = Array.isArray(params.post_id)
    ? params.post_id[0] ?? ""
    : params.post_id ?? "";

  if (!postId.trim()) {
    return <PostIdEmptyState />;
  }

  return <BriefBuilder initialPostId={postId} />;
}
