import fs from 'fs';
import ytSearch from 'yt-search';

const outPath = 'src/data/movies.json';
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function run() {
  let updatedCount = 0;
  
  for (let m of movies) {
    if (m.category === 'Anime' && !m.trailerId) {
      console.log(`Searching trailer for Anime: ${m.title}...`);
      try {
        const r = await ytSearch(`${m.title} anime trailer`);
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
  
  // Also shorten One Piece synopsis
  const onePiece = movies.find(m => m.title.toLowerCase() === 'one piece');
  if (onePiece) {
    onePiece.description = "Gol D. Roger dikenal sebagai \"Raja Bajak Laut\", makhluk terkuat dan paling terkenal yang pernah mengarungi Grand Line. Menjelang kematiannya, ia mengungkapkan keberadaan harta karun terbesar di dunia, One Piece. Puluhan tahun kemudian, Monkey D. Luffy, seorang anak laki-laki berusia 17 tahun yang memiliki kekuatan karet, memulai perjalanannya dari East Blue menuju Grand Line untuk mencari kru bajak lautnya sendiri dan menemukan One Piece.";
    console.log('Shortened One Piece synopsis.');
    updatedCount++;
  }
  
  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated ${updatedCount} items.`);
  } else {
    console.log('No updates needed.');
  }
}

run();
