const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { Resend } = require('resend');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const EMAIL = 'ibidag@yahoo.com';
const TEMP_PWD = 'BEgsaPXF9moB'; // provided
const LOGIN_URL = 'https://ashfordandgrayfusionacademy.com';

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

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('ashford_gray');
  const users = db.collection('users');

  const profile = await users.findOne({ email: EMAIL });
  const displayName = profile?.displayName || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; padding:24px; color:#0f172a;">
      <h2 style="color:#0B1F3A;">Welcome to Ashford & Gray Fusion Academy</h2>
      <p>Dear ${displayName || EMAIL.split('@')[0]},</p>
      <p>Your account has been created. Use the credentials below to sign in:</p>
      <p><strong>Login URL:</strong> <a href="${LOGIN_URL}">${LOGIN_URL}</a></p>
      <p><strong>Email:</strong> ${EMAIL}</p>
      <p><strong>Temporary password:</strong> ${TEMP_PWD}</p>
      <p>Please sign in and change your password immediately. Your account will prompt you to change it on first login.</p>
      <p style="margin-top:24px;color:#475569;font-size:14px;">Thank you,<br/>Ashford & Gray Fusion Academy</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: EMAIL,
      subject: 'Your Ashford & Gray Fusion Academy account',
      html,
    });

    if (result.error) {
      console.error('Send failed:', result.error);
    } else {
      console.log(`Sent production welcome email to ${EMAIL}`);
      await users.updateOne({ email: EMAIL }, { $set: { welcomeEmailSentAt: new Date(), mustChangePassword: true } }, { upsert: true });
      console.log('Updated DB welcomeEmailSentAt and mustChangePassword.');
    }
  } catch (err) {
    console.error('Error sending email:', err);
  } finally {
    await client.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
