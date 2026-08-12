import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { MovieGrid } from '../components/MovieGrid';
import { PageTransition } from '../components/PageTransition';
import { useMovies } from '../hooks/useMovies';
import { useDebounce } from '../hooks/useDebounce';
import { searchMovies } from '../utils/movieUtils';
import { ChevronLeft } from 'lucide-react';

export function CategoryView() {
  const { type } = useParams<{ type: string }>(); // 'anime' or 'donghua'
  const navigate = useNavigate();
  const { movies } = useMovies();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);

  // Filter by category
  const categoryMovies = useMemo(() => {
    if (!type) return [];
    return movies.filter(m => m.category?.toLowerCase() === type.toLowerCase());
  }, [movies, type]);

  // Apply search
  const results = useMemo(
    () => searchMovies(categoryMovies, debouncedQuery),
    [categoryMovies, debouncedQuery]
  );

  const displayType = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';

  return (
    <PageTransition>
      <Header />
      <div className="pt-20 px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        
        <h1 className="font-display font-bold text-3xl mb-6">{displayType} Collection</h1>
        
        <section className="mb-8">
          <SearchBar value={query} onChange={setQuery} />
        </section>

        <section className="pb-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-[20px] text-on-surface tracking-tight">
              All {displayType}
            </h3>
            <span className="font-mono text-[11px] text-secondary uppercase tracking-widest">
              {results.length} {results.length === 1 ? 'series' : 'series'}
            </span>
          </div>
          <MovieGrid
            movies={results}
            isSearch={!!debouncedQuery.trim()}
          />
        </section>
      </div>
    </PageTransition>
  );
}
