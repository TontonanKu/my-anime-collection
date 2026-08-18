import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { MovieGrid } from '../components/MovieGrid';
import { PageTransition } from '../components/PageTransition';
import { useMovies } from '../hooks/useMovies';
import { useDebounce } from '../hooks/useDebounce';
import { searchMovies } from '../utils/movieUtils';
import { ChevronRight } from 'lucide-react';

export function Home() {
  const { movies } = useMovies();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);

  const results = useMemo(
    () => searchMovies(movies, debouncedQuery),
    [movies, debouncedQuery],
  );

  const animeMovies = useMemo(
    () => movies.filter(m => m.category === 'Anime').sort((a, b) => b.rating - a.rating),
    [movies]
  );
  const TRENDING_DONGHUA = [
    'Renegade Immortal',
    'Tales of Herding Gods',
    "Beyond Time's Gaze",
    'Perfect World',
    'Soul Land 2',
    'One Slash to the heavens',
    'Tomb of Fallen Gods',
    'Swallowed Star'
  ];

  const donghuaMovies = useMemo(
    () => movies.filter(m => m.category === 'Donghua').sort((a, b) => {
      const idxA = TRENDING_DONGHUA.findIndex(t => a.title.includes(t));
      const idxB = TRENDING_DONGHUA.findIndex(t => b.title.includes(t));
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      
      return b.rating - a.rating;
    }),
    [movies]
  );

  const isSearch = !!debouncedQuery.trim();

  return (
    <PageTransition>
      <Header />
      <Hero movies={movies} />

      <div className="max-w-[1440px] mx-auto w-full md:px-8">
        <section className="px-6 mt-6 mb-8">
          <SearchBar value={query} onChange={setQuery} />
        </section>

        {isSearch ? (
          <section className="px-6 pb-12">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-[20px] text-on-surface tracking-tight">
                Search Results
              </h3>
              <span className="font-mono text-[11px] text-secondary uppercase tracking-widest">
                {results.length} found
              </span>
            </div>
            <MovieGrid
              movies={results}
              isSearch={true}
            />
          </section>
        ) : (
          <div className="pb-12 space-y-12">
            {/* Donghua Section */}
            <section className="px-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-[20px] text-on-surface tracking-tight">
                Trending Donghua
              </h3>
              <Link 
                to="/category/donghua" 
                className="flex items-center gap-1 font-mono text-[11px] text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <MovieGrid
              movies={donghuaMovies.slice(0, 12)}
              isSearch={false}
              limitMobile={8}
            />
          </section>

          {/* Anime Section */}
          <section className="px-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-[20px] text-on-surface tracking-tight">
                Trending Anime
              </h3>
              <Link 
                to="/category/anime" 
                className="flex items-center gap-1 font-mono text-[11px] text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <MovieGrid
              movies={animeMovies.slice(0, 12)}
              isSearch={false}
              limitMobile={8}
            />
          </section>
        </div>
      )}
      </div>
    </PageTransition>
  );
}

