import { handleZoomWebhook } from '@/lib/zoom-webhook';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ account: string }> };

// =============================================================================
// POST /api/webhooks/zoom/[account] — receives Zoom Event Subscriptions for
// one of our two Zoom accounts ("primary" or "school"), each with its own
// Server-to-Server OAuth app and webhook Secret Token. Handles the one-time
// endpoint.url_validation challenge and recording.completed events (which
// populate LiveClass.recordingUrl — see src/lib/zoom-webhook.ts).
// =============================================================================
export async function POST(req: Request, { params }: RouteParams): Promise<Response> {
    const { account } = await params;
    if (account !== 'primary' && account !== 'school') {
        return new Response('Unknown account', { status: 404 });
    }
    return handleZoomWebhook(account, req);
}
