// 17 Nov 2026 (approved): removes the older test/demo accounts (list C).
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import User from '../src/models/User';
import Enrollment from '../src/models/Enrollment';
import Attempt from '../src/models/Attempt';
import { adminAuth } from '../src/lib/firebase-admin';
const EMAILS = ['test.registrar@ashfordandgrayfusionacademy.com','test.courseregistrar@ashfordandgrayfusionacademy.com','qa-course-registrar-temp@ashfordandgrayfusionacademy.com','demo.instructor@ashfordandgrayfusionacademy.com','demo.student@ashfordandgrayfusionacademy.com'];
async function main(){ await dbConnect();
  for (const email of EMAILS) {
    const u:any = await User.findOne({ email }).lean();
    let uid = u?.uid;
    if (!uid) { try { uid = (await adminAuth().getUserByEmail(email)).uid; } catch { console.log('not found', email); continue; } }
    const a = await Attempt.deleteMany({ userId: uid }); const e = await Enrollment.deleteMany({ userId: uid });
    await User.deleteOne({ uid });
    try { await adminAuth().deleteUser(uid); } catch (err:any) { if (err.code !== 'auth/user-not-found') throw err; }
    console.log('deleted', email, '| attempts', a.deletedCount, '| enrollments', e.deletedCount);
  }
  console.log('left:', await User.countDocuments({ email: { $in: EMAILS } }));
  await mongoose.disconnect(); }
main().catch(e=>{console.error(e);process.exit(1);});
