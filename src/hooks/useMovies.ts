import { useCallback, useEffect, useMemo, useState } from 'react';
import moviesSeed from '../data/movies.json';
import type { Movie, WatchStatus } from '../types/movie';
import { supabase } from '../lib/supabase';

// Local storage keys for fallback/offline
const STORAGE_KEY = 'horror-collection:overrides';
const CUSTOM_MOVIES_KEY = 'horror-collection:custom-movies';
const DELETED_MOVIES_KEY = 'horror-collection:deleted-movies';

interface Overrides {
  [id: number]: {
    favorite?: boolean;
    note?: string;
    personalRating?: number;
    poster?: string;
    banner?: string;
    status?: import('../types/movie').WatchStatus;
    progress?: string;
    order?: number;
    seasonData?: string;
  };
}

interface AppData {
  overrides: Overrides;
  customMovies: Movie[];
  deletedIds: number[];
}

// Fallback loaders
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
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
      poster: o.poster ?? m.poster,
      banner: o.banner ?? m.banner,
      status: o.status ?? m.status,
      progress: o.progress ?? m.progress,
      order: o.order ?? m.order,
      seasonData: o.seasonData ?? m.seasonData,
    };
  });
}

export function useMovies() {
  const [overrides, setOverrides] = useState<Overrides>(() => loadLocal(STORAGE_KEY, {}));
  const [customMovies, setCustomMovies] = useState<Movie[]>(() => loadLocal(CUSTOM_MOVIES_KEY, []));
  const [deletedIds, setDeletedIds] = useState<number[]>(() => loadLocal(DELETED_MOVIES_KEY, []));
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', 1)
        .single();
      
      if (!error && data?.data) {
        const cloudData = data.data as AppData;
        if (cloudData.overrides) {
          setOverrides(cloudData.overrides);
          saveLocal(STORAGE_KEY, cloudData.overrides);
        }
        if (cloudData.customMovies) {
          setCustomMovies(cloudData.customMovies);
          saveLocal(CUSTOM_MOVIES_KEY, cloudData.customMovies);
        }
        if (cloudData.deletedIds) {
          setDeletedIds(cloudData.deletedIds);
          saveLocal(DELETED_MOVIES_KEY, cloudData.deletedIds);
        }
      }
      setIsLoaded(true);
    }
    fetchData();
  }, []);

  // Sync to Cloud
  const syncToCloud = useCallback(async (newData: Partial<AppData>) => {
    // Current state + new changes
    const payload = {
      overrides,
      customMovies,
      deletedIds,
      ...newData
    };
    
    // Save locally immediately for snappy UI
    if (newData.overrides) saveLocal(STORAGE_KEY, newData.overrides);
    if (newData.customMovies) saveLocal(CUSTOM_MOVIES_KEY, newData.customMovies);
    if (newData.deletedIds) saveLocal(DELETED_MOVIES_KEY, newData.deletedIds);

    // Sync to Supabase in background
    if (isLoaded) {
      await supabase.from('app_data').upsert({ id: 1, data: payload });
    }
  }, [overrides, customMovies, deletedIds, isLoaded]);


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
        syncToCloud({ overrides: next });
        return next;
      });
    },
    [syncToCloud],
  );

  const updateMetadata = useCallback(
    (id: number, poster: string, banner: string, seasonData?: string, status?: WatchStatus, progress?: string) => {
      updateOverride(id, { poster, banner, seasonData, ...(status && { status }), ...(progress && { progress }) });
    },
    [updateOverride]
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

  const updateStatus = useCallback(
    (id: number, status: import('../types/movie').WatchStatus) => {
      updateOverride(id, { status });
    },
    [updateOverride],
  );

  const updateProgress = useCallback(
    (id: number, progress: string) => {
      updateOverride(id, { progress });
    },
    [updateOverride],
  );

  const updateOrder = useCallback(
    (id: number, order: number) => {
      updateOverride(id, { order });
    },
    [updateOverride]
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
        status: 'Anime & Donghua',
      };
      setCustomMovies((prev) => {
        const next = [movie, ...prev];
        syncToCloud({ customMovies: next });
        return next;
      });
      return id;
    },
    [syncToCloud],
  );

  const deleteMovie = useCallback(
    (id: number) => {
      let nextDeletedIds = deletedIds;
      let nextCustomMovies = customMovies;
      let nextOverrides = overrides;

      setDeletedIds((prev) => {
        if (prev.includes(id)) return prev;
        nextDeletedIds = [...prev, id];
        return nextDeletedIds;
      });
      setCustomMovies((prev) => {
        nextCustomMovies = prev.filter((m) => m.id !== id);
        return nextCustomMovies;
      });
      setOverrides((prev) => {
        if (!(id in prev)) return prev;
        nextOverrides = { ...prev };
        delete nextOverrides[id];
        return nextOverrides;
      });

      // Sync all changes at once
      syncToCloud({
        deletedIds: nextDeletedIds,
        customMovies: nextCustomMovies,
        overrides: nextOverrides
      });
    },
    [deletedIds, customMovies, overrides, syncToCloud],
  );

  const hasDummyMovies = useMemo(
    () => (moviesSeed as Movie[]).some((seed) => !deletedIds.includes(seed.id)),
    [deletedIds],
  );

  const clearDummyMovies = useCallback(() => {
    const seedIds = (moviesSeed as Movie[]).map((m) => m.id);
    setDeletedIds((prev) => {
      const next = Array.from(new Set([...prev, ...seedIds]));
      syncToCloud({ deletedIds: next });
      return next;
    });
  }, [syncToCloud]);

  const restoreDummyMovies = useCallback(() => {
    const seedIds = (moviesSeed as Movie[]).map((m) => m.id);
    setDeletedIds((prev) => {
      const next = prev.filter((id) => !seedIds.includes(id));
      syncToCloud({ deletedIds: next });
      return next;
    });
  }, [syncToCloud]);

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
    updateMetadata,
    getById, 
    addMovie, 
    deleteMovie, 
    updateStatus,
    updateProgress,
    updateOrder,
    isCustomMovie,
    hasDummyMovies,
    clearDummyMovies,
    restoreDummyMovies,
    isLoaded
  };
}
