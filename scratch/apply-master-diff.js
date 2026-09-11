const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const data = require('./diff-result.json');
  const changed = data.changed;

  const toBlank = changed.filter(c => c.db.module && !c.master.module);
  const realReassign = changed.filter(c => (c.db.module || '') === (c.master.module || '') && (c.db.lecturerName || '') !== (c.master.lecturerName || '') && c.master.lecturerName !== 'Maimoona Salim');

  console.log('toBlank:', toBlank.length, 'realReassign:', realReassign.length);

  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  await client.connect();
  const db = client.db();
  const col = db.collection('timetablesessions');

  let blanked = 0;
  for (const c of toBlank) {
    const [sessionCode, startTimeIso] = c.key.split('|');
    const res = await col.updateOne(
      { sessionCode, startTime: new Date(startTimeIso) },
      {
        $set: { module: '', lecturerName: '' },
        $unset: { instructorUid: '', instructorEmail: '', courseId: '', courseTitle: '' },
      }
    );
    blanked += res.modifiedCount;
  }
  console.log('blanked:', blanked);

  const afy = { uid: 'Dyknh5ffNPTX202Kv8gOO2SDDMv1', email: 'afy.douglas@ashfordandgrayfusionacademy.com' };
  let reassigned = 0;
  for (const c of realReassign) {
    const [sessionCode, startTimeIso] = c.key.split('|');
    console.log('reassigning', sessionCode, startTimeIso, c.db.lecturerName, '->', c.master.lecturerName);
    const res = await col.updateOne(
      { sessionCode, startTime: new Date(startTimeIso) },
      { $set: { lecturerName: c.master.lecturerName, instructorUid: afy.uid, instructorEmail: afy.email } }
    );
    reassigned += res.modifiedCount;
  }
  console.log('reassigned:', reassigned);

  const total = await col.countDocuments({});
  console.log('total sessions now:', total);
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
