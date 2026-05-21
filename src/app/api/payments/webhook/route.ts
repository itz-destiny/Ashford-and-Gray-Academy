import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { finalizeSuccessfulPayment } from '../verify/route';
import { getPaystackConfig, verifyWebhookSignature } from '@/lib/paystack';

// Paystack delivers webhooks as POST with the raw JSON body signed via
// HMAC-SHA512 in the `x-paystack-signature` header. We verify before parsing.
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let secret: string;
    try {
        secret = getPaystackConfig().secretKey;
    } catch (err) {
        console.error('paystack webhook: server misconfigured', err);
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    if (!verifyWebhookSignature(raw, signature, secret)) {
        console.warn('paystack webhook: invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event: { event?: string; data?: any };
    try {
        event = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    try {
        await dbConnect();
        if (event.event === 'charge.success' && event.data?.reference) {
            const tx = await Transaction.findOne({ transactionId: event.data.reference });
            if (tx) {
                await finalizeSuccessfulPayment({
                    transactionId: tx._id.toString(),
                    verifiedReference: event.data.reference,
                });
            }
        } else if (
            (event.event === 'charge.failed' || event.event === 'charge.dispute.create') &&
            event.data?.reference
        ) {
            await Transaction.findOneAndUpdate(
                { transactionId: event.data.reference, status: 'pending' },
                {
                    $set: {
                        status: event.event === 'charge.failed' ? 'failed' : 'completed',
                        failureReason:
                            event.event === 'charge.failed'
                                ? event.data.gateway_response || 'Charge failed'
                                : undefined,
                        processedAt: new Date(),
                    },
                }
            );
        }
    } catch (err) {
        console.error('paystack webhook: persistence failed', err);
        // Still 200 — Paystack will retry, but we logged the failure.
    }

    return NextResponse.json({ received: true });
}
