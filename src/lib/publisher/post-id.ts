/** Stable local post id for the publisher workflow (Create → Publish). */
export function createPostId(): string {
  return `post_${Date.now()}`;
}
