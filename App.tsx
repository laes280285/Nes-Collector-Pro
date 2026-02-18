
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { Game, ViewMode, GroupBy, AppSettings, UrgentItem, ConsoleId, CONSOLES, User, BlacklistedUser, AccountStatus } from './types';
import { fetchGameMetadata } from './services/geminiService';
import { getAllLocalGames, saveGameLocally, deleteLocalGame, clearAllLocalGames } from './services/dbService';
import { requestDrivePermission, uploadToDrive, checkAutoBackupWeekly } from './services/googleDriveService';
import { 
  Plus, Search, Camera, Trash2, AlertTriangle, X, Save, Check, Star, Library, 
  Settings as SettingsIcon, DollarSign, Wallet, PiggyBank, History, Filter, 
  Eye, EyeOff, PlayCircle, EyeClosed, Image as ImageIcon, Mail, MoreVertical, 
  Slash, Lock, UserCheck, ShieldCheck, MailPlus, Info, TrendingUp, LogOut, ChevronRight, 
  FileText, Calendar, User as UserIcon, Tag, Upload, Database, Cloud, RefreshCw, Download,
  CheckCircle2, FileImage, Shield, Zap, Sparkles, Monitor, Info as InfoIcon, Play, Calculator, FileCheck, Layers
} from 'lucide-react';

