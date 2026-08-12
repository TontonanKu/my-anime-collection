import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function translateToIndonesian(text) {
  if (!text || text.trim() === '') return '';
  
  // Unofficial Google Translate API
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!response.ok) return text; // Return original if fails
    
    const data = await response.json();
    // Response is an array of arrays, first element contains translation chunks
    if (data && data[0]) {
      const translated = data[0]
        .filter(chunk => chunk && chunk[0])
        .map(chunk => chunk[0])
        .join('');
      return translated;
    }
    return text;
  } catch (e) {
    return text; // Return original if fails
  }
}

async function run() {
  let translated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    
    if (!movie.description || movie.description.trim() === '') {
      process.stdout.write(`[${i+1}/${movies.length}] ${movie.title} -> No description, skipping\n`);
      skipped++;
      continue;
    }

    // Check if already in Indonesian (rough check: common Indonesian words)
    const indonesianIndicators = ['adalah', 'yang', 'dan', 'untuk', 'dengan', 'dari', 'dalam', 'ini', 'itu', 'pada', 'sebagai', 'mereka', 'dia', 'seorang', 'sebuah', 'tidak', 'juga'];
    const words = movie.description.toLowerCase().split(/\s+/);
    const idWordCount = words.filter(w => indonesianIndicators.includes(w)).length;
    
    if (idWordCount > 5) {
      process.stdout.write(`[${i+1}/${movies.length}] ${movie.title} -> Already Indonesian (skipping)\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${i+1}/${movies.length}] ${movie.title}...`);
    
    // Truncate very long descriptions to avoid URL length limits
    const textToTranslate = movie.description.substring(0, 1500);
    
    const translated_text = await translateToIndonesian(textToTranslate);
    
    if (translated_text && translated_text !== textToTranslate) {
      movie.description = translated_text;
      process.stdout.write(` -> OK\n`);
      translated++;
    } else {
      process.stdout.write(` -> FAILED (kept original)\n`);
      failed++;
    }

    // Save checkpoint every 25 entries
    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
      console.log(`--- Checkpoint saved at ${i+1} ---`);
    }

    // Small delay to not overload Google
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Translated: ${translated}, Skipped: ${skipped}, Failed: ${failed}`);
}

run();
