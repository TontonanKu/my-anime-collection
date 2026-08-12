import { Link } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';

export function Header() {
  const { restoreDummyMovies } = useMovies();

  return (
    <header className="bg-surface/80 backdrop-blur-md text-primary-container sticky top-0 z-50 flex justify-between items-center px-4 py-4 w-full">
      <Link to="/" className="font-display font-extrabold text-[18px] tracking-tight text-on-surface hover:opacity-80 transition-opacity">
        My Collection
      </Link>
      <div className="flex items-center gap-1.5">
        <button
          onClick={restoreDummyMovies}
          aria-label="Restore Deleted"
          className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2"
        >
          <span className="material-symbols-outlined text-[22px] text-red-500">restore</span>
        </button>
        <Link
          to="/history"
          aria-label="Riwayat"
          className="bg-primary-container text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]! text-white">history</span>
          <span>Riwayat</span>
        </Link>
        <Link
          to="/grid"
          aria-label="3x3 Grid Generator"
          className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2"
        >
          <span className="material-symbols-outlined text-[22px]">grid_view</span>
        </Link>
        <Link
          to="/stats"
          aria-label="View statistics"
          className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2"
        >
          <span className="material-symbols-outlined text-[22px]">bar_chart</span>
        </Link>
      </div>
    </header>
  );
}

