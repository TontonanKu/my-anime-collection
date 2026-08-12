import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function fetchJikan(searchTitle) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTitle)}&limit=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data && json.data.length > 0 ? json.data[0] : null;
  } catch (error) {
    return null;
  }
}

async function run() {
  console.log(`Fetching MAL poster for Azure Legacy...`);
  const media = await fetchJikan('Cang Yuan Tu');
  
  if (media) {
    const movie = movies.find(m => m.title === 'Azure Legacy');
    if (movie) {
      // Jikan returns images in media.images.jpg.large_image_url
      const newPoster = media.images?.jpg?.large_image_url || media.images?.jpg?.image_url;
      if (newPoster) {
        movie.poster = newPoster;
        movie.banner = newPoster; // We can use the same for banner, or keep the old one
        console.log(` -> Updated poster for Azure Legacy: ${movie.poster}`);
        fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
        console.log(`Successfully updated!`);
      }
    } else {
      console.log(` -> Could not find Azure Legacy in local movies.json!`);
    }
  } else {
    console.log(` -> Could not find on MAL/Jikan!`);
  }
}

run();
