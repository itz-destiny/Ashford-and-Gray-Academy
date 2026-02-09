import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MeetingLog from '@/models/MeetingLog';

// GET - Fetch meeting logs
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');
        const meetingId = searchParams.get('meetingId');

        const query: any = {};
        if (conversationId) query.conversationId = conversationId;
        if (meetingId) query.meetingId = meetingId;

        const logs = await MeetingLog.find(query).sort({ startTime: -1 });
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create or Update a meeting log
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { meetingId, action, ...data } = body;

        if (!meetingId) {
            return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
        }

        if (action === 'start') {
            const log = await MeetingLog.create({
                meetingId,
                ...data,
                startTime: new Date(),
                status: 'active'
            });
            return NextResponse.json(log);
        }

        if (action === 'end') {
            const endTime = new Date();
            const log = await MeetingLog.findOne({ meetingId });

            if (!log) {
                return NextResponse.json({ error: 'Meeting log not found' }, { status: 404 });
            }

            const startTime = new Date(log.startTime);
            const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

            const updatedLog = await MeetingLog.findOneAndUpdate(
                { meetingId },
                {
                    status: 'completed',
                    endTime,
                    durationMinutes,
                    ...data
                },
                { new: true }
            );
            return NextResponse.json(updatedLog);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
