/** Canonical admin allowlist — keep Desktop / Mobile / API in sync. */
export const ADMIN_EMAILS = [
  "contact@ideeata.ai",
  "nadiaramonaz@gmail.com",
  "adrian@ideeata.ai",
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}

/**
 * Server-side admin check on a verified Firebase ID token.
 * Requires email_verified: an unverified email/password signup on an allowlisted
 * address that has no account yet would otherwise get admin rights.
 */
export function isAdminToken(decoded?: { email?: string | null; email_verified?: boolean } | null): boolean {
  return decoded?.email_verified === true && isAdminEmail(decoded.email);
}
