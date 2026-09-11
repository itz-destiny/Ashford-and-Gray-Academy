const XLSX = require('xlsx');

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

function serialToDateMs(serial) {
  return EXCEL_EPOCH_MS + Math.round(serial) * 86400000;
}
function fractionToMs(frac) {
  return Math.round(frac * 86400000);
}

function loadMaster(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['Master Timetable'];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }).slice(2).filter(r => r && r[4]);

  let currentProgramme = null;
  const out = [];
  for (const r of rows) {
    const [programme, module, lecturer, daySerial, sessionCode, startFrac, endFrac] = r;
    if (programme) currentProgramme = programme;
    const dateMs = serialToDateMs(daySerial);
    const startMs = dateMs + fractionToMs(startFrac);
    const endMs = dateMs + fractionToMs(endFrac);
    const weekMatch = sessionCode.match(/^(W\d+)-([A-Z]+)-/);
    out.push({
      programmeName: currentProgramme,
      module: module || null,
      lecturerName: lecturer || null,
      date: new Date(dateMs),
      startTime: new Date(startMs),
      endTime: new Date(endMs),
      sessionCode,
      weekCode: weekMatch ? weekMatch[1] : null,
      day: weekMatch ? weekMatch[2] : null,
    });
  }
  return out;
}

module.exports = { loadMaster };

if (require.main === module) {
  const rows = loadMaster(process.argv[2]);
  console.log('total:', rows.length);
  console.log(JSON.stringify(rows.slice(0, 3), null, 1));
  console.log(JSON.stringify(rows.filter(r => r.lecturerName).slice(0, 3), null, 1));
}
