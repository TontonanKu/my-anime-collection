import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const malIds = {
  "In Search of God's": 61626,
  "Peak Of True Martial Arts": 57351
};

async function fetchJikanById(id) {
  const url = `https://api.jikan.moe/v4/anime/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

async function run() {
  let updated = 0;

  for (let movie of movies) {
    const id = malIds[movie.title];
    if (id) {
      console.log(`Fetching Jikan data for ${movie.title} with ID: ${id}`);
      const media = await fetchJikanById(id);
      if (media && media.images?.jpg?.large_image_url) {
        movie.poster = media.images.jpg.large_image_url;
        movie.banner = media.images.jpg.large_image_url;
        console.log(`  -> Success! Poster URL: ${movie.poster}`);
        updated++;
      } else {
        console.log(`  -> Failed to find data.`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated ${updated} posters.`);
}

run();
