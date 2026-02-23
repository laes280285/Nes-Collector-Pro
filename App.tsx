
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { Game, ViewMode, GroupBy, AppSettings, UrgentItem, ConsoleId, CONSOLES, User, BlacklistedUser, AccountStatus } from './types';
import { fetchGameMetadata } from './services/geminiService';
import { db, auth } from './services/firebase';
import { collection as fsCollection, doc, getDoc, setDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { saveGameToFirestore, getGamesFromFirestore, deleteGameFromFirestore, saveMultipleGamesToFirestore } from './services/firestoreService';
import { 
  Plus, Search, Camera, Trash2, AlertTriangle, X, Save, Check, Star, Library, 
  Settings as SettingsIcon, DollarSign, Wallet, PiggyBank, History, Filter, 
  Eye, EyeOff, PlayCircle, EyeClosed, Image as ImageIcon, Mail, MoreVertical, 
  Slash, Lock, UserCheck, ShieldCheck, MailPlus, Info, TrendingUp, LogOut, ChevronRight, 
  FileText, Calendar, User as UserIcon, Tag, Upload, Database, Cloud, RefreshCw, Download,
  CheckCircle2, FileImage, Shield, Zap, Sparkles, Monitor, Info as InfoIcon, Play, Calculator, FileCheck, Layers, Edit2
} from 'lucide-react';

const APP_VERSION = "3.3.0";

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState('home');
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all');
  const [collection, setCollection] = useState<Game[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none',
    uiScale: 'med',
    showFinancialsHome: true,
    showFinancialsShelf: true,
    hideEmptyConsoles: false
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<'front' | 'back' | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser(userData);
        } else {
          // If profile doesn't exist, sign out
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setShowSplash(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Subscribe to user's games collection in Firestore
      const q = query(
        fsCollection(db, 'users', currentUser.id, 'games'),
        orderBy('dateAdded', 'desc')
      );
      
      const unsubscribeGames = onSnapshot(q, (snapshot) => {
        const games = snapshot.docs.map(doc => doc.data() as Game);
        setCollection(games);
      });

      const savedSettings = localStorage.getItem(`set_${currentUser.id}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      return () => unsubscribeGames();
    } else {
      setCollection([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`set_${currentUser.id}`, JSON.stringify(settings));
    }
  }, [settings, currentUser]);

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
    setSearchResults([]);
    setCoverOptions([]);
    try {
      const consoleData = CONSOLES.find(c => c.id === newGameForm.consoleId);
      const results = await fetchGameMetadata(searchName, consoleData?.name || 'Nintendo');
      setSearchResults(results);
      if (results && results.length > 0) {
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
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
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

    if (currentUser) {
      await saveGameToFirestore(currentUser.id, game);
    }
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

  const handlePlayNow = (gameName: string, consoleName: string) => {
    // Usamos una búsqueda más directa que incluya el nombre del juego y la consola
    const query = encodeURIComponent(`${gameName} ${consoleName} rom download`);
    // Redirigimos a una búsqueda de Google que priorice sitios de descarga directa para ir al grano
    window.open(`https://www.google.com/search?q=${query}+site:vimm.net+OR+site:wowroms.com+OR+site:romsgames.net`, '_blank');
  };

  const toggleGameSelection = (id: string) => {
    setSelectedGameIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!currentUser) return;
    try {
      for (const id of selectedGameIds) {
        await deleteGameFromFirestore(currentUser.id, id);
      }
      setSelectedGameIds([]);
      setIsEditMode(false);
      setConfirmBulkDelete(false);
      setNotification({ message: "Títulos eliminados correctamente", type: 'success' });
    } catch (error) {
      setNotification({ message: "Error al eliminar títulos", type: 'error' });
    }
  };

  const handleExportLibrary = () => {
    try {
      const dataStr = JSON.stringify(collection, null, 2);
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
        const importedGames = JSON.parse(content);

        if (!Array.isArray(importedGames)) {
          throw new Error("Formato de archivo inválido");
        }

        // Basic validation
        const isValid = importedGames.every(g => g.id && g.name && g.consoleId);
        if (!isValid) {
          throw new Error("El archivo no contiene datos de juegos válidos");
        }

        if (confirm(`Se importarán ${importedGames.length} juegos. Los juegos con el mismo ID serán actualizados. ¿Continuar?`)) {
          if (currentUser) {
            await saveMultipleGamesToFirestore(currentUser.id, importedGames);
            setNotification({ message: `¡${importedGames.length} juegos importados con éxito!`, type: 'success' });
          }
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
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[1000] animate-fadeIn p-10">
        <img src="https://lh3.googleusercontent.com/d/1RFXYtZ9Pls3jJg4pGo80svjKfTayESwl" className="w-32 h-auto animate-pulse brightness-125 mb-6" alt="Logo" />
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

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
      {notification && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-slideUp ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
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
                <GameCard 
                  key={game.id} 
                  game={game} 
                  viewMode={settings.viewMode} 
                  currentUser={currentUser} 
                  onDelete={async (id) => {
                    if (currentUser) {
                      await deleteGameFromFirestore(currentUser.id, id);
                      setConfirmDelete(null);
                      setNotification({ message: "Título eliminado", type: 'success' });
                    }
                  }} 
                  onEdit={() => {}} 
                  onSelect={setSelectedGame} 
                  consoleColor={CONSOLES.find(c => c.id === game.consoleId)?.color}
                  isEditMode={isEditMode}
                  isSelected={selectedGameIds.includes(game.id)}
                  onToggleSelect={toggleGameSelection}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && currentUser?.role === 'admin' && (
        <AdminDashboard />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fadeIn pb-24">
          <div className="bg-white rounded-[45px] p-10 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-black pro-font mb-8 flex items-center gap-4 text-gray-900"><Cloud className="text-blue-500" /> SINCRONIZACIÓN EN LA NUBE</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[35px] flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <div className="bg-blue-500 text-white p-3 rounded-2xl shadow-lg"><CheckCircle2 size={24} /></div>
                   <div className="flex flex-col">
                     <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Estado: Conectado</span>
                     <span className="text-[10px] text-blue-400 font-bold lowercase">{currentUser.email}</span>
                   </div>
                </div>
                <div className="bg-white/50 px-3 py-1 rounded-lg text-[8px] font-black text-blue-600 uppercase">Auto-Sync</div>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-[35px] border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed text-center">
                  Tus juegos se guardan automáticamente en tu cuenta de Firebase. 
                  <br/>Tus datos están seguros y disponibles en cualquier dispositivo.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-[45px] p-10 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-black pro-font mb-8 flex items-center gap-4 text-gray-900"><Zap className="text-yellow-500" /> ESCALA DE INTERFAZ</h2>
            <div className="flex bg-gray-100 p-1.5 rounded-[24px]">
              {(['min', 'med', 'max'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSettings({ ...settings, uiScale: scale })}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${settings.uiScale === scale ? 'bg-white shadow-md text-gray-900' : 'text-gray-400'}`}
                >
                  {scale === 'min' ? 'Compacto' : scale === 'med' ? 'Estándar' : 'Accesible'}
                </button>
              ))}
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4 text-center">
              {settings.uiScale === 'min' ? 'Ideal para ver más elementos en pantalla.' : settings.uiScale === 'med' ? 'Tamaño equilibrado para uso diario.' : 'Tipografía y botones aumentados para mejor lectura.'}
            </p>
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

          <div className="bg-red-50 rounded-[45px] p-10 border border-red-100 space-y-6">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center font-black text-2xl text-red-600 pro-font border border-red-100">{currentUser.name.charAt(0)}</div>
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em] leading-none mb-1">SESIÓN ACTIVA</p>
                   <h4 className="pro-font text-3xl text-red-600 tracking-wider leading-none uppercase">{currentUser.name}</h4>
                </div>
             </div>
             <button onClick={async () => {
                await signOut(auth);
                setCurrentUser(null);
              }} className="w-full py-6 bg-red-600 text-white rounded-[32px] font-black uppercase pro-font text-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">CERRAR EL ESTANTE</button>
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

              {searchResults.length > 0 && !isSearching && (
                <div className="space-y-3 animate-fadeIn">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">COINCIDENCIAS ENCONTRADAS (IA)</label>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {searchResults.slice(0, 3).map((res, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelectSearchResult(res)}
                        className={`flex-shrink-0 w-[140px] rounded-3xl border-2 transition-all text-left overflow-hidden flex flex-col ${newGameForm.name === res.name ? 'bg-gray-950 border-gray-950 text-white shadow-xl scale-105' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        <div className="aspect-[3/4] w-full bg-gray-200 relative">
                          {res.coverOptions?.[0] ? (
                            <img src={res.coverOptions[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="opacity-20" /></div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                            #{idx + 1}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-black uppercase truncate leading-tight mb-1">{res.name}</p>
                          <p className="text-[8px] font-bold opacity-60 uppercase">{res.year} • {res.developer}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  <button onClick={async () => { 
                    if (currentUser) {
                      await deleteGameFromFirestore(currentUser.id, confirmDelete); 
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
    </Layout>
  );
};

export default App;
