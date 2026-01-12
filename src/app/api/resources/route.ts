import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Resource } from '@/models/Supports';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        const query: any = {};
        if (courseId) query.courseId = courseId;

        const resources = await Resource.find(query).populate('courseId').sort({ createdAt: -1 });
        return NextResponse.json(resources);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const data = await request.json();
        const resource = await Resource.create(data);
        return NextResponse.json(resource);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
