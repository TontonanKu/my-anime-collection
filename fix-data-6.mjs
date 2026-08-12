import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const malUrls = {
  "Primeval Overlord": "https://myanimelist.net/anime/64710/Taigu_Shen_Zun",
  "Renegade Immortal": "https://myanimelist.net/anime/55809/Xian_Ni",
  "Swallowed Star": "https://myanimelist.net/anime/56524/Tunshi_Xingkong_4th_Season",
  "Stay Low Profile, Sect Chief": "https://myanimelist.net/anime/64384/Zhangmen_Didiao_Dian"
};

const posterAnilist = {
  "Perfect World": "Wanmei Shijie 6"
};

const query = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    coverImage { large }
    bannerImage
  }
}
`;

async function fetchAniList(searchTitle) {
  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: query, variables: { search: searchTitle } })
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.Media;
  } catch (e) {
    return null;
  }
}

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
    // Check MAL URLs first
    const url = malUrls[movie.title];
    if (url) {
      console.log(`Scraping MAL HTML for ${movie.title}...`);
      const imageUrl = await fetchMalPoster(url);
      if (imageUrl) {
        movie.poster = imageUrl;
        movie.banner = imageUrl;
        console.log(`  -> Success! Found image: ${imageUrl}`);
        updated++;
      } else {
        console.log(`  -> Failed to extract image from HTML.`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Check AniList
    const aQuery = posterAnilist[movie.title];
    if (aQuery) {
      console.log(`[Anilist] Fetching poster for ${movie.title} with query: ${aQuery}`);
      const media = await fetchAniList(aQuery);
      if (media && media.coverImage?.large) {
        movie.poster = media.coverImage.large;
        movie.banner = media.bannerImage || media.coverImage.large;
        console.log(`  -> Success!`);
        updated++;
      } else {
        console.log(`  -> Failed to find on Anilist.`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated ${updated} posters.`);
}

run();
