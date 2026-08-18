import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';
import { EmptyState } from './EmptyState';

interface MovieGridProps {
  movies: Movie[];
  isSearch?: boolean;
  onRestoreDummy?: () => void;
  canRestore?: boolean;
  limitMobile?: number;
}

export function MovieGrid({ movies, isSearch, onRestoreDummy, canRestore, limitMobile }: MovieGridProps) {
  if (movies.length === 0) {
    return <EmptyState isSearch={isSearch} onRestoreDummy={onRestoreDummy} canRestore={canRestore} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
      {movies.map((movie, i) => (
        <div key={movie.id} className={limitMobile && i >= limitMobile ? "hidden md:block" : ""}>
          <MovieCard movie={movie} index={i} />
        </div>
      ))}
    </div>
  );
}

