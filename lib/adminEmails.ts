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
