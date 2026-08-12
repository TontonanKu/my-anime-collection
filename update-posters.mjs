import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const query = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title {
      romaji
      english
    }
    coverImage {
      large
      extraLarge
    }
    bannerImage
  }
}
`;

async function fetchAniList(searchTitle) {
  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { search: searchTitle }
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429) {
        console.log(`Rate limited! Waiting...`);
        await new Promise(r => setTimeout(r, 2000));
        return fetchAniList(searchTitle);
      }
      return null;
    }
    const json = await response.json();
    return json.data?.Media;
  } catch (error) {
    return null;
  }
}

const targets = [
  { myTitle: "Azure Legacy", aniTitle: "The Demon Hunter" }
];

async function run() {
  let updatedCount = 0;
  for (const t of targets) {
    console.log(`Fetching ${t.aniTitle} for ${t.myTitle}...`);
    const media = await fetchAniList(t.aniTitle);
    
    if (media) {
      const movie = movies.find(m => m.title === t.myTitle);
      if (movie) {
        const newPoster = media.coverImage?.extraLarge || media.coverImage?.large;
        const newBanner = media.bannerImage || newPoster;
        if (newPoster) movie.poster = newPoster;
        if (newBanner) movie.banner = newBanner;
        
        console.log(` -> Updated poster for ${t.myTitle}: ${movie.poster}`);
        updatedCount++;
      } else {
        console.log(` -> Could not find ${t.myTitle} in local movies.json!`);
      }
    } else {
      console.log(` -> Could not find ${t.aniTitle} on AniList!`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Successfully updated ${updatedCount} movies!`);
  }
}

run();
