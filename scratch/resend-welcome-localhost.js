const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { Resend } = require('resend');
const admin = require('firebase-admin');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const EMAILS = [
  'saviourtaekor144@gmail.com',
  'eyinareyid@gmail.com',
  'ibitoruhart71@gmail.com',
  'ibidag@yahoo.com'
];

function readPem(raw) {
  if (!raw) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY missing');
  return raw.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
}

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error('Missing Firebase admin credentials in .env.local');
  process.exit(2);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: readPem(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  }),
});

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI missing in .env.local');
  process.exit(2);
}

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY missing in .env.local');
  process.exit(2);
}

const resend = new Resend(process.env.RESEND_API_KEY);

function genPassword() {
  return crypto.randomBytes(9).toString('base64').replace(/\+/g, 'A').replace(/\//g, 'B').slice(0, 12);
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('ashford_gray');
  const users = db.collection('users');

  for (const email of EMAILS) {
    try {
      const tempPwd = genPassword();
      let fbUser;
      try {
        fbUser = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(fbUser.uid, { password: tempPwd });
        console.log(`Updated Firebase user password for ${email}`);
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
          fbUser = await admin.auth().createUser({ email, password: tempPwd, emailVerified: true });
          console.log(`Created Firebase user for ${email}`);
        } else {
          throw err;
        }
      }

      // Ensure Mongo profile exists and mark mustChangePassword
      const profile = await users.findOne({ email });
      const displayName = profile?.displayName || '';
      await users.updateOne(
        { email },
        {
          $set: {
            uid: fbUser.uid,
            email,
            displayName: displayName || '',
            role: profile?.role || 'student',
            emailVerified: true,
            mustChangePassword: true,
            welcomeEmailSentAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      const name = displayName || email.split('@')[0];
      const loginUrl = 'http://localhost:9002';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; padding:24px; color:#0f172a;">
          <h2 style="color:#0B1F3A;">Welcome to Ashford & Gray Fusion Academy</h2>
          <p>Dear ${name},</p>
          <p>Your account has been created. Use the credentials below to sign in to the local development site:</p>
          <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary password:</strong> ${tempPwd}</p>
          <p>Please sign in and change your password immediately. Your account will prompt you to change it on first login.</p>
          <p style="margin-top:24px;color:#475569;font-size:14px;">Thank you,<br/>Ashford & Gray Fusion Academy</p>
        </div>
      `;

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your Ashford & Gray Fusion Academy (local) account',
        html,
      });

      if (result.error) {
        console.error(`Failed to send email to ${email}:`, result.error);
      } else {
        console.log(`Sent welcome email to ${email}`);
      }
    } catch (err) {
      console.error(`Error processing ${email}:`, err);
    }
  }

  await client.close();
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
