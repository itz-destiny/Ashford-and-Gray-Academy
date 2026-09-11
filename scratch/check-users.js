const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const EMAILS = [
  'saviourtaekor144@gmail.com',
  'Chistella46@gmail.com',
  'eyinareyid@gmail.com',
  'ibitoruhart71@gmail.com',
  'ibidag@yahoo.com'
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local. Please add it and retry.');
    process.exit(2);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db('ashford_gray');
    const users = db.collection('users');

    const docs = await users.find({ email: { $in: EMAILS } }).project({
      email: 1,
      displayName: 1,
      role: 1,
      emailVerified: 1,
      welcomeEmailSentAt: 1,
      createdAt: 1
    }).toArray();

    if (docs.length === 0) {
      console.log('No matching users found for the provided emails.');
    } else {
      console.log(`Found ${docs.length} user(s):\n`);
      for (const u of docs) {
        console.log('---');
        console.log(`email: ${u.email}`);
        console.log(`displayName: ${u.displayName || '<none>'}`);
        console.log(`role: ${u.role || '<none>'}`);
        console.log(`emailVerified: ${u.emailVerified === true ? 'yes' : 'no'}`);
        console.log(`welcomeEmailSentAt: ${u.welcomeEmailSentAt || '<not sent>'}`);
        console.log(`createdAt: ${u.createdAt || '<unknown>'}`);
      }
    }
  } catch (err) {
    console.error('Error connecting or querying MongoDB:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
