import fs from 'fs';
import path from 'path';

const outPath = path.join(process.cwd(), 'src', 'data', 'movies.json');
const movies = JSON.parse(fs.readFileSync(outPath, 'utf-8'));

const query = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      large
    }
    bannerImage
    averageScore
    genres
    duration
    episodes
  }
}
`;

async function fetchAniList(searchTitle) {
  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { search: searchTitle }
    })
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json.data?.Media;
  } catch (error) {
    return null;
  }
}

async function run() {
  const searchTitle = 'The Jack-of-All-Trades, Party of None';
  console.log(`Searching for: ${searchTitle}`);
  const media = await fetchAniList(searchTitle);
  
  if (media) {
    for (let i = 0; i < movies.length; i++) {
      if (movies[i].title.includes('Yuusha Party wo Oidasareta Kiyoubinbou')) {
        movies[i].description = (media.description || "").replace(/<[^>]*>?/gm, '');
        movies[i].poster = media.coverImage?.large || "";
        movies[i].banner = media.bannerImage || media.coverImage?.large || "";
        movies[i].rating = media.averageScore ? media.averageScore / 10 : 0;
        if (media.duration) {
          movies[i].duration = `${media.duration} min`;
          movies[i].durationMinutes = media.duration;
        }
        if (media.genres && media.genres.length > 0) {
          movies[i].genre = [movies[i].category, ...media.genres.slice(0, 2)];
        }
        console.log(` -> Found: ${media.title.romaji || media.title.english}`);
      }
    }
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated successfully!`);
  } else {
    console.log(` -> Not found`);
  }
}

run();