const USERS_KEY = 'nintendo_users_v1';
const BLACKLIST_KEY = 'nintendo_blacklist_v1';
const APP_VERSION = "3.3.0";

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedUser[]>([]);
  
  const [activeTab, setActiveTab] = useState('home');
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all');
  const [collection, setCollection] = useState<Game[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none',
    showFinancialsHome: true,
    showFinancialsShelf: true,
    hideEmptyConsoles: false,
    autoBackup: false,
    autoBackupWeekly: false,
    driveLinked: false,
    googleClientId: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newGameForm, setNewGameForm] = useState<Partial<Game>>({
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    const savedBlacklist = localStorage.getItem(BLACKLIST_KEY);
    if (savedBlacklist) setBlacklist(JSON.parse(savedBlacklist));
    
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      getAllLocalGames().then(setCollection);
      const savedSettings = localStorage.getItem(`set_${currentUser.id}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`set_${currentUser.id}`, JSON.stringify(settings));
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [settings, currentUser, users]);

  const filteredCollection = useMemo(() => {
    return activeConsole === 'all' ? collection : collection.filter(g => g.consoleId === activeConsole);
  }, [collection, activeConsole]);

  const globalStats = useMemo(() => {
    const paid = collection.reduce((acc, g) => acc + (g.costPaid || 0), 0);
    const market = collection.reduce((acc, g) => acc + (g.marketPrice || 0), 0);
    return { paid, market, saved: market - paid };
  }, [collection]);

  const handleFetchMetadata = async () => {
    if (!searchName.trim() || !newGameForm.consoleId) return;
    setIsSearching(true);
    setCoverOptions([]);
    try {
      const consoleData = CONSOLES.find(c => c.id === newGameForm.consoleId);
      const data = await fetchGameMetadata(searchName, consoleData?.name || 'Nintendo');
      if (data) {
        setNewGameForm(prev => ({
          ...prev,
          name: data.name || searchName,
          developer: data.developer,
          year: data.year,
          genre: data.genre,
          marketPrice: data.estimatedPrice || 0,
          coverUrl: data.coverOptions?.[0] || ''
        }));
        setCoverOptions(data.coverOptions || []);
      }
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  const handleSaveGame = async () => {
    if (!newGameForm.name || !newGameForm.consoleId) return;
    const game: Game = {
      id: crypto.randomUUID(),
      consoleId: newGameForm.consoleId as ConsoleId,
      name: newGameForm.name,
      developer: newGameForm.developer || 'Desconocido',
      year: newGameForm.year || 'N/A',
      genre: newGameForm.genre || 'Desconocido',
      coverUrl: newGameForm.coverUrl || '',
      costPaid: Number(newGameForm.costPaid) || 0,
      marketPrice: Number(newGameForm.marketPrice) || 0,
      acquisitionDate: newGameForm.acquisitionDate || Date.now(),
      dateAdded: Date.now(),
      notes: newGameForm.notes || '',
      cartridgeFrontPhoto: newGameForm.cartridgeFrontPhoto || '',
      cartridgeBackPhoto: newGameForm.cartridgeBackPhoto || ''
    };

    await saveGameLocally(game);
    setCollection(prev => [game, ...prev]);
    setIsRegisterOpen(false);
    setActiveTab('collection');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoSlot) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setNewGameForm(prev => ({
        ...prev,
        [activePhotoSlot === 'front' ? 'cartridgeFrontPhoto' : 'cartridgeBackPhoto']: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLinkDrive = async () => {
    if (!settings.googleClientId) {
      alert("Configura tu Google Client ID en Opciones.");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await requestDrivePermission(settings.googleClientId);
      if (result) {
        setGoogleToken(result.token);
        setSettings({...settings, driveLinked: true, googleUserEmail: result.email});
        alert(`Cuenta ${result.email} vinculada exitosamente.`);
      }
    } catch (e) {
      alert("Error al vincular. Verifica tu Client ID.");
    } finally { setIsSyncing(false); }
  };

  const triggerDriveBackup = async () => {
    if (!settings.driveLinked) return;
    setIsSyncing(true);
    const success = await uploadToDrive({
      games: collection,
      settings: settings,
      timestamp: Date.now()
    }, googleToken || undefined);
    if (success) {
      setSettings(prev => ({...prev, lastBackup: Date.now()}));
      alert("Respaldo subido a Drive.");
    } else {
      alert("Fallo en la carga.");
    }
    setIsSyncing(false);
  };

  const handlePlayNow = (gameName: string, consoleName: string) => {
    const query = encodeURIComponent(`${gameName} ${consoleName}`);
    window.open(`https://www.gam.onl/?s=${query}`, '_blank');
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[1000] animate-fadeIn p-10">
        <img src="https://lh3.googleusercontent.com/d/1RFXYtZ9Pls3jJg4pGo80svjKfTayESwl" className="w-32 h-auto animate-pulse brightness-125 mb-6" alt="Logo" />
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} users={users} setUsers={setUsers} />;

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} 
      activeConsole={activeConsole} setActiveConsole={setActiveConsole}
      onOpenRegister={() => {
        setNewGameForm({ costPaid: 0, marketPrice: 0, acquisitionDate: Date.now(), consoleId: activeConsole === 'all' ? undefined : activeConsole, cartridgeFrontPhoto: '', cartridgeBackPhoto: '' });
        setSearchName('');
        setCoverOptions([]);
        setIsRegisterOpen(true);
      }}
      hideEmpty={settings.hideEmptyConsoles} collection={collection} currentUser={currentUser}
    >
      <input 
        type="file" 
        accept="image/*" 
        ref={photoInputRef} 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />

      {activeTab === 'home' && (
        <div className="space-y-10 animate-fadeIn pb-10">
          {CONSOLES.map(c => {
            const cGames = collection.filter(g => g.consoleId === c.id).slice(0, 8);
            if (cGames.length === 0) return null;
            return (
              <section key={c.id}>
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-7 rounded-full" style={{ backgroundColor: c.color }}></div>
                    <h2 className="pro-font text-3xl text-gray-900 tracking-wider leading-none">{c.name}</h2>
                  </div>
                  <button onClick={() => { setActiveConsole(c.id); setActiveTab('collection'); }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors">VER ESTANTE</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-1">
                   {cGames.map(g => (
                     <div key={g.id} className="w-28 flex-shrink-0 group" onClick={() => setSelectedGame(g)}>
                       <img src={g.coverUrl} className="aspect-[3/4] rounded-2xl object-cover shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] border border-gray-100 group-active:scale-95 transition-all duration-300" />
                     </div>
                   ))}
                </div>
              </section>
            );
          })}

          {settings.showFinancialsHome && (
            <div className="bg-gray-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/20 rounded-full -translate-y-24 translate-x-24 blur-[80px]"></div>
              <h3 className="pro-font text-2xl text-gray-500 mb-8 tracking-[0.3em] uppercase">VALOR TOTAL DEL LEGADO</h3>
              <div className="grid grid-cols-2 gap-10">
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Inversión</p>
                   <p className="text-4xl font-black pro-font tracking-tight">${globalStats.paid.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Valor Actual</p>
                   <p className="text-4xl font-black pro-font text-blue-400 tracking-tight">${globalStats.market.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-400"><TrendingUp size={24}/></div>
                  <div className="flex flex-col">
                    <p className="text-2xl font-black text-green-400 pro-font tracking-wider">+${globalStats.saved.toLocaleString()}</p>
                    <span className="text-[8px] font-black text-green-700 uppercase">INCREMENTO DE VALOR</span>
                  </div>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-gray-500 tracking-widest">{collection.length} TÍTULOS</div>
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
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {filteredCollection.map(game => (
                <GameCard key={game.id} game={game} viewMode={settings.viewMode} currentUser={currentUser} onDelete={id => setConfirmDelete(id)} onEdit={() => {}} onSelect={setSelectedGame} consoleColor={CONSOLES.find(c => c.id === game.consoleId)?.color} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && currentUser?.role === 'admin' && (
        <AdminDashboard 
          users={users} setUsers={setUsers} 
          blacklist={blacklist} setBlacklist={setBlacklist}
          collection={collection} onBackupNow={triggerDriveBackup}
          isSyncing={isSyncing} driveLinked={settings.driveLinked}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fadeIn pb-24">
          <div className="bg-white rounded-[45px] p-10 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-black pro-font mb-8 flex items-center gap-4 text-gray-900"><Cloud className="text-blue-500" /> NUBE PERSONAL</h2>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">ID DE CLIENTE GOOGLE CLOUD</label>
                <input 
                  type="password" 
                  value={settings.googleClientId} 
                  onChange={e => setSettings({...settings, googleClientId: e.target.value})}
                  placeholder="ID de cliente de OAuth 2.0..."
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-xs font-mono outline-none focus:ring-4 ring-blue-50 transition-all"
                />
                <a href="https://console.cloud.google.com/" target="_blank" className="text-[10px] text-blue-500 font-black uppercase underline tracking-wider inline-block mt-1">Configurar en Consola de Google</a>
              </div>

              {settings.driveLinked ? (
                <div className="space-y-4">
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[35px] flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-500 text-white p-3 rounded-2xl shadow-lg"><CheckCircle2 size={24} /></div>
                       <div className="flex flex-col">
                         <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Cuenta Vinculada</span>
                         <span className="text-[10px] text-blue-400 font-bold lowercase">{settings.googleUserEmail}</span>
                       </div>
                    </div>
                    <button onClick={() => setSettings({...settings, driveLinked: false})} className="text-[10px] font-black text-red-500 uppercase p-2 hover:bg-red-50 rounded-xl transition-colors">BORRAR</button>
                  </div>
                  <button onClick={triggerDriveBackup} disabled={isSyncing} className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black uppercase text-sm flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                    {isSyncing ? <RefreshCw size={24} className="animate-spin" /> : <Upload size={24} />}
                    {isSyncing ? 'Subiendo Colección...' : 'Sincronizar Estante con Drive'}
                  </button>
                </div>
              ) : (
                <button onClick={handleLinkDrive} className="w-full py-8 border-3 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center gap-4 group hover:bg-gray-50 transition-all border-spacing-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-110">
                    <Monitor size={32} />
                  </div>
                  <span className="font-black uppercase text-[11px] text-gray-400 tracking-[0.2em]">Enlazar Almacenamiento Remoto</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-[45px] p-10 border border-red-100 space-y-6">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center font-black text-2xl text-red-600 pro-font border border-red-100">{currentUser.name.charAt(0)}</div>
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em] leading-none mb-1">SESIÓN ACTIVA</p>
                   <h4 className="pro-font text-3xl text-red-600 tracking-wider leading-none uppercase">{currentUser.name}</h4>
                </div>
             </div>
             <button onClick={() => setCurrentUser(null)} className="w-full py-6 bg-red-600 text-white rounded-[32px] font-black uppercase pro-font text-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">CERRAR EL ESTANTE</button>
          </div>
        </div>
      )}

      {/* DETALLE DE JUEGO */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-0 sm:p-6 animate-fadeIn">
          <div className="bg-white sm:rounded-[56px] w-full max-w-xl h-full sm:h-auto max-h-[100dvh] overflow-y-auto no-scrollbar relative flex flex-col border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            <button onClick={() => setSelectedGame(null)} className="absolute top-8 right-8 z-[350] bg-white/10 hover:bg-white/30 backdrop-blur-xl p-4 rounded-full text-white transition-all shadow-xl active:scale-90"><X size={28}/></button>
            
            <div className="w-full aspect-video sm:aspect-square relative overflow-hidden flex-shrink-0 group bg-gray-900">
              <img src={selectedGame.coverUrl} className="w-full h-full object-cover scale-150 blur-3xl opacity-50 absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-14">
                 <img 
                   src={selectedGame.coverUrl} 
                   className="h-full w-auto object-contain rounded-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] border border-white/30 transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                 />
              </div>
            </div>

            <div className="p-10 sm:p-12 space-y-10 flex-1 bg-white relative">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: CONSOLES.find(c => c.id === selectedGame.consoleId)?.color }}></div>
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{CONSOLES.find(c => c.id === selectedGame.consoleId)?.name} LEGACY</p>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black pro-font uppercase leading-none tracking-tighter text-gray-950">{selectedGame.name}</h3>
                <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.developer}</span>
                    <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.year}</span>
                    <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedGame.genre}</span>
                </div>
              </div>

              {/* Fotos del Cartucho */}
              {(selectedGame.cartridgeFrontPhoto || selectedGame.cartridgeBackPhoto) && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers size={14} /> Inspección Física del Cartucho
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedGame.cartridgeFrontPhoto && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-300 uppercase">Anverso</p>
                        <img src={selectedGame.cartridgeFrontPhoto} className="w-full h-24 object-cover rounded-xl border border-gray-100 shadow-sm" />
                      </div>
                    )}
                    {selectedGame.cartridgeBackPhoto && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-300 uppercase">Reverso</p>
                        <img src={selectedGame.cartridgeBackPhoto} className="w-full h-24 object-cover rounded-xl border border-gray-100 shadow-sm" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-blue-50/40 p-8 rounded-[40px] border border-blue-100/50 text-center shadow-sm">
                   <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">VALOR MERCADO</p>
                   <p className="text-4xl font-black pro-font text-blue-600 leading-none">${selectedGame.marketPrice}</p>
                </div>
                <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 text-center">
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">PAGADO</p>
                   <p className="text-4xl font-black pro-font text-gray-400 leading-none">${selectedGame.costPaid}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                 <button 
                    onClick={() => handlePlayNow(selectedGame.name, CONSOLES.find(c => c.id === selectedGame.consoleId)?.name || 'Nintendo')}
                    className="w-full py-7 bg-red-600 text-white rounded-[35px] font-black pro-font text-3xl uppercase shadow-[0_20px_40px_-10px_rgba(220,38,38,0.5)] flex items-center justify-center gap-5 hover:bg-red-700 active:scale-95 transition-all duration-300 group/play"
                 >
                   <Play size={28} fill="white" className="group-hover/play:scale-125 transition-transform" /> JUGAR AHORA
                 </button>
                 <button onClick={() => setSelectedGame(null)} className="w-full py-5 text-gray-300 font-black pro-font text-xl uppercase tracking-[0.2em] hover:text-gray-950 transition-colors">Volver al Estante</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO IA */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] w-full max-w-lg p-10 animate-slideUp max-h-[92vh] overflow-y-auto no-scrollbar relative border border-white/20 shadow-2xl">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-gray-950 transition-colors"><X size={32}/></button>
            <h2 className="text-4xl font-black pro-font mb-10 tracking-tighter text-gray-950 uppercase">ADQUIRIR TÍTULO</h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] block">SELECCIONA CONSOLA</label>
                <div className="grid grid-cols-4 gap-3">
                  {CONSOLES.map(c => (
                    <button key={c.id} onClick={() => setNewGameForm({...newGameForm, consoleId: c.id})} className={`p-4 rounded-[22px] border-2 flex items-center justify-center transition-all duration-300 ${newGameForm.consoleId === c.id ? 'bg-gray-950 border-gray-950 scale-105 shadow-xl' : 'border-gray-50 opacity-20 grayscale'}`}>
                      <img src={c.logo} className={`h-6 w-auto object-contain ${newGameForm.consoleId === c.id ? 'brightness-200' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] block">BÚSQUEDA IA NINTENDO</label>
                <div className="flex gap-3">
                  <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Ej: Super Mario World..." className="flex-1 p-6 bg-gray-50 rounded-[28px] border-none font-bold outline-none text-base placeholder:text-gray-300 focus:ring-4 ring-red-50 transition-all" />
                  <button onClick={handleFetchMetadata} disabled={isSearching || !newGameForm.consoleId} className="bg-gray-950 text-white p-6 rounded-[28px] shadow-2xl active:scale-90 transition-all">
                    {isSearching ? <RefreshCw size={28} className="animate-spin" /> : <Search size={28} />}
                  </button>
                </div>
              </div>

              {newGameForm.name && !isSearching && (
                <div className="animate-fadeIn space-y-8">
                  {/* FICHA TÉCNICA Y OPCIONES DE FOTO */}
                  <div className="bg-gray-900 text-white rounded-[40px] p-8 space-y-6 shadow-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                     
                     <div className="flex gap-6 items-start">
                        <div className="w-24 flex-shrink-0">
                           <img src={newGameForm.coverUrl} className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl border-2 border-white/20" />
                        </div>
                        <div className="flex-1 space-y-2">
                           <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] mb-1">DATA INSPECCIONADA</p>
                           <h4 className="text-2xl font-black uppercase pro-font leading-none tracking-tight mb-2">{newGameForm.name}</h4>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/5 p-2 rounded-lg">
                                 <p className="text-[7px] font-black text-gray-500 uppercase">Genero</p>
                                 <p className="text-[10px] font-bold uppercase truncate">{newGameForm.genre}</p>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg">
                                 <p className="text-[7px] font-black text-gray-500 uppercase">Lanzamiento</p>
                                 <p className="text-[10px] font-bold uppercase">{newGameForm.year}</p>
                              </div>
                           </div>
                           <div className="bg-white/5 p-2 rounded-lg w-full">
                              <p className="text-[7px] font-black text-gray-500 uppercase">Dev</p>
                              <p className="text-[10px] font-bold uppercase truncate">{newGameForm.developer}</p>
                           </div>
                        </div>
                     </div>

                     {/* CARGA DE FOTOS CARTUCHO */}
                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={14} /> FOTOS DEL CARTUCHO REAL
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                           <div 
                              onClick={() => { setActivePhotoSlot('front'); photoInputRef.current?.click(); }}
                              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden ${newGameForm.cartridgeFrontPhoto ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
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
                              onClick={() => { setActivePhotoSlot('back'); photoInputRef.current?.click(); }}
                              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden ${newGameForm.cartridgeBackPhoto ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
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

                  <button onClick={handleSaveGame} className="w-full py-7 bg-red-600 text-white rounded-[35px] font-black uppercase pro-font text-2xl shadow-2xl hover:bg-red-700 active:scale-95 transition-all">INGRESAR AL ESTANTE</button>
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
                  <button onClick={async () => { await deleteLocalGame(confirmDelete); setCollection(collection.filter(g => g.id !== confirmDelete)); setConfirmDelete(null); }} className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase pro-font text-xl shadow-xl">BORRAR PARA SIEMPRE</button>
                  <button onClick={() => setConfirmDelete(null)} className="w-full py-5 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase pro-font text-lg">CANCELAR</button>
               </div>
            </div>
         </div>
      )}
    </Layout>
  );
};

export default App;
