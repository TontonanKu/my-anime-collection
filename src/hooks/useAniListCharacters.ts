import { useState, useEffect } from 'react';

export interface Character {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActor?: {
    id: number;
    name: string;
    image: string;
    language: string;
  };
}

export function useAniListCharacters(title: string, prefetchedCharacters?: Character[]) {
  const [characters, setCharacters] = useState<Character[]>(prefetchedCharacters || []);
  const [loading, setLoading] = useState<boolean>(!prefetchedCharacters);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>(prefetchedCharacters ? 'Local Storage (Prefetched)' : '');

  useEffect(() => {
    if (prefetchedCharacters && prefetchedCharacters.length > 0) {
      setCharacters(prefetchedCharacters);
      setDataSource('Local Storage (Prefetched)');
      setLoading(false);
      return;
    }

    if (!title) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCharacters = async () => {
      setLoading(true);
      setError(null);
      setDataSource('');
      
      try {
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

        const anilistResponse = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: {
              search: title,
              type: 'ANIME',
            },
          }),
        });

        let anilistData = null;
        if (anilistResponse.ok) {
          anilistData = await anilistResponse.json();
        }

        const media = anilistData?.data?.Media;
        const idMal = media?.idMal;
        
        let malSuccess = false;
        let malErrorReason = '';

        if (idMal) {
          // Retry logic for Jikan API
          let retries = 3;
          let delay = 1000;

          while (retries > 0 && !malSuccess) {
            try {
              const charsRes = await fetch(`https://api.jikan.moe/v4/anime/${idMal}/characters`);
              if (charsRes.ok) {
                const charsData = await charsRes.json();
                if (charsData.data && charsData.data.length > 0) {
                  const topChars = charsData.data.slice(0, 8);
                  const mappedMal = topChars.map((c: any) => {
                    let va = null;
                    if (c.voice_actors && c.voice_actors.length > 0) {
                      va = c.voice_actors.find((v: any) => v.language === 'Japanese' || v.language === 'Mandarin') || c.voice_actors[0];
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
                  if (isMounted) {
                    setCharacters(mappedMal);
                    setDataSource('MyAnimeList');
                  }
                  malSuccess = true;
                  break;
                } else {
                  malErrorReason = 'MAL returned empty data';
                  break; // Don't retry if it's just empty
                }
              } else if (charsRes.status === 429) {
                malErrorReason = 'MAL Rate Limit (429)';
                retries--;
                if (retries > 0) await new Promise(r => setTimeout(r, delay));
                delay *= 2;
              } else {
                malErrorReason = `MAL Error: ${charsRes.status}`;
                break; // Don't retry on 404 etc
              }
            } catch (e: any) {
              malErrorReason = `MAL Fetch Exception: ${e.message}`;
              retries--;
              if (retries > 0) await new Promise(r => setTimeout(r, delay));
              delay *= 2;
            }
          }
        } else {
          malErrorReason = 'idMal not found in AniList';
        }

        if (!malSuccess && media?.characters?.edges) {
          const edges = media.characters.edges;
          const aniListChars = edges.map((edge: any) => {
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
          if (isMounted) {
            setCharacters(aniListChars);
            setDataSource(`AniList (Fallback: ${malErrorReason})`);
          }
        }

      } catch (err: any) {
        if (isMounted) setError('Failed to fetch characters');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCharacters();

    return () => {
      isMounted = false;
    };
  }, [title]);

  return { characters, loading, error, dataSource };
}
