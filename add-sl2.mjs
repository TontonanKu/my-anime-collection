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
  const res = await fetch('https://api.jikan.moe/v4/anime/51836');
  const json = await res.json();
  const media = json.data;
  
  if (media) {
    const title = 'Soul Land 2: The Peerless Tang Clan';
    
    if (movies.find(m => m.title === title)) {
      console.log('Already exists');
      return;
    }

    const desc = await translateText(media.synopsis || '');
    
    const newMovie = {
      id: Date.now(),
      title: title,
      year: media.year || 2023,
      genre: media.genres.map(g => g.name).concat('Donghua'),
      duration: media.duration || '20 min per ep',
      durationMinutes: 20,
      rating: media.score || 8.03,
      personalRating: 0,
      status: 'Watched',
      poster: media.images.jpg.large_image_url,
      banner: media.images.jpg.large_image_url,
      description: desc,
      note: '',
      favorite: false,
      tag: '',
      altTitles: media.titles.map(t => t.title),
      progress: '1',
      category: 'Donghua',
      trailerId: media.trailer?.youtube_id || ''
    };
    
    movies.push(newMovie);
    movies.sort((a, b) => a.title.localeCompare(b.title));
    
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log('Added:', title);
  } else {
    console.log('Failed to fetch from Jikan');
  }
}

run();
