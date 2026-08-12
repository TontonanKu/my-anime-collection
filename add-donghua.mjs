import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

async function fetchAniList(searchTitle) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { romaji english }
        coverImage { extraLarge large }
        bannerImage
        description
        genres
        averageScore
        startDate { year }
      }
    }
  `;
  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: query, variables: { search: searchTitle } })
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.Media;
  } catch (e) {
    return null;
  }
}

async function addMovie(title, progress) {
  if (movies.find(m => m.title === title)) {
    console.log(`${title} already exists!`);
    return;
  }
  
  console.log(`Fetching info for ${title}...`);
  const media = await fetchAniList(title);
  
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const poster = media?.coverImage?.extraLarge || media?.coverImage?.large || 'https://via.placeholder.com/300x450?text=Poster';
  const banner = media?.bannerImage || poster;
  
  movies.push({
    id,
    title,
    year: media?.startDate?.year || 2024,
    genre: media?.genres || ['Action', 'Fantasy', 'Donghua'],
    duration: '20 MIN',
    durationMinutes: 20,
    rating: media?.averageScore ? (media.averageScore / 10) : 8.0,
    personalRating: 0,
    status: 'Watched',
    poster,
    banner,
    description: media?.description || 'Deskripsi belum tersedia.',
    note: '',
    favorite: false,
    tag: '',
    altTitles: [],
    progress,
    category: 'Donghua',
    trailerId: ''
  });
  console.log(`Added ${title}.`);
}

async function run() {
  await addMovie('A Good Day to Ascend', '6');
  await new Promise(r => setTimeout(r, 1000));
  await addMovie('Sage Ancestor', '6');
  
  fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
  console.log('Saved to movies.json');
}

run();
