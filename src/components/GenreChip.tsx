interface GenreChipProps {
  label: string;
  variant?: 'default' | 'onPoster';
}

export function GenreChip({ label, variant = 'default' }: GenreChipProps) {
  if (variant === 'onPoster') {
    return (
      <span className="bg-surface-container-lowest text-on-surface font-mono text-[11px] font-medium tracking-wider px-2 py-1 rounded uppercase">
        {label}
      </span>
    );
  }

  return (
    <span className="bg-surface-container text-on-surface px-2 py-1 rounded font-mono text-[11px] font-medium tracking-wider uppercase">
      {label}
    </span>
  );
}
