import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const altTitles = {
  "Sebelum Iblis Menjemput": ["May the Devil Take You", "sebelu iblis menjemput"],
  "Siksa Kubur": ["Grave Torture", "siksa kubur"],
  "Ratu Ilmu Hitam": ["The Queen of Black Magic", "ratu ilmu hitam"],
  "Pengabdi Setan": ["Satan's Slaves", "pengabdi setan"],
  "Racun Sangga: Santet Pemisah Rumah Tangga": ["Racun Sangga"],
  "Pamali: Dusun Pocong": ["Pamali Dusun Pocong", "Dusun Pocong", "Pamali"],
  "Abadi Nan Jaya": ["Abadi Nan Jaya", "Zombie di Yogyakarta"],
  "Santet Segoro Pitu": ["Santet Segoro Pitu", "Segoro Pitu"]
};

async function searchImdbSingle(qStr) {
  if (!qStr) return null;
  const firstLetter = qStr[0].toLowerCase();
  const url = `https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${qStr}.json`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.d && Array.isArray(data.d)) {
        for (const item of data.d) {
          if (item.i && item.i.imageUrl) {
            return item.i.imageUrl;
          }
        }
      }
    }
  } catch (e) {}
  return null;
}

async function searchImdb(query) {
  const clean = query.toLowerCase().trim();
  const variations = new Set([
    encodeURIComponent(clean),
    clean.replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '_'),
    clean.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, '%20'),
    clean.replace(/\s+/g, '_')
  ]);

  for (const q of variations) {
    const res = await searchImdbSingle(q);
    if (res) return res;
  }
  return null;
}

async function run() {
  let updatedCount = 0;
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    if (movie.id >= 9) {
      console.log(`Searching IMDb for: ${movie.title}...`);
      let queries = [movie.title];
      if (altTitles[movie.title]) {
        queries = queries.concat(altTitles[movie.title]);
      }
      if (movie.title.includes(':')) {
        queries.push(movie.title.split(':')[0].trim());
      }

      let img = null;
      for (const q of queries) {
        img = await searchImdb(q);
        if (img) {
          if (q !== movie.title) console.log(`  Found under title query "${q}"`);
          break;
        }
      }

      if (img) {
        console.log(`  Found poster: ${img}`);
        movie.poster = img;
        movie.banner = img;
        updatedCount++;
      } else {
        console.log(`  No IMDb poster found for ${movie.title}, keeping default.`);
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished updating! Total movies updated with IMDb posters: ${updatedCount}`);
}

run();
