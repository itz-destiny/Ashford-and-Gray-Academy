import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Find users who have 'instructor' fields (like expertise or organization) but the role is 'student'
        const mislabeledInstructors = await User.find({
            role: 'student',
            $or: [
                { expertise: { $exists: true, $ne: "" } },
                { organization: { $exists: true, $ne: "" } }
            ]
        });

        const results = [];
        for (const user of mislabeledInstructors) {
            user.role = 'instructor';
            await user.save();
            results.push(user.email);
        }

        return NextResponse.json({
            message: `Successfully updated ${mislabeledInstructors.length} instructors`,
            updatedEmails: results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
