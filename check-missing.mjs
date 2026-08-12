import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

function normalize(title) {
  return title
    .toLowerCase()
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

const existingTitles = new Set(movies.map(m => normalize(m.title)));
movies.forEach(m => {
  if (m.altTitles) {
    m.altTitles.forEach(alt => existingTitles.add(normalize(alt)));
  }
});

const userList = fs.readFileSync(path.join(process.cwd(), 'user-list.txt'), 'utf-8');

const regex = /- \[\s?\] (.*?)\s*\[.*?\]/g;
const missing = [];
let parsedCount = 0;

let match;
while ((match = regex.exec(userList)) !== null) {
  parsedCount++;
  let rawTitle = match[1].trim();
  let title = rawTitle.normalize('NFKC');
  let normTitle = normalize(title);
  
  if (!normTitle || normTitle === '.') continue; 
  
  if (normTitle.includes('jodoh hanbaiki')) normTitle = 'jidou hanbaiki ni umarekawatta ore wa meikyuu wo samayou';
  if (normTitle.includes('sekien gakuin')) normTitle = 'seiken gakuin no makentsukai';
  if (normTitle.includes('masamunekub')) normTitle = 'masamunekun no revenge r';
  if (normTitle.includes('oboeteinal')) normTitle = 'naze boku no sekai wo daremo oboeteinai no ka';
  
  if (!existingTitles.has(normTitle)) {
    const isSubset = Array.from(existingTitles).some(et => et.includes(normTitle) || normTitle.includes(et));
    if (!isSubset) {
      missing.push(title);
    }
  }
}

console.log("Parsed from user list:", parsedCount);
console.log("Total in database:", movies.length);
console.log("Missing Titles:");
missing.forEach(m => console.log("- " + m));
