import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

console.log('Connecting...');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
console.log('Connected.');

const { default: User } = await import('../src/models/User.ts');
const { default: Enrollment } = await import('../src/models/Enrollment.ts');
const { default: Course } = await import('../src/models/Course.ts');

function cleanEmail(raw) {
  return String(raw || '').trim().replace(/^:+/, '').replace(/\s+/g, '').replace(/[.,;:]+$/, '').replace(/@gamil\.com$/i, '@gmail.com').toLowerCase();
}

const HGRM = [
  ['Adolphus Salome Ibikinibari', 'salomeadolphus65@gmail.com'],
  ['Akwu Victoria Izichi', ':izichiakwu@gmail.com'],
  ['Amb Fabian Braide Chukwu', 'fabianchukwu48@gmail.com'],
  ['Anyanwu Onyedikachi Judith', 'anyanwuroyalty@gmail.com'],
  ['Augustus Ye-Oritonipiri Tamunonimiteim', 'yeoritonipiria@gmail.com'],
  ['Banigo, Felicia Felix', 'feliciabanigo12@gmail.com'],
  ['Chieme Precious Nnendah', 'diedubaby@gmail.com'],
  ['Esor Angel Prince', 'angeluesor@gmail.com'],
  ['Esther Williams', 'estywillsjohn@gmail.com'],
  ['Gabriel Ruth Ibim', 'ibimruth@gmail.com'],
  ['Ibiso Opualapuye Dappa', 'ibiso0536@gmail.com'],
  ['Jovita Jude', 'Jovitajude1@gmail.com'],
  ['Mac-David Iheanacho David', 'iheanachomacdavid@gmail.com'],
  ['Janet Izu Mitoun', 'janetizu5@gmail.com'],
  ['Jinyebarimiema Daminabo Dickson', 'dicmatconcept@gmail.com.'],
  ['Jonathan Ayibakuro Woko', 'wokojonathan3@gmail.com'],
  ['Kobani Evans Legborsi', 'evanskel84@gmail.com'],
  ['Lasbury Silas Ibifa-A', 'lasburysilas@gmail.com'],
  ['Lovegod Chimezunim', 'gj56836@gmail.com'],
  ['Nevi Efezino Idahosa', 'neviokpeva@gmail.com'],
  ['Nnordee, Joseph Meelubari', 'josephnnordee@gmail.com'],
  ['Nwachukwu Good Luck', 'chikapride4real@gmail.com'],
  ['Ozori Ibinabo Marvelous', 'ibinaboozori@gmail.com'],
  ['Precious Chisa', 'preciouschisa147@gmail.com'],
  ['Siko Elijahba Furotubo', 'Sikoelija87@gmail.com'],
  ['Simon Wilfred Emmanuel', 'reachwilfred8702@gmail.com'],
  ['Stella Wori Opuruiche Amesi', 'stellaworiamesi@gmail.com'],
];

const HM = [
  ['Antoinette Peculiar Ebhodaghe', 'antoinetteebhodaghe634@gmail.com'],
  ['Ashiri Stella Nnenna', 'ashiristella6@gmail.com'],
  ['Belema Omogbai', 'belemaomogbai@gmail.com'],
  ['Bupo Wisdom Nengia', 'wisdombupo@gmail.com'],
  ['Chinwo Queen', 'chinwo120@gmail.com'],
  ['Eluke Joy Chisa', 'joyeluke45@gmail.com'],
  ['Favour Chukwuma', 'favourchukwuma@gmail.com'],
  ['Fidelis Chukwudi Badu', 'fidelisbadu12@gmail.com'],
  ['Godswill Oscar Olaka', 'godswilloscarolaka@gmail.com'],
  ['Goodluck Paul Ogan', 'gbliss701@gmail.com'],
  ['Grace Siere', 'greasegrease7@gmail.com'],
  ['Igbanor Samuel Chidera', 'oluwasammy97@gamil.com'],
  ['Ikenna Chukwudi Dimkpa', 'ikennadimkpa@gmail.com'],
  ['Jesse Akayoogo', 'akayoogonwineekedu@gmail.com'],
  ['Leka Nora Lawrence', 'noranne1604@gmail.com'],
  ['Lugard Miebaka Tamuno', 'tamunomiebakalugard@gmail.com'],
  ['Michael Kalio', 'michaelkalio42@gmail.com'],
  ['Nengi John Tamuno', 'nengijohntamuno@gmail.com'],
  ["Odekwano God'Sgift Alali", 'odekwanogodsgiftalali@gmail.com'],
  ['Okonu Akachukwu David', 'okonuakachukwu@gmail.com'],
  ['Peter Wigwe', 'peter.wigwe4real@gmail.com'],
  ['Precious Okachi', 'preciousokachi4@gmail.com'],
  ['Reuben Peter Chioduye', 'reubenpeter98@gmail.com'],
  ['Stephen Opurum', 'stephenopurum73@gmail.com'],
  ['Tamunoibima Mercy Georgewill', 'mercygeorgewill95@gmail.com'],
  ['Tonia Iboi', 'ibitonia27@gmail.com'],
  ['Uti Kevin Chidera', 'kevinuti912@gmail.com'],
];

async function checkList(label, list, expectedCourseTitle) {
  console.log(`\n=== ${label} (expect: "${expectedCourseTitle}") ===`);
  const course = await Course.findOne({ title: expectedCourseTitle }).select('_id').lean();
  for (const [name, rawEmail] of list) {
    const email = cleanEmail(rawEmail);
    const u = await User.findOne({ email }).select('uid displayName').lean();
    if (!u) { console.log(`MISSING ACCOUNT: ${name} <${email}>`); continue; }
    const ens = await Enrollment.find({ userId: u.uid }).populate('courseId', 'title').lean();
    const titles = ens.map(e => e.courseId?.title);
    const matches = titles.includes(expectedCourseTitle);
    if (!matches) {
      console.log(`WRONG COURSE: ${name} <${email}> — has [${titles.join(', ') || 'none'}], expected "${expectedCourseTitle}"`);
    }
  }
}

await checkList('HGRM', HGRM, 'Hospitality & Global Relationship Management');
await checkList('HM', HM, 'Hospitality Management');

console.log(`\nHGRM listed rows: ${HGRM.length}, HM listed rows: ${HM.length}`);
process.exit(0);
