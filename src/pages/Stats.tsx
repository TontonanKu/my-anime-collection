import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { computeStats, formatMinutesAsHours } from '../utils/movieUtils';
import { PageTransition } from '../components/PageTransition';

const statCardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

export function Stats() {
  const navigate = useNavigate();
  const { movies } = useMovies();
  const stats = useMemo(() => computeStats(movies), [movies]);

  const topGenres = useMemo(
    () =>
      Object.entries(stats.genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [stats.genreCounts],
  );

  const maxGenreCount = topGenres[0]?.[1] ?? 1;

  const cards = [
    { label: 'Total Movies', value: stats.totalMovies.toString(), icon: 'movie' },
    { label: 'Average Rating', value: stats.averageRating.toFixed(1), icon: 'star' },
    { label: 'Total Watch Time', value: formatMinutesAsHours(stats.totalWatchMinutes), icon: 'schedule' },
    { label: 'Favorites', value: stats.favoriteCount.toString(), icon: 'favorite' },
  ];

  return (
    <PageTransition>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-3 px-4 py-4 w-full">
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-[18px] text-on-surface">Statistics</h1>
      </header>

      <main className="px-6 pb-16 pt-2">
        <div className="grid grid-cols-2 gap-4 mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={statCardVariants}
              initial="hidden"
              animate="show"
              className="bg-surface-container-low rounded-2xl p-5 ambient-shadow-sm"
            >
              <span
                className="material-symbols-outlined text-primary-container mb-3 block"
                style={{ fontSize: 22 }}
              >
                {card.icon}
              </span>
              <p className="font-display font-extrabold text-[24px] text-on-surface leading-none mb-1">
                {card.value}
              </p>
              <p className="font-mono text-[11px] text-secondary uppercase tracking-widest">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="font-display font-bold text-[18px] text-on-surface mb-4">
            Top Genres
          </h3>
          <div className="flex flex-col gap-4">
            {topGenres.map(([genre, count], i) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="text-[14px] text-on-surface font-medium">{genre}</span>
                  <span className="font-mono text-[12px] text-secondary">{count}</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-container rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxGenreCount) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
