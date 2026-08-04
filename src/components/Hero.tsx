import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Movie } from '../types/movie';

interface HeroProps {
  movies?: Movie[];
}

export function Hero({ movies = [] }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil daftar film favorit atau film dengan rating tertinggi untuk disorot (spotlight)
  const spotlightMovies = useMemo(() => {
    if (movies.length === 0) return [];
    const favorites = movies.filter((m) => m.favorite);
    if (favorites.length >= 3) return favorites.slice(0, 6);
    return [...movies].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [movies]);

  useEffect(() => {
    if (spotlightMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [spotlightMovies.length, currentIndex]);

  if (spotlightMovies.length === 0) {
    return (
      <section className="relative w-full h-[360px] flex flex-col justify-end overflow-hidden bg-zinc-950 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative z-10 px-6 pb-8">
          <h2 className="font-display font-extrabold text-[32px] text-on-surface mb-1 tracking-tight">
            My Horror Collection
          </h2>
          <p className="text-[14px] text-secondary font-medium">Arsip Personal & Watchlist Horor</p>
        </div>
      </section>
    );
  }

  const current = spotlightMovies[currentIndex] || spotlightMovies[0];

  return (
    <section className="relative w-full h-[460px] md:h-[500px] flex flex-col justify-end overflow-hidden bg-zinc-950 border-b border-border/40 select-none group">
      {/* Background Poster / Banner with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${current.banner || current.poster}')` }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.65, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </AnimatePresence>

      {/* Cinematic Gradients & Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/80 to-transparent" />

      {/* Spotlight Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`info-${current.id}`}
          className="relative z-10 px-6 pb-8 md:pb-10 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Badge & Tag */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Sorotan Koleksi
            </span>
            <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
              {current.tag || current.genre[0]}
            </span>
          </div>

          {/* Movie Title */}
          <h2 className="font-display font-extrabold text-[32px] md:text-[38px] leading-[1.1] text-white mb-2 tracking-tight drop-shadow-md">
            {current.title}
          </h2>

          {/* Meta Info */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300 mb-3.5 flex-wrap">
            <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              <span className="material-symbols-outlined text-[15px] filled">star</span>
              <span>{current.rating}</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-mono">{current.year}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">{current.duration}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 text-[11px] font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {current.status === 'Watched' ? 'Ditonton' : 'Watchlist'}
            </span>
          </div>

          {/* Synopsis Preview */}
          <p className="text-xs md:text-sm text-zinc-300/90 line-clamp-2 leading-relaxed mb-6 font-normal max-w-lg drop-shadow-xs">
            {current.description}
          </p>

          {/* Actions & Carousel Indicators */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Link
                to={`/movie/${current.id}`}
                className="bg-primary-container text-white hover:opacity-95 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Lihat Detail</span>
              </Link>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length)}
                aria-label="Ganti Film Sorotan"
                title="Ganti Film Sorotan"
                className="bg-surface-container/80 hover:bg-surface-container text-on-surface p-2.5 rounded-xl border border-border/60 shadow-xs flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-zinc-300">shuffle</span>
              </button>
            </div>

            {/* Dots */}
            {spotlightMovies.length > 1 && (
              <div className="flex items-center gap-1.5">
                {spotlightMovies.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-6 bg-red-500' : 'w-1.5 bg-zinc-600/70 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

