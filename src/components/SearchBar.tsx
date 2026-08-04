interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search the archive...' }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
        search
      </span>
      <input
        className="w-full bg-surface-container text-on-surface text-[16px] rounded-full py-3.5 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-container border-none shadow-sm transition-all placeholder:text-secondary/70"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search movies by title or year"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      )}
    </div>
  );
}
