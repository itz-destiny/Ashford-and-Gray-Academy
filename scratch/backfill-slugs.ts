// Gives every assessment a readable link name (/exam/<slug>). Safe to re-run.
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Assessment from '../src/models/Assessment';
import { slugify, uniqueSlug } from '../src/lib/assessment-slug';
const FIXED: Record<string, string> = {
  '6af5c01cb174ceb1bfdb2fe1': 'hospitality-management',   // 6pm pilot exam
  '6af5ea66710233413e008e4a': 'my-phone-test',            // Destiny's phone test
};
async function main() {
  await dbConnect();
  await Assessment.syncIndexes();
  const all: any[] = await Assessment.find({}).sort({ createdAt: 1 });
  for (const a of all) {
    const want = FIXED[String(a._id)];
    if (want) a.slug = await uniqueSlug(want, String(a._id));
    else if (!a.slug) a.slug = await uniqueSlug(slugify(a.title), String(a._id));
    await a.save();
    console.log(a.slug.padEnd(48), a.status.padEnd(10), a.type.padEnd(5), a.title);
  }
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
