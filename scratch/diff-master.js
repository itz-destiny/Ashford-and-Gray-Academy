const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { loadMaster } = require('./parse-master');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const master = loadMaster(path.join(__dirname, '..', 'public', 'Ashford_Gray_Fusion_Academy_Timetable_Certificate_Workbook Updated (1).xlsx'));

  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  await client.connect();
  const db = client.db();
  const dbDocs = await db.collection('timetablesessions').find({}).toArray();
  await client.close();

  const key = (sessionCode, startTime) => sessionCode + '|' + new Date(startTime).toISOString();

  const masterMap = new Map();
  for (const m of master) masterMap.set(key(m.sessionCode, m.startTime), m);

  const dbMap = new Map();
  for (const d of dbDocs) dbMap.set(key(d.sessionCode, d.startTime), d);

  console.log('master keys:', masterMap.size, 'db keys:', dbMap.size);

  const onlyInMaster = [];
  const onlyInDb = [];
  const changed = [];
  const unchanged = [];

  for (const [k, m] of masterMap) {
    const d = dbMap.get(k);
    if (!d) { onlyInMaster.push(m); continue; }
    const lecDiff = (d.lecturerName || '') !== (m.lecturerName || '');
    const modDiff = (d.module || '') !== (m.module || '');
    const progDiff = (d.programmeName || '') !== (m.programmeName || '');
    if (lecDiff || modDiff || progDiff) {
      changed.push({ key: k, db: { programmeName: d.programmeName, module: d.module, lecturerName: d.lecturerName }, master: { programmeName: m.programmeName, module: m.module, lecturerName: m.lecturerName } });
    } else {
      unchanged.push(k);
    }
  }
  for (const [k, d] of dbMap) {
    if (!masterMap.has(k)) onlyInDb.push({ sessionCode: d.sessionCode, startTime: d.startTime, programmeName: d.programmeName, module: d.module, lecturerName: d.lecturerName });
  }

  console.log('unchanged:', unchanged.length);
  console.log('changed:', changed.length);
  console.log('onlyInMaster (new, not in DB):', onlyInMaster.length);
  console.log('onlyInDb (in DB, not in new master):', onlyInDb.length);

  require('fs').writeFileSync(path.join(__dirname, 'diff-result.json'), JSON.stringify({ changed, onlyInMaster, onlyInDb }, null, 1));
}

main().catch(e => { console.error(e); process.exit(1); });
