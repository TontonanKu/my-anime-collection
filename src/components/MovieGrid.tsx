import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';
import { EmptyState } from './EmptyState';

interface MovieGridProps {
  movies: Movie[];
  isSearch?: boolean;
  onRestoreDummy?: () => void;
  canRestore?: boolean;
}

export function MovieGrid({ movies, isSearch, onRestoreDummy, canRestore }: MovieGridProps) {
  if (movies.length === 0) {
    return <EmptyState isSearch={isSearch} onRestoreDummy={onRestoreDummy} canRestore={canRestore} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
      {movies.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} index={i} />
      ))}
    </div>
  );
}

