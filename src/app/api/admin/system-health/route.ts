import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import SystemHealth from '@/models/SystemHealth';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const metric = searchParams.get('metric');
        const status = searchParams.get('status');
        const hours = parseInt(searchParams.get('hours') || '24', 10);

        const query: Record<string, unknown> = {
            timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) },
        };
        if (metric) query.metric = metric;
        if (status) query.status = status;

        const healthMetrics = await SystemHealth.find(query).sort({ timestamp: -1 }).limit(100).lean();
        const [criticalAlerts, warningAlerts] = await Promise.all([
            SystemHealth.countDocuments({
                status: 'critical',
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
            SystemHealth.countDocuments({
                status: 'warning',
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
        ]);

        return NextResponse.json({
            success: true,
            metrics: healthMetrics,
            summary: {
                criticalAlerts,
                warningAlerts,
                overallStatus:
                    criticalAlerts > 0 ? 'critical' : warningAlerts > 0 ? 'warning' : 'healthy',
            },
        });
    } catch (error: any) {
        console.error('Error fetching system health:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    metric: z.string().min(1).max(120),
    value: z.number(),
    unit: z.string().max(40).optional(),
    threshold: z
        .object({
            warning: z.number().optional(),
            critical: z.number().optional(),
        })
        .optional(),
});

// POST is admin-only for now. In production a metrics emitter would normally
// use a shared-secret header instead — add when introducing observability.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const { metric, value, unit, threshold } = parsed.data;

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (threshold) {
            if (threshold.critical !== undefined && value >= threshold.critical) status = 'critical';
            else if (threshold.warning !== undefined && value >= threshold.warning) status = 'warning';
        }

        const healthMetric = await SystemHealth.create({
            metric,
            value,
            unit,
            status,
            threshold,
            timestamp: new Date(),
        });
        return NextResponse.json({ success: true, metric: healthMetric }, { status: 201 });
    } catch (error: any) {
        console.error('Error recording health metric:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
});
