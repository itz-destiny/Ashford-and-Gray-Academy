import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const email = 'myne.wilfred@ashfordandgrayfusionacademy.com';
        const password = 'Password123!';
        const displayName = 'Myne Wilfred';
        
        await dbConnect();
        
        let userRecord;
        try {
            userRecord = await adminAuth().getUserByEmail(email);
            console.log('User exists in Firebase Auth. Updating password...');
            await adminAuth().updateUser(userRecord.uid, { password, displayName });
        } catch (e: any) {
            console.log('User not found in Firebase Auth. Creating...', e.message);
            userRecord = await adminAuth().createUser({
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
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        return NextResponse.json({ 
            success: true, 
            message: 'Super Admin created successfully!',
            email,
            password,
            mongoId: mongoUser._id
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
