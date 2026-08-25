/**
 * Deterministic, human-typeable temporary password: `AGFA-<First>-<Last>-2026`.
 * Recipients are always forced to set their own password on first sign-in
 * (`mustChangePassword`), so this only needs to survive being read off an
 * email and typed once — not resist brute force on its own.
 */
export function generateTempPassword(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0] || 'Academy';
    const last = parts[parts.length - 1] || 'Member';
    return `AGFA-${first}-${last}-2026`;
}
