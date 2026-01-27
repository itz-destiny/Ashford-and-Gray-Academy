import dbConnect from './src/lib/mongodb';
import User from './src/models/User';

async function fixRoles() {
    try {
        await dbConnect();
        console.log('Connected to MongoDB.');

        // Find users who have 'instructor' fields (like expertise or organization) but the role is 'student'
        const mislabeledInstructors = await User.find({
            role: 'student',
            $or: [
                { expertise: { $exists: true, $ne: "" } },
                { organization: { $exists: true, $ne: "" } }
            ]
        });

        console.log(`Found ${mislabeledInstructors.length} users to update.`);

        for (const user of mislabeledInstructors) {
            console.log(`Updating user: ${user.email} -> instructor`);
            user.role = 'instructor';
            await user.save();
        }

        console.log('Fix complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing roles:', err);
        process.exit(1);
    }
}

fixRoles();
