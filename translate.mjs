import fs from 'fs';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function translateText(text) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`);
    const json = await res.json();
    return json[0].map((item) => item[0]).join('');
  } catch (e) {
    console.error('Translation error', e);
    return text;
  }
}

async function run() {
  let updatedCount = 0;
  
  for (let m of movies) {
    if (m.title === 'A Good Day to Ascend') {
      m.rating = 9.8;
      m.description = "Di tengah kekacauan dunia, siluman merajalela dan para pengkhianat berkuasa. Ditambah lagi dengan invasi dari Dunia Roh, kekuatan dari dunia manusia dan Dunia Roh mengacaukan kehidupan manusia.";
      updatedCount++;
    } else if (m.title === 'Sage Ancestor') {
      m.description = "Cerita dimulai ketika Luo Lie tiba-tiba dipindahkan ke dunia lain. Setibanya di sana, dia menemukan dirinya hidup dengan identitas yang berbeda di dunia yang penuh bahaya. Didorong oleh kerinduan akan rumah dan berbekal kemampuan misterius, Luo Lie mengatasi berbagai rintangan untuk bertahan hidup dan secara tidak sengaja memulai jalan untuk menjadi seorang pahlawan.";
      updatedCount++;
    } else {
      // Check if description is likely English
      if (m.description && /\b(the|and|is|in|to|of|with|for)\b/i.test(m.description) && !m.description.includes('yang') && !m.description.includes('dan')) {
        console.log(`Translating: ${m.title}...`);
        const translated = await translateText(m.description);
        if (translated && translated !== m.description) {
          m.description = translated;
          updatedCount++;
        }
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  
  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated ${updatedCount} movies.`);
  } else {
    console.log('No updates needed.');
  }
}

run();
