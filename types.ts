
export type ConsoleId = 'nes' | 'snes' | 'n64' | 'gamecube' | 'wii' | 'wiiu' | 'switch' | 'switch2';

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
  showFinancials: boolean; 
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
  { id: 'nes', name: 'NES', color: '#dc2626', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo_Entertainment_System_logo.svg/512px-Nintendo_Entertainment_System_logo.svg.png' },
  { id: 'snes', name: 'SNES', color: '#8b5cf6', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/SNES_logo.svg/512px-SNES_logo.svg.png' },
  { id: 'n64', name: 'N64', color: '#3b82f6', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Nintendo_64_Logo.svg/512px-Nintendo_64_Logo.svg.png' },
  { id: 'gamecube', name: 'GameCube', color: '#6366f1', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Nintendo_GameCube_Logo.svg/512px-Nintendo_GameCube_Logo.svg.png' },
  { id: 'wii', name: 'Wii', color: '#0ea5e9', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Wii_Logo.svg/512px-Wii_Logo.svg.png' },
  { id: 'wiiu', name: 'Wii U', color: '#009ac7', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Wii_U_Logo.svg/512px-Wii_U_Logo.svg.png' },
  { id: 'switch', name: 'Switch', color: '#e60012', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Nintendo_Switch_logo_icon.png/512px-Nintendo_Switch_logo_icon.png' },
  { id: 'switch2', name: 'Switch 2', color: '#b91c1c', textColor: 'text-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nintendo_Switch_2_logo_concept.png/512px-Nintendo_Switch_2_logo_concept.png' },
];
