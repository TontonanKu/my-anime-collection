import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import { PageTransition } from '../components/PageTransition';
import type { Movie, WatchStatus } from '../types/movie';

const COLUMNS: WatchStatus[] = ['Anime & Donghua', 'Plan to Watch', 'Watching', 'On Hold', 'Completed'];

export function Watchboard() {
  const navigate = useNavigate();
  const { movies, updateStatus, updateProgress, updateOrder } = useMovies();
  const { isAuthenticated } = useAuth();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, id: number) => {
    if (!isAuthenticated) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    // Required for Firefox
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAuthenticated) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getOrder = (m: Movie) => m.order ?? (movies.indexOf(m) * 1000);

  const processDrop = (draggedId: number, targetStatus: WatchStatus, newOrder?: number) => {
    updateStatus(draggedId, targetStatus);
    if (newOrder !== undefined) {
      updateOrder(draggedId, newOrder);
    }
    
    const movie = movies.find(m => m.id === draggedId);
    if (movie) {
      let cp = (movie.progress || '').trim();
      
      if (targetStatus === 'Completed') {
        if (!cp.toUpperCase().includes('END')) {
          let formatted = cp;
          if (/^\d+$/.test(cp)) {
            formatted = `eps ${cp}`;
          } else if (/^s\d+,\s*\d+$/i.test(cp)) {
            formatted = cp.replace(/,\s*(\d+)$/, ', eps $1');
          }
          updateProgress(draggedId, formatted ? `${formatted}, END` : 'END');
        }
      } else if (targetStatus === 'Watching') {
        if (cp.toUpperCase().includes('END')) {
          cp = cp.replace(/\s*\[?END\]?/gi, '')
                 .replace(/eps?\s*/gi, '')
                 .replace(/,\s*$/, '')
                 .trim();
                 
          if (cp !== '') {
            const sMatch = cp.match(/S(\d+)/i);
            if (sMatch) {
              const nextS = parseInt(sMatch[1], 10) + 1;
              updateProgress(draggedId, `S${nextS}, 1`);
            } else {
              updateProgress(draggedId, 'S2, 1');
            }
          }
        }
      }
    }
    setDraggedId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: WatchStatus) => {
    e.preventDefault();
    if (draggedId !== null) {
      const columnMovies = movies
        .filter((m) => m.status === targetStatus)
        .sort((a, b) => getOrder(a) - getOrder(b));
      
      let newOrder = undefined;
      // If dropping on the empty space of the column, append to bottom
      if (columnMovies.length > 0) {
        const lastMovie = columnMovies[columnMovies.length - 1];
        if (lastMovie.id !== draggedId) {
          newOrder = getOrder(lastMovie) + 1000;
        }
      } else {
        newOrder = 1000;
      }
      
      processDrop(draggedId, targetStatus, newOrder);
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetMovie: Movie, targetStatus: WatchStatus, columnMovies: Movie[]) => {
    e.preventDefault();
    e.stopPropagation(); // prevent column drop handler from firing
    
    if (draggedId !== null && draggedId !== targetMovie.id) {
      const targetIndex = columnMovies.findIndex(m => m.id === targetMovie.id);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      const isAbove = dropY < rect.height / 2;
      
      let newOrder = 0;
      const targetOrder = getOrder(targetMovie);
      
      if (isAbove) {
        // Put before target
        const prevMovie = targetIndex > 0 ? columnMovies[targetIndex - 1] : null;
        const prevOrder = prevMovie ? getOrder(prevMovie) : targetOrder - 1000;
        newOrder = (prevOrder + targetOrder) / 2;
      } else {
        // Put after target
        const nextMovie = targetIndex < columnMovies.length - 1 ? columnMovies[targetIndex + 1] : null;
        const nextOrder = nextMovie ? getOrder(nextMovie) : targetOrder + 1000;
        newOrder = (targetOrder + nextOrder) / 2;
      }
      
      processDrop(draggedId, targetStatus, newOrder);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleIncrementEpisode = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    const currentProgress = movie.progress || '';
    
    // Check if progress is a pure number
    if (/^\d+$/.test(currentProgress)) {
      const nextEp = parseInt(currentProgress) + 1;
      updateProgress(movie.id, nextEp.toString());
    } else {
      // If it's a string like 'S2, 34' or empty, prompt the user
      const newProgress = window.prompt(`Update episode untuk ${movie.title} (Ketik "END" jika sudah tamat):`, currentProgress);
      if (newProgress !== null) {
        const uppercaseProgress = newProgress.trim().toUpperCase();
        if (uppercaseProgress === 'END' || uppercaseProgress === 'TAMAT') {
          updateProgress(movie.id, 'END');
          updateStatus(movie.id, 'Completed');
        } else {
          updateProgress(movie.id, newProgress);
        }
      }
    }
  };

  return (
    <PageTransition>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 w-full border-b border-border/40">
        <div className="max-w-[1600px] mx-auto w-full flex items-center gap-3 px-4 md:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-full transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-display font-bold text-[18px] md:text-[22px] text-on-surface">Watchboard</h1>
            <p className="text-secondary text-xs font-mono">Kelola progress tontonanmu (Drag & Drop)</p>
          </div>
          <button
            onClick={() => setShowInfo(true)}
            className="ml-auto w-10 h-10 flex items-center justify-center text-primary-container hover:bg-primary-container/10 rounded-full transition-colors active:scale-90"
            title="Informasi Status"
          >
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </header>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-surface-container-high border border-border/40 p-6 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <h3 className="font-display font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">help</span>
                Penjelasan Status
              </h3>
              <div className="space-y-4 font-mono text-sm text-secondary">
                <div>
                  <strong className="text-on-surface">Anime & Donghua:</strong>
                  <p>Daftar utama semua anime dan donghua yang belum ditentukan status tontonannya.</p>
                </div>
                <div>
                  <strong className="text-on-surface">Plan to Watch:</strong>
                  <p>Anime/Donghua yang baru direncanakan untuk ditonton di masa depan.</p>
                </div>
                <div>
                  <strong className="text-on-surface">Watching:</strong>
                  <p>Sedang ditonton saat ini (baik marathon atau on-going mingguan).</p>
                </div>
                <div>
                  <strong className="text-on-surface">On Hold:</strong>
                  <p>Ditunda sementara (mungkin bosan atau nunggu episodenya numpuk).</p>
                </div>
                <div>
                  <strong className="text-on-surface">Completed:</strong>
                  <p>Sudah tamat ditonton sampai episode terakhir.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-2.5 bg-primary-container text-white rounded-full font-bold font-mono text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)]">
        <div className="flex gap-4 md:gap-6 h-full overflow-x-auto snap-x snap-mandatory pb-8">
          {COLUMNS.map((status) => {
            const columnMovies = movies
              .filter((m) => m.status === status)
              .sort((a, b) => getOrder(a) - getOrder(b));
            
            return (
              <div 
                key={status}
                className="flex-shrink-0 w-[85vw] md:w-[320px] h-full flex flex-col bg-surface-container-low rounded-2xl border border-border/40 snap-center"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border/40 flex items-center justify-between bg-surface-container-low rounded-t-2xl sticky top-0 z-10">
                  <h2 className="font-display font-bold text-on-surface tracking-wide uppercase text-sm">
                    {status}
                  </h2>
                  <span className="bg-surface-container-highest text-on-surface-variant text-xs font-mono px-2 py-0.5 rounded-full font-bold">
                    {columnMovies.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  <AnimatePresence>
                    {columnMovies.map((movie) => (
                      <motion.div
                        key={movie.id}
                        layoutId={`card-${movie.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        draggable={isAuthenticated}
                        onDragStart={(e: any) => handleDragStart(e, movie.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => handleCardDrop(e, movie, status, columnMovies)}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className={`group flex gap-3 p-2 bg-surface-container hover:bg-surface-container-high rounded-xl border border-border/40 ${isAuthenticated ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-colors ${draggedId === movie.id ? 'opacity-50' : 'opacity-100'}`}
                      >
                        <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container-highest">
                          <img 
                            src={movie.poster} 
                            alt={movie.title} 
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                        <div className="flex flex-col py-1 flex-1 min-w-0">
                          <h3 className="font-display font-bold text-on-surface text-sm line-clamp-2 leading-tight mb-1">
                            {movie.title}
                          </h3>
                          <p className="text-secondary font-mono text-[10px] mb-2">
                            {movie.category} • {movie.year}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <div 
                              className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-primary-container font-bold max-w-full"
                            >
                              <span className="material-symbols-outlined text-[12px] shrink-0">bookmark</span>
                              <span className="truncate">
                              {status === 'Completed'
                                ? (movie.progress && movie.progress.toUpperCase().includes('END') 
                                    ? movie.progress 
                                    : (() => {
                                        const p = (movie.progress || '').trim();
                                        if (/^\d+$/.test(p)) return `eps ${p}, END`;
                                        if (/^s\d+,\s*\d+$/i.test(p)) return p.replace(/,\s*(\d+)$/, ', eps $1') + ', END';
                                        return p ? `${p}, END` : 'END';
                                      })())
                                : (movie.progress || 'Ep 1')}
                              </span>
                            </div>
                            
                            {status !== 'Completed' && isAuthenticated && (
                              <button 
                                onClick={(e) => handleIncrementEpisode(e, movie)}
                                className="w-6 h-6 rounded bg-primary-container/20 text-primary-container hover:bg-primary-container hover:text-white flex items-center justify-center transition-colors"
                                title="Update Episode"
                              >
                                <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {columnMovies.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-secondary/50 border-2 border-dashed border-border/40 rounded-xl m-2">
                      <span className="material-symbols-outlined text-2xl mb-1">inbox</span>
                      <p className="text-xs font-mono uppercase">Kosong</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </PageTransition>
  );
}
