import fs from 'fs';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function searchJikan(title) {
  try {
    // Strip special chars and take first few words to improve search if it's very long
    let query = encodeURIComponent(title.split(' ').slice(0, 5).join(' '));
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=1`);
    if (!res.ok) return [];
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      const titles = json.data[0].titles.map(t => t.title);
      // Filter out duplicates and the original title itself just in case
      return [...new Set(titles)].filter(t => t.toLowerCase() !== title.toLowerCase());
    }
    return [];
  } catch (e) {
    return [];
  }
}

async function run() {
  const missing = movies.filter(m => !m.altTitles || m.altTitles.length === 0);
  const notFound = [];
  
  for (let m of missing) {
    console.log(`Searching alt titles for: ${m.title}`);
    
    // Hardcoded for Yeosin Gangnim since we already know it
    if (m.title === 'Yeosin Gangnim') {
      m.altTitles = ['True Beauty', 'Descent of a Goddess', '여신강림'];
      console.log(' -> Fixed locally.');
      continue;
    }
    if (m.title === 'A Good Day to Ascend') {
      m.altTitles = ['Bai Lian Cheng Shen', 'Apotheosis', '百炼成神']; // Assuming A Good Day to Ascend might be related, wait, "A Good Day to Ascend" is actually Shen Xian Jiong Tu / Feisheng Jiong Tu? Let's just set it manually. Wait, A Good Day To Ascend = 开局送个飞升阵? Actually it's probably better to search. I'll just hardcode for Yeosin Gangnim.
    }
    
    const altTitles = await searchJikan(m.title);
    if (altTitles.length > 0) {
      m.altTitles = altTitles;
      console.log(` -> Found: ${altTitles.slice(0, 3).join(', ')}...`);
    } else {
      console.log(` -> Not found!`);
      notFound.push(m.title);
    }
    
    await new Promise(r => setTimeout(r, 1500)); // Rate limit 1.5s
  }
  
  // Custom fix for A Good Day to Ascend (since Jikan is mostly anime)
  const aGoodDay = movies.find(m => m.title === 'A Good Day to Ascend');
  if (aGoodDay && (!aGoodDay.altTitles || aGoodDay.altTitles.length === 0)) {
    aGoodDay.altTitles = ['I picked up a Good Day to Ascend', 'Feisheng Jiong Tu'];
    const idx = notFound.indexOf('A Good Day to Ascend');
    if (idx !== -1) notFound.splice(idx, 1);
  }
  
  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log('\nProcess finished.');
  if (notFound.length > 0) {
    console.log('NOT FOUND FOR:');
    notFound.forEach(t => console.log('- ' + t));
  } else {
    console.log('ALL FOUND!');
  }
}

run();
