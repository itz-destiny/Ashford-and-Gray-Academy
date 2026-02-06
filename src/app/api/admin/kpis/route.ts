import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Get date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Parallel queries for performance
        const [
            totalStudents,
            totalInstructors,
            totalCourses,
            totalEvents,
            activeStudents,
            todayRevenue,
            weekRevenue,
            monthRevenue,
            completedEnrollments,
            totalEnrollments,
            failedTransactions,
            pendingPayouts,
            churnRate
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'instructor' }),
            Course.countDocuments(),
            Event.countDocuments(),
            User.countDocuments({ role: 'student', updatedAt: { $gte: thisWeek } }),
            Transaction.aggregate([
                { $match: { type: 'enrollment', status: 'completed', createdAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { type: 'enrollment', status: 'completed', createdAt: { $gte: thisWeek } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { type: 'enrollment', status: 'completed', createdAt: { $gte: thisMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Enrollment.countDocuments({ status: 'completed' }),
            Enrollment.countDocuments(),
            Transaction.countDocuments({ status: 'failed', createdAt: { $gte: today } }),
            Transaction.countDocuments({ type: 'payout', status: 'pending' }),
            User.countDocuments({ role: 'student', updatedAt: { $lt: lastMonth } })
        ]);

        const completionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        const churnPercentage = totalStudents > 0
            ? Math.round((churnRate / totalStudents) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            kpis: {
                // User metrics
                totalStudents,
                totalInstructors,
                activeStudents,
                totalCourses,
                totalEvents,

                // Revenue metrics
                revenue: {
                    today: todayRevenue[0]?.total || 0,
                    week: weekRevenue[0]?.total || 0,
                    month: monthRevenue[0]?.total || 0
                },

                // Performance metrics
                completionRate,
                churnRate: churnPercentage,

                // Financial health
                failedTransactions,
                pendingPayouts,

                // Enrollments
                totalEnrollments,
                completedEnrollments
            },
            timestamp: new Date()
        });

    } catch (error: any) {
        console.error('Error fetching admin KPIs:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
