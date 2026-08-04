import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  isSearch?: boolean;
  onRestoreDummy?: () => void;
  canRestore?: boolean;
}

export function EmptyState({ isSearch = true, onRestoreDummy, canRestore }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-14 px-6 bg-surface-container/40 rounded-3xl border border-dashed border-border/80 my-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="material-symbols-outlined text-primary-container/70 text-[48px] mb-3">movie_filter</span>
      <p className="font-display font-bold text-[18px] text-on-surface mb-2">
        {isSearch ? 'No matching films found' : 'Your collection is currently empty'}
      </p>
      <p className="text-secondary text-xs max-w-[260px] leading-relaxed mb-6">
        {isSearch
          ? 'Nothing in the archive matches your search. Try a different title or year.'
          : 'You have cleared the sample films! Ready to add the horror films you watch to your personal watchlist?'}
      </p>

      {!isSearch && (
        <div className="flex flex-col items-center gap-3 w-full max-w-[240px]">
          <Link
            to="/add"
            className="w-full bg-primary-container text-white text-xs font-mono font-bold uppercase tracking-wider py-3.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]! text-white">add</span>
            <span>Add Your First Film</span>
          </Link>
          {canRestore && (
            <button
              type="button"
              onClick={onRestoreDummy}
              className="text-[11px] font-mono text-secondary hover:text-on-surface underline uppercase font-semibold py-2 transition-colors cursor-pointer"
            >
              Restore 8 Sample Dummy Films
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

