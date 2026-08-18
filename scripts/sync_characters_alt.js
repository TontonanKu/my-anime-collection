import fs from 'fs';
import path from 'path';

const moviesFile = path.join(process.cwd(), 'src/data/movies.json');
const movies = JSON.parse(fs.readFileSync(moviesFile, 'utf8'));

const query = `
  query ($search: String, $type: MediaType) {
    Media(search: $search, type: $type) {
      idMal
      characters(sort: [ROLE, RELEVANCE], perPage: 8) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
          voiceActors(language: JAPANESE) {
            id
            name {
              full
            }
            image {
              large
            }
            languageV2
          }
        }
      }
    }
  }
`;

async function fetchForSearchTerm(searchTerm) {
  try {
    const anilistResponse = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          search: searchTerm,
          type: 'ANIME',
        },
      }),
    });

    if (!anilistResponse.ok) return null;
    const anilistData = await anilistResponse.json();
    const media = anilistData?.data?.Media;
    const idMal = media?.idMal;

    if (idMal) {
      let retries = 3;
      let delay = 1000;
      while (retries > 0) {
        try {
          const charsRes = await fetch(`https://api.jikan.moe/v4/anime/${idMal}/characters`);
          if (charsRes.ok) {
            const charsData = await charsRes.json();
            if (charsData.data && charsData.data.length > 0) {
              const topChars = charsData.data.slice(0, 8);
              return topChars.map((c) => {
                let va = null;
                if (c.voice_actors && c.voice_actors.length > 0) {
                  va = c.voice_actors.find((v) => v.language === 'Japanese' || v.language === 'Mandarin') || c.voice_actors[0];
                }
                return {
                  id: c.character.mal_id,
                  name: c.character.name,
                  image: c.character.images?.jpg?.image_url || '',
                  role: c.role,
                  voiceActor: va ? {
                    id: va.person.mal_id,
                    name: va.person.name,
                    image: va.person.images?.jpg?.image_url || '',
                    language: va.language
                  } : undefined
                };
              });
            }
            return null; // Empty MAL data
          } else if (charsRes.status === 429) {
            retries--;
            if (retries > 0) await new Promise(r => setTimeout(r, delay));
            delay *= 2;
          } else {
            break;
          }
        } catch (e) {
          retries--;
          if (retries > 0) await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
    }

    // Fallback to AniList
    if (media?.characters?.edges && media.characters.edges.length > 0) {
      return media.characters.edges.map((edge) => {
        const va = edge.voiceActors?.[0];
        return {
          id: edge.node.id,
          name: edge.node.name.full,
          image: edge.node.image.large,
          role: edge.role,
          voiceActor: va
            ? {
                id: va.id,
                name: va.name.full,
                image: va.image.large,
                language: va.languageV2 || 'Japanese',
              }
            : undefined,
        };
      });
    }

  } catch (e) {
    console.error(`Failed to fetch for ${searchTerm}:`, e);
  }
  return null;
}

async function run() {
  for (const movie of movies) {
    if (movie.characters && movie.characters.length > 0) {
      continue;
    }
    
    let allTitles = [movie.title];
    if (movie.altTitles) {
      allTitles = allTitles.concat(movie.altTitles);
    }

    console.log(`Trying to find characters for: ${movie.title}...`);
    
    let foundChars = null;
    for (const title of allTitles) {
      console.log(`  -> Searching: ${title}`);
      const chars = await fetchForSearchTerm(title);
      if (chars && chars.length > 0) {
        foundChars = chars;
        console.log(`    -> Success! Found ${chars.length} characters using "${title}"`);
        break;
      }
      await new Promise(r => setTimeout(r, 1000)); // Delay between searches
    }

    if (foundChars) {
      movie.characters = foundChars;
      fs.writeFileSync(moviesFile, JSON.stringify(movies, null, 2));
    } else {
      console.log(`    -> Still 0 characters found across all titles.`);
    }
  }
  console.log("Done syncing characters!");
}

run();
