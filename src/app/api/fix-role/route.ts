
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        const email = 'johngin@gmail.com';
        
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'instructor' },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: `User ${email} not found in database. Please log in first.` }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'SUCCESS: User role updated to instructor',
            user: {
                uid: user.uid,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
