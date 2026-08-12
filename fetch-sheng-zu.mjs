import fs from 'fs';

async function run() {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        coverImage { extraLarge large }
      }
    }
  `;
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query, variables: { search: 'Sheng Zu' } })
  });
  const json = await res.json();
  const media = json.data?.Media;
  
  if (media) {
    const outPath = 'src/data/movies.json';
    const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    const movie = movies.find(m => m.title === 'Sage Ancestor');
    if (movie) {
      movie.poster = media.coverImage.extraLarge || media.coverImage.large;
      movie.banner = movie.poster;
      fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
      console.log('Success:', movie.poster);
    }
  } else {
    console.log('Not found on Anilist either.');
  }
}
run();
