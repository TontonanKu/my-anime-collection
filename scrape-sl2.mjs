import fs from 'fs';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function translateText(text) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`);
    const json = await res.json();
    return json[0].map((item) => item[0]).join('');
  } catch (e) {
    return text;
  }
}

async function run() {
  const res = await fetch('https://myanimelist.net/anime/51836/Douluo_Dalu_II__Jueshi_Tangmen');
  const html = await res.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)">/);
  
  if (match) {
    const posterUrl = match[1];
    const title = 'Soul Land 2: The Peerless Tang Clan';
    
    if (movies.find(m => m.title === title)) {
      console.log('Already exists');
      return;
    }

    const desc = await translateText("This place has no magic, no battle aura, no martial arts, but there are Martial Souls. On the Douluo Continent, ten thousand years after the founding of the Tang Sect, the Tang Sect has declined. A new generation of geniuses emerges. Can the new Shrek Seven Devils revive the Tang Sect?");
    
    const newMovie = {
      id: Date.now(),
      title: title,
      year: 2023,
      genre: ['Action', 'Fantasy', 'Adventure', 'Donghua'],
      duration: '20 min per ep',
      durationMinutes: 20,
      rating: 8.03,
      personalRating: 0,
      status: 'Watched',
      poster: posterUrl,
      banner: posterUrl,
      description: desc,
      note: '',
      favorite: false,
      tag: '',
      altTitles: ['Douluo Dalu II: Jueshi Tangmen'],
      progress: '1',
      category: 'Donghua',
      trailerId: '1c-xrXkFrdM' // Placeholder or we fetch it later
    };
    
    movies.push(newMovie);
    movies.sort((a, b) => a.title.localeCompare(b.title));
    
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log('Added:', title);
  } else {
    console.log('Failed to scrape MAL');
  }
}

run();
