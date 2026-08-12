import fs from 'fs';

async function run() {
  const outPath = 'src/data/movies.json';
  const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
  
  const res = await fetch('https://myanimelist.net/anime/57877/Sheng_Zu');
  const html = await res.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)">/);
  
  if (match) {
    const posterUrl = match[1];
    const movie = movies.find(m => m.title === 'Sage Ancestor');
    if (movie) {
      movie.poster = posterUrl;
      movie.banner = posterUrl;
      fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
      console.log('Success!', posterUrl);
    }
  } else {
    console.log('Regex failed');
  }
}
run();
