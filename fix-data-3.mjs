import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const posterAnilist = {
  "In Search of God's": "Sou Shen Ji (ONA)",
  "Legend Of Martial Immortal": "Xianwu Zhuan", // removed season suffix as Anilist sometimes groups them
  "Peak Of True Martial Arts": "Zhen Wu Dianfeng 3",
  "Primeval Overlord": "Taigu Shen Zun",
  "Swallowed Star": "Tunshi Xingkong", // removed season
  "Stay Low Profile, Sect Chief": "Zhangmen Didiao Dian",
  "The Other Side of Deep Space": "Shenkong Bi An"
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
    if (!response.ok) {
      if (response.status === 429) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchAniList(searchTitle);
      }
      return null;
    }
    const json = await response.json();
    return json.data?.Media;
  } catch (e) {
    return null;
  }
}

async function run() {
  let updated = 0;

  for (let movie of movies) {
    const aQuery = posterAnilist[movie.title];
    if (aQuery) {
      console.log(`[Anilist Fallback] Fetching poster for ${movie.title} with query: ${aQuery}`);
      const media = await fetchAniList(aQuery);
      if (media && media.coverImage?.large) {
        movie.poster = media.coverImage.large;
        movie.banner = media.bannerImage || media.coverImage.large;
        console.log(`  -> Success!`);
        updated++;
      } else {
        console.log(`  -> Failed to find on Anilist either.`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished fallback! Updated ${updated} posters.`);
}

run();
