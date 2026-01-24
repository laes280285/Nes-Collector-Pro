
export interface Game {
  id: string;
  name: string;
  developer: string;
  year: string;
  genre: string;
  coverUrl: string;
  cartridgeFrontPhoto?: string;
  cartridgeBackPhoto?: string;
  dateAdded: number;
}

export type ViewMode = 'icon' | 'list';
export type GroupBy = 'none' | 'genre' | 'year' | 'developer';

export interface AppSettings {
  viewMode: ViewMode;
  columns: number;
  groupBy: GroupBy;
}

export interface UrgentItem {
  id: string;
  title: string;
}
