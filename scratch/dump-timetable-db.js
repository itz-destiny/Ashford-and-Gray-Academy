const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  await client.connect();
  const db = client.db();
  const sessions = await db.collection('timetablesessions').find({}).toArray();
  console.log('total sessions in DB:', sessions.length);

  const byLecturer = {};
  for (const s of sessions) {
    byLecturer[s.lecturerName] = (byLecturer[s.lecturerName] || 0) + 1;
  }
  console.log(JSON.stringify(byLecturer, null, 1));

  const users = await db.collection('users').find({ role: { $in: ['instructor'] } }).project({ uid: 1, email: 1, displayName: 1 }).toArray();
  console.log('instructor accounts:', JSON.stringify(users, null, 1));

  const noCourse = sessions.filter(s => !s.courseId).length;
  console.log('sessions with no courseId:', noCourse);

  await client.close();
}
main().catch(e => { console.error(e); process.exit(1); });
