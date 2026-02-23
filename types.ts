
export type ConsoleId = 'nes' | 'snes' | 'n64' | 'gamecube' | 'wii' | 'wiiu' | 'switch' | 'switch2';
export type UserRole = 'standard' | 'vip' | 'admin';
export type AccountStatus = 'active' | 'paused' | 'stopped' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: AccountStatus;
  dateJoined: number;
  verified: boolean;
}

export interface BlacklistedUser extends Omit<User, 'password'> {
  deletionReason: string;
  deletedAt: number;
}

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
  textColor: string;
  logo: string;
}

export const CONSOLES: ConsoleConfig[] = [
  { id: 'nes', name: 'NES', color: '#dc2626', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1OtoAnQ7TgG2UT-PqETPQGBtijfYIEztt' },
  { id: 'snes', name: 'SNES', color: '#8b5cf6', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1dqANCw-wDjiNzLMkA_dOSqzaEtkHYKcB' },
  { id: 'n64', name: 'N64', color: '#3b82f6', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1JShUZacw5uv9ezuNag8xqJ6wHJal8ABw' },
  { id: 'gamecube', name: 'GameCube', color: '#6366f1', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1zDoblhiufJepH0JTTtzvpRmayqEeAwTu' },
  { id: 'wii', name: 'Wii', color: '#0ea5e9', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1kKT4DuJ7NvNUMpyRqpnJppBRAfDOtAkU' },
  { id: 'wiiu', name: 'Wii U', color: '#009ac7', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1kNFdBrw9gNoE17uLVPgiqD1X2-pS4InN' },
  { id: 'switch', name: 'Switch', color: '#e60012', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1ezfRlETpWX0X6r8QIxqRXTFgYRMaY4iB' },
  { id: 'switch2', name: 'Switch 2', color: '#b91c1c', textColor: 'text-white', logo: 'https://lh3.googleusercontent.com/d/1hS3ZgBUeA4xEs8H8zrU_Y8dQobVoLfhz' },
];
