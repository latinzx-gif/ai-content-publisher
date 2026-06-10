import RulesLoader from "./RulesLoader";
import { PostIdEmptyState } from "@/components/publisher/post-id-empty-state";

type RulesPageProps = {
  searchParams: Promise<{ post_id?: string | string[] }>;
};

export default async function RulesPage({ searchParams }: RulesPageProps) {
  const params = await searchParams;
  const postId = Array.isArray(params.post_id)
    ? params.post_id[0] ?? ""
    : params.post_id ?? "";

  if (!postId.trim()) {
    return <PostIdEmptyState />;
  }

  return <RulesLoader initialPostId={postId} />;
}
