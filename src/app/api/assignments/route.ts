import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Assignment, Submission } from '@/models/Supports';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const moduleId = searchParams.get('moduleId');
        const assignmentId = searchParams.get('assignmentId');
        const userId = searchParams.get('userId');

        if (assignmentId) {
            if (userId) {
                // Fetch submission for specific assignment and user
                const submission = await Submission.findOne({ assignmentId, userId });
                return NextResponse.json(submission);
            }
            const assignment = await Assignment.findById(assignmentId);
            return NextResponse.json(assignment);
        }

        const query: any = {};
        if (courseId) query.courseId = courseId;
        if (moduleId) query.moduleId = moduleId;

        const assignments = await Assignment.find(query).sort({ createdAt: 1 });
        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { type, data } = body; // type: 'assignment' or 'submission'

        if (type === 'assignment') {
            const assignment = await Assignment.create(data);
            return NextResponse.json(assignment);
        } else if (type === 'submission') {
            const submission = await Submission.create(data);
            return NextResponse.json(submission);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { type, id, data } = body;

        if (type === 'assignment') {
            const updated = await Assignment.findByIdAndUpdate(id, data, { new: true });
            return NextResponse.json(updated);
        } else if (type === 'submission') {
            // Grading
            const updated = await Submission.findByIdAndUpdate(id, data, { new: true });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        if (type === 'assignment') {
            await Assignment.findByIdAndDelete(id);
            await Submission.deleteMany({ assignmentId: id });
            return NextResponse.json({ message: 'Assignment deleted' });
        }

        return NextResponse.json({ error: 'Invalid type/id' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
