/**
 * Role model for the BP Holding platform.
 *
 * The platform serves three distinct user surfaces from a single Next.js app:
 *  - Public visitors  → no account required (forms only).
 *  - Employees        → can sign in to the Employee/HR portal only.
 *  - Admins           → can sign in to the Admin Dashboard.
 *
 * The user's role is stored in the `profiles` table (1:1 with `auth.users`)
 * and mirrored in the JWT app_metadata for fast middleware checks.
 */
export const APP_ROLES = ["admin", "employee", "member"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function hasRole(
  role: AppRole | null | undefined,
  allowed: readonly AppRole[],
): boolean {
  return !!role && allowed.includes(role);
}
