import { useCallback, useMemo, useState } from 'react';
import moviesSeed from '../data/movies.json';
import type { Movie } from '../types/movie';

const STORAGE_KEY = 'horror-collection:overrides';
const CUSTOM_MOVIES_KEY = 'horror-collection:custom-movies';
const DELETED_MOVIES_KEY = 'horror-collection:deleted-movies';

interface Overrides {
  [id: number]: {
    favorite?: boolean;
    note?: string;
    personalRating?: number;
  };
}

function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable — fail silently, data just won't persist
  }
}

function loadCustomMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MOVIES_KEY);
    return raw ? (JSON.parse(raw) as Movie[]) : [];
  } catch {
    return [];
  }
}

function saveCustomMovies(movies: Movie[]) {
  try {
    localStorage.setItem(CUSTOM_MOVIES_KEY, JSON.stringify(movies));
  } catch {
    // localStorage unavailable
  }
}

function loadDeletedIds(): number[] {
  try {
    const raw = localStorage.getItem(DELETED_MOVIES_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveDeletedIds(ids: number[]) {
  try {
    localStorage.setItem(DELETED_MOVIES_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable
  }
}

function applyOverrides(movies: Movie[], overrides: Overrides): Movie[] {
  return movies.map((m) => {
    const o = overrides[m.id];
    if (!o) return m;
    return {
      ...m,
      favorite: o.favorite ?? m.favorite,
      note: o.note ?? m.note,
      personalRating: o.personalRating ?? m.personalRating,
    };
  });
}

export function useMovies() {
  const [overrides, setOverrides] = useState<Overrides>(loadOverrides);
  const [customMovies, setCustomMovies] = useState<Movie[]>(loadCustomMovies);
  const [deletedIds, setDeletedIds] = useState<number[]>(loadDeletedIds);

  const movies = useMemo(
    () =>
      applyOverrides([...customMovies, ...(moviesSeed as Movie[])], overrides).filter(
        (m) => !deletedIds.includes(m.id)
      ),
    [customMovies, overrides, deletedIds],
  );

  const updateOverride = useCallback(
    (id: number, patch: Overrides[number]) => {
      setOverrides((prev) => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } };
        saveOverrides(next);
        return next;
      });
    },
    [],
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      const movie = movies.find((m) => m.id === id);
      if (!movie) return;
      updateOverride(id, { favorite: !movie.favorite });
    },
    [movies, updateOverride],
  );

  const setNote = useCallback(
    (id: number, note: string) => {
      updateOverride(id, { note });
    },
    [updateOverride],
  );

  const setPersonalRating = useCallback(
    (id: number, personalRating: number) => {
      updateOverride(id, { personalRating });
    },
    [updateOverride],
  );

  const addMovie = useCallback(
    (newMovieData: Omit<Movie, 'id' | 'status'>) => {
      const id = Date.now();
      const movie: Movie = {
        ...newMovieData,
        id,
        status: 'Watched',
      };
      setCustomMovies((prev) => {
        const next = [movie, ...prev];
        saveCustomMovies(next);
        return next;
      });
      return id;
    },
    [],
  );

  const deleteMovie = useCallback(
    (id: number) => {
      setDeletedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveDeletedIds(next);
        return next;
      });
      setCustomMovies((prev) => {
        const next = prev.filter((m) => m.id !== id);
        saveCustomMovies(next);
        return next;
      });
      setOverrides((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        saveOverrides(next);
        return next;
      });
    },
    [],
  );

  const hasDummyMovies = useMemo(
    () => (moviesSeed as Movie[]).some((seed) => !deletedIds.includes(seed.id)),
    [deletedIds],
  );

  const clearDummyMovies = useCallback(() => {
    const seedIds = (moviesSeed as Movie[]).map((m) => m.id);
    setDeletedIds((prev) => {
      const next = Array.from(new Set([...prev, ...seedIds]));
      saveDeletedIds(next);
      return next;
    });
  }, []);

  const restoreDummyMovies = useCallback(() => {
    const seedIds = (moviesSeed as Movie[]).map((m) => m.id);
    setDeletedIds((prev) => {
      const next = prev.filter((id) => !seedIds.includes(id));
      saveDeletedIds(next);
      return next;
    });
  }, []);

  const isCustomMovie = useCallback(
    (id: number) => customMovies.some((m) => m.id === id),
    [customMovies],
  );

  const getById = useCallback(
    (id: number) => movies.find((m) => m.id === id),
    [movies],
  );

  return { 
    movies, 
    toggleFavorite, 
    setNote, 
    setPersonalRating, 
    getById, 
    addMovie, 
    deleteMovie, 
    isCustomMovie,
    hasDummyMovies,
    clearDummyMovies,
    restoreDummyMovies
  };
}


