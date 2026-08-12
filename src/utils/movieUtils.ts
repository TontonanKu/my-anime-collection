import type { Movie } from '../types/movie';

/** Filters movies by title or release year against a free-text query. */
export function searchMovies(movies: Movie[], query: string): Movie[] {
  // Strip punctuation and multiple spaces for a more forgiving search
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  
  const q = normalize(query);
  if (!q) return movies;

  // Split query into keywords so if they type "beyond time gaze" it matches "beyond time's gaze"
  const keywords = q.split(' ');

  return movies.filter((movie) => {
    const titleNorm = normalize(movie.title);
    const titleMatch = keywords.every(k => titleNorm.includes(k));
    
    const altTitleMatch = movie.altTitles?.some(alt => {
      const altNorm = normalize(alt);
      return keywords.every(k => altNorm.includes(k));
    }) ?? false;
    
    const yearMatch = String(movie.year).includes(q);
    return titleMatch || altTitleMatch || yearMatch;
  });
}

export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function formatMinutesAsHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export interface CollectionStats {
  totalMovies: number;
  averageRating: number;
  totalWatchMinutes: number;
  favoriteCount: number;
  genreCounts: Record<string, number>;
  highestRated?: Movie;
  lowestRated?: Movie;
  watchingPersona: string;
}

export function computeStats(movies: Movie[]): CollectionStats {
  const totalMovies = movies.length;
  const totalWatchMinutes = movies.reduce(
    (sum, m) => sum + (m.durationMinutes || parseDurationToMinutes(m.duration)),
    0,
  );
  const averageRating = totalMovies
    ? movies.reduce((sum, m) => sum + m.rating, 0) / totalMovies
    : 0;
  const favoriteCount = movies.filter((m) => m.favorite).length;

  const genreCounts: Record<string, number> = {};
  movies.forEach((m) => {
    m.genre.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedByRating = [...movies].filter(m => m.rating > 0).sort((a, b) => b.rating - a.rating);
  const highestRated = sortedByRating[0];
  const lowestRated = sortedByRating[sortedByRating.length - 1];

  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  let watchingPersona = "The Generalist";
  if (topGenre === "Action") watchingPersona = "Action Junkie";
  else if (topGenre === "Romance") watchingPersona = "Hopeless Romantic";
  else if (topGenre === "Comedy") watchingPersona = "The Joker";
  else if (topGenre === "Drama") watchingPersona = "Drama Magnet";
  else if (topGenre === "Fantasy" || topGenre === "Isekai") watchingPersona = "Escapist Explorer";
  else if (topGenre === "Horror") watchingPersona = "Thrill Seeker";
  else if (topGenre === "Slice of Life") watchingPersona = "Chill Vibes Only";
  else if (topGenre) watchingPersona = `${topGenre} Enthusiast`;

  return { 
    totalMovies, averageRating, totalWatchMinutes, favoriteCount, 
    genreCounts, highestRated, lowestRated, watchingPersona
  };
}
