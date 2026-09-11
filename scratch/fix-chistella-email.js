const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { Resend } = require('resend');
const admin = require('firebase-admin');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const OLD_EMAIL = 'Schistella46@gmail.com';
const NEW_EMAIL = 'Chistella46@gmail.com';
const DISPLAY_NAME = 'Stella Chidera Ebere-Smile';
const PHONE = '08140346340';
const LOGIN_URL = 'https://ashfordandgrayfusionacademy.com';

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
if (!process.env.EMAIL_FROM) {
  console.error('EMAIL_FROM missing in .env.local');
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

  // Find user by old or new email
  const existingNew = await users.findOne({ email: NEW_EMAIL });
  if (existingNew) {
    console.log(`${NEW_EMAIL} already exists in DB; nothing to change.`);
    await client.close();
    return;
  }

  const existingOld = await users.findOne({ email: OLD_EMAIL });
  if (!existingOld) {
    console.log(`${OLD_EMAIL} not found in DB. Creating a new record for ${NEW_EMAIL}.`);
  }

  // Try to find Firebase user by old email
  let fbUser;
  try {
    fbUser = await admin.auth().getUserByEmail(OLD_EMAIL);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.error('Error looking up Firebase user by old email:', err);
      await client.close();
      process.exit(1);
    }
  }

  const tempPwd = genPassword();
  try {
    if (fbUser) {
      // Update Firebase user email and password
      await admin.auth().updateUser(fbUser.uid, { email: NEW_EMAIL, emailVerified: true, password: tempPwd });
      console.log(`Updated Firebase user email from ${OLD_EMAIL} to ${NEW_EMAIL}`);
    } else {
      // Create new Firebase user
      const e164 = PHONE.startsWith('0') ? `+234${PHONE.slice(1)}` : PHONE;
      fbUser = await admin.auth().createUser({ email: NEW_EMAIL, password: tempPwd, emailVerified: true, displayName: DISPLAY_NAME, phoneNumber: e164 });
      console.log(`Created Firebase user for ${NEW_EMAIL}`);
    }

    // Update Mongo record: set email to NEW_EMAIL (upsert)
    await users.updateOne(
      { email: OLD_EMAIL },
      {
        $set: {
          uid: fbUser.uid,
          email: NEW_EMAIL,
          displayName: DISPLAY_NAME,
          role: existingOld?.role || 'student',
          phone: PHONE,
          emailVerified: true,
          mustChangePassword: true,
          welcomeEmailSentAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // Also, if there was a separate doc with NEW_EMAIL, remove old doc
    if (existingOld) {
      // remove the old document keyed by OLD_EMAIL if any left
      await users.deleteOne({ email: OLD_EMAIL, _id: existingOld._id });
    }

    // Send welcome email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; padding:24px; color:#0f172a;">
        <h2 style="color:#0B1F3A;">Welcome to Ashford & Gray Fusion Academy</h2>
        <p>Dear ${DISPLAY_NAME},</p>
        <p>Your account has been created. Use the credentials below to sign in:</p>
        <p><strong>Login URL:</strong> <a href="${LOGIN_URL}">${LOGIN_URL}</a></p>
        <p><strong>Email:</strong> ${NEW_EMAIL}</p>
        <p><strong>Temporary password:</strong> ${tempPwd}</p>
        <p>Please sign in and change your password immediately. Your account will prompt you to change it on first login.</p>
        <p style="margin-top:24px;color:#475569;font-size:14px;">Thank you,<br/>Ashford & Gray Fusion Academy</p>
      </div>
    `;

    const res = await resend.emails.send({ from: process.env.EMAIL_FROM, to: NEW_EMAIL, subject: 'Your Ashford & Gray Fusion Academy account', html });
    if (res.error) {
      console.error('Send failed:', res.error);
    } else {
      console.log(`Sent production welcome email to ${NEW_EMAIL}`);
      console.log('Temporary password:', tempPwd);
    }
  } catch (err) {
    console.error('Error updating/creating user:', err);
  } finally {
    await client.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
