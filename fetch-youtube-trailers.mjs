import fs from 'fs';
import ytSearch from 'yt-search';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function run() {
  let updatedCount = 0;
  
  for (let m of movies) {
    if (m.category === 'Donghua' && !m.trailerId) {
      console.log(`Searching trailer for: ${m.title}...`);
      try {
        const r = await ytSearch(`${m.title} donghua trailer`);
        const videos = r.videos;
        if (videos.length > 0) {
          const video = videos[0];
          m.trailerId = video.videoId;
          updatedCount++;
          console.log(`Found: ${video.title} (${video.videoId})`);
        } else {
          console.log('No results found.');
        }
      } catch (e) {
        console.error('Search error for ' + m.title, e);
      }
      
      // Delay to avoid spamming
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated ${updatedCount} trailers.`);
  } else {
    console.log('No trailers updated.');
  }
}

run();
