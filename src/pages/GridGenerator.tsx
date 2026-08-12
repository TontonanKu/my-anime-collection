import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useMovies } from '../hooks/useMovies';
import { PageTransition } from '../components/PageTransition';
import { SearchBar } from '../components/SearchBar';
import { searchMovies } from '../utils/movieUtils';
import type { Movie } from '../types/movie';

export function GridGenerator() {
  const navigate = useNavigate();
  const { movies } = useMovies();
  const [query, setQuery] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchMovies(movies, query).slice(0, 10);
  }, [movies, query]);

  const handleSelect = (movie: Movie) => {
    if (selectedMovies.length < 9 && !selectedMovies.find(m => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, movie]);
      setQuery('');
    }
  };

  const handleRemove = (id: number) => {
    setSelectedMovies(selectedMovies.filter(m => m.id !== id));
  };

  const downloadImage = async () => {
    if (gridRef.current === null) return;
    try {
      const dataUrl = await toPng(gridRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'my-3x3-anime.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

  return (
    <PageTransition>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-display font-bold text-[18px] md:text-[22px] text-on-surface">3x3 Grid</h1>
          </div>
          {selectedMovies.length > 0 && (
            <button
              onClick={downloadImage}
              className="bg-primary-container text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-mono uppercase font-bold flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Save
            </button>
          )}
        </div>
      </header>

      <main className="px-6 md:px-8 pb-20 max-w-[1440px] mx-auto w-full">
        <div className="max-w-2xl mx-auto">
          <p className="text-secondary text-sm md:text-base mb-6 text-center">
            Pilih 9 anime favoritmu untuk membuat kolase 3x3 yang bisa di-download dan dibagikan. ({selectedMovies.length}/9)
          </p>

          <div className="flex justify-center mb-8">
            <div 
              ref={gridRef}
              className="grid grid-cols-3 gap-1 w-full max-w-[360px] aspect-square bg-surface-container p-1 rounded-xl shadow-2xl"
            >
            {Array.from({ length: 9 }).map((_, i) => {
              const movie = selectedMovies[i];
              return (
                <div key={i} className="group bg-surface-container relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center border border-border/20 transition-all duration-300 hover:shadow-lg">
                  {movie ? (
                    <>
                      <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      {/* Removing overlay for download, only show in UI */}
                      <button 
                        data-html2canvas-ignore="true"
                        onClick={() => handleRemove(movie.id)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                      >
                        <span className="material-symbols-outlined text-white text-3xl scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                          delete
                        </span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => document.querySelector('input')?.focus()}
                      className="w-full h-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary text-2xl transition-colors">add</span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Select */}
        {selectedMovies.length < 9 && (
          <div className="space-y-4 relative">
            <SearchBar value={query} onChange={setQuery} />
            
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-surface-container-low rounded-xl p-2 absolute top-[60px] left-0 w-full z-10 ambient-shadow-sm flex flex-col gap-1 max-h-[300px] overflow-y-auto"
                >
                  {results.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => handleSelect(movie)}
                      className="flex items-center gap-3 w-full p-2 hover:bg-surface-container rounded-lg text-left"
                    >
                      <img src={movie.poster} className="w-10 h-14 object-cover rounded bg-surface-container" />
                      <div>
                        <p className="font-display font-bold text-on-surface text-sm line-clamp-1">{movie.title}</p>
                        <p className="font-mono text-secondary text-[10px]">{movie.year}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        </div>
      </main>
    </PageTransition>
  );
}
