import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            // If no UID provided, return all users (for admin usage)
            // In a real app, verify admin role here
            const users = await User.find({}).sort({ createdAt: -1 });
            return NextResponse.json(users);
        }

        let user = await User.findOne({ uid });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { uid, email, displayName, photoURL, role, bio, title, school, dateOfBirth, expertise, organization } = body;

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // upsert user
        const updateData: any = {
            uid,
            email,
            displayName: displayName || 'User',
            photoURL,
            bio,
            title,
            school,
            dateOfBirth,
            expertise,
            organization
        };

        // Only set role if provided, otherwise leave it (or set default on insert)
        if (role) {
            updateData.role = role;
        }

        const user = await User.findOneAndUpdate(
            { uid },
            {
                ...updateData,
                $setOnInsert: { role: 'student' } // fallback if role is missing on insert
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
