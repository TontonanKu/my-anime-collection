export function StatusBadge() {
  return (
    <div className="absolute top-4 right-4 bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-full font-mono text-[11px] font-medium tracking-wider flex items-center gap-1 shadow-sm">
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
