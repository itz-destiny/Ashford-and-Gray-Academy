import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Module, Lesson } from '@/models/Supports';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const courseId = params.id;

        const modules = await Module.find({ courseId }).sort({ order: 1 });
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });

        return NextResponse.json({ modules, lessons });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const courseId = params.id;
        const body = await request.json();
        const { type, data } = body; // type: 'module' or 'lesson'

        if (type === 'module') {
            const lastModule = await Module.findOne({ courseId }).sort({ order: -1 });
            const order = lastModule ? lastModule.order + 1 : 1;
            const module = await Module.create({ ...data, courseId, order });
            return NextResponse.json(module);
        } else if (type === 'lesson') {
            const { moduleId } = data;
            const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 });
            const order = lastLesson ? lastLesson.order + 1 : 1;
            const lesson = await Lesson.create({ ...data, order });
            return NextResponse.json(lesson);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const body = await request.json();
        const { type, id, data } = body;

        if (type === 'module') {
            const updatedModule = await Module.findByIdAndUpdate(id, data, { new: true });
            return NextResponse.json(updatedModule);
        } else if (type === 'lesson') {
            const updatedLesson = await Lesson.findByIdAndUpdate(id, data, { new: true });
            return NextResponse.json(updatedLesson);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        if (type === 'module') {
            await Module.findByIdAndDelete(id);
            // Also delete lessons in this module
            await Lesson.deleteMany({ moduleId: id });
            return NextResponse.json({ message: 'Module deleted' });
        } else if (type === 'lesson') {
            await Lesson.findByIdAndDelete(id);
            return NextResponse.json({ message: 'Lesson deleted' });
        }

        return NextResponse.json({ error: 'Invalid type/id' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
