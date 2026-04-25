
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Game, ViewMode, GroupBy, AppSettings, ConsoleId, CONSOLES } from './types';
import { fetchGameMetadata } from './services/geminiService';
import { syncToDrive, downloadFromDrive } from './services/driveService';
import { 
  Plus, Search, Camera, Trash2, AlertTriangle, X, Save, Check, Star, Library, 
  Settings as SettingsIcon, DollarSign, Wallet, PiggyBank, History, Filter, 
  Eye, EyeOff, PlayCircle, EyeClosed, Image as ImageIcon, Mail, MoreVertical, 
  Slash, Lock, UserCheck, ShieldCheck, MailPlus, Info, TrendingUp, LogOut, ChevronRight, 
  FileText, Calendar, User as UserIcon, Tag, Upload, Database, Cloud, RefreshCw, Download,
  CheckCircle2, FileImage, Shield, Zap, Sparkles, Monitor, Info as InfoIcon, Play, Calculator, FileCheck, Layers, Edit2, Trophy, ChevronLeft
} from 'lucide-react';

const APP_VERSION = "3.4.0";

const STORAGE_KEY = 'nintendo_collector_v1';
const SETTINGS_KEY = 'nintendo_collector_settings';
const WISHLIST_KEY = 'nintendo_collector_wishlist';

const FONTS = [
  { id: 'technical', name: 'Táctica (Inter)', class: 'font-technical' },
  { id: 'retro', name: 'Retro (Mono)', class: 'font-retro' },
  { id: 'elegant', name: 'Elegante (Serif)', class: 'font-elegant' },
];

const THEMES = [
  { id: 'none', name: 'Original', url: '' },
  { id: 't1', name: 'Tema 1', url: 'https://lh3.googleusercontent.com/d/1PQXHuRc5xlrrTfGwU8BKw8s33Mm7nVmC' },
  { id: 't2', name: 'Tema 2', url: 'https://lh3.googleusercontent.com/d/1mLZRzGS1qMK3zZmw3s61gdXgnvf9eWNM' },
  { id: 't3', name: 'Tema 3', url: 'https://lh3.googleusercontent.com/d/1WzEVLdu6VpLMzEnmWd_DMz4L9w6A_Xnw' },
  { id: 't4', name: 'Tema 4', url: 'https://lh3.googleusercontent.com/d/1pDBA1mgqhAHCKMMTDVJ3VgYfkDmxPz3e' },
  { id: 't5', name: 'Tema 5', url: 'https://lh3.googleusercontent.com/d/1AlFLTo7lgtOyF1SH20ePUZZjo6nhRwP6' },
  { id: 't6', name: 'Tema 6', url: 'https://lh3.googleusercontent.com/d/1vOebRignxG_BFO8DVAW3NDxCx16Jbu9o' },
  { id: 't7', name: 'Tema 7', url: 'https://lh3.googleusercontent.com/d/1iEk8PcX_6BTYrjXG8tqTmSWUg-RLwNbW' },
  { id: 't8', name: 'Tema 8', url: 'https://lh3.googleusercontent.com/d/1Bx5hk6nih4peYk1ESzARCoD4SCNx0uQW' },
  { id: 't9', name: 'Tema 9', url: 'https://lh3.googleusercontent.com/d/1_9s5sMaA6acKbT9zpsGhI1-qm9UhSb0a' },
  { id: 't10', name: 'Tema 10', url: 'https://lh3.googleusercontent.com/d/1bKUpCfxSm12NVclGaxFJ4voYcNNqpCLV' },
  { id: 't11', name: 'Tema 11', url: 'https://lh3.googleusercontent.com/d/15aipetN1jQLWsepIQVvww8ZCCzZ6h8Rr' },
  { id: 't12', name: 'Tema 12', url: 'https://lh3.googleusercontent.com/d/10zLrVNG7yQFPgLmiZIfTqdj8a1Zx0y_W' },
  { id: 't13', name: 'Tema 13', url: 'https://lh3.googleusercontent.com/d/17o7KOZrxyvmlhOcRfD9MEyrXwbDvTJ2K' },
  { id: 't14', name: 'Tema 14', url: 'https://lh3.googleusercontent.com/d/1TO1h9V9t6qcWQpDHxAbdaD2lEM5nL1PP' },
];

