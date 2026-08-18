import type { WatchStatus } from '../types/movie';

export function StatusBadge({ status = 'Completed' }: { status?: WatchStatus }) {
  if (status !== 'Completed' && status !== 'Watching' && status !== 'On Hold') {
    return null;
  }

  if (status === 'Watching') {
    return (
      <div className="absolute top-4 right-4 bg-primary-container/90 backdrop-blur-sm text-on-primary-container px-3 py-1 rounded-full font-mono text-[11px] font-medium tracking-wider flex items-center gap-1 shadow-sm">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
        >
          play_circle
        </span>
        <span>Watching</span>
      </div>
    );
  }

  if (status === 'On Hold') {
    return (
      <div className="absolute top-4 right-4 bg-surface-container-highest/90 backdrop-blur-sm text-on-surface-variant px-3 py-1 rounded-full font-mono text-[11px] font-medium tracking-wider flex items-center gap-1 shadow-sm">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
        >
          pause_circle
        </span>
        <span>On Hold</span>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 bg-[#e8f5e9]/90 backdrop-blur-sm text-[#2e7d32] px-3 py-1 rounded-full font-mono text-[11px] font-medium tracking-wider flex items-center gap-1 shadow-sm">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <span>Watched</span>
    </div>
  );
}
