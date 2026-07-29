const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { Resend } = require('resend');

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Ashford & Gray Academy <onboarding@resend.dev>';
  const to = 'aesthetics6d@gmail.com';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: 'Welcome to Ashford & Gray Fusion Academy',
    html: '<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #0f172a;"><h2 style="color: #0B1F3A;">Welcome to Ashford & Gray Fusion Academy</h2><p>Dear user,</p><p>Welcome to Ashford & Gray Fusion Academy. Your account is now ready and your dashboard is waiting for you.</p><p>You can explore the full course catalogue, complete your profile, and register for upcoming programmes and events.</p><p style="margin-top: 24px;"><a href="https://www.ashfordandgrayfusionacademy.com/" style="background: #0B1F3A; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 999px; display: inline-block;">Open your dashboard</a></p><p style="margin-top: 24px; color: #475569; font-size: 14px;">Thank you,<br/>Ashford & Gray Fusion Academy</p></div>'
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
