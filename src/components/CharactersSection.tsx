import { useAniListCharacters } from '../hooks/useAniListCharacters';
import type { Character } from '../hooks/useAniListCharacters';

interface CharactersSectionProps {
  title: string;
  prefetchedCharacters?: Character[];
}

export function CharactersSection({ title, prefetchedCharacters }: CharactersSectionProps) {
  const { characters, loading, error, dataSource } = useAniListCharacters(title, prefetchedCharacters);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || characters.length === 0) {
    return null; // or show an error state
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-16 mb-24 relative z-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Characters</h2>
        {dataSource && (
          <span className="text-[10px] text-on-surface-variant/50 font-mono">
            {dataSource}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((char) => (
          <div 
            key={char.id} 
            className="flex items-stretch bg-surface-container/50 hover:bg-surface-container rounded-lg overflow-hidden transition-colors border border-border/20 h-[85px]"
          >
            {/* Character Image */}
            <div className="w-[60px] md:w-[70px] shrink-0 h-full relative">
              <img 
                src={char.image} 
                alt={char.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Character Info */}
            <div className="flex-grow flex flex-col justify-between py-2 px-3 min-w-0">
              <div className="text-[13px] md:text-[14px] font-bold text-on-surface truncate">
                {char.name}
              </div>
              <div className="text-[11px] text-secondary">
                {char.role}
              </div>
            </div>

            {/* Voice Actor Info (if exists) */}
            {char.voiceActor && (
              <>
                <div className="flex-grow flex flex-col justify-between items-end py-2 px-3 min-w-0 text-right">
                  <div className="text-[13px] md:text-[14px] font-medium text-on-surface truncate max-w-[100px] md:max-w-full">
                    {char.voiceActor.name}
                  </div>
                  <div className="text-[11px] text-secondary">
                    {char.voiceActor.language}
                  </div>
                </div>
                
                {/* Voice Actor Image */}
                <div className="w-[60px] md:w-[70px] shrink-0 h-full relative">
                  <img 
                    src={char.voiceActor.image} 
                    alt={char.voiceActor.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
