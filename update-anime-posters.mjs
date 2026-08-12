import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'raw_anime.json');
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');

const query = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      large
    }
    bannerImage
    averageScore
    genres
    duration
    episodes
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
        console.log(`Rate limited! Waiting for 2s...`);
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

async function run() {
  const movies = [];
  let idCounter = 1;

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    console.log(`[${i+1}/${rawData.length}] Fetching data for: ${item.title}`);
    
    // We try to fetch from AniList
    const media = await fetchAniList(item.title);
    
    // Default movie structure
    const movie = {
      id: idCounter++,
      title: item.title,
      year: new Date().getFullYear(),
      genre: [item.category],
      duration: "24 min",
      durationMinutes: 24,
      rating: 0,
      personalRating: 0,
      status: "Watched",
      poster: "",
      banner: "",
      description: "",
      note: "",
      favorite: false,
      tag: "",
      progress: item.progress,
      category: item.category,
      altTitles: []
    };

    if (media) {
      // Use titles
      const englishTitle = media.title?.english;
      const romajiTitle = media.title?.romaji;
      
      // Keep user's title but add others as altTitles
      const alts = new Set();
      if (englishTitle && englishTitle.toLowerCase() !== item.title.toLowerCase()) alts.add(englishTitle);
      if (romajiTitle && romajiTitle.toLowerCase() !== item.title.toLowerCase()) alts.add(romajiTitle);
      if (media.title?.native) alts.add(media.title.native);
      
      movie.altTitles = Array.from(alts);
      
      movie.description = (media.description || "").replace(/<[^>]*>?/gm, ''); // Strip simple html tags
      movie.poster = media.coverImage?.large || "";
      movie.banner = media.bannerImage || media.coverImage?.large || "";
      movie.rating = media.averageScore ? media.averageScore / 10 : 0; // Out of 10
      
      if (media.duration) {
        movie.duration = `${media.duration} min`;
        movie.durationMinutes = media.duration;
      }
      if (media.genres && media.genres.length > 0) {
        // Add at most 3 genres from AniList to our category
        movie.genre = [item.category, ...media.genres.slice(0, 2)];
      }
    } else {
      console.log(`   -> Not found on AniList, keeping default values.`);
    }

    movies.push(movie);
    // AniList rate limit is ~90 req / min. Sleep 750ms to be safe (max ~80/min)
    await new Promise(r => setTimeout(r, 750));
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished updating! Wrote ${movies.length} entries to movies.json`);
}

run();
