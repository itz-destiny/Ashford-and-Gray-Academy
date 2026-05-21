import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import dbConnect from './mongodb';
import Otp, { type OtpPurpose } from '@/models/Otp';

const OTP_TTL_MS = 10 * 60 * 1000;       // 10 minutes
const MAX_ATTEMPTS = 5;                  // before the code is invalidated
const COOLDOWN_MS = 60 * 1000;           // 60-second per-purpose throttle

export class OtpError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'OtpError';
    }
}

/**
 * Crypto-strong 6-digit code, uniform over 0..999_999, left-padded.
 * randomInt is unbiased — important for security codes.
 */
export function generateCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashCode(code: string): string {
    // Salting by uid+purpose would be marginally better but adds little here
    // because the OTP space is small (10^6) and the rate limit + 5-attempt cap
    // is the actual defense. Hashing exists so a DB leak doesn't expose
    // active codes.
    return createHash('sha256').update(code).digest('hex');
}

export async function issueOtp(input: {
    uid: string;
    email: string;
    purpose: OtpPurpose;
}): Promise<{ code: string; expiresAt: Date }> {
    await dbConnect();

    // Per-purpose throttle: if we issued one in the last 60s, refuse.
    const recent = await Otp.findOne({
        uid: input.uid,
        purpose: input.purpose,
        createdAt: { $gte: new Date(Date.now() - COOLDOWN_MS) },
    });
    if (recent) {
        const remaining = Math.ceil(
            (COOLDOWN_MS - (Date.now() - new Date((recent as any).createdAt).getTime())) / 1000
        );
        throw new OtpError(429, `Please wait ${remaining}s before requesting another code.`);
    }

    // Invalidate any outstanding codes of the same purpose for this user.
    await Otp.updateMany(
        { uid: input.uid, purpose: input.purpose, consumedAt: { $exists: false } },
        { $set: { consumedAt: new Date(), expiresAt: new Date(0) } }
    );

    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await Otp.create({
        uid: input.uid,
        email: input.email.toLowerCase(),
        purpose: input.purpose,
        codeHash: hashCode(code),
        expiresAt,
    });

    return { code, expiresAt };
}

export async function verifyOtp(input: {
    uid: string;
    purpose: OtpPurpose;
    code: string;
}): Promise<void> {
    await dbConnect();

    const record = await Otp.findOne({
        uid: input.uid,
        purpose: input.purpose,
        consumedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!record) throw new OtpError(400, 'No active code. Request a new one.');
    if (record.expiresAt.getTime() < Date.now()) {
        throw new OtpError(400, 'Code expired. Request a new one.');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
        // Burn it so retries don't pile up.
        record.consumedAt = new Date();
        await record.save();
        throw new OtpError(429, 'Too many incorrect attempts. Request a new code.');
    }

    const a = Buffer.from(record.codeHash, 'hex');
    const b = Buffer.from(hashCode(input.code), 'hex');
    const matches = a.length === b.length && timingSafeEqual(a, b);

    if (!matches) {
        record.attempts += 1;
        await record.save();
        throw new OtpError(400, 'Incorrect code.');
    }

    record.consumedAt = new Date();
    await record.save();
}

export const __testing = { OTP_TTL_MS, MAX_ATTEMPTS, COOLDOWN_MS, hashCode };