const COLLECTOR_LEVELS = [
  { name: 'Novato', threshold: 0, icon: 'https://lh3.googleusercontent.com/d/1UTQWOoijQd3RKIWJZwk34KeeuWTWemwr', phrase: "Aun hay mucho camino por delante." },
  { name: 'Principiante', threshold: 10, icon: 'https://lh3.googleusercontent.com/d/1h52gPiNdPJTKSBr2QoQsooiLez6O4ynH', phrase: "Tus primeros pasos en una gran aventura" },
  { name: 'Entusiasta', threshold: 25, icon: 'https://lh3.googleusercontent.com/d/1UZDsWvf9m9pYbtkxz6PdnfuieU5VSjao', phrase: "La pasión por los clásicos comienza a brillar" },
  { name: 'Visionario', threshold: 50, icon: 'https://lh3.googleusercontent.com/d/10MMFcmM6vQyya9XCOa_wQr65A6pwMQXl', phrase: "Tienes el ojo puesto en los tesoros más raros" },
  { name: 'Serio', threshold: 100, icon: 'https://lh3.googleusercontent.com/d/1gQzi0zAZSwFO94PTBc0KRrXHtQgy6ZX5', phrase: "Tu colección es ya una fuerza imparable" },
  { name: 'Avanzado', threshold: 150, icon: 'https://lh3.googleusercontent.com/d/1ZfXhDH4sAuuz_0tUTK5Ql8eteGQhSHvV', phrase: "Dominas el arte de encontrar lo imposible" },
  { name: 'Aguerrido', threshold: 200, icon: 'https://lh3.googleusercontent.com/d/1rVU8J9t7HJTwTy0ieDZRr6Spng2ozqEw', phrase: "Ningún cartucho es demasiado difícil para ti" },
  { name: 'Intenso', threshold: 300, icon: 'https://lh3.googleusercontent.com/d/1mEx9COuHM3-I5k-nRyFpYwzy-B4dy4e6', phrase: "Vives y respiras la nostalgia de Nintendo" },
  { name: 'Leyenda', threshold: 400, icon: 'https://lh3.googleusercontent.com/d/1bbaE7RHU0JqqVC72muRP-h5VFKgibqy1', phrase: "Tu nombre resuena en los salones de la historia" },
  { name: 'Uno con el Cosmos', threshold: 500, icon: 'https://lh3.googleusercontent.com/d/1oCH5K0Tpado6P8-0S9xtMRMtbCtIqtBQ', phrase: "Has trascendido, eres parte del universo Nintendo" },
];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  const [activeTab, setActiveTab] = useState('home');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all');
  const [collection, setCollection] = useState<Game[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none',
    uiScale: 'med',
    showFinancialsHome: true,
    showFinancialsShelf: true,
    hideEmptyConsoles: false,
    googleDriveSync: false,
    themeId: 'none',
    fontId: 'technical',
    autoSyncFrequency: 'none',
    coinsSpent: 0,
    unlockedThemes: ['none', 't1', 't2', 't3']
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newGameForm, setNewGameForm] = useState<Partial<Game>>({
    name: '',
    developer: '',
    year: '',
    genre: '',
    coverUrl: '',
    costPaid: 0,
    marketPrice: 0,
    acquisitionDate: Date.now(),
    consoleId: undefined,
    notes: '',
    cartridgeFrontPhoto: '',
    cartridgeBackPhoto: ''
  });
  const [coverOptions, setCoverOptions] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<'front' | 'back' | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const suppressUnlocksRef = useRef(true);
  const prevRewardsRef = useRef<any>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<any[]>([]);
  const [unlockMessage, setUnlockMessage] = useState("");

  const CHEERING_MESSAGES = [
    "¡Sigue así, tu estante cada vez se ve más impresionante!",
    "¡Un paso más cerca de convertirte en una Leyenda de Nintendo!",
    "Miyamoto estaría orgulloso de tu dedicación. ¡Sigue coleccionando!",
    "¡Excelente adquisición! Tu museo personal sigue creciendo.",
    "¡Power up! Cada título es un pedazo de historia preservado.",
    "Tu pasión por los videojuegos es verdaderamente inspiradora. ¡A por más!",
    "¡Increíble! Ese cartucho ahora tiene el hogar perfecto.",
    "Coleccionar no es un pasatiempo, es un arte. ¡Sigue creando tu obra maestra!",
    "¡Bingo! Tu colección brilla más brillante que una Estrella de Invencibilidad.",
    "Estás construyendo un legado pixelado inolvidable. ¡No te detengas!"
  ];

  const rewards = useMemo(() => {
    const totalTitles = collection.length;
    const availableCoins = totalTitles - (settings.coinsSpent || 0);

    const consolesWithGames = CONSOLES.filter(c => collection.some(g => g.consoleId === c.id));
    
    // Gold coins: 1 per 10 total games
    const goldCoins = Math.floor(totalTitles / 10);

    // Unlocks logic
    const consolesWith10Plus = CONSOLES.filter(c => 
      collection.filter(g => g.consoleId === c.id).length >= 10
    );
    const unlockNes = totalTitles >= 20 && consolesWith10Plus.length >= 2;
    const unlockAll = totalTitles >= 50;

    // Levels
    const level = COLLECTOR_LEVELS.slice().reverse().find(l => totalTitles >= l.threshold) || COLLECTOR_LEVELS[0];

    return {
      totalTitles,
      silverCoins: totalTitles,
      goldCoins,
      availableCoins,
      consoleTokens: consolesWithGames.map(c => c.id),
      dkCoin: totalTitles >= 50 ? 1 : 0,
      mushroomTrophy: totalTitles >= 100 ? 1 : 0,
      goldRupee: totalTitles >= 200 ? 1 : 0,
      diamond: totalTitles >= 300 ? 1 : 0,
      triforce: totalTitles >= 400 ? 1 : 0,
      masterTriforce: totalTitles >= 500 ? 1 : 0,
      unlockNes,
      unlockAll,
      level
    };
  }, [collection, settings.coinsSpent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      suppressUnlocksRef.current = false;
    }, 4500);

    // Initial load from storage
    const savedCollection = localStorage.getItem(STORAGE_KEY);
    if (savedCollection) {
      setCollection(JSON.parse(savedCollection));
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedWishlist = localStorage.getItem(WISHLIST_KEY);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const backupKeyDate = 'ninty_backup_date';
      if (localStorage.getItem(backupKeyDate) !== today) {
        if (savedCollection || savedWishlist) {
          localStorage.setItem('ninty_emergency_backup_data', JSON.stringify({
            collection: savedCollection ? JSON.parse(savedCollection) : [],
            wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
            settings: savedSettings ? JSON.parse(savedSettings) : {},
            date: today
          }));
          localStorage.setItem(backupKeyDate, today);
          console.log('Respaldo de emergencia diario guardado:', today);
        }
      }
    } catch(e) { console.error('Backup error', e); }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!prevRewardsRef.current) {
      prevRewardsRef.current = rewards;
      return;
    }

    if (suppressUnlocksRef.current) {
      prevRewardsRef.current = rewards;
      return;
    }

    const prev = prevRewardsRef.current;
    const current = rewards;
    const unlocks = [];
    
    // Only check if we added games (not deleted)
    if (current.silverCoins > prev.silverCoins) {
      unlocks.push({ 
        type: 'silver', 
        name: 'Moneda de Plata', 
        icon: 'https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N', 
        description: 'Por registrar un título' 
      });
      
      const newTokens = current.consoleTokens.filter(t => !prev.consoleTokens.includes(t));
      for (const t of newTokens) {
        const consoleData = CONSOLES.find(c => c.id === t);
        unlocks.push({ 
          type: 'token', 
          name: `Insignia ${consoleData?.name}`, 
          icon: consoleData?.badge || 'https://drive.google.com/uc?export=view&id=1OQGDdqWhAWYyQVqAZpGj5nRsQI_ugh96', 
          description: 'Primer título en este sistema' 
        });
      }
      
      if (current.goldCoins > prev.goldCoins) {
        unlocks.push({ 
          type: 'gold', 
          name: 'Moneda de Oro', 
          icon: 'https://drive.google.com/uc?export=view&id=1XIgz_oKAp4rVygTyZb8m4rRnhC4xrui-', 
          description: 'Por cada 10 títulos registrados' 
        });
      }
      
      if (current.dkCoin > prev.dkCoin) unlocks.push({ 
        type: 'special', 
        name: 'Moneda DK', 
        icon: 'https://drive.google.com/uc?export=view&id=1QeC8jVlx4uyYKg1ld2CkpJIigflEddwk', 
        description: 'Hito: 50 Títulos' 
      });
      if (current.mushroomTrophy > prev.mushroomTrophy) unlocks.push({ 
        type: 'special', 
        name: 'Trofeo Champiñón', 
        icon: 'https://drive.google.com/uc?export=view&id=1aC3VS4J6rMfq4hjuPUgMBmsJhgn-Seij', 
        description: 'Hito: 100 Títulos' 
      });
      if (current.goldRupee > prev.goldRupee) unlocks.push({ 
        type: 'special', 
        name: 'Rupia Oro', 
        icon: 'https://drive.google.com/uc?export=view&id=1XbLtJcGKr3f6gaKlIFZhs20cO-lKFUFA', 
        description: 'Hito: 200 Títulos' 
      });
      if (current.diamond > prev.diamond) unlocks.push({ 
        type: 'special', 
        name: 'Diamante', 
        icon: 'https://drive.google.com/uc?export=view&id=1GwD1m5YlpwCzDI_XkFnz0RlcadKn33FC', 
        description: 'Hito: 300 Títulos' 
      });
      if (current.triforce > prev.triforce) unlocks.push({ 
        type: 'special', 
        name: 'Trifuerza', 
        icon: 'https://drive.google.com/uc?export=view&id=1uwWC1GFaTYQQgXmRuzjqxgnkdrvlR9BG', 
        description: 'Hito: 400 Títulos' 
      });
      if (current.masterTriforce > prev.masterTriforce) unlocks.push({ 
        type: 'special', 
        name: 'Trifuerza Maestra', 
        icon: 'https://drive.google.com/uc?export=view&id=1nBKI8aKKniXdpuYEgQKLAER0fRko_nd3', 
        description: 'Hito: 500 Títulos' 
      });
      
      if (current.level.name !== prev.level.name) {
        unlocks.push({ 
          type: 'level', 
          name: current.level.name, 
          icon: current.level.icon || '🛡️', 
          description: '¡Subiste de Rango de Coleccionista!' 
        });
      }

      if (current.unlockNes && !prev.unlockNes) {
        unlocks.push({ type: 'unlock', name: 'Emulación NES', icon: '📺', description: 'Jugar Ahora desbloqueado para NES' });
      }
      if (current.unlockAll && !prev.unlockAll) {
        unlocks.push({ type: 'unlock', name: 'Emulación Total', icon: '🌟', description: 'Jugar Ahora desbloqueado para todo' });
      }
    }

    if (unlocks.length > 0) {
      setRecentUnlocks(unlocks);
      setUnlockMessage(CHEERING_MESSAGES[Math.floor(Math.random() * CHEERING_MESSAGES.length)]);
    }

    prevRewardsRef.current = current;
  }, [rewards]);

  useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const tokens = event.data.tokens;
        setSettings(prev => ({
          ...prev,
          googleDriveSync: true,
          googleDriveTokens: tokens
        }));
        setNotification({ message: "Conectado a Google Drive correctamente", type: 'success' });
      }
    };
    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, []);

  // Auto-sync when collection changes
  useEffect(() => {
    if (settings.googleDriveSync && settings.googleDriveTokens && collection.length > 0) {
      const performSync = async () => {
        try {
          setIsSyncing(true);
          const consolidatedData = { version: 2, collection, settings, wishlist };
          await syncToDrive(settings.googleDriveTokens, consolidatedData);
          setSettings(prev => ({ ...prev, lastSync: Date.now() }));
        } catch (err) {
          console.error("Auto-sync error:", err);
        } finally {
          setIsSyncing(false);
        }
      };
      
      const timeout = setTimeout(performSync, 5000); // Initial delay to avoid too many writes
      return () => clearTimeout(timeout);
    }
  }, [collection, settings.googleDriveSync, settings.googleDriveTokens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Auto-sync logic
  useEffect(() => {
    if (!settings.googleDriveSync || settings.autoSyncFrequency === 'none' || isSyncing) return;

    const checkAutoSync = async () => {
      const now = Date.now();
      const lastSync = settings.lastSync || 0;
      let shouldSync = false;

      const msPerDay = 24 * 60 * 60 * 1000;
      
      if (settings.autoSyncFrequency === 'daily' && now - lastSync > msPerDay) {
        shouldSync = true;
      } else if (settings.autoSyncFrequency === 'weekly' && now - lastSync > msPerDay * 7) {
        shouldSync = true;
      } else if (settings.autoSyncFrequency === 'monthly' && now - lastSync > msPerDay * 30) {
        shouldSync = true;
      }

      if (shouldSync) {
        console.log(`Performing auto-sync (${settings.autoSyncFrequency})`);
        setIsSyncing(true);
        try {
          const consolidatedData = { version: 2, collection, settings, wishlist };
          await syncToDrive(settings.googleDriveTokens, consolidatedData);
          setSettings(prev => ({ ...prev, lastSync: Date.now() }));
          setNotification({ message: "Respaldo automático completado", type: 'success' });
        } catch (error) {
          console.error("Auto-sync failed", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const interval = setInterval(checkAutoSync, 60000); // Check every minute
    checkAutoSync(); // Initial check

    return () => clearInterval(interval);
  }, [settings.googleDriveSync, settings.autoSyncFrequency, settings.lastSync, collection, isSyncing]);

  const filteredCollection = useMemo(() => {
    return activeConsole === 'all' ? collection : collection.filter(g => g.consoleId === activeConsole);
  }, [collection, activeConsole]);

  const globalStats = useMemo(() => {
    const paid = collection.reduce((acc, g) => acc + (g.costPaid || 0), 0);
    const market = collection.reduce((acc, g) => acc + (g.marketPrice || 0), 0);
    return { paid, market, saved: market - paid };
  }, [collection]);

  const handleConnectGoogleDrive = async () => {
    try {
      const params = new URLSearchParams();
      if (settings.googleClientId) params.append('clientId', settings.googleClientId);
      if (settings.googleClientSecret) params.append('clientSecret', settings.googleClientSecret);
      
      const response = await fetch(`/api/auth/google/url${params.toString() ? '?' + params.toString() : ''}`);
      if (!response.ok) throw new Error();
      const { url } = await response.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (error) {
      setNotification({ message: "Error al conectar con Google Drive", type: 'error' });
    }
  };

  const handleRestoreFromDrive = async () => {
    if (!settings.googleDriveTokens) return;
    try {
      setIsSyncing(true);
      const data = await downloadFromDrive(settings.googleDriveTokens);
      
      let importedGames = [];
      let importedSettings = null;
      let importedWishlist = null;

      if (data && Array.isArray(data)) {
        importedGames = data;
      } else if (data && data.version === 2) {
        importedGames = data.collection || [];
        importedSettings = data.settings;
        importedWishlist = data.wishlist;
      }

      if (importedGames.length > 0 || importedSettings) {
        if (confirm(`Se restaurarán los datos desde Google Drive. ¿Deseas reemplazar tu colección actual?`)) {
          suppressUnlocksRef.current = true;
          setCollection(importedGames);
          
          if (importedSettings) {
             setSettings(prev => ({...prev, ...importedSettings}));
          }
          if (importedWishlist) {
             setWishlist(importedWishlist);
          }

          setTimeout(() => { suppressUnlocksRef.current = false; }, 1000);
          setNotification({ message: "Datos restaurados desde Google Drive", type: 'success' });
        }
      } else {
        setNotification({ message: "No se encontró ningún respaldo en Google Drive", type: 'error' });
      }
    } catch (error) {
      setNotification({ message: "Error al restaurar desde Google Drive", type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchMetadata = async (dataOnly: boolean = false) => {
    const query = dataOnly ? newGameForm.name || searchName : searchName;
    if (!query?.trim() || !newGameForm.consoleId) return;
    setIsSearching(true);
    if (!dataOnly) {
      setSearchError(false);
      setSearchResults([]);
      setCoverOptions([]);
    }
    
    try {
      const consoleData = CONSOLES.find(c => c.id === newGameForm.consoleId);
      const results = await fetchGameMetadata(query, consoleData?.name || 'Nintendo', dataOnly);
      
      if (dataOnly) {
        if (results && results.length > 0) {
          const data = results[0];
          setNewGameForm(prev => ({
            ...prev,
            name: data.name || prev.name,
            developer: data.developer || prev.developer,
            year: data.year || prev.year,
            genre: data.genre || prev.genre,
            marketPrice: data.estimatedPrice || prev.marketPrice,
          }));
          setNotification({ message: "Datos actualizados correctamente", type: "success" });
        } else {
          setNotification({ message: "No se encontraron datos", type: "error" });
        }
      } else {
        setSearchResults(results);
        if (results && results.length > 0) {
           // Clear new game form on successful fetch before applying first result
          const data = results[0];
          setNewGameForm(prev => ({
            ...prev,
            name: data.name,
            developer: data.developer,
            year: data.year,
            genre: data.genre,
            marketPrice: data.estimatedPrice || 0,
            coverUrl: data.coverOptions?.[0] || ''
          }));
          setCoverOptions(data.coverOptions || []);
        }
      }
    } catch (err) { 
      console.error(err); 
      if (!dataOnly) {
        setSearchError(true);
        // Auto-fill the name so user can skip or input manually
        setNewGameForm(prev => ({ ...prev, name: searchName.trim() }));
      } else {
        setNotification({ message: "Error al buscar datos", type: "error" });
      }
    } finally { 
      setIsSearching(false); 
    }
  };

  const handleSelectSearchResult = (data: any) => {
    setNewGameForm(prev => ({
      ...prev,
      name: data.name,
      developer: data.developer,
      year: data.year,
      genre: data.genre,
      marketPrice: data.estimatedPrice || 0,
      coverUrl: data.coverOptions?.[0] || ''
    }));
    setCoverOptions(data.coverOptions || []);
  };

  const handleSaveGame = async () => {
    if (!newGameForm.name || !newGameForm.consoleId) return;
    const game: Game = {
      id: editingGameId || crypto.randomUUID(),
      consoleId: newGameForm.consoleId as ConsoleId,
      name: newGameForm.name,
      developer: newGameForm.developer || 'Desconocido',
      year: newGameForm.year || 'N/A',
      genre: newGameForm.genre || 'Desconocido',
      coverUrl: newGameForm.coverUrl || '',
      costPaid: Number(newGameForm.costPaid) || 0,
      marketPrice: Number(newGameForm.marketPrice) || 0,
      acquisitionDate: newGameForm.acquisitionDate || Date.now(),
      dateAdded: editingGameId ? (collection.find(g => g.id === editingGameId)?.dateAdded || Date.now()) : Date.now(),
      isFavorite: editingGameId ? (collection.find(g => g.id === editingGameId)?.isFavorite || false) : false,
      notes: newGameForm.notes || '',
      cartridgeFrontPhoto: newGameForm.cartridgeFrontPhoto || '',
      cartridgeBackPhoto: newGameForm.cartridgeBackPhoto || ''
    };

    if (editingGameId) {
      setCollection(prev => prev.map(g => g.id === editingGameId ? game : g));
      setNotification({ message: "Juego actualizado correctamente", type: "success" });
      setEditingGameId(null);
    } else {
      setCollection(prev => [game, ...prev]);
      
      // Reproducir sonido 1-UP y activar efecto en la tarjeta (solo al añadir uno nuevo)
      const audio = new Audio('https://www.myinstants.com/media/sounds/super-mario-1-up.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio blocked', e));
      
      setLastAddedId(game.id);
      setTimeout(() => setLastAddedId(null), 3000);
      setNotification({ message: "Juego añadido a tu colección", type: "success" });
    }

    setIsRegisterOpen(false);
    setActiveTab('collection');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoSlot) return;
    
    const objUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // slightly lower quality to save memory
        setNewGameForm(prev => ({
          ...prev,
          [activePhotoSlot === 'front' ? 'cartridgeFrontPhoto' : 'cartridgeBackPhoto']: dataUrl
        }));
      } else {
        // Fallback if context not available
        const reader = new FileReader();
        reader.onload = (ev) => {
          setNewGameForm(prev => ({
            ...prev,
            [activePhotoSlot === 'front' ? 'cartridgeFrontPhoto' : 'cartridgeBackPhoto']: ev.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      // Fallback on error
      URL.revokeObjectURL(objUrl);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewGameForm(prev => ({
          ...prev,
          [activePhotoSlot === 'front' ? 'cartridgeFrontPhoto' : 'cartridgeBackPhoto']: ev.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    };
    img.src = objUrl;
  };

  const handlePlayNow = (gameName: string, consoleId: string) => {
    // Verificación de desbloqueos por colección
    if (!rewards.unlockAll) {
      if (consoleId === 'nes') {
        if (!rewards.unlockNes) {
          setNotification({ 
            message: "¡BLOQUEADO! Necesitas 10 títulos en 2 consolas distintas para jugar Nes.", 
            type: 'error' 
          });
          return;
        }
      } else {
        setNotification({ 
          message: "¡BLOQUEADO! Alcanza los 50 títulos en total para desbloquear emulación.", 
          type: 'error' 
        });
        return;
      }
    }

    // Generate slug from game name: "Super Mario World" -> "super-mario-world"
    const slug = gameName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Target specific URL pattern on gam.onl
    const url = `https://gam.onl/${consoleId}/${slug}-play-online.html#${slug}-play-online`;
    window.open(url, '_blank');
  };

  const toggleFavorite = (gameId: string) => {
    setCollection(prev => prev.map(g => 
      g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g
    ));
    // Also update selected game if it matches
    if (selectedGame && selectedGame.id === gameId) {
      setSelectedGame({ ...selectedGame, isFavorite: !selectedGame.isFavorite });
    }
  };

  const addToWishlist = (item: any) => {
    if (wishlist.length >= 10) {
      setNotification({ message: "La lista de deseos está limitada a 10 títulos", type: 'error' });
      return;
    }
    setWishlist(prev => [item, ...prev]);
    setNotification({ message: "Añadido a lista de deseos", type: 'success' });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const toggleGameSelection = (id: string) => {
    setSelectedGameIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setCollection(prev => prev.filter(g => !selectedGameIds.includes(g.id)));
    setSelectedGameIds([]);
    setIsEditMode(false);
    setConfirmBulkDelete(false);
    setNotification({ message: "Títulos eliminados correctamente", type: 'success' });
  };

  const handleExportLibrary = () => {
    try {
      const consolidatedData = {
        version: 2,
        collection,
        settings,
        wishlist
      };
      const dataStr = JSON.stringify(consolidatedData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nintendo_legacy_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setNotification({ message: "Biblioteca exportada correctamente", type: 'success' });
    } catch (error) {
      setNotification({ message: "Error al exportar la biblioteca", type: 'error' });
    }
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);

        let importedGames = [];
        let importedSettings = null;
        let importedWishlist = null;

        if (Array.isArray(parsedData)) {
          // Legacy format
          importedGames = parsedData;
        } else if (parsedData.version === 2) {
          // New format
          importedGames = parsedData.collection || [];
          importedSettings = parsedData.settings;
          importedWishlist = parsedData.wishlist;
        } else {
          throw new Error("Formato de archivo inválido");
        }

        // Basic validation
        const isValid = importedGames.every((g: any) => g.id && g.name && g.consoleId);
        if (!isValid) {
          throw new Error("El archivo no contiene datos de juegos válidos");
        }

        if (confirm(`Se importarán ${importedGames.length} juegos. Los juegos y configuraciones serán actualizados. ¿Continuar?`)) {
          suppressUnlocksRef.current = true;
          setCollection(prev => {
            const newCollection = [...prev];
            importedGames.forEach((imported: any) => {
              const idx = newCollection.findIndex(g => g.id === imported.id);
              if (idx > -1) {
                newCollection[idx] = imported;
              } else {
                newCollection.unshift(imported);
              }
            });
            return newCollection;
          });
          
          if (importedSettings) {
             setSettings(prev => ({...prev, ...importedSettings}));
          }
          if (importedWishlist) {
             setWishlist(importedWishlist);
          }

          setTimeout(() => { suppressUnlocksRef.current = false; }, 1000);
          setNotification({ message: `¡Respaldo importado con éxito!`, type: 'success' });
        }
      } catch (error) {
        setNotification({ message: "Error al importar: Archivo corrupto o inválido", type: 'error' });
      } finally {
        if (importInputRef.current) importInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  if (showSplash) {
    const welcomeText = "Welcome to";
    const enjoyText = "Enjoy";
    
    return (
      <div onClick={() => { try { document.documentElement.requestFullscreen() } catch(e){} }} className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center z-[1000] p-10 overflow-hidden cursor-pointer">
        {/* WELCOME TO SECTION */}
        <div className="flex gap-1.5 mb-14">
          {welcomeText.split("").map((char, i) => (
            <motion.span
              key={i}
              className={`pro-font text-white ${char === " " ? "w-4" : "text-4xl sm:text-5xl"} inline-block font-black tracking-widest drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]`}
              initial={{ y: -100, opacity: 0 }}
              animate={{ 
                y: [0, -30, 0],
                opacity: 1
              }}
              transition={{
                y: {
                  duration: 0.6,
                  repeat: 2,
                  repeatType: "reverse",
                  delay: i * 0.08,
                  ease: "easeOut"
                },
                opacity: { duration: 0.5, delay: i * 0.08 }
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* LOGO SECTION */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 1.2,
            duration: 0.8
          }}
          className="relative mb-14"
        >
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <img 
            src="https://lh3.googleusercontent.com/d/1UFaiz33dmWOocrSre7pXmewkabxMaCoW" 
            className="w-32 sm:w-48 h-auto brightness-125 relative z-10 drop-shadow-[0_10px_25px_rgba(0,0,0,0.3)]" 
            alt="Logo" 
          />
        </motion.div>

        {/* ENJOY SECTION */}
        <div className="flex gap-1.5">
          {enjoyText.split("").map((char, i) => (
            <motion.span
              key={i}
              className={`pro-font text-white ${char === " " ? "w-4" : "text-4xl sm:text-5xl"} inline-block font-black tracking-[0.3em] drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ 
                y: [0, 30, 0],
                opacity: 1 
              }}
              transition={{
                y: {
                  duration: 0.6,
                  repeat: 2,
                  repeatType: "reverse",
                  delay: 2.2 + (i * 0.1),
                  ease: "easeOut"
                },
                opacity: { duration: 0.5, delay: 2.2 + (i * 0.1) }
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* LOADING BAR (Subtle) */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "200px", opacity: 1 }}
          transition={{ delay: 3, duration: 1.5 }}
          className="h-1 bg-white rounded-full mt-16 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
        />
      </div>
    );
  }

  const currentFont = FONTS.find(f => f.id === settings.fontId) || FONTS[0];
  const currentTheme = THEMES.find(t => t.id === settings.themeId) || THEMES[0];

  return (
    <div 
      className={`min-h-screen ${currentFont.class} transition-all duration-500 relative`}
      style={{ 
        backgroundImage: currentTheme.url ? `url(${currentTheme.url})` : 'none',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Subtle overlay to improve readability on complex backgrounds */}
      {currentTheme.url && (
        <div className="fixed inset-0 bg-white/40 pointer-events-none z-0" />
      )}
      
      <div className="relative z-10">
        <Layout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeConsole={activeConsole} 
          setActiveConsole={setActiveConsole}
          onOpenRegister={() => {
            setNewGameForm({ name: '', developer: '', year: '', genre: '', coverUrl: '', costPaid: 0, marketPrice: 0, acquisitionDate: Date.now(), consoleId: activeConsole === 'all' ? undefined : activeConsole, notes: '', cartridgeFrontPhoto: '', cartridgeBackPhoto: '' });
            setSearchName('');
            setSearchResults([]);
            setCoverOptions([]);
            setIsManualEntry(false);
            setSearchError(false);
            setEditingGameId(null);
            setIsRegisterOpen(true);
          }}
          hideEmpty={settings.hideEmptyConsoles} 
          collection={collection}
          uiScale={settings.uiScale}
          collectorLevel={rewards.level.name}
          collectorIcon={rewards.level.icon}
          onOpenAchievements={() => { setActiveTab('achievements'); setShowHowItWorks(false); }}
        >
      {notification && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="text-[9px] font-black uppercase tracking-widest">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={12} /></button>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        ref={photoInputRef} 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={cameraInputRef} 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />

      <input 
        type="file" 
        accept=".json" 
        ref={importInputRef} 
        className="hidden" 
        onChange={handleImportLibrary} 
      />

      {activeTab === 'home' && (
        <div className="space-y-8 animate-fadeIn pb-10">
          {/* REWARDS SYSTEM HUD */}
          <section className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-xl animate-slideUp relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-700"></div>
            
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-7 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                 <div>
                   <h2 className="pro-font text-2xl text-gray-900 tracking-tight leading-none uppercase">Mis Logros</h2>
                   <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">Nivel de Coleccionista</p>
                 </div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 rounded-full shadow-lg border border-gray-800">
                    <Sparkles size={12} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{rewards.level.name}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
               {/* Monedas Base */}
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" alt="Monedas" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-black text-gray-900 retro-data leading-none">{rewards.availableCoins}</p>
                    <p className="text-[6px] font-black text-gray-400 uppercase tracking-tighter mt-1">Monedas</p>
                  </div>
               </div>

               {/* Tokens de Consola */}
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/d/1OQGDdqWhAWYyQVqAZpGj5nRsQI_ugh96" alt="Sistemas" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-black text-gray-900 retro-data leading-none">{rewards.consoleTokens.length}</p>
                    <p className="text-[6px] font-black text-gray-400 uppercase tracking-tighter mt-1">Sistemas</p>
                  </div>
               </div>

               {/* Monedas de Oro (Antes Plata) */}
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/d/1XIgz_oKAp4rVygTyZb8m4rRnhC4xrui-" alt="Oro" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-black text-gray-900 retro-data leading-none">{rewards.goldCoins}</p>
                    <p className="text-[6px] font-black text-gray-400 uppercase tracking-tighter mt-1">Oro</p>
                  </div>
               </div>

               {/* RECOMPENSAS ESPECIALES (DINÁMICAS) */}
               {rewards.dkCoin > 0 && (
                 <div className="flex flex-col items-center gap-2 animate-bounce">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-lg ring-4 ring-yellow-400/20 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1QeC8jVlx4uyYKg1ld2CkpJIigflEddwk" alt="DK" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-yellow-800 uppercase tracking-tighter leading-none">Moneda DK</p>
                    </div>
                 </div>
               )}

               {rewards.mushroomTrophy > 0 && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-lg ring-4 ring-orange-400/20 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1aC3VS4J6rMfq4hjuPUgMBmsJhgn-Seij" alt="Trofeo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-orange-700 uppercase tracking-tighter leading-none">Trofeo</p>
                    </div>
                 </div>
               )}

               {rewards.goldRupee > 0 && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-lg ring-4 ring-emerald-400/20 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1XbLtJcGKr3f6gaKlIFZhs20cO-lKFUFA" alt="Rupia" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-emerald-800 uppercase tracking-tighter leading-none">Rupia Oro</p>
                    </div>
                 </div>
               )}

               {rewards.diamond > 0 && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-lg ring-4 ring-blue-400/20 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1GwD1m5YlpwCzDI_XkFnz0RlcadKn33FC" alt="Diamante" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-blue-800 uppercase tracking-tighter leading-none">Diamante</p>
                    </div>
                 </div>
               )}

               {rewards.triforce > 0 && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-1.5 shadow-lg ring-4 ring-yellow-400/20 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1uwWC1GFaTYQQgXmRuzjqxgnkdrvlR9BG" alt="Trifuerza" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-yellow-800 uppercase tracking-tighter leading-none">Trifuerza</p>
                    </div>
                 </div>
               )}

               {rewards.masterTriforce > 0 && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-1 shadow-lg ring-4 ring-yellow-600/40 overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/d/1nBKI8aKKniXdpuYEgQKLAER0fRko_nd3" alt="Master Triforce" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-center">
                      <p className="text-[6px] font-black text-yellow-900 uppercase tracking-tighter leading-none">M. Trifuerza</p>
                    </div>
                 </div>
               )}
            </div>

            {/* CONSOLE TOKENS GALLERY */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 pt-6 border-t border-white/10">
               {CONSOLES.map(c => {
                 const hasToken = rewards.consoleTokens.includes(c.id);
                 return (
                   <motion.div 
                    key={c.id} 
                    whileHover={hasToken ? { scale: 1.2, rotate: 10 } : {}}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      hasToken 
                      ? 'bg-white shadow-md border-gray-100 opacity-100' 
                      : 'bg-black/5 border-dashed border-white/10 opacity-20 grayscale'
                    }`}
                   >
                      <img src={c.logo} className="w-6 h-auto object-contain" />
                   </motion.div>
                 );
               })}
            </div>

            {/* PROGRESS BAR TO NEXT LEVEL */}
            <div className="mt-8">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Siguiente Nivel</span>
                  <span className="text-[9px] font-black text-gray-900 retro-data">
                    {collection.length} / {COLLECTOR_LEVELS[COLLECTOR_LEVELS.findIndex(l => l.name === rewards.level.name) + 1]?.threshold || 'MAX'}
                  </span>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (collection.length / (COLLECTOR_LEVELS[COLLECTOR_LEVELS.findIndex(l => l.name === rewards.level.name) + 1]?.threshold || collection.length)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  />
               </div>
            </div>
          </section>
          {/* TOP 10 FAVORITOS */}
          {collection.filter(g => g.isFavorite).length > 0 && (
            <section className="animate-slideUp">
              <div className="flex justify-between items-end mb-3 border-b border-gray-50 pb-1.5 px-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full bg-yellow-400"></div>
                  <h2 className={`pro-font ${settings.uiScale === 'min' ? 'text-lg' : settings.uiScale === 'max' ? 'text-4xl' : 'text-2xl'} text-gray-900 tracking-wider leading-none uppercase flex items-center gap-2`}><Star size={20} className="text-yellow-400 fill-yellow-400" /> FAVORITOS</h2>
                </div>
                <span className="text-[8px] font-black text-gray-400 tracking-widest uppercase mb-1">TOP 10</span>
              </div>
              <div className={`flex ${settings.uiScale === 'min' ? 'gap-2' : settings.uiScale === 'max' ? 'gap-6' : 'gap-3'} overflow-x-auto no-scrollbar pb-2 px-0.5`}>
                 {collection.filter(g => g.isFavorite).slice(0, 10).map(g => (
                   <div key={g.id} className={`${settings.uiScale === 'min' ? 'w-20' : settings.uiScale === 'max' ? 'w-36' : 'w-24'} flex-shrink-0 group cursor-pointer`} onClick={() => setSelectedGame(g)}>
                     <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-gray-50 group-active:scale-95 transition-all duration-300">
                        <img src={g.coverUrl} className="w-full h-full object-cover" />
                        <div className="absolute top-1.5 right-1.5 bg-yellow-400 rounded-full p-1 shadow-sm">
                           <Star size={8} className="text-white fill-white" />
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            </section>
          )}

          {/* ÚLTIMOS ADQUIRIDOS */}
          {collection.length > 0 && (
            <section className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-end mb-3 border-b border-gray-50 pb-1.5 px-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
                  <h2 className={`pro-font ${settings.uiScale === 'min' ? 'text-lg' : settings.uiScale === 'max' ? 'text-4xl' : 'text-2xl'} text-gray-900 tracking-wider leading-none uppercase flex items-center gap-2`}><History size={20} className="text-emerald-500" /> RECIÉN ADQUIRIDOS</h2>
                </div>
                <span className="text-[8px] font-black text-gray-400 tracking-widest uppercase mb-1">ÚLTIMOS 10</span>
              </div>
              <div className={`flex ${settings.uiScale === 'min' ? 'gap-2' : settings.uiScale === 'max' ? 'gap-6' : 'gap-3'} overflow-x-auto no-scrollbar pb-2 px-0.5`}>
                 {[...collection].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 10).map(g => (
                   <div key={g.id} className={`${settings.uiScale === 'min' ? 'w-20' : settings.uiScale === 'max' ? 'w-36' : 'w-24'} flex-shrink-0 group cursor-pointer`} onClick={() => setSelectedGame(g)}>
                     <img src={g.coverUrl} className="aspect-[3/4] rounded-xl object-cover shadow-lg border border-gray-50 group-active:scale-95 transition-all duration-300" />
                   </div>
                 ))}
              </div>
            </section>
          )}

          {/* WISHLIST */}
          <section className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-end mb-4 border-b border-gray-50 pb-1.5 px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-purple-500"></div>
                <h2 className={`pro-font ${settings.uiScale === 'min' ? 'text-lg' : settings.uiScale === 'max' ? 'text-4xl' : 'text-2xl'} text-gray-900 tracking-wider leading-none uppercase flex items-center gap-2`}><Sparkles size={20} className="text-purple-500" /> LISTA DE DESEOS</h2>
              </div>
              <span className="text-[8px] font-black text-gray-400 tracking-widest uppercase mb-1">TOP 10</span>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200 text-center flex flex-col items-center gap-3">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-300">
                    <Sparkles size={24} />
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[150px]">Tu lista de deseos está vacía. Añade títulos desde la búsqueda IA.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {wishlist.map(w => (
                  <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-2 flex items-center gap-3 shadow-sm group animate-fadeIn">
                    <img src={w.coverUrl || 'https://via.placeholder.com/150'} className="w-10 h-14 object-cover rounded-lg shadow-sm border border-gray-50" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-black text-gray-900 uppercase truncate leading-none">{w.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CONSOLES.find(c => c.id === w.consoleId)?.color }}></div>
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{CONSOLES.find(c => c.id === w.consoleId)?.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromWishlist(w.id)}
                      className="p-3 text-gray-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIONES POR CONSOLA */}
          <div className="flex items-center gap-2 mb-2 px-0.5">
             <div className="w-1 h-3 rounded-full bg-gray-950"></div>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Mi Colección por Sistema</p>
          </div>
          {CONSOLES.map(c => {
            const cGames = collection.filter(g => g.consoleId === c.id).slice(0, 8);
            if (cGames.length === 0) return null;
            return (
              <section key={c.id}>
                <div className={`flex justify-between items-end ${settings.uiScale === 'min' ? 'mb-2 pb-1' : settings.uiScale === 'max' ? 'mb-6 pb-3' : 'mb-3 pb-1.5'} border-b border-gray-50`}>
                  <div className="flex items-center gap-2">
                    <div className={`${settings.uiScale === 'min' ? 'w-1 h-4' : settings.uiScale === 'max' ? 'w-2 h-8' : 'w-1.5 h-6'} rounded-full`} style={{ backgroundColor: c.color }}></div>
                    <img src={c.badge} alt={c.name} className={`${settings.uiScale === 'min' ? 'h-4' : settings.uiScale === 'max' ? 'h-10' : 'h-6'} w-auto object-contain mx-1`} />
                    <h2 className={`pro-font ${settings.uiScale === 'min' ? 'text-lg' : settings.uiScale === 'max' ? 'text-4xl' : 'text-2xl'} text-gray-900 tracking-wider leading-none uppercase`}>{c.name}</h2>
                  </div>
                  <button onClick={() => { setActiveConsole(c.id); setActiveTab('collection'); }} className={`${settings.uiScale === 'min' ? 'text-[7px]' : settings.uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors`}>ESTANTE</button>
                </div>
                <div className={`flex ${settings.uiScale === 'min' ? 'gap-2' : settings.uiScale === 'max' ? 'gap-6' : 'gap-3'} overflow-x-auto no-scrollbar pb-2 px-0.5`}>
                   {cGames.map(g => (
                     <div key={g.id} className={`${settings.uiScale === 'min' ? 'w-20' : settings.uiScale === 'max' ? 'w-36' : 'w-24'} flex-shrink-0 group cursor-pointer`} onClick={() => setSelectedGame(g)}>
                       <img src={g.coverUrl} className="aspect-[3/4] rounded-xl object-cover shadow-sm border border-gray-50 group-active:scale-95 transition-all duration-300" />
                     </div>
                   ))}
                </div>
              </section>
            );
          })}

          {settings.showFinancialsHome && (
            <div className={`bg-gray-950 rounded-2xl ${settings.uiScale === 'min' ? 'p-4' : settings.uiScale === 'max' ? 'p-12' : 'p-8'} text-white shadow-xl relative overflow-hidden border border-white/5`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -translate-y-16 translate-x-16 blur-[60px]"></div>
              <h3 className={`pro-font ${settings.uiScale === 'min' ? 'text-xs mb-3' : settings.uiScale === 'max' ? 'text-2xl mb-10' : 'text-lg mb-6'} text-gray-500 tracking-[0.2em] uppercase`}>VALOR TOTAL DEL LEGADO</h3>
              <div className={`grid grid-cols-2 ${settings.uiScale === 'min' ? 'gap-4' : 'gap-8'}`}>
                <div>
                   <p className={`${settings.uiScale === 'min' ? 'text-[6px]' : settings.uiScale === 'max' ? 'text-[11px]' : 'text-[8px]'} font-black text-gray-500 uppercase tracking-widest mb-1 opacity-60`}>Inversión</p>
                   <p className={`${settings.uiScale === 'min' ? 'text-xl' : settings.uiScale === 'max' ? 'text-5xl' : 'text-3xl'} font-black retro-data tracking-tight`}>${globalStats.paid.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className={`${settings.uiScale === 'min' ? 'text-[6px]' : settings.uiScale === 'max' ? 'text-[11px]' : 'text-[8px]'} font-black text-gray-500 uppercase tracking-widest mb-1 opacity-60`}>Mercado</p>
                   <p className={`${settings.uiScale === 'min' ? 'text-xl' : settings.uiScale === 'max' ? 'text-5xl' : 'text-3xl'} font-black retro-data text-blue-400 tracking-tight`}>${globalStats.market.toLocaleString()}</p>
                </div>
              </div>
              <div className={`${settings.uiScale === 'min' ? 'mt-4 pt-4' : 'mt-8 pt-6'} border-t border-white/5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`${settings.uiScale === 'min' ? 'p-1' : 'p-2'} bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20`}><TrendingUp size={settings.uiScale === 'min' ? 14 : settings.uiScale === 'max' ? 24 : 18}/></div>
                  <div className="flex flex-col">
                    <p className={`${settings.uiScale === 'min' ? 'text-base' : settings.uiScale === 'max' ? 'text-3xl' : 'text-xl'} font-black text-emerald-400 retro-data tracking-wider leading-none`}>+${globalStats.saved.toLocaleString()}</p>
                    <span className={`${settings.uiScale === 'min' ? 'text-[6px]' : settings.uiScale === 'max' ? 'text-[9px]' : 'text-[7px]'} font-black text-emerald-700 uppercase mt-1`}>CAPITAL</span>
                  </div>
                </div>
                <div className={`bg-white/5 ${settings.uiScale === 'min' ? 'px-1.5 py-0.5 text-[6px]' : settings.uiScale === 'max' ? 'px-4 py-2 text-[11px]' : 'px-2.5 py-1 text-[8px]'} rounded-lg border border-white/5 font-black uppercase text-gray-500 tracking-widest`}>{collection.length} TÍTULOS</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'collection' && (
        <div className="animate-fadeIn min-h-[60vh]">
          {filteredCollection.length === 0 ? (
            <div className="py-32 text-center space-y-6 opacity-20">
              <Library size={80} className="mx-auto" />
              <p className="pro-font text-3xl uppercase tracking-[0.2em]">Estante Vacío</p>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Solicita juegos con el botón central</p>
            </div>
          ) : activeConsole === 'all' ? (
            <div className="space-y-12 pb-20">
              {CONSOLES.filter(c => collection.some(g => g.consoleId === c.id)).map((console, index, array) => {
                const consoleGames = collection.filter(g => g.consoleId === console.id);
                return (
                  <div key={console.id} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-3 mb-4 px-1">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: console.color }}></div>
                      <img src={console.badge} alt={console.name} className="h-8 w-auto object-contain" />
                      <div className="flex flex-col">
                        <h3 className={`pro-font ${settings.uiScale === 'min' ? 'text-xl' : 'text-3xl'} uppercase tracking-widest text-gray-900 leading-none`}>{console.name}</h3>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-1">{consoleGames.length} TÍTULOS EN EL ESTANTE</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-8 px-1">
                       {consoleGames.map(game => (
                         <div key={game.id} className={`${settings.uiScale === 'min' ? 'w-16' : settings.uiScale === 'max' ? 'w-48' : 'w-32'} flex-shrink-0`}>
                           <GameCard 
                              game={game} 
                              viewMode={settings.viewMode} 
                              onDelete={(id) => setConfirmDelete(id)} 
                              onEdit={() => {}} 
                              onSelect={setSelectedGame} 
                              consoleColor={console.color}
                              isEditMode={isEditMode}
                              isSelected={selectedGameIds.includes(game.id)}
                              onToggleSelect={toggleGameSelection}
                              uiScale={settings.uiScale === 'min' ? 'min' : 'med'} // Enforce smaller UI in rows
                              isJustAdded={game.id === lastAddedId}
                            />
                         </div>
                       ))}
                    </div>

                    {index < array.length - 1 && (
                      <div className="flex justify-center pt-2 pb-10 transform scale-y-75">
                        <img 
                          src="https://lh3.googleusercontent.com/d/1qV6NhpQ9nBKOgsg-sBOWcPe0KSCtZU_6" 
                          alt="Separator" 
                          className="w-full max-w-md h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`grid ${settings.uiScale === 'min' ? 'grid-cols-3 sm:grid-cols-5 gap-3' : settings.uiScale === 'max' ? 'grid-cols-1 sm:grid-cols-2 gap-8' : 'grid-cols-2 sm:grid-cols-3 gap-5'}`}>
              {filteredCollection.map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  viewMode={settings.viewMode} 
                  onDelete={(id) => {
                    setConfirmDelete(id);
                  }} 
                  onEdit={() => {}} 
                  onSelect={setSelectedGame} 
                  consoleColor={CONSOLES.find(c => c.id === game.consoleId)?.color}
                  isEditMode={isEditMode}
                  isSelected={selectedGameIds.includes(game.id)}
                  onToggleSelect={toggleGameSelection}
                  uiScale={settings.uiScale}
                  isJustAdded={game.id === lastAddedId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-3 animate-fadeIn pb-24">
          <div className="bg-white rounded-[32px] overflow-hidden flex flex-col shadow-sm border border-gray-100">
             <div className="p-6 bg-gray-100 relative flex flex-col items-center border-b border-gray-200">
                {showHowItWorks && (
                   <button onClick={() => setShowHowItWorks(false)} className="absolute top-4 left-4 bg-black/5 hover:bg-black/10 rounded-full p-2 backdrop-blur-md transition-all active:scale-95"><ChevronLeft size={20} className="text-gray-900"/></button>
                )}
                <h3 className="pro-font text-xl uppercase tracking-widest mb-1 text-center mt-1 text-black">{showHowItWorks ? 'Cómo Funciona' : 'Estatus de Coleccionista'}</h3>
                
                {!showHowItWorks && (
                   <>
                     <div className="mt-1 flex flex-col items-center w-full">
                       <div className="relative mb-6">
                          <div className="w-24 h-24 bg-red-600/10 rounded-full blur-2xl absolute inset-0 animate-pulse"></div>
                          {rewards.level.icon ? (
                            <img src={rewards.level.icon} alt={rewards.level.name} className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] relative z-10" referrerPolicy="no-referrer" />
                          ) : (
                            <Shield size={60} className="text-gray-400 fill-gray-100 relative z-10" />
                          )}
                       </div>
                       
                       <div className="w-full bg-red-600 py-3 shadow-xl transform skew-x-[-12deg] mb-1">
                          <div className="transform skew-x-[12deg] text-center">
                             <h4 className="text-3xl font-black text-white pro-font tracking-tighter uppercase leading-none drop-shadow-md">
                               {rewards.level.name}
                             </h4>
                          </div>
                       </div>
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] opacity-90 mb-4 text-center">
                          {COLLECTOR_LEVELS.find(l => l.name === rewards.level.name)?.phrase || "¡Sigue coleccionando!"}
                       </p>

                       {(() => {
                          const nextLvlIndex = COLLECTOR_LEVELS.findIndex(l => l.name === rewards.level.name) + 1;
                          const nextLvl = nextLvlIndex < COLLECTOR_LEVELS.length ? COLLECTOR_LEVELS[nextLvlIndex] : null;

                          if (nextLvl) {
                            const missing = nextLvl.threshold - collection.length;
                            return (
                              <div className="w-full px-4 mb-2">
                                <div className="flex justify-between items-center mb-1 px-1">
                                   <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                      {collection.length} / {nextLvl.threshold} Títulos
                                   </span>
                                   <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                      -{missing} para {nextLvl.name}
                                   </span>
                                </div>
                                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden border border-black/5 shadow-inner">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${Math.min(100, (collection.length / nextLvl.threshold) * 100)}%` }}
                                     className="h-full bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                                   />
                                </div>
                              </div>
                            )
                          }
                          return <div className="pb-4"><p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">¡Rango Máximo Alcanzado!</p></div>
                       })()}
                     </div>
                   </>
                )}
             </div>

             <div className="p-6 bg-gray-50">
                {showHowItWorks ? (
                   <div className="space-y-6 text-sm text-gray-700">
                     <div>
                       <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Rangos</h4>
                       <p className="text-xs opacity-80 leading-relaxed mb-3">Obtén nuevos rangos al alcanzar hitos de títulos en tu colección: <strong>Novato (0), Principiante (10), Entusiasta (25), Visionario (50), Serio (100), Avanzado (150), Aguerrido (200), Intenso (300), Leyenda (400), Uno con el Cosmos (500).</strong></p>
                       <div className="mt-4 grid grid-cols-5 gap-3 border-t border-gray-100 pt-4">
                           {COLLECTOR_LEVELS.map((lvl, index) => (
                             <div key={lvl.name} className="flex flex-col items-center justify-start gap-1">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner p-2 ${index === 0 ? 'bg-white border border-gray-200' : 'bg-gray-100 border border-gray-200 opacity-60'}`}>
                                  <img 
                                    src={lvl.icon} 
                                    className={`w-full h-full object-contain ${index === 0 ? '' : 'brightness-0 opacity-20'}`} 
                                    referrerPolicy="no-referrer" 
                                  />
                               </div>
                               {index === 0 ? (
                                  <span className="text-[8px] font-black uppercase text-center leading-tight truncate w-full">{lvl.name}</span>
                               ) : (
                                  <span className="text-[8px] font-black uppercase text-center leading-tight text-gray-400">???</span>
                               )}
                             </div>
                           ))}
                        </div>
                     </div>
                     <div>
                       <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2"><img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                           Monedas y Oro</h4>
                        <ul className="text-xs opacity-80 space-y-3">
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Moneda de Plata:</strong> Se gana por cada título registrado. Se usan para canjear fondos exclusivos en la tienda.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1XIgz_oKAp4rVygTyZb8m4rRnhC4xrui-" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Moneda de Oro:</strong> Se otorga por cada 10 títulos registrados en total en tu colección.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1OQGDdqWhAWYyQVqAZpGj5nRsQI_ugh96" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Token de Consola:</strong> Se obtiene al registrar el primer juego de cualquier sistema nuevo en tu estantería.</span>
                          </li>
                       </ul>
                     </div>
                     <div>
                       <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2"><Star size={16} className="text-orange-500"/> Tesoros Especiales</h4>
                       <ul className="text-xs opacity-80 space-y-2 mb-4">
                         <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1QeC8jVlx4uyYKg1ld2CkpJIigflEddwk" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Moneda DK:</strong> Un gran reconocimiento al alcanzar tus primeros 50 títulos registrados.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1aC3VS4J6rMfq4hjuPUgMBmsJhgn-Seij" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Trofeo Champiñón:</strong> El gran premio reservado para los coleccionistas con 100 títulos.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1XbLtJcGKr3f6gaKlIFZhs20cO-lKFUFA" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Rupia de Oro:</strong> Una verdadera joya para quienes logran reunir 200 títulos.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1GwD1m5YlpwCzDI_XkFnz0RlcadKn33FC" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Diamante:</strong> El brillo de la excelencia para aquellos que llegan a los 300 títulos.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1uwWC1GFaTYQQgXmRuzjqxgnkdrvlR9BG" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Trifuerza:</strong> El poder del coleccionismo concentrado en 400 títulos.</span>
                          </li>
                          <li className="flex items-start gap-3">
                             <img src="https://lh3.googleusercontent.com/d/1nBKI8aKKniXdpuYEgQKLAER0fRko_nd3" className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" />
                             <span><strong>Trifuerza Maestra:</strong> El honor máximo destinado solo a los que alcanzan los 500 títulos.</span>
                          </li>
                       </ul>
                       <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center p-2">
                          <img 
                            src={null} 
                            alt="" className="hidden"
                            referrerPolicy="no-referrer" 
                          />
                       </div>
                     </div>
                     <div>
                       <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2"><Play size={16} className="text-red-500 fill-red-500"/> JUGAR AHORA (Emulación)</h4>
                       <ul className="text-xs opacity-80 space-y-2 mb-4">
                         <li>• <strong>Juegos de NES:</strong> Desbloqueado al tener al menos 20 títulos en total, repartidos en 2 o más consolas con mínimo 10 títulos cada una.</li>
                         <li>• <strong>Todas las consolas:</strong> Desbloqueado al alcanzar 50 títulos registrados en tu colección en total.</li>
                       </ul>
                     </div>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {/* Monedas Gastadas en Recompensas */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                         <h4 className="font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-xs">
                             <img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                             Balance de Economía
                          </h4>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                               <img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" className="w-6 h-6 mb-1 mx-auto" referrerPolicy="no-referrer" />
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 text-center">Monedas Libres</p>
                               <p className="text-lg font-bold text-gray-700 retro-data text-center">{rewards.availableCoins}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                               <img src="https://lh3.googleusercontent.com/d/1ox5MJXOKP6ItekKdWmfIAzOfpwGS9w5N" className="w-6 h-6 mb-1 mx-auto grayscale opacity-50" referrerPolicy="no-referrer" />
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 text-center">Gastadas</p>
                               <p className="text-lg font-bold text-red-500 retro-data text-center">-{settings.coinsSpent || 0}</p>
                            </div>
                         </div>
                         <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Desbloqueos Adquiridos:</p>
                            <div className="flex flex-wrap gap-2">
                               {settings.unlockedThemes && settings.unlockedThemes.filter(id => !['none', 't1', 't2', 't3'].includes(id)).length > 0 ? (
                                  settings.unlockedThemes.filter(id => !['none', 't1', 't2', 't3'].includes(id)).map(themeId => (
                                    <span key={themeId} className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                                       Fondo: {THEMES.find(t => t.id === themeId)?.name || themeId}
                                    </span>
                                  ))
                               ) : (
                                  <span className="text-xs text-gray-400 italic">No has comprado temas aún.</span>
                               )}
                            </div>
                         </div>
                      </div>

                      <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2 text-xs">🏅 Insignias de Consola</h4>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                          {CONSOLES.map(c => {
                            const hasGame = collection.some(g => g.consoleId === c.id);
                            return (
                              <div key={c.id} className="flex flex-col items-center gap-1.5 grayscale opacity-30 data-[unlocked=true]:grayscale-0 data-[unlocked=true]:opacity-100 transition-all duration-500" data-unlocked={hasGame}>
                                <div className="relative group">
                                  <img 
                                    src={c.badge} 
                                    className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" 
                                    alt={c.name} 
                                  />
                                  {!hasGame && <Lock size={10} className="absolute bottom-0 right-0 text-gray-400 bg-white rounded-full p-0.5" />}
                                </div>
                                <span className="text-[7px] font-black uppercase text-gray-400 tracking-tighter text-center leading-none px-1">
                                  {c.name.split(' ')[0]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <h4 className="font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2 text-xs">🛡️ Camino al 100%</h4>
                      <div className="grid grid-cols-1 gap-2 pb-4">
                         {COLLECTOR_LEVELS.map((lvl, idx) => {
                            const isAchieved = collection.length >= lvl.threshold;
                            const isCurrent = lvl.name === rewards.level.name;
                            return (
                              <div key={lvl.name} className={`px-4 py-3 rounded-2xl border flex items-center gap-4 ${isCurrent ? 'bg-orange-50 border-orange-200 shadow-sm' : isAchieved ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${isAchieved ? 'bg-white shadow-md border border-gray-100' : 'bg-gray-200 text-gray-400'}`}>
                                   {lvl.icon ? (
                                      <img 
                                        src={lvl.icon} 
                                        alt={lvl.name} 
                                        className={`w-11 h-11 object-contain ${isAchieved ? '' : 'brightness-0 opacity-10'}`} 
                                        referrerPolicy="no-referrer" 
                                      />
                                   ) : (
                                      isAchieved ? <Check size={28} /> : <Lock size={24} />
                                   )}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className={`text-[13px] font-black uppercase tracking-[0.1em] ${isCurrent ? 'text-orange-600' : 'text-gray-900'}`}>{lvl.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{lvl.threshold} Títulos</p>
                                 </div>
                                 {isCurrent && <div className="text-[7px] font-black bg-orange-500 text-white px-2 py-1 rounded uppercase tracking-widest shadow-sm">ACTUAL</div>}
                              </div>
                            )
                         })}
                      </div>
                   </div>
                )}
             </div>

             {!showHowItWorks && (
               <div className="p-4 bg-white border-t border-gray-100">
                  <button 
                    onClick={() => setShowHowItWorks(true)}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Info size={16} /> ¿Cómo funciona el sistema de recompensas?
                  </button>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fadeIn pb-24">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black pro-font flex items-center gap-4 text-gray-900"><Database className="text-blue-500" /> ALMACENAMIENTO</h2>
              {isSyncing && <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full"><RefreshCw size={12} className="animate-spin text-blue-500" /><span className="text-[8px] font-black text-blue-500 uppercase">Sincronizando...</span></div>}
            </div>
            
            <div className="space-y-4">
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <div className="bg-blue-500 text-white p-2.5 rounded-lg shadow-lg"><CheckCircle2 size={20} /></div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Local: Persistente</span>
                     <span className="text-[9px] text-blue-400 font-bold lowercase">Offline Ready</span>
                   </div>
                </div>
                <div className="bg-white/50 px-2 py-0.5 rounded text-[8px] font-black text-blue-600 uppercase">Interno</div>
              </div>

              {settings.googleDriveSync ? (
                <>
                  <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500 text-white p-2.5 rounded-lg shadow-lg"><Cloud size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-none mb-1">Google Drive: Activo</span>
                        <span className="text-[9px] text-emerald-400 font-bold lowercase">
                          {settings.lastSync ? `Sincronizado: ${new Date(settings.lastSync).toLocaleTimeString()}` : 'Pendiente de sincronizar'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button 
                        onClick={() => setSettings(prev => ({ ...prev, googleDriveSync: false, googleDriveTokens: undefined }))}
                        className="text-[8px] font-black text-red-400 uppercase tracking-widest text-right"
                      >
                        Desconectar
                      </button>
                      <button 
                        onClick={handleRestoreFromDrive}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        <Download size={12} /> Restaurar
                      </button>
                    </div>
                  </div>
                  {/* Selector de Frecuencia */}
                  <div className="mt-4 pt-4 border-t border-emerald-100/30 space-y-3">
                    <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                       <RefreshCw size={12} /> Respaldo Automático
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 bg-emerald-100/50 p-1 rounded-lg">
                      {(['none', 'daily', 'weekly', 'monthly'] as const).map(freq => (
                        <button
                          key={freq}
                          onClick={() => setSettings({ ...settings, autoSyncFrequency: freq })}
                          className={`py-1.5 rounded text-[7px] font-black uppercase tracking-tighter transition-all ${settings.autoSyncFrequency === freq ? 'bg-white text-emerald-600 shadow-sm' : 'text-emerald-400 hover:text-emerald-500'}`}
                        >
                          {freq === 'none' ? 'Manual' : freq === 'daily' ? 'Diario' : freq === 'weekly' ? 'Semanal' : 'Mensual'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-2 border-t border-gray-50">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">CONFIGURACIÓN PROPIA (OPCIONAL)</label>
                    <div className="space-y-2">
                       <input 
                         type="text" 
                         placeholder="Google Client ID"
                         value={settings.googleClientId || ''}
                         onChange={e => setSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                         className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 ring-blue-100"
                       />
                       <input 
                         type="password" 
                         placeholder="Google Client Secret"
                         value={settings.googleClientSecret || ''}
                         onChange={e => setSettings(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                         className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 ring-blue-100"
                       />
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                       <p className="text-[8px] font-bold text-yellow-700 leading-normal">
                         Si usas tus propias credenciales, añade esta URL de redirección en tu Google Cloud Console:
                         <code className="block mt-1 bg-white/50 p-1 rounded font-mono select-all">
                           {`${window.location.protocol}//${window.location.host}/api/auth/google/callback`}
                         </code>
                       </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleConnectGoogleDrive}
                    className="w-full p-4 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-98 shadow-xl"
                  >
                    <Cloud size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Conectar Google Drive</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 relative">
            <h2 className="text-xl font-black pro-font mb-6 flex items-center gap-4 text-gray-900"><Zap className="text-yellow-500" /> ESCALA DE INTERFAZ</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['min', 'med', 'max'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSettings({ ...settings, uiScale: scale })}
                  className={`flex-1 py-3 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all ${settings.uiScale === scale ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}
                >
                  {scale === 'min' ? 'Compacto' : scale === 'med' ? 'Estándar' : 'Accesible'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 relative">
            <h2 className="text-xl font-black pro-font mb-6 flex items-center gap-4 text-gray-900"><Sparkles className="text-purple-500" /> PERSONALIZACIÓN</h2>
            
            <div className="space-y-6">
              {/* Selector de Fuentes */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Estilo de Letra</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSettings({ ...settings, fontId: f.id })}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${f.class} ${settings.fontId === f.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Temas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Fondo de Interfaz</label>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded text-yellow-700">
                     <span className="text-[8px] font-black uppercase tracking-widest">Monedas</span>
                     <span className="text-[10px] font-bold retro-data">{rewards.availableCoins}</span>🪙
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEMES.map(t => {
                    const isUnlocked = settings.unlockedThemes?.includes(t.id) || ['none', 't1', 't2', 't3'].includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (isUnlocked) {
                             setSettings({ ...settings, themeId: t.id });
                          } else {
                             if (rewards.availableCoins >= 5) {
                               if(confirm(`¿Deseas desbloquear "${t.name}" por 5 monedas?`)) {
                                  setSettings({ 
                                    ...settings, 
                                    themeId: t.id,
                                    coinsSpent: (settings.coinsSpent || 0) + 5,
                                    unlockedThemes: [...(settings.unlockedThemes || ['none', 't1', 't2', 't3']), t.id]
                                  });
                                  setNotification({ message: `¡Tema ${t.name} Desbloqueado!`, type: 'success' });
                               }
                             } else {
                               alert(`Necesitas 5 monedas para desbloquear este tema. Tienes ${rewards.availableCoins}. Registra más juegos para ganar monedas.`);
                             }
                          }
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${settings.themeId === t.id ? 'border-red-600 scale-102 shadow-lg' : 'border-gray-100'} ${isUnlocked ? 'grayscale hover:grayscale-0' : 'opacity-80'}`}
                      >
                        {t.url ? (
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${t.url})` }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <Slash className="text-gray-200" size={24} />
                          </div>
                        )}
                        {!isUnlocked && (
                           <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                              <Lock size={20} className="mb-1 text-white/80" />
                              <span className="text-[10px] font-black tracking-widest font-mono flex items-center gap-1">5 🪙</span>
                           </div>
                        )}
                        <div className={`absolute bottom-0 left-0 right-0 p-2 text-center transition-opacity ${settings.themeId === t.id ? 'bg-red-600 text-white' : 'bg-black/80 text-white opacity-0 group-hover:opacity-100'} ${!isUnlocked && 'hidden'}`}>
                          <span className="text-[7px] font-black uppercase tracking-widest leading-none">{t.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[45px] p-10 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-black pro-font mb-8 flex items-center gap-4 text-gray-900"><Database className="text-emerald-500" /> RESPALDO LOCAL</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExportLibrary}
                className="flex flex-col items-center justify-center gap-3 p-8 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <Download size={24} />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Exportar JSON</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Descargar copia local</p>
                </div>
              </button>
              
              <button 
                onClick={() => importInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-8 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FileCheck size={24} />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Importar JSON</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Restaurar desde archivo</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-orange-50 rounded-[45px] p-8 border border-orange-100 space-y-6">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center font-black text-2xl text-orange-600 pro-font border border-orange-100"><Shield size={24}/></div>
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] leading-none mb-1">AUTOMÁTICO</p>
                   <h4 className="pro-font text-3xl text-orange-600 tracking-wider leading-none uppercase">Respaldo Local</h4>
                </div>
             </div>
             <p className="text-xs font-bold text-orange-800 opacity-80 leading-relaxed">El sistema almacena automáticamente una copia de tus datos todos los días como respaldo de emergencia en este mismo navegador.</p>
             <button onClick={() => {
                const backup = localStorage.getItem('ninty_emergency_backup_data');
                if (backup) {
                  try {
                    const data = JSON.parse(backup);
                    if (confirm(`¿Deseas restaurar el último respaldo de emergencia del ${data.date || 'día anterior'}? Esto reemplazará tu colección actual.`)) {
                      if (data.collection) setCollection(data.collection);
                      if (data.wishlist) setWishlist(data.wishlist);
                      if (data.settings) setSettings(data.settings);
                      setNotification({ message: "Respaldo restaurado exitosamente", type: 'success' });
                    }
                  } catch(e) {
                     setNotification({ message: "El respaldo está corrupto o es inválido.", type: 'error' });
                  }
                } else {
                  setNotification({ message: "No hay respaldos de emergencia disponibles", type: 'error' });
                }
              }} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-orange-600 active:scale-95 transition-all">RESTAURAR ÚLTIMO RESPALDO</button>
          </div>

          <div className="bg-red-50 rounded-[45px] p-10 border border-red-100 space-y-6">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center font-black text-2xl text-red-600 pro-font border border-red-100">C</div>
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em] leading-none mb-1">PERFIL LOCAL</p>
                   <h4 className="pro-font text-3xl text-red-600 tracking-wider leading-none uppercase">Coleccionista</h4>
                </div>
             </div>
             <button onClick={() => {
                if(confirm("¿Deseas borrar toda tu colección local? Esta acción no se puede deshacer.")) {
                   setCollection([]);
                   localStorage.removeItem(STORAGE_KEY);
                   window.location.reload();
                }
              }} className="w-full py-6 bg-red-600 text-white rounded-[32px] font-black uppercase pro-font text-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">BORRAR COLECCIÓN LOCAL</button>
          </div>
        </div>
      )}

      {/* DETALLE DE JUEGO */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[95dvh] overflow-y-auto no-scrollbar relative flex flex-col border border-white/10 shadow-2xl">
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-[350] bg-black/10 hover:bg-black/20 backdrop-blur-xl p-2 rounded-full text-gray-500 transition-all active:scale-90"><X size={20}/></button>
            
            <div className="w-full aspect-[4/3] relative overflow-hidden flex-shrink-0 bg-gray-950">
              <img src={selectedGame.coverUrl} className="w-full h-full object-cover scale-150 blur-3xl opacity-30 absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                 <img 
                   src={selectedGame.coverUrl} 
                   className="h-full w-auto object-contain rounded-lg shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-500" 
                 />
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-white relative">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CONSOLES.find(c => c.id === selectedGame.consoleId)?.color }}></div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{CONSOLES.find(c => c.id === selectedGame.consoleId)?.name}</p>
                </div>
                <h3 className="text-xl font-black pro-font uppercase leading-tight tracking-tight text-gray-950">{selectedGame.name}</h3>
                <div className="flex items-center gap-3 absolute top-6 right-6">
                   <button 
                     onClick={() => toggleFavorite(selectedGame.id)}
                     className={`transition-all active:scale-95 ${selectedGame.isFavorite ? 'text-yellow-400' : 'text-gray-200 hover:text-gray-400'}`}
                   >
                     <Star size={24} fill={selectedGame.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                   </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.developer}</span>
                    <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest retro-data">{selectedGame.year}</span>
                    <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.genre}</span>
                </div>
              </div>

              {(selectedGame.cartridgeFrontPhoto || selectedGame.cartridgeBackPhoto) && (
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} /> Inspección Física
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedGame.cartridgeFrontPhoto && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-gray-300 uppercase">Frente</p>
                        <img 
                           src={selectedGame.cartridgeFrontPhoto} 
                           className="w-full h-20 object-cover rounded-lg border border-gray-50 shadow-sm cursor-pointer active:scale-95 transition-transform" 
                           onClick={() => setFullScreenImage(selectedGame.cartridgeFrontPhoto)}
                        />
                      </div>
                    )}
                    {selectedGame.cartridgeBackPhoto && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-gray-300 uppercase">Reverso</p>
                        <img 
                           src={selectedGame.cartridgeBackPhoto} 
                           className="w-full h-20 object-cover rounded-lg border border-gray-50 shadow-sm cursor-pointer active:scale-95 transition-transform" 
                           onClick={() => setFullScreenImage(selectedGame.cartridgeBackPhoto)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50 text-center">
                   <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">VALOR ESTIMADO</p>
                   <p className="text-xl font-black retro-data text-emerald-600 leading-none tracking-tight">${selectedGame.marketPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">PAGADO</p>
                   <p className="text-xl font-black retro-data text-gray-500 leading-none tracking-tight">${selectedGame.costPaid.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => handlePlayNow(selectedGame.name, selectedGame.consoleId)}
                    className={`w-full py-4 rounded-xl font-black pro-font text-xl uppercase shadow-lg flex items-center justify-center gap-3 transition-all group/play ${
                      rewards.unlockAll || (selectedGame.consoleId === 'nes' && rewards.unlockNes)
                      ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                      : 'bg-gray-200 text-gray-400'
                    }`}
                 >
                   {(rewards.unlockAll || (selectedGame.consoleId === 'nes' && rewards.unlockNes)) ? (
                      <Play size={20} fill="currentColor" className="group-hover/play:scale-110 transition-transform" /> 
                   ) : (
                      <Lock size={20} />
                   )} 
                   JUGAR AHORA
                 </button>
                 <button 
                   onClick={() => {
                     setNewGameForm({
                       consoleId: selectedGame.consoleId,
                       name: selectedGame.name,
                       developer: selectedGame.developer,
                       year: selectedGame.year,
                       genre: selectedGame.genre,
                       coverUrl: selectedGame.coverUrl,
                       costPaid: selectedGame.costPaid,
                       marketPrice: selectedGame.marketPrice,
                       acquisitionDate: selectedGame.acquisitionDate,
                       notes: selectedGame.notes,
                       cartridgeFrontPhoto: selectedGame.cartridgeFrontPhoto,
                       cartridgeBackPhoto: selectedGame.cartridgeBackPhoto
                     });
                     setEditingGameId(selectedGame.id);
                     setIsManualEntry(true);
                     setSelectedGame(null);
                     setIsRegisterOpen(true);
                   }} 
                   className="w-full py-3 rounded-xl border border-gray-200 font-black text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2"
                 >
                   <Edit2 size={16} /> EDITAR TÍTULO
                 </button>
                 <button onClick={() => setSelectedGame(null)} className="w-full py-2 text-gray-300 font-black text-[10px] uppercase tracking-widest hover:text-gray-950 transition-colors">Cerrar Detalle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO IA */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-slideUp max-h-[95vh] overflow-y-auto no-scrollbar relative border border-gray-100">
            <button onClick={() => {setIsRegisterOpen(false); setEditingGameId(null); setIsManualEntry(false); setSearchError(false);}} className="absolute top-6 right-6 text-gray-300 hover:text-gray-950 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black pro-font mb-6 tracking-tight text-gray-950 uppercase">{editingGameId ? 'EDITAR TÍTULO' : 'ADQUIRIR TÍTULO'}</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">SELECCIONA CONSOLA</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CONSOLES.map(c => (
                    <button key={c.id} onClick={() => setNewGameForm({...newGameForm, consoleId: c.id})} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${newGameForm.consoleId === c.id ? 'bg-gray-950 border-gray-950 scale-102 shadow-lg' : 'border-gray-50 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                      <img src={c.logo} className={`h-8 w-auto object-contain ${newGameForm.consoleId === c.id ? 'brightness-200' : ''}`} />
                      <span className={`text-[8px] font-black uppercase tracking-widest ${newGameForm.consoleId === c.id ? 'text-white' : 'text-gray-400'}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{isManualEntry || editingGameId ? 'EDITAR DATOS' : 'BÚSQUEDA IA NINTENDO'}</label>
                  {!(isManualEntry || editingGameId) && (
                    <button onClick={() => {setIsManualEntry(true); setSearchError(false);}} className="text-[8px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                      Omitir Búsqueda
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Ej: Super Mario World..." className="flex-1 p-3.5 bg-gray-50 rounded-xl border-none font-bold outline-none text-sm placeholder:text-gray-300 focus:ring-2 ring-red-100 transition-all" />
                  <button onClick={() => handleFetchMetadata()} disabled={isSearching || !newGameForm.consoleId} className="bg-gray-950 text-white p-3.5 rounded-xl shadow-lg active:scale-95 transition-all">
                    {isSearching ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
                  </button>
                </div>
                {searchError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-800 leading-relaxed">
                      El asistente falló o no hay internet. Puedes <button onClick={() => {setIsManualEntry(true); setSearchError(false);}} className="text-red-600 underline">Ingresar datos manualmente</button> en la ficha de abajo, agregar solo el nombre y editarlo después, o intentar de nuevo.
                    </p>
                  </div>
                )}
              </div>

              {searchResults.length > 0 && !isSearching && (
                <div className="space-y-3 animate-fadeIn">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">RESULTADOS IA</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {searchResults.slice(0, 3).map((res, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelectSearchResult(res)}
                        className={`flex-shrink-0 w-32 rounded-xl border-2 transition-all text-left overflow-hidden flex flex-col ${newGameForm.name === res.name ? 'bg-gray-950 border-gray-950 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        <div className="aspect-[3/4] w-full bg-gray-200 relative">
                          {res.coverOptions?.[0] ? (
                            <img src={res.coverOptions[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="opacity-20" /></div>
                          )}
                          <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm px-1 py-0.5 rounded text-[7px] font-black text-white retro-data">
                            #{idx + 1}
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-[9px] font-black uppercase truncate leading-tight mb-0.5">{res.name}</p>
                          <p className="text-[7px] font-bold opacity-60 uppercase truncate">{res.year} • {res.developer}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(newGameForm.name || isManualEntry) && !isSearching && (
                <div className="animate-fadeIn space-y-8">
                  {/* FICHA TÉCNICA Y OPCIONES DE FOTO */}
                  <div className="bg-gray-900 text-white rounded-3xl p-6 space-y-6 shadow-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                     
                     <div className="flex gap-5 items-start">
                        <div className="w-20 flex-shrink-0 space-y-2">
                           <div className="relative aspect-[3/4] rounded-lg shadow-2xl border border-white/20 overflow-hidden bg-white/5">
                             {newGameForm.coverUrl ? (
                               <img src={newGameForm.coverUrl} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                 <ImageIcon size={20} className="text-white/20" />
                               </div>
                             )}
                           </div>
                           {(isManualEntry || searchError) && (
                              <input 
                                type="text" 
                                value={newGameForm.coverUrl} 
                                onChange={e => setNewGameForm({...newGameForm, coverUrl: e.target.value})} 
                                className="w-full bg-white/10 border border-white/20 rounded p-1 text-[6px] text-white outline-none" 
                                placeholder="URL Portada" 
                              />
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-0.5">DATA INSPECCIONADA</p>
                           {(isManualEntry || searchError) ? (
                             <div className="space-y-1 mb-2">
                               <input type="text" value={newGameForm.name} onChange={e => setNewGameForm({...newGameForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-1.5 rounded text-[10px] uppercase font-black tracking-widest text-white outline-none focus:bg-white/10" placeholder="Título Original" />
                               <input type="text" value={newGameForm.developer || ''} onChange={e => setNewGameForm({...newGameForm, developer: e.target.value})} className="w-full bg-white/5 border border-white/10 p-1.5 rounded text-[8px] uppercase font-bold tracking-widest text-gray-400 outline-none focus:bg-white/10" placeholder="Nombre Desarrollador" />
                               
                               <button 
                                 onClick={() => handleFetchMetadata(true)} 
                                 disabled={isSearching || !newGameForm.name} 
                                 className="w-full bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg mt-1 transition-all active:scale-95 disabled:opacity-50"
                               >
                                 {isSearching ? 'Buscando...' : 'Buscar Datos'}
                               </button>
                             </div>
                           ) : (
                             <>
                               <h4 className="text-xl font-black uppercase pro-font leading-none tracking-tight mb-1">{newGameForm.name}</h4>
                               {newGameForm.developer && <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1 leading-tight">{newGameForm.developer}</p>}
                             </>
                           )}
                           <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                                 <p className="text-[6px] font-black text-gray-500 uppercase">Genero</p>
                                 {(isManualEntry || searchError) ? (
                                   <input type="text" value={newGameForm.genre || ''} onChange={e => setNewGameForm({...newGameForm, genre: e.target.value})} className="w-full bg-transparent text-[9px] font-bold uppercase truncate text-white outline-none focus:text-red-400" placeholder="Ej: RPG" />
                                 ) : (
                                   <p className="text-[9px] font-bold uppercase truncate">{newGameForm.genre}</p>
                                 )}
                              </div>
                              <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                                 <p className="text-[6px] font-black text-gray-500 uppercase">Lanzamiento</p>
                                 {(isManualEntry || searchError) ? (
                                    <input type="text" value={newGameForm.year || ''} onChange={e => setNewGameForm({...newGameForm, year: e.target.value})} className="w-full bg-transparent text-[9px] font-black retro-data uppercase text-white outline-none focus:text-red-400" placeholder="YYYY" />
                                 ) : (
                                   <p className="text-[9px] font-black retro-data uppercase">{newGameForm.year}</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* OPCIONES DE PORTADA */}
                     {coverOptions.length > 1 && (
                       <div className="space-y-3">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} /> OTRAS PORTADAS DISPONIBLES
                          </p>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {coverOptions.map((url, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => setNewGameForm({...newGameForm, coverUrl: url})}
                                className={`flex-shrink-0 w-16 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${newGameForm.coverUrl === url ? 'border-red-500 scale-105 shadow-lg' : 'border-white/10 opacity-40'}`}
                              >
                                <img src={url} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                       </div>
                     )}

                     {/* CARGA DE FOTOS CARTUCHO */}
                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={14} /> FOTOS DEL CARTUCHO REAL
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                           <div 
                              onClick={() => { setActivePhotoSlot('front'); setShowPhotoModal(true); }}
                              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative ${newGameForm.cartridgeFrontPhoto ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                           >
                              {newGameForm.cartridgeFrontPhoto ? (
                                <img src={newGameForm.cartridgeFrontPhoto} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Camera size={20} className="text-white/20" />
                                  <span className="text-[8px] font-black text-white/30 uppercase">Frente</span>
                                </>
                              )}
                           </div>
                           <div 
                              onClick={() => { setActivePhotoSlot('back'); setShowPhotoModal(true); }}
                              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative ${newGameForm.cartridgeBackPhoto ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                           >
                              {newGameForm.cartridgeBackPhoto ? (
                                <img src={newGameForm.cartridgeBackPhoto} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Camera size={20} className="text-white/20" />
                                  <span className="text-[8px] font-black text-white/30 uppercase">Reverso</span>
                                </>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* PRECIOS */}
                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="space-y-1">
                           <div className="flex items-center gap-1.5 text-blue-400">
                              <TrendingUp size={12} />
                              <p className="text-[8px] font-black uppercase">Market Value</p>
                           </div>
                           <p className="text-2xl font-black pro-font text-blue-400">${newGameForm.marketPrice}</p>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-1.5 text-green-400">
                              <Calculator size={12} />
                              <p className="text-[8px] font-black uppercase">¿Costo pagado?</p>
                           </div>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black pro-font text-lg text-green-500">$</span>
                              <input 
                                type="number" 
                                value={newGameForm.costPaid}
                                onChange={e => setNewGameForm({...newGameForm, costPaid: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-7 pr-3 font-black pro-font text-xl text-green-400 outline-none focus:bg-white/10 transition-colors"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button onClick={handleSaveGame} className="w-full py-7 bg-red-600 text-white rounded-[35px] font-black uppercase pro-font text-2xl shadow-2xl hover:bg-red-700 active:scale-95 transition-all">
                      {editingGameId ? 'GUARDAR CAMBIOS' : 'INGRESAR AL ESTANTE'}
                    </button>
                    {!editingGameId && (
                      <button 
                      onClick={() => {
                        addToWishlist({
                          id: Math.random().toString(36).substr(2, 9),
                          name: newGameForm.name!,
                          coverUrl: newGameForm.coverUrl,
                          consoleId: newGameForm.consoleId!,
                          dateAdded: Date.now()
                        });
                        setIsRegisterOpen(false);
                      }}
                      className="w-full py-4 bg-purple-600 text-white rounded-3xl font-black uppercase pro-font text-lg shadow-xl hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} /> AÑADIR A WISHLIST
                    </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[400] flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white p-10 rounded-[45px] w-full max-w-sm text-center space-y-8">
               <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trash2 size={40} /></div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black pro-font uppercase tracking-tight">¿BORRAR TÍTULO?</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed px-4">Esta acción es irreversible y eliminará los datos de la base local.</p>
               </div>
               <div className="flex flex-col gap-3">
                  <button onClick={() => { 
                    if (confirmDelete) {
                      setCollection(prev => prev.filter(g => g.id !== confirmDelete));
                      setConfirmDelete(null); 
                      setNotification({ message: "Título eliminado", type: 'success' });
                    }
                  }} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase pro-font text-xl shadow-xl">BORRAR PARA SIEMPRE</button>
                  <button onClick={() => setConfirmDelete(null)} className="w-full py-5 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase pro-font text-lg">CANCELAR</button>
               </div>
            </div>
         </div>
      )}

      {/* CONFIRM BULK DELETE MODAL */}
      {confirmBulkDelete && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[400] flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white p-10 rounded-[45px] w-full max-w-sm text-center space-y-8">
               <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trash2 size={40} /></div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black pro-font uppercase tracking-tight">¿BORRAR {selectedGameIds.length} TÍTULOS?</h3>
                  <div className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4 space-y-2">
                    <p>Se eliminarán permanentemente de las siguientes plataformas:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {Array.from(new Set(collection.filter(g => selectedGameIds.includes(g.id)).map(g => g.consoleId))).map(cid => (
                        <span key={cid} className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600">{CONSOLES.find(c => c.id === cid)?.name}</span>
                      ))}
                    </div>
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  <button onClick={handleBulkDelete} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase pro-font text-xl shadow-xl">ELIMINAR SELECCIÓN</button>
                  <button onClick={() => setConfirmBulkDelete(false)} className="w-full py-5 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase pro-font text-lg">CANCELAR</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL FUENTE DE FOTO */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[600] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white p-10 rounded-[45px] w-full max-w-sm text-center space-y-8 shadow-2xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 text-gray-900 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Camera size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black pro-font uppercase tracking-tight text-gray-950">Origen de Imagen</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                Selecciona cómo deseas agregar la foto del cartucho.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => { cameraInputRef.current?.click(); setShowPhotoModal(false); }}
                className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black uppercase pro-font text-xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
              >
                <Camera size={24} /> Usar Cámara
              </button>
              <button 
                onClick={() => { photoInputRef.current?.click(); setShowPhotoModal(false); }}
                className="w-full py-6 bg-gray-100 text-gray-900 rounded-[32px] font-black uppercase pro-font text-xl flex items-center justify-center gap-4 active:scale-95 transition-all"
              >
                <ImageIcon size={24} /> Almacenamiento
              </button>
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS */}
      {activeTab === 'shelf' && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-4 z-[200]">
          {isEditMode && selectedGameIds.length > 0 && (
            <button 
              onClick={() => setConfirmBulkDelete(true)}
              className="w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce active:scale-90 transition-all"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button 
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (isEditMode) setSelectedGameIds([]);
            }}
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all ${isEditMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-950 border border-gray-100'}`}
          >
            {isEditMode ? <X size={28} /> : <Edit2 size={28} />}
          </button>
        </div>
      )}
      {/* NEW UNLOCKS MODAL */}
      <AnimatePresence>
        {recentUnlocks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-[32px] w-full max-w-sm p-1.5 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none"></div>
               
               <div className="bg-white/95 backdrop-blur-lg rounded-[28px] p-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner ring-4 ring-yellow-50">
                    <Trophy size={32} />
                  </div>
                  
                  <h2 className="pro-font text-2xl font-black text-gray-900 uppercase tracking-widest mb-1">¡Logro Desbloqueado!</h2>
                  <p className="text-xs font-bold text-gray-500 mb-6 px-2">{unlockMessage}</p>

                  <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar">
                    {recentUnlocks.map((u, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-4"
                      >
                         <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden p-1">
                                    {u.icon.startsWith('http') ? (
                                      <img src={u.icon} alt={u.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                    ) : (
                                      u.icon
                                    )}
                                 </div>
                         <div className="text-left flex-1">
                           <h4 className="font-black text-gray-900 uppercase tracking-widest text-[11px]">{u.name}</h4>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{u.description}</p>
                         </div>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setRecentUnlocks([])}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg hover:bg-black"
                  >
                    CONTINUAR
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN IMAGE MODAL */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setFullScreenImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[5010]"
              onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}
            >
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullScreenImage} 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
    </div>
    </div>
  );
};

export default App;
