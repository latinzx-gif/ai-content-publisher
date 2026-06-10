import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const configured = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY?.trim();
  if (configured) {
    return createHash('sha256').update(configured).digest();
  }

  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!fallback) {
    throw new Error('Missing INTEGRATION_TOKEN_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createHash('sha256').update(`integration-token:${fallback}`).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(payload: string) {
  const [ivPart, authTagPart, encryptedPart] = payload.split('.');
  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error('Invalid encrypted token payload.');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivPart, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
