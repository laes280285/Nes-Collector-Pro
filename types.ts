export type ConsoleId = 'nes' | 'snes' | 'n64' | 'gamecube' | 'wii' | 'wiiu' | 'switch' | 'switch2';
export type UserRole = 'standard' | 'vip' | 'admin';
export type AccountStatus = 'active' | 'paused' | 'stopped';

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
}

export type ViewMode = 'icon' | 'list';
export type GroupBy = 'none' | 'genre' | 'year' | 'developer';

export interface AppSettings {
  viewMode: ViewMode;
  columns: number;
  groupBy: GroupBy;
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
  { id: 'nes', name: 'NES', color: '#dc2626', textColor: 'text-white', logo: 'nes_logo.png' },
  { id: 'snes', name: 'SNES', color: '#8b5cf6', textColor: 'text-white', logo: 'snes_logo.png' },
  { id: 'n64', name: 'N64', color: '#3b82f6', textColor: 'text-white', logo: 'n64_logo.png' },
  { id: 'gamecube', name: 'GameCube', color: '#6366f1', textColor: 'text-white', logo: 'gamecube_logo.png' },
  { id: 'wii', name: 'Wii', color: '#0ea5e9', textColor: 'text-white', logo: 'wii_logo.png' },
  { id: 'wiiu', name: 'Wii U', color: '#009ac7', textColor: 'text-white', logo: 'wiiu_logo.png' },
  { id: 'switch', name: 'Switch', color: '#e60012', textColor: 'text-white', logo: 'switch_logo.png' },
  { id: 'switch2', name: 'Switch 2', color: '#b91c1c', textColor: 'text-white', logo: 'switch2_logo.png' },
];