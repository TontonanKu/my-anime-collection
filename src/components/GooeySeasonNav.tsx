import { motion } from 'framer-motion';

export interface SeasonData {
  name: string;
  episodes: number;
  poster?: string;
  isCompleted?: boolean;
}

interface GooeySeasonNavProps {
  seasons: SeasonData[];
  activeSeasonIndex: number;
  onSeasonChange: (index: number) => void;
}

export function GooeySeasonNav({ seasons, activeSeasonIndex, onSeasonChange }: GooeySeasonNavProps) {
  if (!seasons || seasons.length === 0) return null;

  return (
    <div className="flex flex-col items-start md:items-end gap-2 w-full mt-2 md:mt-0">
      <div className="relative flex items-center bg-[#1a1a1a] rounded-full p-1 shadow-sm">
        {seasons.map((season, i) => {
          const isActive = activeSeasonIndex === i;
          return (
            <button
              key={i}
              onClick={() => onSeasonChange(i)}
              className="relative outline-none flex items-center justify-center w-12 h-8 rounded-full"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSeasonBubble"
                  className="absolute inset-0 bg-[#2d2d2d] rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              
              <span 
                className={`relative z-10 font-mono text-[11px] font-bold transition-colors duration-200 ${
                  isActive ? 'text-primary-container' : 'text-secondary hover:text-on-surface'
                }`}
              >
                {season.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Episode Box */}
      <div className="bg-[#121212] border border-border/40 rounded-lg px-4 py-2 flex items-center gap-2 mt-2">
        <span className="text-[#a0a0a0] text-[10px] font-mono tracking-widest uppercase">
          EPS:
        </span>
        <span className="text-on-surface font-mono font-bold text-[13px]">
          {seasons[activeSeasonIndex].episodes}
        </span>
      </div>
    </div>
  );
}
