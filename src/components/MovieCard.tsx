import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { GenreChip } from './GenreChip';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <motion.article
      className="flex flex-col gap-3 cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
      onClick={() => navigate(`/movie/${movie.id}`)}
      whileTap={{ scale: 0.96 }}
    >
      <motion.div
        className="relative w-full aspect-[2/3] rounded-[24px] overflow-hidden ambient-shadow-sm bg-surface-container"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <img
          className="w-full h-full object-cover"
          src={movie.poster}
          alt={`${movie.title} poster`}
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <GenreChip label={movie.tag} variant="onPoster" />
        </div>
        {movie.favorite && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-container-lowest/90 flex items-center justify-center shadow-sm">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
        )}
      </motion.div>
      <div>
        <h4 className="text-[16px] text-on-surface font-semibold leading-tight">{movie.title}</h4>
        <p className="font-mono text-[12px] text-secondary mt-1 tracking-wide">{movie.year}</p>
      </div>
    </motion.article>
  );
}
