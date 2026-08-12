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
    }
    trailer {
      id
      site
    }
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
    if (!response.ok) {
      if (response.status === 429) {
        console.log(`Rate limited! Waiting...`);
        await new Promise(r => setTimeout(r, 2000));
        return fetchAniList(searchTitle);
      }
      return null;
    }
    const json = await response.json();
    return json.data?.Media;
  } catch (error) {
    return null;
  }
}

async function run() {
  let updatedCount = 0;
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    
    // We'll skip searching if it already has a trailerId
    if (!movie.trailerId) {
      // Use the english or romaji title if we have altTitles, or just the title
      // It's faster to just use the primary title
      let searchTitle = movie.title;
      // manual map for the hard ones we found earlier
      const mappings = {
        'Botsuraku Yotei no Kizoku dakedo, Ore ga Mahou wo Kiwamete Dou Suru': 'Botsuraku Yotei no Kizoku',
        'Dekisokonai to Yobarete Motoeiyuu wa Jika Kara Tsuihou Sareta node Sukikatte ni Ikiru Koto ni Shita': 'The Banished Former Hero Lives as He Pleases',
        'Gotoubun no Hanayome': 'The Quintessential Quintuplets',
        "Hazurewaku no 'Joutai Ijou Skill' de Saikyou ni Natta Ore ga Subete wo Juurin suru made": 'Failure Frame',
        'Kimi no Koto ga Daidaidaidaidaisuki na 100-nin no Kanojo': '100 Girlfriends',
        'Kimi to Boku no Saigo no Senjou (Kimisen)': 'Our Last Crusade',
        'Noumin Kanren no Skill bakka Agetetara Nazeka Tsuyoku Natta': "I've Somehow Gotten Stronger When I Improved My Farm-Related Skills",
        'Seiken Gakuin no Makentsukai': 'The Demon Sword Master of Excalibur Academy',
        'Shinmai Ossan Boukensha, Saikyou Party ni Shinu hodo Kitaerarete Muteki ni Naru.': 'The Ossan Newbie Adventurer',
        'Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san': 'Alya Sometimes Hides Her Feelings in Russian',
        'Tsuki ga Michibiku Isekai Douchuu': 'Tsukimichi',
        'Yuusha Party wo Oidasareta Kiyoubinbou': 'The Jack-of-All-Trades, Party of None'
      };
      
      searchTitle = mappings[movie.title] || movie.title;
      
      console.log(`[${i+1}/${movies.length}] Searching for: ${searchTitle}`);
      const media = await fetchAniList(searchTitle);
      
      if (media && media.trailer && media.trailer.site === 'youtube') {
        movie.trailerId = media.trailer.id;
        console.log(` -> Found trailer: ${movie.trailerId}`);
        updatedCount++;
      } else {
        console.log(` -> No YouTube trailer found.`);
      }
      // Wait to respect rate limits
      await new Promise(r => setTimeout(r, 750));
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(outPath, JSON.stringify(movies, null, 2), 'utf-8');
    console.log(`Updated ${updatedCount} movies with trailers!`);
  } else {
    console.log(`No new trailers found.`);
  }
}

run();
