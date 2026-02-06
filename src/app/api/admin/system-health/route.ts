import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SystemHealth from '@/models/SystemHealth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const metric = searchParams.get('metric');
        const status = searchParams.get('status');
        const hours = parseInt(searchParams.get('hours') || '24');

        // Build query
        const query: any = {
            timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
        };
        if (metric) query.metric = metric;
        if (status) query.status = status;

        // Get latest health metrics
        const healthMetrics = await SystemHealth.find(query)
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();

        // Get critical alerts
        const criticalAlerts = await SystemHealth.countDocuments({
            status: 'critical',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        const warningAlerts = await SystemHealth.countDocuments({
            status: 'warning',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        return NextResponse.json({
            success: true,
            metrics: healthMetrics,
            summary: {
                criticalAlerts,
                warningAlerts,
                overallStatus: criticalAlerts > 0 ? 'critical' : warningAlerts > 0 ? 'warning' : 'healthy'
            }
        });

    } catch (error: any) {
        console.error('Error fetching system health:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Record health metric
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { metric, value, unit, threshold } = body;

        if (!metric || value === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Determine status based on thresholds
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (threshold) {
            if (threshold.critical && value >= threshold.critical) {
                status = 'critical';
            } else if (threshold.warning && value >= threshold.warning) {
                status = 'warning';
            }
        }

        const healthMetric = await SystemHealth.create({
            metric,
            value,
            unit,
            status,
            threshold,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            metric: healthMetric
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error recording health metric:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
