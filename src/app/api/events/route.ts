import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Registration from '@/models/Registration';

export async function GET() {
    try {
        await dbConnect();
        const [events, registrations] = await Promise.all([
            Event.find({}),
            Registration.find({})
        ]);

        const regCounts = registrations.reduce((acc: any, reg: any) => {
            const eid = reg.eventId.toString();
            acc[eid] = (acc[eid] || 0) + 1;
            return acc;
        }, {});

        const eventsWithData = events.map(event => ({
            ...event.toObject(),
            id: event._id.toString(),
            registrationCount: regCounts[event._id.toString()] || 0
        }));
        return NextResponse.json(eventsWithData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
