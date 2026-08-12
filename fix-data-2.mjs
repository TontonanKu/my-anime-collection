import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const posterAnilist = {
  "Eclipse Of Illusion": "Yun Shen Buzhi Meng Special: Zhu Ming Zhi Yi",
  "Stellar Transformation": "Xingchen Bian: Xichen Yao Hai"
};

const posterJikan = {
  "In Search of God's": "Sou Shen Ji (ONA)",
  "Legend Of Martial Immortal": "Xianwu Zhuan 2nd Season",
  "Peak Of True Martial Arts": "Zhen Wu Dianfeng 3rd Season",
  "Primeval Overlord": "Taigu Shen Zun",
  "Swallowed Star": "Tunshi Xingkong 4th Season",
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

async function fetchJikan(searchTitle) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTitle)}&limit=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchJikan(searchTitle);
      }
      return null;
    }
    const json = await response.json();
    return json.data && json.data.length > 0 ? json.data[0] : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  let updated = 0;

  for (let movie of movies) {
    // 1. Anilist overrides
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

    // 2. Jikan overrides
    const jQuery = posterJikan[movie.title];
    if (jQuery) {
      console.log(`[Jikan] Fetching poster for ${movie.title} with query: ${jQuery}`);
      const media = await fetchJikan(jQuery);
      if (media && media.images?.jpg?.large_image_url) {
        movie.poster = media.images.jpg.large_image_url;
        movie.banner = media.images.jpg.large_image_url;
        console.log(`  -> Success!`);
        updated++;
      } else {
        console.log(`  -> Failed to find on Jikan. Response empty.`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated ${updated} posters.`);
}

run();
