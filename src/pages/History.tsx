import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { useMovies } from '../hooks/useMovies';
import { useDebounce } from '../hooks/useDebounce';
import { searchMovies } from '../utils/movieUtils';
import { ChevronLeft } from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const { movies } = useMovies();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);
  
  const [filter, setFilter] = useState<'Semua' | 'Donghua' | 'Anime'>('Semua');

  // 1. Filter by category
  const filteredByCategory = useMemo(() => {
    if (filter === 'Semua') return movies;
    return movies.filter(m => m.category === filter);
  }, [movies, filter]);

  // 2. Apply search
  const searchResults = useMemo(() => {
    return searchMovies(filteredByCategory, debouncedQuery);
  }, [filteredByCategory, debouncedQuery]);

  // 3. Sort alphabetically
  const sortedMovies = [...searchResults].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-surface pb-20"
    >
      <Header />
      
      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-[24px] text-on-surface">
            Riwayat
          </h1>
          <span className="text-secondary text-sm font-mono">{sortedMovies.length} Judul</span>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {['Semua', 'Donghua', 'Anime'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all shrink-0 ${
                filter === cat 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'bg-surface-container text-secondary hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {sortedMovies.length > 0 ? (
            sortedMovies.map((movie) => (
              <Link 
                to={`/movie/${movie.id}`} 
                key={movie.id}
                className="flex items-center gap-4 p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-colors active:scale-[0.98]"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-sm bg-surface-container-high">
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Content */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface text-[15px] leading-tight truncate mb-1">
                    {movie.title}
                  </h3>
                  <p className="text-secondary text-[13px]">
                    Terakhir: Episode {movie.progress || '1'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-secondary">
              Tidak ada hasil yang ditemukan.
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
