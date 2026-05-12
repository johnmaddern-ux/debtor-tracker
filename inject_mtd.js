const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const newMtd   = fs.readFileSync(path.join(__dirname, 'mtd_raw_output.js'), 'utf8').trim();

let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the MTD_RAW declaration (it's on one long line)
const start = html.indexOf('const MTD_RAW = [');
if (start < 0) { console.error('MTD_RAW not found in index.html'); process.exit(1); }

const end = html.indexOf('];', start) + 2; // include the closing ];
if (end < 2) { console.error('Could not find end of MTD_RAW'); process.exit(1); }

const before = html.slice(0, start);
const after  = html.slice(end);

html = before + newMtd + ';' + after;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Done. Replaced ${end - start} chars with ${newMtd.length + 1} chars.`);
console.log(`Old block started at char ${start}, ended at ${end}.`);
