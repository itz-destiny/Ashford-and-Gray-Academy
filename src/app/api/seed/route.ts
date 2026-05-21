import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Event from '@/models/Event';
import { Module, Lesson, Assignment } from '@/models/Supports';
import { coursesToSeed, eventsToSeed } from '@/lib/data';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { assertDevEndpointAllowed } from '@/lib/dev-only';

// Wipes and reseeds the database with sample courses, modules, lessons,
// assignments and events. This is a developer convenience and is only allowed
// outside production AND for admin callers.
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        assertDevEndpointAllowed();
        requireRole(auth, ['admin']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();

        await Course.deleteMany({});
        await Event.deleteMany({});
        await Module.deleteMany({});
        await Lesson.deleteMany({});
        await Assignment.deleteMany({});

        const createdCourses = await Course.insertMany(coursesToSeed);
        await Event.insertMany(eventsToSeed);

        for (let i = 0; i < Math.min(2, createdCourses.length); i++) {
            const course = createdCourses[i];
            const modulesData = [
                {
                    courseId: course._id,
                    title: 'Introduction & Foundations',
                    order: 1,
                    description: 'Master the core concepts and history.',
                },
                {
                    courseId: course._id,
                    title: 'Practical Implementation',
                    order: 2,
                    description: 'Hands-on techniques and standards.',
                },
                {
                    courseId: course._id,
                    title: 'Advanced Strategy & Leadership',
                    order: 3,
                    description: 'Elevating your professional standing.',
                },
            ];
            const createdModules = await Module.insertMany(modulesData);

            for (const mod of createdModules) {
                await Lesson.insertMany([
                    {
                        moduleId: mod._id,
                        title: `${mod.title} - Overview`,
                        content:
                            'In this lesson, we will cover the fundamental pillars of this module.',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        duration: 15,
                        order: 1,
                        isLive: false,
                    },
                    {
                        moduleId: mod._id,
                        title: `${mod.title} - Deep Dive`,
                        content:
                            'This lesson explores the practical applications and nuances of the subject matter.',
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        duration: 30,
                        order: 2,
                        isLive: false,
                    },
                    {
                        moduleId: mod._id,
                        title: `${mod.title} - Interactive Q&A (Live)`,
                        content:
                            'Join the instructor for a live session to discuss questions and real-world scenarios.',
                        duration: 45,
                        order: 3,
                        isLive: true,
                        scheduledAt: new Date(Date.now() + 86400000),
                    },
                ]);
            }

            await Assignment.insertMany([
                {
                    courseId: course._id,
                    title: 'Institutional Standards Essay',
                    description: 'Discuss the role of professional standards in luxury hospitality.',
                    dueDate: new Date(Date.now() + 86400000 * 3),
                    points: 100,
                },
                {
                    courseId: course._id,
                    title: 'Practical Housekeeping Simulation',
                    description:
                        'Submit a video of your bed-making technique according to Ashford standards.',
                    dueDate: new Date(Date.now() + 86400000 * 7),
                    points: 150,
                },
            ]);
        }

        return NextResponse.json({
            message: 'Database seeded successfully with Courses, Modules, and Lessons.',
            coursesCount: createdCourses.length,
        });
    } catch (error: any) {
        console.error('SEED ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
