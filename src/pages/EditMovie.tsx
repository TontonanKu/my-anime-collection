import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { PageTransition } from '../components/PageTransition';
import { ImageUpload } from '../components/ImageUpload';
export function EditMovie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, updateMetadata } = useMovies();
  
  const movie = getById(Number(id));

  const [poster, setPoster] = useState('');
  const [banner, setBanner] = useState('');
  const [seasonData, setSeasonData] = useState('');
  
  useEffect(() => {
    if (movie) {
      setPoster(movie.poster || '');
      setBanner(movie.banner || '');
      setSeasonData(movie.seasonData || '');
    }
  }, [movie]);

  if (!movie) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
          <p className="text-on-surface font-semibold mb-2">Film not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-container text-sm font-mono uppercase tracking-widest mt-2"
          >
            Back to Collection
          </button>
        </div>
      </PageTransition>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically manage global status based on the LAST season in seasonData
    let newStatus = movie.status;
    let newProgress = movie.progress;
    
    if (seasonData.trim().length > 0) {
      const lines = seasonData.split('\n').filter(l => l.trim().length > 0);
      const lastLine = lines[lines.length - 1];
      
      const parts = lastLine.split('|').map(s => s.trim());
      if (parts.length >= 2) {
        const seasonName = parts[0];
        const epsString = parts[1].replace(/END/i, '').trim();
        const hasEnd = lastLine.toUpperCase().includes('END');
        
        newProgress = `${seasonName}, eps ${epsString}${hasEnd ? ', END' : ''}`;
        newStatus = hasEnd ? 'Completed' : 'Watching';
      } else {
        if (lastLine.toUpperCase().includes('END')) {
          newStatus = 'Completed';
        } else {
          newStatus = 'Watching';
        }
      }
    } else if (movie.status === 'Completed') {
      // If no seasonData and they manually saved, just respect manual stuff.
      // But we can't tell if they removed it. Let's just leave it alone.
    }

    updateMetadata(movie.id, poster, banner, seasonData, newStatus, newProgress);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display font-bold text-[18px] text-on-surface">Edit Data</h1>
          <div className="w-10" />
        </header>

        <div className="max-w-2xl mx-auto px-6 pt-8">
          <div className="mb-8 text-center">
            <h2 className="font-display font-extrabold text-[24px] text-on-surface mb-2">
              {movie.title}
            </h2>
            <p className="text-secondary text-sm">Ganti gambar poster, banner, dan atur season.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container/40 p-4 rounded-2xl border border-border/60">
              <ImageUpload
                label="Poster Image"
                value={poster}
                onChange={setPoster}
                placeholder="https://..."
              />
              {poster && (
                <div className="mt-4 aspect-[2/3] w-32 rounded-lg overflow-hidden border border-border">
                  <img src={poster} alt="Preview Poster" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Error' }} />
                </div>
              )}
            </div>

            <div className="bg-surface-container/40 p-4 rounded-2xl border border-border/60">
              <ImageUpload
                label="Banner / Backdrop"
                value={banner}
                onChange={setBanner}
                placeholder="https://..."
              />
              {banner && (
                <div className="mt-4 aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border">
                  <img src={banner} alt="Preview Banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x170?text=Error' }} />
                </div>
              )}
            </div>

            <div className="bg-surface-container/40 p-4 rounded-2xl border border-border/60 flex flex-col gap-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-secondary font-semibold">
                Manajemen Season
              </label>
              <textarea
                value={seasonData}
                onChange={(e) => setSeasonData(e.target.value)}
                placeholder={"S1 | 24\nS2 | 12"}
                className="w-full bg-surface-container-high text-on-surface p-4 rounded-xl border border-border/40 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-y min-h-[100px] font-mono text-sm placeholder:text-secondary/50"
              />
              <p className="text-xs text-secondary mt-1">Format: Nama Season | Jumlah Episode</p>
            </div>

            {seasonData.trim() && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonData.split('\n').map((line, index) => {
                  const parts = line.split('|').map(s => s.trim());
                  if (parts.length >= 2 && parts[0] && parts[1]) {
                    const seasonName = parts[0];
                    const posterUrl = parts[2] || '';
                    return (
                      <div key={index} className="bg-surface-container/40 p-4 rounded-2xl border border-border/60">
                        <ImageUpload
                          label={`Poster ${seasonName}`}
                          value={posterUrl}
                          onChange={(newUrl) => {
                            const newLines = seasonData.split('\n');
                            newLines[index] = `${seasonName} | ${parts[1]} | ${newUrl}`;
                            setSeasonData(newLines.join('\n'));
                          }}
                          placeholder="Drag & drop poster..."
                        />
                        {posterUrl && (
                          <div className="mt-4 aspect-[2/3] w-24 rounded-lg overflow-hidden border border-border">
                            <img src={posterUrl} alt={`Preview ${seasonName}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Error' }} />
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary-container text-white font-mono font-bold text-sm uppercase tracking-wider py-4 rounded-xl transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
