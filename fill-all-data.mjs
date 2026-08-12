import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

// AniList query that fetches all the data we need
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
    coverImage { large }
    bannerImage
    averageScore
    genres
    duration
    startDate { year }
    synonyms
  }
}
`;

async function fetchAniList(searchTitle, retries = 3) {
  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: query, variables: { search: searchTitle } })
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        const wait = 3000;
        process.stdout.write(` [rate limited, waiting ${wait/1000}s]`);
        await new Promise(r => setTimeout(r, wait));
        return fetchAniList(searchTitle, retries - 1);
      }
      return null;
    }
    const json = await response.json();
    return json.data?.Media;
  } catch (e) {
    return null;
  }
}

// Build search queries: try original title, then alt titles if available
function getSearchQueries(movie) {
  const queries = [movie.title];
  if (movie.altTitles && movie.altTitles.length > 0) {
    for (const alt of movie.altTitles) {
      if (!queries.includes(alt)) queries.push(alt);
    }
  }
  return queries;
}

function needsUpdate(movie) {
  return (
    !movie.description ||
    movie.description.trim() === '' ||
    movie.rating === 0 ||
    movie.duration === '24 min' ||
    !movie.altTitles || movie.altTitles.length === 0
  );
}

async function run() {
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    
    // Skip if all data already exists and is complete
    if (!needsUpdate(movie)) {
      process.stdout.write(`[${i+1}/${movies.length}] ${movie.title} -> OK (skipped)\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${i+1}/${movies.length}] ${movie.title}...`);

    const queries = getSearchQueries(movie);
    let media = null;
    for (const q of queries) {
      media = await fetchAniList(q);
      if (media) break;
      await new Promise(r => setTimeout(r, 300));
    }

    if (media) {
      // Update description if empty
      if (!movie.description || movie.description.trim() === '') {
        movie.description = (media.description || '').replace(/<[^>]*>?/gm, '').trim();
      }

      // Update rating if zero
      if (movie.rating === 0 && media.averageScore) {
        movie.rating = media.averageScore / 10;
      }

      // Update duration if it's the placeholder
      if ((movie.duration === '24 min' || movie.durationMinutes === 24) && media.duration) {
        movie.duration = `${media.duration} min`;
        movie.durationMinutes = media.duration;
      }

      // Update year if it's the placeholder (current year = 2026 placeholder)
      if (media.startDate?.year && media.startDate.year > 0) {
        movie.year = media.startDate.year;
      }

      // Build altTitles (merge existing with new ones)
      const alts = new Set(movie.altTitles || []);
      const { romaji, english, native } = media.title || {};
      if (romaji && romaji.toLowerCase() !== movie.title.toLowerCase()) alts.add(romaji);
      if (english && english.toLowerCase() !== movie.title.toLowerCase()) alts.add(english);
      if (native) alts.add(native);
      if (media.synonyms) {
        for (const s of media.synonyms) {
          if (s && s.toLowerCase() !== movie.title.toLowerCase()) alts.add(s);
        }
      }
      movie.altTitles = Array.from(alts).filter(Boolean);

      // Update genres if still default single-category
      if (movie.genre.length <= 1 && media.genres && media.genres.length > 0) {
        movie.genre = [movie.category, ...media.genres.slice(0, 2)];
      }

      process.stdout.write(` -> OK\n`);
      updated++;
    } else {
      process.stdout.write(` -> NOT FOUND\n`);
      failed++;
    }

    // Save progress every 20 items in case of crash
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
      console.log(`--- Checkpoint saved at ${i+1} ---`);
    }

    await new Promise(r => setTimeout(r, 700));
  }

  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log(`\nFinished! Updated: ${updated}, Skipped: ${skipped}, Not found: ${failed}`);
}

run();
