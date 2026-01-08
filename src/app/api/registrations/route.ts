import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Event from '@/models/Event';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const registrations = await Registration.find({ userId }).populate('eventId').exec();

        const formattedRegistrations = registrations.map(reg => ({
            id: reg._id,
            userId: reg.userId,
            eventId: reg.eventId._id,
            registeredAt: reg.registeredAt,
            event: reg.eventId,
        }));

        return NextResponse.json(formattedRegistrations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, eventId } = await request.json();
        await dbConnect();

        const existing = await Registration.findOne({ userId, eventId });
        if (existing) {
            return NextResponse.json({ message: 'Already registered' });
        }

        const registration = await Registration.create({
            userId,
            eventId,
        });

        return NextResponse.json(registration);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
