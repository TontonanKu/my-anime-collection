import fs from 'fs';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function searchAnilist(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        averageScore
      }
    }
  `;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.Media?.averageScore ? json.data.Media.averageScore / 10 : null;
  } catch (e) {
    return null;
  }
}

async function searchJikan(title) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return json.data[0].score;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  let updated = 0;
  for (let m of movies) {
    if (!m.rating || m.rating === 0) {
      console.log(`Searching rating for: ${m.title}`);
      
      let rating = await searchAnilist(m.title);
      if (!rating) {
        // Fallback to Jikan
        await new Promise(r => setTimeout(r, 1000));
        rating = await searchJikan(m.title);
      }
      
      if (rating && rating > 0) {
        m.rating = parseFloat(rating.toFixed(2));
        console.log(`Found rating for ${m.title}: ${m.rating}`);
        updated++;
      } else {
        console.log(`Could not find rating for ${m.title}`);
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  if (updated > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated ${updated} ratings.`);
  } else {
    console.log('No ratings updated.');
  }
}

run();
