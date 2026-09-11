const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { loadMaster } = require('./parse-master');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SERVICE_EXCELLENCE = { id: '6a75aaad7cc19b6ca1a85f95', title: 'Service Excellence' };
const HOSPITALITY_WORKFORCE = { id: '6a44e9f2bae728bb84e6764b', title: 'Hospitality Workforce Management' };
const STEVE = { uid: 'YAuuo3caloTxM40wd2Ofg2JhAR33', email: 'steve.onyebuchi@ashfordandgrayfusionacademy.com', name: 'Mr Steve Iyke Onyebuchi' };

async function main() {
  const data = require('./diff-result.json');
  const { changed, onlyInMaster } = data;

  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  await client.connect();
  const db = client.db();
  const col = db.collection('timetablesessions');

  let progUpdates = 0, lecUpdates = 0, skipped = 0;

  for (const c of changed) {
    const [sessionCode, startTimeIso] = c.key.split('|');
    const filter = { sessionCode, startTime: new Date(startTimeIso) };
    const set = {};

    const progChanged = (c.db.programmeName || '') !== (c.master.programmeName || '');
    const lecChanged = (c.db.lecturerName || '') !== (c.master.lecturerName || '');

    if (progChanged) {
      const oldProg = c.db.programmeName || '';
      if (oldProg === 'The Silent Standard Certification Program' || oldProg === 'The Silent Standard Certificate') {
        set.programmeName = SERVICE_EXCELLENCE.title;
        set.courseId = SERVICE_EXCELLENCE.id;
        set.courseTitle = SERVICE_EXCELLENCE.title;
        progUpdates++;
      } else if (oldProg === 'Hospitality Labour Management') {
        set.programmeName = HOSPITALITY_WORKFORCE.title;
        set.courseId = HOSPITALITY_WORKFORCE.id;
        set.courseTitle = HOSPITALITY_WORKFORCE.title;
        progUpdates++;
      } else {
        console.log('UNKNOWN programme change, skipping:', oldProg, '->', c.master.programmeName, sessionCode);
        skipped++;
      }
    }

    if (lecChanged) {
      const oldLec = c.db.lecturerName || '';
      if (oldLec === 'Dr Salim Maimoona') {
        set.lecturerName = 'Maimoona Salim';
        lecUpdates++;
      } else if (oldLec === 'Charles Nwonu FCA') {
        set.lecturerName = STEVE.name;
        set.instructorUid = STEVE.uid;
        set.instructorEmail = STEVE.email;
        lecUpdates++;
      } else {
        console.log('UNKNOWN lecturer change, skipping:', oldLec, '->', c.master.lecturerName, sessionCode);
        skipped++;
      }
    }

    if (Object.keys(set).length > 0) {
      await col.updateOne(filter, { $set: set });
    }
  }

  console.log('programme reassignments applied:', progUpdates);
  console.log('lecturer changes applied:', lecUpdates);
  console.log('skipped (unrecognized):', skipped);

  // Insert the one new session from the master workbook not yet in the DB.
  let inserted = 0;
  for (const m of onlyInMaster) {
    const exists = await col.findOne({ sessionCode: m.sessionCode, startTime: new Date(m.startTime) });
    if (exists) continue;
    await col.insertOne({
      weekCode: m.weekCode,
      day: m.day,
      sessionCode: m.sessionCode,
      date: new Date(m.date),
      startTime: new Date(m.startTime),
      endTime: new Date(m.endTime),
      programmeName: m.programmeName,
      module: m.module || '',
      lecturerName: m.lecturerName || '',
      status: 'unassigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    inserted++;
  }
  console.log('new sessions inserted:', inserted);

  const total = await col.countDocuments({});
  console.log('total sessions now:', total);
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
