/**
 * Guard for routes that exist only to make local development easier (seeding,
 * one-off repairs, mail probes). Throws an AuthError in production so a stray
 * deploy can't be wiped from outside.
 *
 * The route is permitted when ALL of the following hold:
 *   1. `NODE_ENV !== 'production'`, OR `ALLOW_DEV_ENDPOINTS === 'true'` is set
 *      explicitly (escape hatch for a staging environment).
 *   2. The caller has the `admin` role (enforced separately via `withAuth` +
 *      `requireRole`).
 */
import { AuthError } from './auth-server';

export function assertDevEndpointAllowed(env: NodeJS.ProcessEnv = process.env): void {
    const isProd = env.NODE_ENV === 'production';
    const override = env.ALLOW_DEV_ENDPOINTS === 'true';
    if (isProd && !override) {
        throw new AuthError(404, 'Not found');
    }
}
