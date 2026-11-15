// Handle rules (spec/accounts-v1.md section 5), pure so node --test can load them. The database CHECKs and the
// handle_taken triggers (migration 0001) are the final word; this gives the 400 message before the write.

export const HANDLE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{1,41}$/;

/** Returns a plain-language reason when the handle is malformed, else null. */
export function handleProblem(h: unknown): string | null {
  if (typeof h !== 'string') return 'handle must be a string.';
  if (h.length < 2 || h.length > 42) return 'A handle is 2 to 42 characters.';
  if (!HANDLE_RE.test(h)) return 'A handle uses letters, digits, dot, underscore and hyphen, and starts with a letter or digit.';
  if (h.includes('..') || h.includes('--')) return 'A handle cannot hold ".." or "--".';
  return null;
}

/**
 * The handle a deleted account keeps, so its old handle is free again and its old repo addresses cannot be
 * claimed by the next owner of that handle. Built from the Clerk id; always a valid handle, never a reserved
 * word (the reserved list has no "deleted." entries).
 */
export function deletedHandle(userId: string): string {
  const tail = userId.replace(/[^A-Za-z0-9]/g, '').slice(-24).toLowerCase() || 'user';
  return `deleted.${tail}`;
}
