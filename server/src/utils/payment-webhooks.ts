import crypto from 'node:crypto';

export function verifyPaystackSignature(
  rawBody: Buffer | string,
  secretKey: string | undefined,
  signatureHeader: string | undefined,
): boolean {
  if (!secretKey || !signatureHeader) return false;

  const expected = `sha512=${crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signatureHeader.trim(), 'utf8'),
    );
  } catch {
    return false;
  }
}

export function verifyFlutterwaveSignature(
  rawBody: Buffer | string,
  secretHash: string | undefined,
  signatureHeader: string | undefined,
): boolean {
  if (!secretHash || !signatureHeader) return false;

  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  const providedHash = signatureHeader.trim();
  const candidateHashes = new Set<string>([
    crypto.createHash('sha256').update(`${secretHash.trim()}${body.toString('utf8')}`).digest('hex'),
    crypto.createHash('sha256').update(`${secretHash.trim()}${body.toString('utf8')}${secretHash.trim()}`).digest('hex'),
    crypto.createHash('sha256').update(`${body.toString('utf8')}${secretHash.trim()}`).digest('hex'),
    secretHash.trim(),
  ]);

  return Array.from(candidateHashes).some((value) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(value, 'utf8'), Buffer.from(providedHash, 'utf8'));
    } catch {
      return false;
    }
  });
}

export function safeJsonParse<T>(value: unknown): T | null {
  if (!value) return null;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  return value as T;
}

export function getEventReference(payload: any): string | null {
  const data = payload?.data ?? payload;
  const reference = data?.reference ?? data?.tx_ref ?? data?.referenceId ?? data?.id;
  if (typeof reference === 'string' && reference.trim()) return reference.trim();
  return null;
}

export function getEventMetadata(payload: any): Record<string, any> {
  const data = payload?.data ?? payload;
  const metadata = data?.metadata ?? data?.meta ?? {};
  if (!metadata || typeof metadata !== 'object') return {};
  return metadata as Record<string, any>;
}
