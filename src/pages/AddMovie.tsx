import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { PageTransition } from '../components/PageTransition';
import { ImageUpload } from '../components/ImageUpload';

const AVAILABLE_GENRES = [
  'Slasher',
  'Folk Horror',
  'Psychological',
  'Paranormal',
  'Body Horror',
  'Found Footage',
  'Monster',
  'Occult',
  'Sci-Fi Horror',
  'Vampire',
  'Zombie',
  'Mystery',
  'Thriller',
];

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1509248961158-e66394a4fd95?auto=format&fit=crop&w=800&q=80';
const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80';

export function AddMovie() {
  const navigate = useNavigate();
  const { addMovie } = useMovies();

  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Psychological', 'Mystery']);
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [publicRating, setPublicRating] = useState(7.2);
  const [personalRating, setPersonalRating] = useState(4);
  const [poster, setPoster] = useState('');
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState('');

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    const trimmed = customGenreInput.trim();
    if (trimmed && !selectedGenres.includes(trimmed)) {
      setSelectedGenres((prev) => [...prev, trimmed]);
      setCustomGenreInput('');
    }
  };

  const effectivePoster = useMemo(() => (poster.trim() ? poster.trim() : DEFAULT_POSTER), [poster]);
  const effectiveBanner = useMemo(
    () => (banner.trim() ? banner.trim() : effectivePoster || DEFAULT_BANNER),
    [banner, effectivePoster]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul film (Title) wajib diisi');
      return;
    }

    const primaryGenre = selectedGenres[0] || 'HORROR';
    const tag = primaryGenre.toUpperCase();

    const newId = addMovie({
      title: title.trim(),
      year: Number(year) || new Date().getFullYear(),
      genre: selectedGenres.length ? selectedGenres : ['Horror'],
      duration: `${durationMinutes} min`,
      durationMinutes: Number(durationMinutes) || 100,
      rating: Number(publicRating) || 7.0,
      personalRating: Number(personalRating) || 3,
      poster: effectivePoster,
      banner: effectiveBanner,
      description: description.trim() || 'No synopsis provided for this film yet.',
      note: note.trim() || 'No personal notes recorded yet.',
      favorite,
      tag,
    });

    // Navigate straight to the detail page of the newly added film!
    navigate(`/movie/${newId}`);
  };

  return (
    <PageTransition>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-3 px-4 py-4 w-full border-b border-border/50">
        <button
          aria-label="Go back"
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-display font-bold text-[18px] text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary-container text-[22px]">add_to_queue</span>
          Add Horror Film
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="px-6 pb-20 pt-4 flex flex-col gap-6">
        {error && (
          <div className="bg-primary-container/10 border border-primary-container text-primary-container px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Title & Year Section */}
        <section className="flex flex-col gap-4 bg-surface-container/40 p-4 rounded-2xl border border-border/60">
          <h2 className="font-display font-bold text-[15px] text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary-container">movie</span>
            Film Details
          </h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-mono text-secondary uppercase font-semibold">
              Film Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Longlegs, Smile 2, Heretic..."
              className="bg-surface text-on-surface px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container text-[15px] font-medium transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="year" className="text-xs font-mono text-secondary uppercase font-semibold">
                Release Year
              </label>
              <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1920}
                max={2030}
                className="bg-surface text-on-surface px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-primary-container font-mono text-sm transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="duration" className="text-xs font-mono text-secondary uppercase font-semibold">
                Duration (Min)
              </label>
              <input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                max={600}
                className="bg-surface text-on-surface px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-primary-container font-mono text-sm transition-all shadow-2xs"
              />
            </div>
          </div>
        </section>

        {/* Genre Section */}
        <section className="flex flex-col gap-3 bg-surface-container/40 p-4 rounded-2xl border border-border/60">
          <label className="font-display font-bold text-[15px] text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary-container">category</span>
            Genres & Tags
          </label>
          <p className="text-xs text-secondary mb-1">
            Select one or more subgenres. The first selected genre will serve as the card badge tag.
          </p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleToggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide transition-all ${
                    isSelected
                      ? 'bg-primary-container text-white shadow-xs scale-102'
                      : 'bg-surface border border-border text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {genre}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={customGenreInput}
              onChange={(e) => setCustomGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomGenre();
                }
              }}
              placeholder="Add custom tag/genre..."
              className="bg-surface text-on-surface px-3 py-2 rounded-xl border border-border text-xs font-mono flex-1 focus:outline-none focus:border-primary-container"
            />
            <button
              type="button"
              onClick={handleAddCustomGenre}
              className="bg-surface-container-high hover:bg-outline/20 text-on-surface px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors"
            >
              + Add
            </button>
          </div>
        </section>

        {/* Ratings Section */}
        <section className="flex flex-col gap-5 bg-surface-container/40 p-4 rounded-2xl border border-border/60">
          <h2 className="font-display font-bold text-[15px] text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary-container">star_rate</span>
            Ratings & Impression
          </h2>

          {/* Public / IMDb Rating */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="publicRating" className="text-xs font-mono text-secondary uppercase font-semibold">
                Public / IMDb Rating
              </label>
              <span className="font-mono font-bold text-sm bg-surface px-2.5 py-1 rounded-md border border-border text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-[16px]! font-variation-fill">star</span>
                {Number(publicRating).toFixed(1)} / 10
              </span>
            </div>
            <input
              id="publicRating"
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={publicRating}
              onChange={(e) => setPublicRating(parseFloat(e.target.value))}
              className="w-full accent-primary-container cursor-pointer h-2 bg-surface rounded-lg"
            />
          </div>

          {/* Personal Star Rating */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <label className="text-xs font-mono text-secondary uppercase font-semibold">
              Your Personal Rating (Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPersonalRating(star)}
                  className="p-1.5 rounded-lg hover:bg-surface transition-transform active:scale-90"
                >
                  <span
                    className={`material-symbols-outlined text-[32px]! transition-colors ${
                      star <= personalRating
                        ? 'text-amber-500 font-variation-fill drop-shadow-sm'
                        : 'text-secondary/40'
                    }`}
                    style={{
                      fontVariationSettings: star <= personalRating ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
              <span className="ml-2 font-mono text-xs text-secondary">
                ({personalRating} of 5 stars)
              </span>
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                favorite
                  ? 'bg-primary-container/10 border-primary-container text-on-surface'
                  : 'bg-surface border-border text-secondary hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[24px]! ${
                    favorite ? 'text-primary-container font-variation-fill' : 'text-secondary'
                  }`}
                  style={{
                    fontVariationSettings: favorite ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {favorite ? 'favorite' : 'favorite_border'}
                </span>
                <span className="font-display font-bold text-sm">Mark as Favorite Film</span>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider">
                {favorite ? 'Yes' : 'No'}
              </span>
            </button>
          </div>
        </section>

        {/* Media & Artwork Section */}
        <section className="flex flex-col gap-4 bg-surface-container/40 p-4 rounded-2xl border border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[15px] text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">image</span>
              Poster & Banner Art
            </h2>
            <button
              type="button"
              onClick={() => {
                setPoster(DEFAULT_POSTER);
                setBanner(DEFAULT_BANNER);
              }}
              className="text-primary-container text-[11px] font-mono hover:underline uppercase tracking-wide font-bold"
            >
              Use Sample Images
            </button>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <ImageUpload
                label="Poster Image"
                value={poster}
                onChange={setPoster}
                placeholder="https://..."
              />

              <ImageUpload
                label="Banner / Backdrop (Optional)"
                value={banner}
                onChange={setBanner}
                placeholder="Leave empty to use poster image..."
              />
            </div>

            {/* Thumbnail Preview */}
            <div className="w-24 h-36 bg-surface rounded-xl overflow-hidden border border-border flex flex-col items-center justify-center shrink-0 shadow-sm">
              {effectivePoster ? (
                <img
                  src={effectivePoster}
                  alt="Poster preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-secondary/40 text-[32px]">movie</span>
              )}
            </div>
          </div>
        </section>

        {/* Synopsis & Review Section */}
        <section className="flex flex-col gap-4 bg-surface-container/40 p-4 rounded-2xl border border-border/60">
          <h2 className="font-display font-bold text-[15px] text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary-container">notes</span>
            Synopsis & Personal Notes
          </h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-mono text-secondary uppercase font-semibold">
              Movie Synopsis / Plot
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this horror film is about..."
              className="bg-surface text-on-surface p-3.5 rounded-xl border border-border focus:outline-none focus:border-primary-container text-sm transition-all shadow-2xs resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-xs font-mono text-secondary uppercase font-semibold">
              Your Personal Notes & Review (Catatan Pribadi)
            </label>
            <textarea
              id="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made this movie scary? Any favorite kill scenes or jumpscares? Write down your feelings after watching..."
              className="bg-surface text-on-surface p-3.5 rounded-xl border border-border focus:outline-none focus:border-primary-container text-sm transition-all shadow-2xs resize-none"
            />
          </div>
        </section>

        {/* Action Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-container text-white py-4 px-6 rounded-2xl font-display font-extrabold text-[16px] tracking-wide shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]! text-white">bookmark_add</span>
          <span>Save to Horror Collection</span>
        </motion.button>
      </form>
    </PageTransition>
  );
}
