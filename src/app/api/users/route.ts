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

        const user = await User.findOne({ uid });

        if (!user) {
            console.warn(`GET /api/users: User with UID ${uid} not found in DB`);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        console.log(`GET /api/users: Found user ${user.email} with role ${user.role}`);
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

        // Important: Explicitly set role if it's passed, otherwise let MongoDB use default for NEW users
        if (email === 'admin@ashfordgrayfusionacademy.com') {
            updateData.role = 'admin';
            console.log(`POST /api/users: Auto-promoting ${email} to admin`);
        } else if (role) {
            updateData.role = role;
            console.log(`POST /api/users: Setting role to ${role} for user ${email}`);
        }

        const user = await User.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`POST /api/users: Upserted user ${user.email}, final role in DB: ${user.role}`);
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
