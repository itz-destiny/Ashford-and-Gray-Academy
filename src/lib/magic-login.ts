import crypto from 'crypto';
import User from '@/models/User';
import { getEmailUrl } from './app-url';

/**
 * Issues a one-time login link for a welcome email so a new user never has
 * to copy a temporary password by hand: clicking it signs them straight
 * into their dashboard, where ForcePasswordChangeModal takes over.
 *
 * The token stays valid for as long as mustChangePassword is true — no
 * separate expiry or single-use bookkeeping needed. The moment the user
 * actually sets their own password (mustChangePassword flips false), the
 * link stops working forever, the same way it would if we'd deleted it.
 */
export async function issueMagicLoginLink(uid: string): Promise<string> {
    const token = crypto.randomBytes(24).toString('hex');
    await User.updateOne({ uid }, { $set: { magicLoginToken: token } });
    const appUrl = getEmailUrl();
    return `${appUrl}/login/welcome?token=${token}`;
}
