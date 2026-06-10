import { createHash, randomBytes } from 'node:crypto';

export function createOAuthState() {
  return randomBytes(24).toString('base64url');
}

export function createPkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function sanitizeReturnTo(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith('/')) {
    return fallback;
  }
  if (value.startsWith('//')) {
    return fallback;
  }
  return value;
}
