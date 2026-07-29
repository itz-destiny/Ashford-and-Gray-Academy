const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { MongoClient, ObjectId } = require('mongodb');
const { Resend } = require('resend');

async function main() {
  const uri = process.env.MONGODB_URI;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Ashford & Gray Academy <onboarding@resend.dev>';

  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  const resend = new Resend(apiKey);

  try {
    await client.connect();
    const db = client.db('ashford_gray');
    const users = db.collection('users');

    const candidates = await users.find({
      email: { $exists: true, $ne: '' },
      $or: [
        { welcomeEmailSentAt: { $exists: false } },
        { welcomeEmailSentAt: null }
      ]
    }).project({ _id: 1, email: 1, displayName: 1, role: 1 }).toArray();

    console.log(`Found ${candidates.length} registered user(s) without a welcome email record.`);

    if (candidates.length === 0) {
      return;
    }

    for (const user of candidates) {
      const name = (user.displayName || user.email.split('@')[0] || 'there').toString();
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #0f172a;">
          <h2 style="color: #0B1F3A;">Welcome to Ashford & Gray Fusion Academy</h2>
          <p>Dear ${name},</p>
          <p>Welcome to Ashford & Gray Fusion Academy. Your account is now ready, and your dashboard is waiting for you.</p>
          <p>You can explore the full course catalogue, complete your profile, and register for upcoming programmes and events.</p>
          <p style="margin-top: 24px;"><a href="http://localhost:9002/dashboard" style="background: #0B1F3A; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 999px; display: inline-block;">Open your dashboard</a></p>
          <p style="margin-top: 24px; color: #475569; font-size: 14px;">Thank you,<br/>Ashford & Gray Fusion Academy</p>
        </div>
      `;

      const result = await resend.emails.send({
        from,
        to: user.email,
        subject: 'Welcome to Ashford & Gray Fusion Academy',
        html
      });

      if (result.error) {
        console.error(`Failed for ${user.email}:`, result.error);
      } else {
        console.log(`Sent welcome email to ${user.email} (${result.data?.id || 'no-id'})`);
        await users.updateOne(
          { _id: user._id },
          { $set: { welcomeEmailSentAt: new Date() } }
        );
      }
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
