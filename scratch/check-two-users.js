const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const EMAILS = [
  'Chistella46@gmail.com',
  'tkalachiri001@gmail.com'
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(2);
  }

  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('ashford_gray');
  const users = db.collection('users');

  const docs = await users.find({ email: { $in: EMAILS } }).project({ email:1, displayName:1, role:1, emailVerified:1, welcomeEmailSentAt:1, createdAt:1, phone:1 }).toArray();

  for (const email of EMAILS) {
    const u = docs.find(d => d.email && d.email.toLowerCase() === email.toLowerCase());
    if (!u) {
      console.log(`${email}: NOT FOUND`);
    } else {
      console.log('---');
      console.log(`email: ${u.email}`);
      console.log(`displayName: ${u.displayName || '<none>'}`);
      console.log(`role: ${u.role || '<none>'}`);
      console.log(`phone: ${u.phone || '<none>'}`);
      console.log(`emailVerified: ${u.emailVerified === true ? 'yes' : 'no'}`);
      console.log(`welcomeEmailSentAt: ${u.welcomeEmailSentAt || '<not sent>'}`);
      console.log(`createdAt: ${u.createdAt || '<unknown>'}`);
    }
  }

  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
