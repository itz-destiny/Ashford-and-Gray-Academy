// Marks an exam "admin only" (only the admin can monitor it). Usage: ... <slug> [true|false]
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Assessment from '../src/models/Assessment';
async function main() {
  await dbConnect();
  const [slug, flag = 'true'] = process.argv.slice(2);
  const r = await Assessment.updateOne({ slug }, { $set: { adminOnly: flag === 'true' } });
  const a: any = await Assessment.findOne({ slug }).select('title adminOnly proctorLiveClassId').lean();
  console.log(r.matchedCount, JSON.stringify(a));
  await mongoose.disconnect();
}
main();
