import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { StatusBadge } from '../components/StatusBadge';
import { GenreChip } from '../components/GenreChip';
import { PageTransition } from '../components/PageTransition';
import { GooeySeasonNav } from '../components/GooeySeasonNav';
import { CharactersSection } from '../components/CharactersSection';
import type { SeasonData } from '../components/GooeySeasonNav';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, toggleFavorite } = useMovies();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const movie = getById(Number(id));

  const parsedSeasons: SeasonData[] = (movie?.seasonData || '').split('\n').map(line => {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return {
        name: parts[0],
        episodes: parseInt(parts[1]) || 0,
        poster: parts[2] || undefined,
        isCompleted: parts[1].toUpperCase().includes('END')
      };
    }
    return null;
  }).filter(Boolean) as SeasonData[];

  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // Determine current poster and status
  const currentPoster = parsedSeasons[activeSeasonIndex]?.poster || movie?.poster;
  const currentSeasonCompleted = parsedSeasons[activeSeasonIndex]?.isCompleted;
  
  // If we are looking at a specific season that is not completed, we should probably show Watching
  // If there's no seasonData, just use the global status.
  const displayStatus = parsedSeasons.length > 0 
    ? (currentSeasonCompleted ? 'Completed' : 'Watching') 
    : movie?.status;

  if (!movie) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
          <p className="text-on-surface font-semibold mb-2">Film not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-container text-sm font-mono uppercase tracking-widest mt-2"
          >
            Back to Collection
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Hero Banner */}
      <div className="relative w-full h-[350px] md:h-[500px] lg:h-[650px] xl:h-[700px] overflow-hidden bg-surface-container">
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-50 w-11 h-11 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button
          aria-label="Edit Images"
          onClick={() => navigate(`/movie/${movie.id}/edit`)}
          className="absolute top-6 right-[88px] z-50 w-11 h-11 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button
          aria-label={movie.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => toggleFavorite(movie.id)}
          className="absolute top-6 right-6 z-50 w-11 h-11 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-primary-container hover:opacity-70 transition-opacity active:scale-90"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: movie.favorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-[center_20%]"
          style={{ backgroundImage: `url('${movie.banner}')` }}
        />
        <div className="absolute inset-0 fog-gradient" />
      </div>

      {/* Content */}
      <main className="relative z-10 px-6 md:px-12 -mt-[100px] max-w-[1440px] mx-auto w-full pb-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-[150px] md:w-[250px] lg:w-[300px] shrink-0 rounded-[20px] overflow-hidden ambient-shadow bg-surface-container relative md:-mt-32 z-20"
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentPoster}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-auto object-cover aspect-[2/3]"
                src={currentPoster}
                alt={`${movie.title} poster`}
              />
            </AnimatePresence>
            <StatusBadge status={displayStatus} />
          </motion.div>

          {/* Title & Metadata */}
          <div className="flex-grow pt-2 md:pt-24 lg:pt-32">
            <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-4 md:gap-6 w-full pb-6">
              {/* Left Side: Title, Rating, Genres */}
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 md:mb-4">
                  <h1 className="font-display font-extrabold text-[28px] md:text-[40px] lg:text-[48px] leading-tight text-on-surface">
                    {movie.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-outlined text-primary-container"
                      style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-[14px] font-semibold text-on-surface">
                      {movie.rating.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-secondary font-mono">AniList</span>
                  </div>
                  <span className="text-outline">•</span>
                  <span className="font-mono text-[12px] text-secondary">{movie.year}</span>
                  <span className="text-outline">•</span>
                  <span className="font-mono text-[12px] text-secondary">{movie.duration.toUpperCase()}</span>
                </div>

                <div className={`flex flex-wrap gap-2 ${movie.altTitles && movie.altTitles.length > 0 ? 'mb-4' : ''}`}>
                  {movie.genre.map((g) => (
                    <GenreChip key={g} label={g} />
                  ))}
                </div>

                {movie.altTitles && movie.altTitles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-secondary mb-2">
                      Judul Alternatif
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {movie.altTitles.map((alt) => (
                        <span
                          key={alt}
                          className="px-2 py-1 bg-surface-container rounded-md border border-border/40 text-secondary text-[11px] font-medium"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Side: Season Nav & Trailer Button */}
              <div className="shrink-0 md:mt-2 flex flex-col items-start md:items-end">
                {parsedSeasons.length > 0 && (
                  <GooeySeasonNav 
                    seasons={parsedSeasons} 
                    activeSeasonIndex={activeSeasonIndex} 
                    onSeasonChange={setActiveSeasonIndex} 
                  />
                )}
                {movie.trailerId && (
                  <button
                    onClick={() => setIsTrailerModalOpen(true)}
                    className="mt-auto flex items-center justify-center gap-2 bg-[#8B0000] hover:bg-[#660000] text-white px-5 py-2.5 rounded-full font-bold text-[13px] tracking-wider transition-colors w-full md:w-fit shadow-lg"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    TONTON TRAILER
                  </button>
                )}
              </div>
            </div>


            <div className="w-full h-px bg-border mb-5" />

            {/* Synopsis */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-[18px] text-on-surface mb-2">Sinopsis</h2>
              <p className="text-secondary leading-relaxed text-[15px]">{movie.description || 'Belum ada sinopsis.'}</p>
            </div>




          </div>
        </div>

        <CharactersSection title={movie.title} prefetchedCharacters={movie.characters as any} />

    </main>

      {/* Trailer Modal */}
      <AnimatePresence>
        {isTrailerModalOpen && movie.trailerId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setIsTrailerModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[1000px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsTrailerModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
