import dbConnect from './src/lib/mongodb.js';
import mongoose from 'mongoose';

// Define User Schema if model import fails (common in standalone scripts)
const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function promoteAdmin(email) {
    try {
        await dbConnect();
        console.log('Connected to MongoDB.');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${email} to admin.`);
        process.exit(0);
    } catch (err) {
        console.error('Error promoting admin:', err);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.error('Usage: node promote-admin.mjs <email>');
    process.exit(1);
}

promoteAdmin(email);
