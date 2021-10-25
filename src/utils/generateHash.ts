import { createHash } from 'crypto';

export function generateHash(value: string): string {
  const hash = createHash('sha256');
  hash.update(value);
  const hex = hash.digest('hex');
  return hex;
}
