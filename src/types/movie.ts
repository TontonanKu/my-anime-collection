export type WatchStatus = 'Watched';

export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  duration: string;
  /** Runtime in minutes, used for statistics (total watch time). */
  durationMinutes: number;
  /** Public rating out of 10, e.g. IMDb. */
  rating: number;
  /** Personal rating out of 5 stars. */
  personalRating: number;
  status: WatchStatus;
  poster: string;
  banner: string;
  description: string;
  note: string;
  favorite: boolean;
  tag: string;
}
