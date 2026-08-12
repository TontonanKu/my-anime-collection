import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const malUrls = {
  "The Other Side of Deep Space": "https://myanimelist.net/anime/60574/Shenkong_Bi_An"
};

const posterAnilist = {
  "Jade Dynasty": "Zhu Xian 3"
};

const query = `query ($search: String) { Media(search: $search, type: ANIME) { coverImage { large } bannerImage } }`;

async function fetchAniList(searchTitle) {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { search: searchTitle } })
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.Media;
  } catch (e) { return null; }
}

async function fetchMalPoster(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    return match ? match[1] : null;
  } catch (e) { return null; }
}

async function run() {
  let updated = 0;
  for (let movie of movies) {
    const url = malUrls[movie.title];
    if (url) {
      console.log(`[MAL] ${movie.title}...`);
      const img = await fetchMalPoster(url);
      if (img) { movie.poster = img; movie.banner = img; console.log(`  -> Success: ${img}`); updated++; }
      else console.log(`  -> Failed.`);
      await new Promise(r => setTimeout(r, 500));
    }
    const aQuery = posterAnilist[movie.title];
    if (aQuery) {
      console.log(`[Anilist] ${movie.title} -> ${aQuery}`);
      const media = await fetchAniList(aQuery);
      if (media?.coverImage?.large) { movie.poster = media.coverImage.large; movie.banner = media.bannerImage || media.coverImage.large; console.log(`  -> Success!`); updated++; }
      else console.log(`  -> Failed.`);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated ${updated} posters.`);
}

run();
