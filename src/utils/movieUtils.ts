import type { Movie } from '../types/movie';

/** Filters movies by title or release year against a free-text query. */
export function searchMovies(movies: Movie[], query: string): Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return movies;

  return movies.filter((movie) => {
    const titleMatch = movie.title.toLowerCase().includes(q);
    const yearMatch = String(movie.year).includes(q);
    return titleMatch || yearMatch;
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

  return { totalMovies, averageRating, totalWatchMinutes, favoriteCount, genreCounts };
}
