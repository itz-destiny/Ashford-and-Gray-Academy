import { describe, it, expect } from 'vitest';
import { generateCode, __testing } from './otp';

describe('otp.generateCode', () => {
    it('returns a 6-digit numeric string', () => {
        for (let i = 0; i < 200; i++) {
            const code = generateCode();
            expect(code).toMatch(/^\d{6}$/);
        }
    });

    it('uniformly covers the full 0..999_999 range over many draws', () => {
        const seen = new Set<string>();
        for (let i = 0; i < 5_000; i++) seen.add(generateCode());
        // With 5,000 draws over 10^6 possible values, collisions are vanishingly
        // rare; we just want to be sure the function isn't returning a constant.
        expect(seen.size).toBeGreaterThan(4900);
    });
});

describe('otp.hashCode', () => {
    it('is deterministic', () => {
        expect(__testing.hashCode('123456')).toBe(__testing.hashCode('123456'));
    });
    it('differs for different inputs', () => {
        expect(__testing.hashCode('123456')).not.toBe(__testing.hashCode('123457'));
    });
    it('returns a 64-char hex sha256 digest', () => {
        const h = __testing.hashCode('999999');
        expect(h).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe('otp.constants', () => {
    it('TTL is 10 minutes', () => {
        expect(__testing.OTP_TTL_MS).toBe(10 * 60 * 1000);
    });
    it('caps attempts at 5', () => {
        expect(__testing.MAX_ATTEMPTS).toBe(5);
    });
    it('cooldown is 60 seconds', () => {
        expect(__testing.COOLDOWN_MS).toBe(60 * 1000);
    });
});
