import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { StatusBadge } from '../components/StatusBadge';
import { GenreChip } from '../components/GenreChip';
import { RatingStars } from '../components/RatingStars';
import { NoteEditor } from '../components/NoteEditor';
import { PageTransition } from '../components/PageTransition';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, toggleFavorite, setNote, setPersonalRating } = useMovies();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const movie = getById(Number(id));

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
      <div className="relative w-full h-[280px] overflow-hidden bg-surface-container">
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-50 w-11 h-11 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
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
          className="absolute inset-0 w-full h-full bg-cover bg-center"
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
            className="w-[150px] md:w-[250px] lg:w-[300px] shrink-0 rounded-[20px] overflow-hidden ambient-shadow bg-surface-container relative md:-mt-32 md:sticky md:top-24 z-20"
          >
            <img
              className="w-full h-auto object-cover aspect-[2/3]"
              src={movie.poster}
              alt={`${movie.title} poster`}
            />
            <StatusBadge />
          </motion.div>

          {/* Title & Metadata */}
          <div className="flex-grow pt-2 md:pt-24 lg:pt-32">
            <h1 className="font-display font-extrabold text-[28px] md:text-[40px] lg:text-[48px] leading-tight text-on-surface mb-3 md:mb-4">
              {movie.title}
            </h1>

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

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre.map((g) => (
                <GenreChip key={g} label={g} />
              ))}
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-secondary mb-2">
                My Rating
              </p>
              <RatingStars
                rating={movie.personalRating}
                interactive
                onChange={(value) => setPersonalRating(movie.id, value)}
              />
            </div>

            <div className="w-full h-px bg-border mb-5" />

            {/* Synopsis */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-[18px] text-on-surface mb-2">Sinopsis</h2>
              <p className="text-secondary leading-relaxed text-[15px]">{movie.description || 'Belum ada sinopsis.'}</p>
            </div>

            {/* Trailer */}
            {movie.trailerId && (
              <div className="mb-6">
                <h2 className="font-display font-bold text-[18px] text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 20 }}>
                    smart_display
                  </span>
                  Trailer
                </h2>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container-low ambient-shadow border border-border/40">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${movie.trailerId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Alt Titles */}
            {movie.altTitles && movie.altTitles.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold text-[15px] text-on-surface mb-2">Judul Alternatif</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.altTitles.map((alt, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono text-secondary bg-surface-container px-2.5 py-1 rounded-lg border border-border/60"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personal Notes */}
        <div className="mb-12">
          <h2 className="font-display font-bold text-[18px] text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: 20 }}>
              edit_note
            </span>
            Personal Note
          </h2>
          <NoteEditor
            initialNote={movie.note}
            onSave={(note) => setNote(movie.id, note)}
          />
        </div>

    </main>
    </PageTransition>
  );
}
