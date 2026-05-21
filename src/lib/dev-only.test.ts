import { describe, it, expect } from 'vitest';
import { assertDevEndpointAllowed } from './dev-only';
import { AuthError } from './auth-server';

describe('assertDevEndpointAllowed', () => {
    it('passes outside production', () => {
        expect(() => assertDevEndpointAllowed({ NODE_ENV: 'development' } as NodeJS.ProcessEnv))
            .not.toThrow();
        expect(() => assertDevEndpointAllowed({ NODE_ENV: 'test' } as NodeJS.ProcessEnv))
            .not.toThrow();
    });

    it('throws 404 in production with no override', () => {
        try {
            assertDevEndpointAllowed({ NODE_ENV: 'production' } as NodeJS.ProcessEnv);
            expect.unreachable('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(AuthError);
            expect((err as AuthError).status).toBe(404);
        }
    });

    it('passes in production when ALLOW_DEV_ENDPOINTS=true', () => {
        expect(() =>
            assertDevEndpointAllowed({
                NODE_ENV: 'production',
                ALLOW_DEV_ENDPOINTS: 'true',
            } as NodeJS.ProcessEnv)
        ).not.toThrow();
    });

    it('ignores ALLOW_DEV_ENDPOINTS values other than the literal "true"', () => {
        expect(() =>
            assertDevEndpointAllowed({
                NODE_ENV: 'production',
                ALLOW_DEV_ENDPOINTS: '1',
            } as NodeJS.ProcessEnv)
        ).toThrow(AuthError);
    });
});
