import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import mongoose from 'mongoose';

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    role: { type: String, default: 'student' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createSuperAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'myne.wilfred@ashfordandgrayfusionacademy.com';
    const password = 'Password123!';
    const displayName = 'Myne Wilfred';

    try {
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
            console.log('User already exists in Firebase Auth, updating password...');
            await auth.updateUser(userRecord.uid, { password, displayName });
        } catch (e) {
            console.log('Creating new user in Firebase Auth...');
            userRecord = await auth.createUser({
                email,
                password,
                displayName,
            });
        }

        const mongoUser = await User.findOneAndUpdate(
            { email },
            { 
                uid: userRecord.uid,
                email,
                displayName,
                role: 'admin'
            },
            { upsert: true, new: true }
        );

        console.log('Super Admin created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`MongoDB ID: ${mongoUser._id}`);
    } catch (e) {
        console.error('Error creating super admin:', e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createSuperAdmin();
