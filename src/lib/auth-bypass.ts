/** Dev-only API auth bypass — never active when NODE_ENV is production. */
export function isServerApiAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.AI_CONTENT_DISABLE_API_AUTH === 'true';
}

/** Client-visible bypass flag for PRD UI — same production guard. */
export function isPublicApiAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH === 'true'
  );
}
