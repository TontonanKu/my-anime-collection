import fs from 'fs';
import ytSearch from 'yt-search';
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
  const m = movies.find(movie => movie.title === 'Yeosin Gangnim');
  if (m) {
    console.log('Fetching from Jikan for Yeosin Gangnim...');
    const res = await fetch('https://api.jikan.moe/v4/anime/57192');
    const json = await res.json();
    const media = json.data;
    
    if (media) {
      m.rating = media.score || 6.59;
      m.altTitles = ['True Beauty', 'Descent of a Goddess', '여신강림', ...media.titles.map(t => t.title)];
      m.altTitles = [...new Set(m.altTitles)];
      
      const desc = await translateText(media.synopsis || '');
      m.description = desc;
      m.category = 'Anime'; // Ensure it's grouped as Anime
      console.log('Updated metadata.');
    }
    
    console.log('Searching trailer for True Beauty anime trailer');
    const r = await ytSearch('True Beauty anime trailer Crunchyroll');
    if (r.videos.length > 0) {
      m.trailerId = r.videos[0].videoId;
      console.log('Fixed trailer to:', r.videos[0].title);
    }
    
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  }
}
run();
