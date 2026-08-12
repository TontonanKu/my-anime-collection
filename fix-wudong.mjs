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
  const m = movies.find(movie => movie.title === 'Wu Dong Qian Kun');
  if (m) {
    console.log('Fetching from Jikan for Martial Universe...');
    const res = await fetch('https://api.jikan.moe/v4/anime?q=Martial%20Universe&limit=1');
    const json = await res.json();
    const media = json.data && json.data.length > 0 ? json.data[0] : null;
    
    if (media) {
      m.rating = media.score || 7.8;
      m.altTitles = ['Martial Universe', '武动乾坤', 'Wu Dong Qian Kun', ...media.titles.map(t => t.title)];
      m.altTitles = [...new Set(m.altTitles)];
      
      const desc = await translateText(media.synopsis || 'Lin Dong is a child from an offshoot branch of the Lin Clan who finds a mysterious stone talisman. This artifact helps him become a martial arts genius.');
      m.description = desc;
      console.log('Updated metadata.');
    } else {
      m.rating = 7.8;
      m.altTitles = ['Martial Universe', '武动乾坤'];
      m.description = 'Lin Dong, seorang anak dari cabang pinggiran Klan Lin, menemukan sebuah jimat batu misterius di dalam sebuah gua. Artefak ajaib ini membantunya mengolah kemampuan bela diri dan menjadikannya seorang jenius dalam seni bela diri, membawanya ke dalam perjalanan yang luar biasa di dunia kultivasi.';
    }
    
    console.log('Searching trailer for Martial Universe donghua trailer');
    const r = await ytSearch('Martial Universe Wu Dong Qian Kun official trailer');
    if (r.videos.length > 0) {
      // Find a good video that isn't a 1-second clip
      const best = r.videos.find(v => v.seconds > 30) || r.videos[0];
      m.trailerId = best.videoId;
      console.log('Fixed trailer to:', best.title);
    }
    
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  }
}
run();
