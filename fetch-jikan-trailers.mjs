import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function checkTrailerOk(id) {
  const url = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
  try {
    const res = await fetch(url);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function fetchJikanTrailer(searchTitle) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTitle)}&limit=3`;
  
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      console.log('Rate limited by Jikan! Waiting...');
      await new Promise(r => setTimeout(r, 2000));
      return fetchJikanTrailer(searchTitle);
    }
    if (!response.ok) return null;
    const json = await response.json();
    if (!json.data || json.data.length === 0) return null;
    
    // Find the first result that has a youtube trailer
    for (const anime of json.data) {
      if (anime.trailer && anime.trailer.youtube_id) {
        return anime.trailer.youtube_id;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function run() {
  let updatedCount = 0;
  // We only check movies that currently have no trailer
  const missingTrailers = movies.filter(m => !m.trailerId);
  console.log(`Found ${missingTrailers.length} movies without a working trailer. Searching MyAnimeList...`);

  for (let i = 0; i < missingTrailers.length; i++) {
    const movie = missingTrailers[i];
    console.log(`[${i+1}/${missingTrailers.length}] Searching for: ${movie.title}`);
    
    // For search, strip bracket content to get better results
    const cleanTitle = movie.title.replace(/\\[.*?\\]|\\(.*?\\)/g, '').trim();
    
    let trailerId = await fetchJikanTrailer(cleanTitle);
    
    // If not found, try alternative titles if available
    if (!trailerId && movie.altTitles && movie.altTitles.length > 0) {
      for (const alt of movie.altTitles.slice(0, 2)) {
        trailerId = await fetchJikanTrailer(alt.replace(/\\[.*?\\]|\\(.*?\\)/g, '').trim());
        if (trailerId) break;
      }
    }

    if (trailerId) {
      // Test if trailer is actually playable
      const isPlayable = await checkTrailerOk(trailerId);
      if (isPlayable) {
        movie.trailerId = trailerId;
        console.log(` -> Found working trailer: ${trailerId}`);
        updatedCount++;
      } else {
        console.log(` -> Found trailer ${trailerId} but it is broken/private.`);
      }
    } else {
      console.log(` -> No trailer found on MAL.`);
    }

    // Jikan allows 3 requests per second, so 350ms delay is safe
    await new Promise(r => setTimeout(r, 500));
  }

  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Successfully added ${updatedCount} new trailers from MAL!`);
  } else {
    console.log(`No new trailers found.`);
  }
}

run();
