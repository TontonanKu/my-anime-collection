import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-surface/80 backdrop-blur-md text-primary-container sticky top-0 z-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center px-4 md:px-8 py-4">
        <Link to="/" className="font-display font-extrabold text-[18px] md:text-[22px] tracking-tight text-on-surface hover:opacity-80 transition-opacity">
          My Collection
        </Link>
        <div className="flex items-center gap-1.5 md:gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2 mr-1"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[26px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link
            to="/history"
            aria-label="Riwayat"
            className="bg-primary-container text-white text-xs md:text-sm font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 md:px-5 md:py-2 rounded-full flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]! text-white">history</span>
            <span className="hidden sm:inline">Riwayat</span>
          </Link>
          <Link
            to="/board"
            aria-label="Watchboard Kanban"
            className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[26px]">view_kanban</span>
          </Link>
          <Link
            to="/stats"
            aria-label="View statistics"
            className="hover:opacity-70 hover:bg-surface-container/60 rounded-full transition-all active:scale-90 flex items-center justify-center text-primary-container p-2"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[26px]">bar_chart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

