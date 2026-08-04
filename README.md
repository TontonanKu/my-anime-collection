# My Horror Collection

A personal, local-only horror movie watchlist app — built with React, Vite, TypeScript, Tailwind CSS, React Router, and Framer Motion. Matches the "Gallery Macabre" Stitch design.

This is **not** a streaming app and has **no** backend, login, or social features. All data lives in `src/data/movies.json`, and your favorites/personal ratings/notes are saved locally in the browser via `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). The app is designed for a mobile viewport (~390–430px) and centers itself on larger screens.

Build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
 ├── assets/        static assets
 ├── components/    Header, Hero, SearchBar, MovieCard, MovieGrid, RatingStars,
 │                  GenreChip, StatusBadge, NoteEditor, EmptyState, PageTransition
 ├── data/          movies.json — your local movie collection
 ├── hooks/         useMovies (data + localStorage persistence), useDebounce
 ├── pages/         Home, MovieDetail, Stats, NotFound
 ├── types/         Movie type definitions
 └── utils/         search + statistics helpers
```

## Adding your own movies

Edit `src/data/movies.json`. Each entry looks like:

```json
{
  "id": 9,
  "title": "The Conjuring",
  "year": 2013,
  "genre": ["Supernatural Horror"],
  "duration": "112 min",
  "durationMinutes": 112,
  "rating": 8.4,
  "personalRating": 4.5,
  "status": "Watched",
  "poster": "https://your-poster-image-url.jpg",
  "banner": "https://your-banner-image-url.jpg",
  "description": "Synopsis text...",
  "note": "Your personal thoughts...",
  "favorite": false,
  "tag": "SUPERNATURAL"
}
```

`poster`/`banner` can be any image URL, or drop images into `src/assets/` and import them.

## Features

- Hero banner + real-time search (by title or year)
- 2-column responsive movie grid with hover/tap animations
- Movie detail page: banner, poster, IMDb rating, genre chips, duration, year, "Watched" badge, synopsis
- ⭐ Personal 5-star rating (tap to set)
- ❤️ Favorite toggle
- 📝 Editable personal notes, saved locally
- 📊 Statistics page — total movies, average rating, total watch time, top genres
- Smooth page transitions and micro-interactions via Framer Motion

## Notes on images

The sample data reuses placeholder poster/banner images from the original Stitch mockup so the app looks right out of the box. Swap in your own movie poster URLs whenever you're ready.
