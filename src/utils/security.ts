import { createHash } from 'crypto';

export const hashFrom = (toHash: string): string => createHash('sha256').update(toHash).digest('hex');
