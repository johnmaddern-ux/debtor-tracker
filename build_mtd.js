const path = require('path');
const fs   = require('fs');

// Source XLS files and xlsx package live here (outside the repo)
const SRC  = 'C:/Users/JOHN/Documents/claude files';
const xlsx = require(path.join(SRC, 'node_modules/xlsx'));

const FILES = {
  'Construction KSA - MTD.xls': 'Construction KSA',
  'Construction UAE - MTD.xls': 'Construction',
  'EVENTS KSA - MTD.xls':       'Events KSA',
  'EVENTS UAE - MTD.xls':       'Events',
  'Mast Climber - MTD.xls':     'MCWP',
  'PA OMAN - MTD.xls':          'PA OMAN',
  'PA UAE - MTD.xls':           'PA UAE',
  'SS KSA - MTD.xls':           'SS KSA',
  'SS UAE - MTD.xls':           'SS UAE',
};

// Fixed column positions (no header row in XLS — data starts at row 0)
// Verified against: sAccCode=5, sAccName=6, dOtstndAmt=18, buckets=22-30
const C = {
  code:    5,
  name:    6,
  ost:    18,
  b030:   22,
  b3160:  23,
  b6190:  24,
  b91120: 25,
  b12115: 26,
  b15118: 27,
  b18121: 28,
  b21136: 29,
  b360p:  30,
};

function parseNum(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v.replace(/,/g, '')) || 0;
  return 0;
}

const allRecords = [];

for (const [filename, division] of Object.entries(FILES)) {
  const filePath = path.join(SRC, filename);
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  let count = 0;
  for (const row of rows) {
    const code = String(row[C.code] || '').trim();
    if (!code || code === 'Total') continue;

    count++;
    allRecords.push({
      cust_code:       code,
      customer:        String(row[C.name] || '').trim(),
      division,
      net_outstanding: parseNum(row[C.ost]),
      bucket_0_30:     parseNum(row[C.b030]),
      bucket_31_60:    parseNum(row[C.b3160]),
      bucket_61_90:    parseNum(row[C.b6190]),
      bucket_91_120:   parseNum(row[C.b91120]),
      bucket_121_150:  parseNum(row[C.b12115]),
      bucket_151_180:  parseNum(row[C.b15118]),
      bucket_181_210:  parseNum(row[C.b18121]),
      bucket_211_240:  parseNum(row[C.b21136]),
      bucket_240plus:  parseNum(row[C.b360p]),
    });
  }
  console.log(`${division}: ${count} records`);
}

const js = 'const MTD_RAW = ' + JSON.stringify(allRecords) + ';';
fs.writeFileSync(path.join(__dirname, 'mtd_raw_output.js'), js, 'utf8');
console.log(`\nTotal: ${allRecords.length} records written to mtd_raw_output.js`);
