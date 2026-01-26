
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Game, ViewMode, GroupBy, AppSettings, UrgentItem, ConsoleId, CONSOLES } from './types';
import { fetchGameMetadata } from './services/geminiService';
import { 
  Plus, 
  Search, 
  Camera, 
  Trash2, 
  AlertTriangle, 
  X, 
  Save, 
  Check, 
  ChevronRight,
  Star,
  Library,
  Upload,
  Gamepad2,
  Calendar,
  Building2,
  Tags,
  Image as ImageIcon,
  Settings as SettingsIcon,
  DollarSign,
  TrendingUp,
  Wallet,
  PiggyBank,
  History,
  Filter,
  Eye,
  EyeOff,
  PlayCircle
} from 'lucide-react';

const STORAGE_KEY = 'nintendo_collector_pro_v3';
const URGENT_KEY = 'nintendo_urgent_list_v3';
const SETTINGS_KEY = 'nintendo_settings_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all');
  const [collection, setCollection] = useState<Game[]>([]);
  const [urgentList, setUrgentList] = useState<UrgentItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none',
    showFinancials: true
  });

  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  
  const [newGameForm, setNewGameForm] = useState<Partial<Game>>({
    costPaid: 0,
    marketPrice: 0,
    acquisitionDate: Date.now()
  });
  
  const [coverOptions, setCoverOptions] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [newUrgentTitle, setNewUrgentTitle] = useState('');

  const frontPhotoRef = useRef<HTMLInputElement>(null);
  const backPhotoRef = useRef<HTMLInputElement>(null);
  const customCoverRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCollection(JSON.parse(saved));

    const savedUrgent = localStorage.getItem(URGENT_KEY);
    if (savedUrgent) setUrgentList(JSON.parse(savedUrgent));

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...settings, ...parsedSettings });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem(URGENT_KEY, JSON.stringify(urgentList));
  }, [urgentList]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Derived Filtering logic for the collection view
  const filteredCollection = useMemo(() => {
    let list = activeConsole === 'all' 
      ? collection 
      : collection.filter(g => g.consoleId === activeConsole);

    if (filterYear !== 'all') {
      list = list.filter(g => new Date(g.acquisitionDate).getFullYear().toString() === filterYear);
    }
    if (filterMonth !== 'all') {
      list = list.filter(g => (new Date(g.acquisitionDate).getMonth() + 1).toString() === filterMonth);
    }

    return list;
  }, [collection, activeConsole, filterYear, filterMonth]);

  // Unique years for the year filter dropdown
  const availableYears = useMemo(() => {
    const years = collection.map(g => new Date(g.acquisitionDate).getFullYear().toString());
    return Array.from(new Set(years)).sort((a: string, b: string) => b.localeCompare(a));
  }, [collection]);

  // Financial Stats Calculation Helper
  const getStatsFor = (list: Game[]) => {
    const totalPaid = list.reduce((acc, g) => acc + (g.costPaid || 0), 0);
    const totalMarket = list.reduce((acc, g) => acc + (g.marketPrice || 0), 0);
    const totalSaved = totalMarket - totalPaid;
    return { totalPaid, totalMarket, totalSaved };
  };

  const globalStats = getStatsFor(collection);
  const currentViewStats = getStatsFor(filteredCollection);

  const handleFetchMetadata = async () => {
    if (!searchName.trim()) return;
    setIsSearching(true);
    setCoverOptions([]);
    const consoleLabel = activeConsole === 'all' ? 'Nintendo' : CONSOLES.find(c => c.id === activeConsole)?.name || 'Nintendo';
    const data = await fetchGameMetadata(searchName, consoleLabel);
    if (data) {
      setNewGameForm({
        ...newGameForm,
        name: data.name || searchName,
        developer: data.developer,
        year: data.year,
        genre: data.genre,
        marketPrice: data.estimatedPrice || 0,
        coverUrl: data.coverOptions?.[0] || ''
      });
      setCoverOptions(data.coverOptions || []);
    }
    setIsSearching(false);
  };

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back' | 'customCover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (side === 'front') {
          setNewGameForm({ ...newGameForm, cartridgeFrontPhoto: result });
        } else if (side === 'back') {
          setNewGameForm({ ...newGameForm, cartridgeBackPhoto: result });
        } else if (side === 'customCover') {
          setNewGameForm({ ...newGameForm, coverUrl: result });
          setCoverOptions(prev => [result, ...prev.slice(0, 3)]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGame = () => {
    if (!newGameForm.name || (activeConsole === 'all' && !newGameForm.consoleId)) return;
    
    const game: Game = {
      id: crypto.randomUUID(),
      consoleId: (activeConsole === 'all' ? newGameForm.consoleId : activeConsole) as ConsoleId,
      name: newGameForm.name,
      developer: newGameForm.developer || 'Unknown',
      year: newGameForm.year || 'Unknown',
      genre: newGameForm.genre || 'Unknown',
      coverUrl: newGameForm.coverUrl || '',
      cartridgeFrontPhoto: newGameForm.cartridgeFrontPhoto,
      cartridgeBackPhoto: newGameForm.cartridgeBackPhoto,
      costPaid: Number(newGameForm.costPaid) || 0,
      marketPrice: Number(newGameForm.marketPrice) || 0,
      acquisitionDate: newGameForm.acquisitionDate || Date.now(),
      dateAdded: Date.now(),
    };

    setCollection([game, ...collection]);
    setNewGameForm({ costPaid: 0, marketPrice: 0, acquisitionDate: Date.now() });
    setSearchName('');
    setCoverOptions([]);
    setActiveTab('collection');
  };

  const deleteGame = (id: string) => {
    setCollection(collection.filter(g => g.id !== id));
    setConfirmDelete(null);
    setSelectedGame(null);
  };

  const addUrgentItem = () => {
    const targetConsole = activeConsole === 'all' ? 'nes' : activeConsole;
    if (newUrgentTitle.trim()) {
      setUrgentList([...urgentList, { id: crypto.randomUUID(), consoleId: targetConsole as ConsoleId, title: newUrgentTitle.trim() }]);
      setNewUrgentTitle('');
    }
  };

  const getPlayNowUrl = (game: Game) => {
    const slug = game.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Mapping console IDs to retrogames path components
    const consolePath = game.consoleId === 'switch' || game.consoleId === 'switch2' ? 'switch' : game.consoleId;
    return `https://gam.onl/${consolePath}/${slug}.html#${slug}`;
  };

  const renderFinancialDashboard = (stats: { totalPaid: number, totalMarket: number, totalSaved: number }, title: string = "Balance") => (
    <section className="bg-gray-900 rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden mt-8 mb-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 blur-[40px] rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Wallet size={12} className="text-blue-400" /> {title}
          </h2>
          <DollarSign size={14} className="text-gray-700" />
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Inversión</p>
            <p className="text-2xl font-black pro-font tracking-tighter">${stats.totalPaid.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">Valor Mercado</p>
            <p className="text-2xl font-black pro-font tracking-tighter text-blue-400">${stats.totalMarket.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl text-green-400">
              <PiggyBank size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-gray-400 leading-none">Ahorro</p>
              <p className="text-sm font-black text-green-400 pro-font tracking-tight mt-1">
                {stats.totalSaved >= 0 ? '+' : '-'}${Math.abs(stats.totalSaved).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-gray-500 uppercase">Rentabilidad</span>
            <span className="text-[10px] font-black text-white">{stats.totalPaid > 0 ? ((stats.totalSaved / stats.totalPaid) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      </div>
    </section>
  );

  const renderHomeSummary = () => {
    const consolesToShow = activeConsole === 'all' ? CONSOLES : CONSOLES.filter(c => c.id === activeConsole);
    const recentAll = [...collection].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 8);

    return (
      <div className="space-y-8 animate-fadeIn">
        {activeConsole === 'all' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Últimos Agregados (Todos)</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {recentAll.map(game => (
                <div key={game.id} className="w-32 flex-shrink-0 group cursor-pointer" onClick={() => setSelectedGame(game)}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100">
                    <img src={game.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <p className="text-[10px] font-bold mt-2 truncate leading-tight uppercase">{game.name}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">{CONSOLES.find(c => c.id === game.consoleId)?.name}</p>
                </div>
              ))}
              {recentAll.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center w-full">Aún no has añadido juegos.</p>}
            </div>
          </section>
        )}

        {consolesToShow.map(c => {
          const consoleGames = collection.filter(g => g.consoleId === c.id).sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 5);
          if (activeConsole === 'all' && consoleGames.length === 0) return null;
          
          return (
            <section key={c.id} className="animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <img src={c.logo} alt={c.name} className="h-4 w-auto object-contain" /> {c.name}
                  </h2>
                </div>
                <button 
                  onClick={() => { setActiveConsole(c.id); setActiveTab('collection'); }} 
                  className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900"
                >
                  Ver Biblioteca
                </button>
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {consoleGames.map(game => (
                    <div key={game.id} className="w-24 flex-shrink-0 cursor-pointer" onClick={() => setSelectedGame(game)}>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={game.coverUrl} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[9px] font-bold mt-1.5 truncate text-gray-700 leading-none">{game.name}</p>
                    </div>
                  ))}
                  {consoleGames.length === 0 && (
                    <div className="w-full py-8 text-center">
                      <p className="text-xs text-gray-400">Sin juegos registrados en {c.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Lista de Deseos</h2>
            <button onClick={() => setShowUrgentModal(true)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Gestionar</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y overflow-hidden">
            {urgentList.filter(u => activeConsole === 'all' || u.consoleId === activeConsole).length > 0 ? (
              urgentList.filter(u => activeConsole === 'all' || u.consoleId === activeConsole).map((item, idx) => (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  <div 
                    className="w-1 h-4 rounded-full" 
                    style={{ backgroundColor: CONSOLES.find(c => c.id === item.consoleId)?.color }}
                  ></div>
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{item.title}</p>
                  {activeConsole === 'all' && (
                    <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {CONSOLES.find(c => c.id === item.consoleId)?.name}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Star className="mx-auto text-yellow-200 mb-2" size={32} />
                <p className="text-xs text-gray-400 font-bold uppercase">No hay títulos en la lista</p>
              </div>
            )}
          </div>
        </section>

        {settings.showFinancials && renderFinancialDashboard(globalStats, "Inversión Global")}
      </div>
    );
  };

  const renderCollection = () => {
    const currentC = CONSOLES.find(c => c.id === activeConsole);
    
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              {activeConsole === 'all' ? '🌎 Global' : <>{currentC?.logo && <img src={currentC?.logo} alt={currentC?.name} className="h-4 w-auto object-contain" />} {currentC?.name}</>}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredCollection.length} Juegos</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSettings({ ...settings, viewMode: 'icon' })} className={`p-2 rounded-lg ${settings.viewMode === 'icon' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}><Library size={20}/></button>
            <button onClick={() => setSettings({ ...settings, viewMode: 'list' })} className={`p-2 rounded-lg ${settings.viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}><Search size={20}/></button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
           <Filter size={16} className="text-gray-400" />
           <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
              <select 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)}
                className="bg-gray-50 text-[10px] font-black uppercase px-2 py-1.5 rounded-lg border-none outline-none appearance-none"
              >
                <option value="all">Mes Adquisición</option>
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, i) => (
                  <option key={m} value={(i + 1).toString()}>{m}</option>
                ))}
              </select>
              <select 
                value={filterYear} 
                onChange={e => setFilterYear(e.target.value)}
                className="bg-gray-50 text-[10px] font-black uppercase px-2 py-1.5 rounded-lg border-none outline-none appearance-none"
              >
                <option value="all">Año Adquisición</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
           {(filterMonth !== 'all' || filterYear !== 'all') && (
             <button onClick={() => { setFilterMonth('all'); setFilterYear('all'); }} className="text-[10px] font-black text-red-500 uppercase px-2">X</button>
           )}
        </div>

        <div className={settings.viewMode === 'list' ? "space-y-3" : `grid gap-3 grid-cols-${settings.columns}`}>
          {filteredCollection.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              viewMode={settings.viewMode} 
              onDelete={id => setConfirmDelete(id)}
              onEdit={g => setEditGame(g)}
              onSelect={g => setSelectedGame(g)}
              consoleColor={CONSOLES.find(c => c.id === game.consoleId)?.color}
            />
          ))}
        </div>

        {filteredCollection.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <Library size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Nada que mostrar aquí</p>
            <button onClick={() => setActiveTab('register')} className="mt-4 text-xs font-black text-blue-600 uppercase underline">Añadir Primer Juego</button>
          </div>
        )}

        {settings.showFinancials && filteredCollection.length > 0 && renderFinancialDashboard(currentViewStats, activeConsole === 'all' ? "Balance del Estante" : `Balance ${currentC?.name}`)}
      </div>
    );
  };

  const renderRegister = () => {
    const currentThemeColor = activeConsole === 'all' ? '#dc2626' : CONSOLES.find(c => c.id === activeConsole)?.color;

    return (
      <div className="space-y-6 animate-slideUp">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: currentThemeColor }}></div>
            <h2 className="text-xl font-black uppercase tracking-tight">Nuevo Registro</h2>
          </div>
          
          <div className="space-y-4">
            {activeConsole === 'all' && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Consola</label>
                <div className="grid grid-cols-4 gap-2">
                  {CONSOLES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setNewGameForm({ ...newGameForm, consoleId: c.id })}
                      className={`py-2 rounded-xl border-2 text-[10px] font-black transition-all ${newGameForm.consoleId === c.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-100 text-gray-400'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Título del Juego</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder="Ej: Metroid Prime"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 outline-none transition-all font-medium"
                  style={{ '--tw-ring-color': currentThemeColor } as any}
                />
                <button 
                  onClick={handleFetchMetadata}
                  disabled={isSearching}
                  className="text-white px-5 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 shadow-lg"
                  style={{ backgroundColor: currentThemeColor }}
                >
                  {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={22} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha de Adquisición</label>
              <input 
                type="date" 
                value={new Date(newGameForm.acquisitionDate || Date.now()).toISOString().split('T')[0]}
                onChange={e => setNewGameForm({...newGameForm, acquisitionDate: new Date(e.target.value).getTime()})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-800 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Costo Pagado ($)</label>
                <input 
                  type="number" 
                  value={newGameForm.costPaid}
                  onChange={e => setNewGameForm({...newGameForm, costPaid: Number(e.target.value)})}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Costo Mercado ($)</label>
                <input 
                  type="number" 
                  value={newGameForm.marketPrice}
                  onChange={e => setNewGameForm({...newGameForm, marketPrice: Number(e.target.value)})}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-2xl font-bold text-blue-600 outline-none"
                />
              </div>
            </div>

            {coverOptions.length > 0 && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Elegir Portada</label>
                  <button onClick={() => customCoverRef.current?.click()} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Subir Archivo</button>
                  <input type="file" accept="image/*" className="hidden" ref={customCoverRef} onChange={e => handleCapturePhoto(e, 'customCover')} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {coverOptions.map((url, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setNewGameForm({ ...newGameForm, coverUrl: url })}
                      className={`aspect-[3/4] rounded-xl overflow-hidden border-4 transition-all cursor-pointer relative ${newGameForm.coverUrl === url ? 'border-blue-500 scale-105 shadow-md' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                      {newGameForm.coverUrl === url && <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5"><Check size={10} strokeWidth={4} /></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => frontPhotoRef.current?.click()} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                {newGameForm.cartridgeFrontPhoto ? (
                  <img src={newGameForm.cartridgeFrontPhoto} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={28} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                    <span className="text-[9px] font-black text-gray-400 mt-2 uppercase">Frente</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" ref={frontPhotoRef} onChange={e => handleCapturePhoto(e, 'front')} className="hidden" />
              </div>
              <div onClick={() => backPhotoRef.current?.click()} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                {newGameForm.cartridgeBackPhoto ? (
                  <img src={newGameForm.cartridgeBackPhoto} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={28} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                    <span className="text-[9px] font-black text-gray-400 mt-2 uppercase">Atrás</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" ref={backPhotoRef} onChange={e => handleCapturePhoto(e, 'back')} className="hidden" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" placeholder="Desarrollador" value={newGameForm.developer || ''}
                  onChange={e => setNewGameForm({...newGameForm, developer: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white transition-all outline-none"
                />
                <input 
                  type="text" placeholder="Año" value={newGameForm.year || ''}
                  onChange={e => setNewGameForm({...newGameForm, year: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white transition-all outline-none"
                />
              </div>
              <input 
                type="text" placeholder="Género" value={newGameForm.genre || ''}
                onChange={e => setNewGameForm({...newGameForm, genre: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white transition-all outline-none"
              />
            </div>

            <button 
              onClick={handleSaveGame}
              disabled={!newGameForm.name || !newGameForm.coverUrl || (activeConsole === 'all' && !newGameForm.consoleId)}
              className="w-full text-white font-black py-5 rounded-3xl shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              style={{ backgroundColor: currentThemeColor }}
            >
              <Save size={20} />
              Agregar al Estante
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGameDetailModal = () => {
    if (!selectedGame) return null;
    const consoleData = CONSOLES.find(c => c.id === selectedGame.consoleId);
    const saving = (selectedGame.marketPrice || 0) - (selectedGame.costPaid || 0);
    const dateStr = new Date(selectedGame.acquisitionDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const playNowUrl = getPlayNowUrl(selectedGame);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-[40px] w-full max-w-lg animate-slideUp overflow-hidden shadow-2xl relative">
          <button 
            onClick={() => setSelectedGame(null)} 
            className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
            <img src={selectedGame.coverUrl} className="w-full h-full object-cover blur-2xl opacity-40 absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img src={selectedGame.coverUrl} className="h-full w-auto aspect-[3/4] object-contain shadow-2xl rounded-lg border border-white/20" />
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                   {consoleData?.logo && <img src={consoleData.logo} className="h-4 w-auto object-contain" />}
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{consoleData?.name}</span>
                </div>
                <h2 className="text-2xl font-black pro-font uppercase tracking-tighter text-gray-900 leading-none">{selectedGame.name}</h2>
              </div>
              <a 
                href={playNowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-4 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-200 active:scale-90 transition-all flex-shrink-0"
              >
                <PlayCircle size={28} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Play Now</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <Calendar size={18} className="text-gray-300 mb-2" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Año Lanzamiento</p>
                <p className="text-xs font-bold text-gray-800 uppercase">{selectedGame.year}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <History size={18} className="text-gray-300 mb-2" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Adquirido el</p>
                <p className="text-xs font-bold text-gray-800 uppercase">{dateStr}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <Building2 size={18} className="text-gray-300 mb-2" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Estudio</p>
                <p className="text-xs font-bold text-gray-800 uppercase truncate">{selectedGame.developer}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <Tags size={18} className="text-gray-300 mb-2" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Género</p>
                <p className="text-xs font-bold text-gray-800 uppercase truncate">{selectedGame.genre}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={18} className="text-gray-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Mi Copia</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                   {selectedGame.cartridgeFrontPhoto ? (
                     <img src={selectedGame.cartridgeFrontPhoto} className="w-full h-full object-cover" />
                   ) : (
                     <p className="text-[10px] font-black text-gray-300 uppercase">Sin Foto Frontal</p>
                   )}
                </div>
                <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                   {selectedGame.cartridgeBackPhoto ? (
                     <img src={selectedGame.cartridgeBackPhoto} className="w-full h-full object-cover" />
                   ) : (
                     <p className="text-[10px] font-black text-gray-300 uppercase">Sin Foto Trasera</p>
                   )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <div className="flex-1 bg-gray-900 rounded-3xl p-4 text-white">
                <div className="flex items-center gap-1.5 mb-1.5 text-gray-500">
                   <DollarSign size={12} />
                   <span className="text-[7px] font-black uppercase tracking-widest">Pago</span>
                </div>
                <p className="text-lg font-black pro-font">${selectedGame.costPaid?.toLocaleString() || '0'}</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-3xl p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-1.5 text-blue-300">
                   <TrendingUp size={12} />
                   <span className="text-[7px] font-black uppercase tracking-widest">Valuación</span>
                </div>
                <p className="text-lg font-black pro-font text-blue-600">${selectedGame.marketPrice?.toLocaleString() || '0'}</p>
              </div>
              <div className={`flex-1 rounded-3xl p-4 border ${saving >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`flex items-center gap-1.5 mb-1.5 ${saving >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                   <PiggyBank size={12} />
                   <span className="text-[7px] font-black uppercase tracking-widest">{saving >= 0 ? 'Ahorro' : 'Saldo'}</span>
                </div>
                <p className={`text-lg font-black pro-font ${saving >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {saving >= 0 ? '+' : ''}${Math.abs(saving).toLocaleString()}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedGame(null)}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
              Volver al Estante
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      activeConsole={activeConsole} 
      setActiveConsole={setActiveConsole}
    >
      {activeTab === 'home' && renderHomeSummary()}
      {activeTab === 'collection' && renderCollection()}
      {activeTab === 'register' && renderRegister()}
      {activeTab === 'settings' && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
               <SettingsIcon size={24} /> Ajustes de App
             </h2>
             <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Diseño de Cuadrícula</label>
                  <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl">
                    {[3, 4, 5, 6].map(n => (
                      <button key={n} onClick={() => setSettings({...settings, columns: n})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${settings.columns === n ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>{n}</button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Datos Financieros</label>
                   <button 
                    onClick={() => setSettings({...settings, showFinancials: !settings.showFinancials})}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${settings.showFinancials ? 'border-blue-100 bg-blue-50/50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                   >
                     <div className="flex items-center gap-3">
                        {settings.showFinancials ? <Eye size={20} /> : <EyeOff size={20} />}
                        <span className="text-sm font-black uppercase tracking-tight">
                          {settings.showFinancials ? 'Visibles en pestañas' : 'Ocultos en pestañas'}
                        </span>
                     </div>
                     <div className={`w-10 h-6 rounded-full relative transition-all ${settings.showFinancials ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showFinancials ? 'right-1' : 'left-1'}`}></div>
                     </div>
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {renderGameDetailModal()}
      
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center animate-slideUp">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">¿Eliminar Juego?</h3>
            <p className="text-gray-400 text-xs font-bold uppercase leading-relaxed mb-8">Esta acción quitará el cartucho permanentemente de tu colección digital.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-gray-50 rounded-2xl font-black text-gray-400 uppercase text-[10px] tracking-widest">Cancelar</button>
              <button onClick={() => deleteGame(confirmDelete)} className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest shadow-lg shadow-red-200">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showUrgentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-8 w-full max-md max-h-[70vh] flex flex-col animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Lista de Deseos</h3>
              <button onClick={() => setShowUrgentModal(false)} className="bg-gray-50 p-2 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                value={newUrgentTitle} 
                onChange={e => setNewUrgentTitle(e.target.value)}
                placeholder="Nombre del juego..."
                className="flex-1 px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-medium focus:bg-white"
              />
              <button onClick={addUrgentItem} className="bg-yellow-400 text-white p-3 rounded-2xl shadow-lg shadow-yellow-100"><Plus size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {urgentList.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CONSOLES.find(c => c.id === item.consoleId)?.color }}></div>
                    <span className="text-sm font-bold uppercase tracking-tight">{item.title}</span>
                  </div>
                  <button onClick={() => setUrgentList(urgentList.filter(u => u.id !== item.id))} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
