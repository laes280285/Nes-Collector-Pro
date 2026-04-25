
export type ConsoleId = 'nes' | 'snes' | 'n64' | 'gamecube' | 'wii' | 'wiiu' | 'switch' | 'switch2' | 'gb' | 'gbc' | 'gba' | 'nds' | 'n3ds' | 'vboy' | 'gw';

export interface Game {
  id: string;
  consoleId: ConsoleId;
  name: string;
  developer: string;
  year: string;
  genre: string;
  coverUrl: string;
  cartridgeFrontPhoto?: string;
  cartridgeBackPhoto?: string;
  dateAdded: number;
  costPaid: number;
  marketPrice: number;
  acquisitionDate: number; 
  notes?: string;
  isFavorite?: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  consoleId: ConsoleId;
  coverUrl?: string;
  dateAdded: number;
}

export type ViewMode = 'icon' | 'list';
export type GroupBy = 'none' | 'genre' | 'year' | 'developer';
export type UIScale = 'min' | 'med' | 'max';

export interface AppSettings {
  viewMode: ViewMode;
  columns: number;
  groupBy: GroupBy;
  uiScale: UIScale;
  showFinancialsHome: boolean;
  showFinancialsShelf: boolean;
  hideEmptyConsoles: boolean;
  googleDriveSync: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  googleDriveTokens?: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
    email?: string;
  };
  lastSync?: number;
  themeId: string;
  fontId: string;
  autoSyncFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  coinsSpent?: number;
  unlockedThemes?: string[];
}

export interface UrgentItem {
  id: string;
  consoleId: ConsoleId;
  title: string;
}

export interface ConsoleConfig {
  id: ConsoleId;
  name: string;
  color: string;
  secondaryColor?: string;
  textColor: string;
  logo: string;
  badge: string;
}

export const CONSOLES: ConsoleConfig[] = [
  { id: 'nes', name: 'NES', color: '#dc2626', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1OtoAnQ7TgG2UT-PqETPQGBtijfYIEztt', badge: 'https://lh3.googleusercontent.com/d/1SDKIfypWCP3c4aKenrBqbT43S3Sg2tRs' },
  { id: 'snes', name: 'SNES', color: '#8b5cf6', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1dqANCw-wDjiNzLMkA_dOSqzaEtkHYKcB', badge: 'https://lh3.googleusercontent.com/d/18kWa3QNxORrclxzNDV-nGJn1MgeJy9RA' },
  { id: 'n64', name: 'N64', color: '#3b82f6', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1JShUZacw5uv9ezuNag8xqJ6wHJal8ABw', badge: 'https://lh3.googleusercontent.com/d/1abpnYp7rvUwB1HRzds-gdgqt0wdSU8Pp' },
  { id: 'gamecube', name: 'GameCube', color: '#6366f1', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1zDoblhiufJepH0JTTtzvpRmayqEeAwTu', badge: 'https://lh3.googleusercontent.com/d/10ToncvUZuxO9uViBEDsEO4JlzJrnZVk6' },
  { id: 'wii', name: 'Wii', color: '#0ea5e9', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1kKT4DuJ7NvNUMpyRqpnJppBRAfDOtAkU', badge: 'https://lh3.googleusercontent.com/d/12BPaQE0EQu3ubHLvmJ4jUnH6Tf8NZVMe' },
  { id: 'wiiu', name: 'Wii U', color: '#009ac7', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1kNFdBrw9gNoE17uLVPgiqD1X2-pS4InN', badge: 'https://lh3.googleusercontent.com/d/1bHYZ7KiHqBa6MpI2ylJtgUDEzZ2spnrz' },
  { id: 'switch', name: 'Switch', color: '#e60012', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1ezfRlETpWX0X6r8QIxqRXTFgYRMaY4iB', badge: 'https://lh3.googleusercontent.com/d/1ql6vpmn6JHiCeczgnibcYwMRa0G8OGJL' },
  { id: 'switch2', name: 'Switch 2', color: '#b91c1c', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1hS3ZgBUeA4xEs8H8zrU_Y8dQobVoLfhz', badge: 'https://lh3.googleusercontent.com/d/1ql6vpmn6JHiCeczgnibcYwMRa0G8OGJL' },
  { id: 'gb', name: 'GameBoy', color: '#9ca3af', secondaryColor: '#8b5cf6', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1cPN8be8XKkmeCLaPx8-uTaT_KF81QVac', badge: 'https://lh3.googleusercontent.com/d/1YMfc4BdzIQ4y3bpu2jGbSI7I4MPWM-sW' },
  { id: 'gbc', name: 'GameBoy Color', color: '#8b5cf6', secondaryColor: '#a78bfa', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1ok8obatzyJtPvflhVuS8DJvix2L1JKNJ', badge: 'https://lh3.googleusercontent.com/d/1YEK8fk-W2w9SvbKUS2KH-hYl8ZLSDfR5' },
  { id: 'gba', name: 'GameBoy Advance', color: '#4f46e5', secondaryColor: '#6366f1', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1VM0VF5pGNw-PButJJFribrZpiBuWGdHR', badge: 'https://lh3.googleusercontent.com/d/1akINygGHtTWkben5GNl9TRkphKpWiltC' },
  { id: 'nds', name: 'Nintendo DS', color: '#9ca3af', secondaryColor: '#ffffff', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1KxhMeh8WZPXiLmsRW8JiZxY95ksnXJYe', badge: 'https://lh3.googleusercontent.com/d/1MfszZ4YYnVjIgLGeWsHnWqe8cGW8qgt7' },
  { id: 'n3ds', name: 'Nintendo 3DS', color: '#06b6d4', secondaryColor: '#6b7280', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1tH_2A0TmxCBzwLNEUGapAvThqE9UWQdi', badge: 'https://lh3.googleusercontent.com/d/1D4AWryYaBJHYe1EDsm2Ax10PJCH3MlBK' },
  { id: 'vboy', name: 'Virtual Boy', color: '#ef4444', secondaryColor: '#000000', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1c95v2d6-7XZEEAuGpgfILpxKLXxJAiU-', badge: 'https://lh3.googleusercontent.com/d/1GUKSnTkku2AYiBbfjLDDjRYFTLp1fhtH' },
  { id: 'gw', name: 'Game & Watch', color: '#d4af37', secondaryColor: '#000000', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1LeN_bqLKq2JIrhZVxU_Dbf3xASyK1nc-', badge: 'https://lh3.googleusercontent.com/d/1awhoTOQ6K9RHeF88GMrSbowbxwb-mdTe' },
];
