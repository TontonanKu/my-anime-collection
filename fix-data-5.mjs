import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const malUrls = {
  "In Search of God's": "https://myanimelist.net/anime/61626/Sou_Shen_Ji_ONA",
  "Peak Of True Martial Arts": "https://myanimelist.net/anime/57351/Zhen_Wu_Dianfeng_3rd_Season"
};

async function fetchMalPoster(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  let updated = 0;

  for (let movie of movies) {
    const url = malUrls[movie.title];
    if (url) {
      console.log(`Scraping MAL HTML for ${movie.title}...`);
      const imageUrl = await fetchMalPoster(url);
      if (imageUrl) {
        movie.poster = imageUrl;
        movie.banner = imageUrl; // Use same image for banner
        console.log(`  -> Success! Found image: ${imageUrl}`);
        updated++;
      } else {
        console.log(`  -> Failed to extract image from HTML.`);
      }
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated ${updated} posters.`);
}

run();
