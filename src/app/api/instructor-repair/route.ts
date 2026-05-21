import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { assertDevEndpointAllowed } from '@/lib/dev-only';

// Reclassifies users that have instructor-shaped fields (expertise /
// organization) but were saved as students. Dev-only, admin-only.
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
        const mislabeledInstructors = await User.find({
            role: 'student',
            $or: [
                { expertise: { $exists: true, $ne: '' } },
                { organization: { $exists: true, $ne: '' } },
            ],
        });

        const updatedEmails: string[] = [];
        for (const user of mislabeledInstructors) {
            user.role = 'instructor';
            await user.save();
            updatedEmails.push(user.email);
        }

        return NextResponse.json({
            message: `Successfully updated ${mislabeledInstructors.length} instructors`,
            updatedEmails,
        });
    } catch (error: any) {
        console.error('instructor-repair failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
