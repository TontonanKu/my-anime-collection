import { useState, useEffect, useMemo, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Movie } from '../types/movie';

interface HeroProps {
  movies?: Movie[];
}

export function Hero({ movies = [] }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const playerRef = useRef<YouTubePlayer>(null);

  // Ambil top 6 anime dan top 6 donghua untuk disorot (spotlight)
  const spotlightMovies = useMemo(() => {
    if (movies.length === 0) return [];
    
    const topAnime = [...movies]
      .filter(m => m.category === 'Anime')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
      
    const topDonghua = [...movies]
      .filter(m => m.category === 'Donghua')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
      
    // Selang-seling (mix) anime dan donghua
    const mixed: Movie[] = [];
    const maxLength = Math.max(topAnime.length, topDonghua.length);
    for (let i = 0; i < maxLength; i++) {
      if (topAnime[i]) mixed.push(topAnime[i]);
      if (topDonghua[i]) mixed.push(topDonghua[i]);
    }
    
    return mixed.length > 0 ? mixed : movies.slice(0, 6);
  }, [movies]);

  const current = spotlightMovies[currentIndex] || spotlightMovies[0];

  useEffect(() => {
    if (spotlightMovies.length <= 1) return;
    
    // Jika ada trailer, rotasi diatur oleh event onEnd dari YouTube
    if (current?.trailerId) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [spotlightMovies.length, currentIndex, current?.trailerId]);

  // Reset video state when slide changes
  useEffect(() => {
    setVideoReady(false);
  }, [currentIndex]);

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
    event.target.playVideo();
    setVideoReady(true);
  };

  if (spotlightMovies.length === 0) {
    return (
      <section className="relative w-full h-[360px] flex flex-col justify-end overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative z-10 px-6 pb-8">
          <h2 className="font-display font-extrabold text-[32px] text-white mb-1 tracking-tight">
            My Collection
          </h2>
          <p className="text-[14px] text-zinc-400 font-medium">Personal Archive & Watchlist</p>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto md:px-6 lg:px-8">
      <section className="relative w-full h-[460px] md:h-[550px] lg:h-[650px] flex flex-col justify-end overflow-hidden bg-zinc-950 border-b border-zinc-800 shadow-xl select-none group rounded-none md:rounded-b-[2rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${current.banner || current.poster}')` }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.75, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </AnimatePresence>

      {/* YouTube Trailer Background */}
      {current.trailerId && (
        <div
          key={`yt-${current.id}`}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-700 z-0 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '100vw',
            height: '56.25vw',
            minHeight: '100vh',
            minWidth: '177.77vh'
          }}
        >
          <YouTube
            videoId={current.trailerId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                mute: 1,
              },
            }}
            onReady={onReady}
            onEnd={() => setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length)}
            onError={() => setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length)}
            className="w-full h-full"
            iframeClassName="w-full h-full scale-[1.3] md:scale-[1.2]"
          />
        </div>
      )}

      {/* Cinematic Gradients & Vignettes (100% Isolated Dark Palette) */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/20 to-transparent opacity-90 md:w-3/4 lg:w-2/3" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-zinc-950/80 to-transparent opacity-60" />

      {/* Spotlight Content */}
      <div className="max-w-[1440px] mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${current.id}`}
            className="px-6 pb-8 md:pb-12 md:px-8 max-w-2xl lg:max-w-3xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Badge & Tag */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
                Sorotan Koleksi
              </span>
              <span className="text-[11px] md:text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-800">
                {current.tag || current.genre[0]}
              </span>
            </div>

            {/* Movie Title */}
            <h2 className="font-display font-extrabold text-[32px] md:text-[48px] lg:text-[56px] leading-[1.1] text-white mb-3 md:mb-4 tracking-tight drop-shadow-lg">
              {current.title}
            </h2>

            {/* Meta Info */}
            <div className="flex items-center gap-2.5 md:gap-4 text-xs md:text-sm font-semibold text-zinc-300 mb-4 md:mb-6 flex-wrap">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                <span className="material-symbols-outlined text-[15px] md:text-[18px] filled">star</span>
                <span>{current.rating}</span>
              </div>
              <span className="text-zinc-500">?</span>
              <span className="text-zinc-200 font-mono">{current.year}</span>
              <span className="text-zinc-500">?</span>
              <span className="text-zinc-200">{current.duration}</span>
              <span className="text-zinc-500">?</span>
              <span className="text-emerald-400 text-[11px] md:text-xs font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {current.status === 'Completed' ? 'Tamat' : 'Watchlist'}
              </span>
            </div>

            {/* Synopsis Preview */}
            <p className="text-xs md:text-base lg:text-lg text-zinc-300 line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 md:mb-8 font-normal max-w-lg lg:max-w-2xl drop-shadow-md">
              {current.description}
            </p>

            {/* Actions & Carousel Indicators */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 md:gap-4">
                <Link
                  to={`/movie/${current.id}`}
                  className="bg-red-700 hover:bg-red-600 text-white font-mono font-bold text-xs md:text-sm uppercase tracking-wider px-5 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-lg flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[22px]">info</span>
                  <span>Lihat Detail</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlightMovies.length)}
                  aria-label="Ganti Film Sorotan"
                  title="Ganti Film Sorotan"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-zinc-700/80 shadow-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[22px] text-zinc-200">shuffle</span>
                </button>
                {/* Mute Button */}
                {current.trailerId && videoReady && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                    title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                    className="bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-md text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-zinc-700/80 shadow-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] md:text-[22px] text-zinc-200">
                      {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>
                )}
              </div>

              {/* Dots */}
              {spotlightMovies.length > 1 && (
                <div className="flex items-center gap-1.5 md:gap-2">
                  {spotlightMovies.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 md:h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex ? 'w-6 md:w-8 bg-red-500' : 'w-1.5 md:w-2 bg-zinc-600/70 hover:bg-zinc-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
    </div>
  );
}

