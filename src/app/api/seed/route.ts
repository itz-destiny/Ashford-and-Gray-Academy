import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Event from '@/models/Event';
import { coursesToSeed, eventsToSeed } from '@/lib/data';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing data
        await Course.deleteMany({});
        await Event.deleteMany({});

        // Seed data
        await Course.insertMany(coursesToSeed);
        await Event.insertMany(eventsToSeed);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
