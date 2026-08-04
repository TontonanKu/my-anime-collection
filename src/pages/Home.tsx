import { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { MovieGrid } from '../components/MovieGrid';
import { PageTransition } from '../components/PageTransition';
import { useMovies } from '../hooks/useMovies';
import { useDebounce } from '../hooks/useDebounce';
import { searchMovies } from '../utils/movieUtils';

export function Home() {
  const { movies } = useMovies();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);

  const results = useMemo(
    () => searchMovies(movies, debouncedQuery),
    [movies, debouncedQuery],
  );

  return (
    <PageTransition>
      <Header />
      <Hero movies={movies} />

      <section className="px-6 mt-6 mb-8">
        <SearchBar value={query} onChange={setQuery} />
      </section>

      <section className="px-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-[20px] text-on-surface tracking-tight">
            Watched Collection
          </h3>
          <span className="font-mono text-[11px] text-secondary uppercase tracking-widest">
            {results.length} {results.length === 1 ? 'film' : 'films'}
          </span>
        </div>
        <MovieGrid
          movies={results}
          isSearch={!!debouncedQuery.trim()}
        />
      </section>
    </PageTransition>
  );
}

