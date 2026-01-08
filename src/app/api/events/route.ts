import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET() {
    try {
        await dbConnect();
        const events = await Event.find({});
        const eventsWithId = events.map(event => ({
            ...event.toObject(),
            id: event._id.toString()
        }));
        return NextResponse.json(eventsWithId);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
