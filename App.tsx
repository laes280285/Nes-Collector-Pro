import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Auth } from './components/Auth';
import { Game, ViewMode, GroupBy, AppSettings, UrgentItem, ConsoleId, CONSOLES, User, BlacklistedUser, AccountStatus } from './types';
import { fetchGameMetadata } from './services/geminiService';
import { 
  Plus, Search, Camera, Trash2, AlertTriangle, X, Save, Check, Star, Library, 
  Settings as SettingsIcon, DollarSign, Wallet, PiggyBank, History, Filter, 
  Eye, EyeOff, PlayCircle, EyeClosed, Image as ImageIcon, Mail, MoreVertical, 
  Slash, Lock, UserCheck, ShieldCheck, MailPlus, Info, TrendingUp, LogOut, ShieldAlert
} from 'lucide-react';

const USERS_KEY = 'nintendo_users_v1';
const BLACKLIST_KEY = 'nintendo_blacklist_v1';

const noTextConsoles: ConsoleId[] = ['nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch', 'switch2'];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedUser[]>([]);
  
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState<'active' | 'blacklist'>('active');
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all');
  const [collection, setCollection] = useState<Game[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none',
    showFinancialsHome: true,
    showFinancialsShelf: true,
    hideEmptyConsoles: false
  });

  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newGameForm, setNewGameForm] = useState<Partial<Game>>({
    costPaid: 0,
    marketPrice: 0,
    acquisitionDate: Date.now(),
    consoleId: undefined // Force selection
  });
  const [coverOptions, setCoverOptions] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [adminUserToDelete, setAdminUserToDelete] = useState<User | null>(null);
  const [deletionReason, setDeletionReason] = useState('');

  // Delete Library states
  const [showDeleteLibraryAuth, setShowDeleteLibraryAuth] = useState(false);
  const [showDeleteLibraryFinal, setShowDeleteLibraryFinal] = useState(false);
  const [deleteLibraryPass, setDeleteLibraryPass] = useState('');
  const [deleteLibraryError, setDeleteLibraryError] = useState('');

  const frontPhotoRef = useRef<HTMLInputElement>(null);
  const backPhotoRef = useRef<HTMLInputElement>(null);
  const customCoverRef = useRef<HTMLInputElement>(null);

  // Splash Screen effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Persistence: Users & Blacklist
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    const savedBlacklist = localStorage.getItem(BLACKLIST_KEY);
    if (savedBlacklist) setBlacklist(JSON.parse(savedBlacklist));
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist));
  }, [blacklist]);

  // Load User Collection
  useEffect(() => {
    if (currentUser) {
      const collKey = `coll_${currentUser.id}`;
      const setKey = `set_${currentUser.id}`;
      
      const savedColl = localStorage.getItem(collKey);
      if (savedColl) setCollection(JSON.parse(savedColl));
      else setCollection([]);

      const savedSettings = localStorage.getItem(setKey);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    }
  }, [currentUser]);

  // Sync User Collection
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`coll_${currentUser.id}`, JSON.stringify(collection));
    }
  }, [collection, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`set_${currentUser.id}`, JSON.stringify(settings));
    }
  }, [settings, currentUser]);

  // Derived filtering
  const filteredCollection = useMemo(() => {
    let list = activeConsole === 'all' ? collection : collection.filter(g => g.consoleId === activeConsole);
    return list;
  }, [collection, activeConsole]);

  const getStats = (list: Game[]) => {
    const totalPaid = list.reduce((acc, g) => acc + (g.costPaid || 0), 0);
    const totalMarket = list.reduce((acc, g) => acc + (g.marketPrice || 0), 0);
    return { totalPaid, totalMarket, totalSaved: totalMarket - totalPaid };
  };

  const globalStats = getStats(collection);
  const currentViewStats = getStats(filteredCollection);

  const getPlayNowUrl = (game: Game) => {
    const slug = game.name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    const consolePath = game.consoleId === 'switch' || game.consoleId === 'switch2' ? 'switch' : game.consoleId;
    return `https://gam.onl/${consolePath}/${slug}.html#${slug}`;
  };

  const handleFetchMetadata = async () => {
    if (!searchName.trim() || !newGameForm.consoleId) return;
    setIsSearching(true);
    setCoverOptions([]);
    const consoleData = CONSOLES.find(c => c.id === newGameForm.consoleId);
    
    const data = await fetchGameMetadata(searchName, consoleData?.name || 'Nintendo');
    
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
        if (side === 'front') setNewGameForm({ ...newGameForm, cartridgeFrontPhoto: result });
        else if (side === 'back') {
          if (currentUser?.role === 'standard') {
            alert("Función VIP");
            return;
          }
          setNewGameForm({ ...newGameForm, cartridgeBackPhoto: result });
        } else if (side === 'customCover') {
          if (currentUser?.role === 'standard') {
            alert("Función VIP");
            return;
          }
          setNewGameForm({ ...newGameForm, coverUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGame = () => {
    if (!newGameForm.name || !newGameForm.consoleId) return;
    
    if (currentUser?.role === 'standard') {
      const count = collection.filter(g => g.consoleId === newGameForm.consoleId).length;
      if (count >= 50) {
        alert("Límite Estándar: Máximo 50 juegos por sistema. ¡Hazte VIP!");
        return;
      }
    }

    const game: Game = {
      id: crypto.randomUUID(),
      consoleId: newGameForm.consoleId as ConsoleId,
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
    setIsRegisterOpen(false);
    setActiveTab('collection');
  };

  const deleteAdminUser = () => {
    const words = deletionReason.trim().split(/\s+/).filter(Boolean).length;
    if (!adminUserToDelete || words < 30) {
      alert("Debes escribir al menos 30 palabras para eliminar la cuenta.");
      return;
    }
    const bUser: BlacklistedUser = {
      ...adminUserToDelete,
      deletedAt: Date.now(),
      deletionReason
    };
    setBlacklist([bUser, ...blacklist]);
    setUsers(users.filter(u => u.id !== adminUserToDelete.id));
    setAdminUserToDelete(null);
    setDeletionReason('');
  };

  const verifyPasswordForDelete = () => {
    if (currentUser?.role === 'admin' && deleteLibraryPass === '13@Ngeles') {
      setShowDeleteLibraryAuth(false);
      setShowDeleteLibraryFinal(true);
      setDeleteLibraryPass('');
      return;
    }
    
    const user = users.find(u => u.email === currentUser?.email && u.password === deleteLibraryPass);
    if (user) {
      setShowDeleteLibraryAuth(false);
      setShowDeleteLibraryFinal(true);
      setDeleteLibraryPass('');
    } else {
      setDeleteLibraryError('Contraseña incorrecta');
    }
  };

  const clearUserLibrary = () => {
    setCollection([]);
    setShowDeleteLibraryFinal(false);
    setActiveTab('home');
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch(status) {
      case 'active': return <span className="text-[9px] font-black uppercase bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 pro-font">Activa</span>;
      case 'paused': return <span className="text-[9px] font-black uppercase bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100 pro-font">Pausada</span>;
      case 'stopped': return <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 pro-font">Detenida</span>;
      default: return null;
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[1000] animate-fadeIn">
        <h1 className="gothic-font text-6xl text-gray-900 opacity-0 animate-fadeIn" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          OddImation Studios
        </h1>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} users={users} setUsers={setUsers} />;
  }

  const isSelectedGamePlayable = selectedGame ? ['nes', 'snes', 'n64'].includes(selectedGame.consoleId) : false;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      activeConsole={activeConsole} 
      setActiveConsole={setActiveConsole}
      onOpenRegister={() => {
        setNewGameForm({ 
          costPaid: 0, 
          marketPrice: 0, 
          acquisitionDate: Date.now(), 
          consoleId: activeConsole === 'all' ? undefined : activeConsole 
        });
        setSearchName('');
        setCoverOptions([]);
        setIsRegisterOpen(true);
      }}
      hideEmpty={settings.hideEmptyConsoles}
      collection={collection}
      currentUser={currentUser}
    >
      {activeTab === 'home' && (
        <div className="space-y-8 animate-fadeIn">
          <section>
            <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest pl-1 pro-font">Últimos Agregados (Todos)</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-4">
              {collection.slice(0, 8).map(game => (
                <div key={game.id} className="w-32 flex-shrink-0 cursor-pointer" onClick={() => setSelectedGame(game)}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 border border-gray-100"><img src={game.coverUrl} className="w-full h-full object-cover" /></div>
                  <p className="text-[11px] font-bold mt-2 truncate uppercase">{game.name}</p>
                </div>
              ))}
              {collection.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center w-full uppercase font-bold">Aún no hay juegos</p>}
            </div>
          </section>

          {CONSOLES.map(c => {
            const consoleGames = collection.filter(g => g.consoleId === c.id).slice(0, 5);
            if (consoleGames.length === 0) return null;
            return (
              <section key={c.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-black pro-font flex items-center gap-2">
                    <img src={c.logo} className="block h-6 w-auto object-contain" style={{ minWidth: '24px' }} /> 
                    {!noTextConsoles.includes(c.id) && c.name}
                  </h2>
                  <button onClick={() => { setActiveConsole(c.id); setActiveTab('collection'); }} className="text-[11px] font-black uppercase text-gray-400">VER TODO</button>
                </div>
                <div className="bg-white rounded-2xl p-3 flex gap-3 overflow-x-auto no-scrollbar shadow-sm">
                   {consoleGames.map(g => (
                     <div key={g.id} className="w-24 flex-shrink-0" onClick={() => setSelectedGame(g)}>
                       <img src={g.coverUrl} className="aspect-[3/4] rounded-lg object-cover" />
                     </div>
                   ))}
                </div>
              </section>
            );
          })}

          {settings.showFinancialsHome && (
            <section className="bg-gray-900 rounded-[32px] p-6 text-white shadow-2xl mt-8">
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 pro-font">BALANCE GLOBAL</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div><p className="text-[9px] font-black uppercase text-gray-500">Inversión</p><p className="text-3xl font-black pro-font">${globalStats.totalPaid.toLocaleString()}</p></div>
                <div className="text-right"><p className="text-[9px] font-black uppercase text-gray-500">Valor Mercado</p><p className="text-3xl font-black pro-font text-blue-400">${globalStats.totalMarket.toLocaleString()}</p></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-xl text-green-400"><PiggyBank size={20}/></div><p className="text-lg font-black text-green-400 pro-font">+${globalStats.totalSaved.toLocaleString()}</p></div>
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'collection' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
             <h2 className="font-black text-gray-900 flex items-center gap-2 pro-font text-lg uppercase">{activeConsole === 'all' ? '🌎 GLOBAL' : activeConsole}</h2>
             <div className="flex gap-2">
                <button onClick={() => setSettings({...settings, viewMode: 'icon'})} className={`p-2 rounded-lg ${settings.viewMode === 'icon' ? 'bg-gray-100' : 'text-gray-400'}`}><Library size={20}/></button>
                <button onClick={() => setSettings({...settings, viewMode: 'list'})} className={`p-2 rounded-lg ${settings.viewMode === 'list' ? 'bg-gray-100' : 'text-gray-400'}`}><Search size={20}/></button>
             </div>
          </div>
          <div className={`grid gap-3 ${settings.viewMode === 'icon' ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCollection.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                viewMode={settings.viewMode} 
                currentUser={currentUser}
                onDelete={id => setConfirmDelete(id)}
                onEdit={() => {}} 
                onSelect={g => setSelectedGame(g)}
                consoleColor={CONSOLES.find(c => c.id === game.consoleId)?.color}
              />
            ))}
          </div>

          {settings.showFinancialsShelf && filteredCollection.length > 0 && (
             <section className="bg-gray-900 rounded-[32px] p-6 text-white shadow-2xl mt-8">
                <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 pro-font">BALANCE DEL ESTANTE</h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div><p className="text-[9px] font-black uppercase text-gray-500">Inversión</p><p className="text-3xl font-black pro-font">${currentViewStats.totalPaid.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[9px] font-black uppercase text-gray-500">Valor Mercado</p><p className="text-3xl font-black pro-font text-blue-400">${currentViewStats.totalMarket.toLocaleString()}</p></div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-xl text-green-400"><PiggyBank size={20}/></div><p className="text-lg font-black text-green-400 pro-font">+${currentViewStats.totalSaved.toLocaleString()}</p></div>
                </div>
              </section>
          )}
        </div>
      )}

      {activeTab === 'admin' && currentUser?.role === 'admin' && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black uppercase tracking-tight pro-font">Panel Administrativo</h2>
               <button onClick={() => alert("Función de correo masivo activada...")} className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-100"><MailPlus size={20}/></button>
             </div>

             <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
               <button onClick={() => setAdminSubTab('active')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${adminSubTab === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>Activos</button>
               <button onClick={() => setAdminSubTab('blacklist')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${adminSubTab === 'blacklist' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>Lista Negra</button>
             </div>

             {adminSubTab === 'active' && (
               <div className="divide-y divide-gray-100">
                 {users.filter(u => u.email !== 'unforgivenwalker@gmail.com').map(u => (
                   <div key={u.id} className="py-4 flex items-center justify-between group">
                     <div className="flex-1">
                       <div className="flex items-center gap-2">
                         <p className="font-black text-gray-900 uppercase text-sm pro-font tracking-tight leading-none">{u.name}</p>
                         {getStatusBadge(u.status)}
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{u.email} • {u.role.toUpperCase()}</p>
                     </div>
                     <div className="flex items-center gap-1">
                       <button onClick={() => alert(`Enviando correo a ${u.email}...`)} className="p-2 text-gray-400 hover:text-blue-500"><Mail size={18}/></button>
                       <div className="relative group/menu">
                          <button className="p-2 text-gray-400 hover:text-gray-900"><MoreVertical size={18}/></button>
                          <div className="absolute right-0 top-8 bg-white shadow-2xl border border-gray-100 rounded-2xl w-48 py-2 z-50 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all scale-95 group-hover/menu:scale-100">
                             <button onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, role: 'vip' } : user))} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 text-yellow-600">
                               <ShieldCheck size={14}/> Hacer VIP
                             </button>
                             <button onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, role: 'standard' } : user))} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 text-gray-400">
                               <UserCheck size={14}/> Hacer Estándar
                             </button>
                             <div className="h-px bg-gray-100 my-1 mx-2"></div>
                             <button onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, status: 'paused' } : user))} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 text-orange-400">
                               <Lock size={14}/> Pausar
                             </button>
                             <button onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, status: 'stopped' } : user))} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 text-red-400">
                               <ShieldAlert size={14}/> Detener
                             </button>
                             <button onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, status: 'active' } : user))} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 text-green-500">
                               <Check size={14}/> Activar
                             </button>
                             <div className="h-px bg-gray-100 my-1 mx-2"></div>
                             <button onClick={() => setAdminUserToDelete(u)} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 flex items-center gap-3">
                               <Trash2 size={14}/> Borrar Cuenta
                             </button>
                          </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}

             {adminSubTab === 'blacklist' && (
               <div className="divide-y divide-gray-100">
                 {blacklist.map(bu => (
                   <div key={bu.id} className="py-6">
                     <p className="font-black text-gray-900 uppercase text-sm pro-font leading-none">{bu.name}</p>
                     <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">{bu.email} • Expulsado el {new Date(bu.deletedAt).toLocaleDateString()}</p>
                     <div className="mt-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                       <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 pro-font">Razón de Expulsión</p>
                       <p className="text-[11px] font-bold text-gray-700 italic leading-relaxed">"{bu.deletionReason}"</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 pro-font">
               <SettingsIcon size={24} /> Opciones de Usuario
             </h2>
             <div className="space-y-6">
                <div>
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pro-font">Visibilidad Financiera</label>
                   <div className="grid grid-cols-1 gap-3">
                     <button 
                      onClick={() => setSettings({...settings, showFinancialsHome: !settings.showFinancialsHome})}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${settings.showFinancialsHome ? 'border-blue-100 bg-blue-50/50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                     >
                       <div className="flex items-center gap-3">
                          {settings.showFinancialsHome ? <Eye size={20} /> : <EyeOff size={20} />}
                          <span className="text-sm font-black uppercase tracking-tight pro-font">Recuadro Resumen</span>
                       </div>
                     </button>

                     <button 
                      onClick={() => setSettings({...settings, showFinancialsShelf: !settings.showFinancialsShelf})}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${settings.showFinancialsShelf ? 'border-indigo-100 bg-indigo-50/50 text-indigo-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                     >
                       <div className="flex items-center gap-3">
                          {settings.showFinancialsShelf ? <Eye size={20} /> : <EyeOff size={20} />}
                          <span className="text-sm font-black uppercase tracking-tight pro-font">Recuadro Estante Consolas</span>
                       </div>
                     </button>
                   </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => setCurrentUser(null)} 
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase pro-font shadow-lg transition-transform active:scale-95"
                  >
                    <LogOut size={18} />
                    CERRAR SESIÓN
                  </button>

                  <button 
                    onClick={() => setShowDeleteLibraryAuth(true)} 
                    className="w-full py-4 bg-red-50 text-red-600 border border-red-100 font-black rounded-2xl text-xs uppercase pro-font transition-transform active:scale-95"
                  >
                    Borrar mi libreria
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeleteLibraryAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] p-8 w-full max-w-sm animate-slideUp">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black uppercase pro-font">Verificar Identidad</h3>
               <button onClick={() => setShowDeleteLibraryAuth(false)} className="text-gray-400"><X size={20}/></button>
             </div>
             <p className="text-xs font-bold text-gray-400 uppercase mb-6">Introduce tu contraseña para confirmar el borrado total de tus juegos.</p>
             <input 
               type="password" 
               value={deleteLibraryPass}
               onChange={e => setDeleteLibraryPass(e.target.value)}
               placeholder="Contraseña"
               className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold mb-2"
             />
             {deleteLibraryError && <p className="text-[10px] text-red-500 font-bold uppercase mb-4">{deleteLibraryError}</p>}
             <button onClick={verifyPasswordForDelete} className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase pro-font shadow-xl">CONTINUAR</button>
           </div>
        </div>
      )}

      {showDeleteLibraryFinal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center animate-slideUp">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={32}/>
             </div>
             <h3 className="text-xl font-black uppercase mb-4 pro-font text-red-600">¿ESTÁ SEGURO?</h3>
             <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed mb-8">
               Esta seguro que quiere borrar todos los datos de su libreria? esta acción no puede deshacerse.
             </p>
             <div className="flex gap-3">
                <button onClick={() => setShowDeleteLibraryFinal(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs pro-font">CANCELAR</button>
                <button onClick={clearUserLibrary} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs pro-font shadow-lg">SÍ, BORRAR TODO</button>
             </div>
           </div>
        </div>
      )}

      {adminUserToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] p-8 w-full max-sm animate-slideUp">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-black uppercase pro-font leading-none">ELIMINAR A {adminUserToDelete.name}</h3>
               <button onClick={() => setAdminUserToDelete(null)}><X size={20} className="text-gray-400"/></button>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pro-font">Esta acción enviará al usuario a la Lista Negra</p>
             <textarea 
               value={deletionReason}
               onChange={e => setDeletionReason(e.target.value)}
               placeholder="Motivo detallado de la expulsión (mínimo 30 palabras)..."
               className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none mb-2 leading-relaxed"
             />
             <div className="flex justify-between items-center mb-6">
               <p className={`text-[10px] font-black uppercase pro-font ${deletionReason.trim().split(/\s+/).filter(Boolean).length >= 30 ? 'text-green-500' : 'text-red-400'}`}>
                 Palabras: {deletionReason.trim().split(/\s+/).filter(Boolean).length}/30
               </p>
             </div>
             <div className="flex gap-2">
               <button onClick={() => setAdminUserToDelete(null)} className="flex-1 py-4 font-black uppercase text-xs text-gray-400 pro-font">Cancelar</button>
               <button 
                 onClick={deleteAdminUser} 
                 disabled={deletionReason.trim().split(/\s+/).filter(Boolean).length < 30}
                 className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs pro-font shadow-lg disabled:opacity-30 transition-all"
                >
                  EXPULSAR
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Register Game Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-6 animate-slideUp relative overflow-y-auto max-h-[90vh] no-scrollbar">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-6 right-6 text-gray-400"><X size={24}/></button>
            <h2 className="text-2xl font-black uppercase mb-6 pro-font tracking-tight">NUEVO REGISTRO</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 pro-font">1. SELECCIONA PLATAFORMA (OBLIGATORIO)</label>
                <div className="grid grid-cols-4 gap-2">
                  {CONSOLES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setNewGameForm({ ...newGameForm, consoleId: c.id });
                        setCoverOptions([]);
                      }}
                      className={`py-2 rounded-xl border-2 text-[10px] font-black transition-all flex flex-col items-center gap-1 pro-font ${newGameForm.consoleId === c.id ? 'bg-gray-900 text-white border-gray-900 shadow-inner' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                    >
                      <img src={c.logo} className={`block h-4 w-auto object-contain ${newGameForm.consoleId === c.id ? 'brightness-0 invert' : 'grayscale'}`} style={{ minWidth: '16px' }} />
                      {!noTextConsoles.includes(c.id) && c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`transition-opacity duration-300 ${!newGameForm.consoleId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 pro-font">2. BUSCAR TÍTULO EN {CONSOLES.find(c => c.id === newGameForm.consoleId)?.name || '...'}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchName} 
                    onChange={e => setSearchName(e.target.value)} 
                    placeholder={!newGameForm.consoleId ? "Selecciona plataforma primero..." : "Ej: Metroid"} 
                    disabled={!newGameForm.consoleId}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold" 
                  />
                  <button 
                    onClick={handleFetchMetadata} 
                    disabled={isSearching || !searchName || !newGameForm.consoleId}
                    className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={24}/>}
                  </button>
                </div>
              </div>

              {coverOptions.length > 0 && (
                <div className="animate-fadeIn">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pro-font">ELEGIR PORTADA</label>
                  <div className="grid grid-cols-4 gap-2">
                    {coverOptions.map((url, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setNewGameForm({ ...newGameForm, coverUrl: url })}
                        className={`aspect-[3/4] rounded-xl overflow-hidden border-4 transition-all cursor-pointer ${newGameForm.coverUrl === url ? 'border-red-600 scale-105 shadow-xl' : 'border-transparent opacity-60'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                     <div className="flex items-center gap-2"><Info size={14} className="text-gray-400" /><span className="text-[10px] font-black uppercase text-gray-400 pro-font">Detalles Encontrados</span></div>
                     <p className="text-xs font-bold text-gray-800 uppercase leading-none">{newGameForm.developer} • {newGameForm.year}</p>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{newGameForm.genre}</p>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${!newGameForm.name ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 pro-font">PAGO ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="number" value={newGameForm.costPaid} onChange={e => setNewGameForm({...newGameForm, costPaid: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div>
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 pro-font">MERCADO ($)</label>
                   <div className="relative">
                     <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                     <input type="number" value={newGameForm.marketPrice} onChange={e => setNewGameForm({...newGameForm, marketPrice: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none" placeholder="0.00" />
                   </div>
                </div>
              </div>

              <div className={`transition-opacity duration-300 ${!newGameForm.name ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 pro-font">FOTOS DEL CARTUCHO</label>
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => frontPhotoRef.current?.click()} className="aspect-video bg-gray-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                    {newGameForm.cartridgeFrontPhoto ? <img src={newGameForm.cartridgeFrontPhoto} className="absolute inset-0 w-full h-full object-cover" /> : <><Camera size={24} className="text-gray-300"/><span className="text-[9px] font-black text-gray-400 mt-1 uppercase pro-font">Frontal</span></>}
                    <input type="file" ref={frontPhotoRef} className="hidden" onChange={e => handleCapturePhoto(e, 'front')} />
                  </div>
                  <div onClick={() => { if(currentUser.role === 'standard') alert("Función VIP"); else backPhotoRef.current?.click(); }} className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group ${currentUser.role === 'standard' ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-gray-50 cursor-pointer'}`}>
                    {currentUser.role === 'standard' ? <Slash size={24} className="text-red-500" /> : (newGameForm.cartridgeBackPhoto ? <img src={newGameForm.cartridgeBackPhoto} className="absolute inset-0 w-full h-full object-cover" /> : <><Camera size={24} className="text-gray-300"/><span className="text-[9px] font-black text-gray-400 mt-1 uppercase pro-font">Trasera</span></>)}
                    <input type="file" ref={backPhotoRef} className="hidden" onChange={e => handleCapturePhoto(e, 'back')} />
                  </div>
                </div>
              </div>

              {currentUser.role !== 'standard' ? (
                <div onClick={() => customCoverRef.current?.click()} className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 bg-blue-50/50 cursor-pointer hover:bg-blue-100 transition-all ${!newGameForm.consoleId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <ImageIcon size={24} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-blue-500 pro-font">Subir Portada desde Dispositivo</span>
                  <input type="file" ref={customCoverRef} className="hidden" onChange={e => handleCapturePhoto(e, 'customCover')} />
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                   <Slash size={24} className="text-red-500" />
                   <span className="text-[10px] font-black uppercase text-gray-400 pro-font">Subida de archivos (Función VIP)</span>
                </div>
              )}

              <button 
                onClick={handleSaveGame} 
                disabled={!newGameForm.name || !newGameForm.consoleId}
                className="w-full py-5 bg-red-600 text-white rounded-[32px] font-black uppercase shadow-xl pro-font text-xl transition-all active:scale-95 disabled:opacity-50"
              >
                AGREGAR AL ESTANTE
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden animate-slideUp relative">
             <button onClick={() => setSelectedGame(null)} className="absolute top-6 right-6 z-20 bg-black/20 p-2 rounded-full text-white backdrop-blur-sm"><X size={24}/></button>
             <div className="aspect-video relative overflow-hidden">
                <img src={selectedGame.coverUrl} className="w-full h-full object-cover blur-2xl opacity-40 absolute inset-0 scale-125" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                   <img src={selectedGame.coverUrl} className="h-full w-auto rounded-lg shadow-2xl border border-white/20" />
                </div>
             </div>
             <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black uppercase pro-font text-gray-900 leading-none">{selectedGame.name}</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{selectedGame.developer} • {selectedGame.year}</p>
                  </div>
                  <button 
                    disabled={!isSelectedGamePlayable}
                    onClick={() => { 
                      if (!isSelectedGamePlayable) return;
                      if(currentUser.role === 'standard') alert("Función VIP");
                      else {
                        window.open(getPlayNowUrl(selectedGame), '_blank');
                      }
                    }}
                    className={`p-4 rounded-[24px] shadow-2xl transition-all ${
                      !isSelectedGamePlayable 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40 grayscale' 
                        : currentUser.role === 'standard' 
                          ? 'bg-gray-100 text-gray-300' 
                          : 'bg-red-600 text-white active:scale-90 shadow-red-200'
                    }`}
                  >
                    {isSelectedGamePlayable ? <PlayCircle size={32}/> : <EyeClosed size={32}/>}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Costo Pago</p>
                      <p className="text-lg font-black pro-font">${selectedGame.costPaid.toLocaleString()}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor Mercado</p>
                      <p className="text-lg font-black pro-font text-blue-600">${selectedGame.marketPrice.toLocaleString()}</p>
                   </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Juego</p>
                   <p className="text-xs font-bold uppercase pro-font">{selectedGame.genre}</p>
                </div>

                {!isSelectedGamePlayable && (
                  <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-tight pro-font">Función Play Now no disponible para este sistema.</p>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pro-font">Evidencia Cartucho</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                       {selectedGame.cartridgeFrontPhoto ? <img src={selectedGame.cartridgeFrontPhoto} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-200" />}
                    </div>
                    <div className={`aspect-square rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 ${currentUser.role === 'standard' ? 'bg-gray-200' : 'bg-gray-50'}`}>
                       {currentUser.role === 'standard' ? <Slash size={24} className="text-red-500" /> : (selectedGame.cartridgeBackPhoto ? <img src={selectedGame.cartridgeBackPhoto} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-200" />)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedGame(null)} className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black uppercase pro-font text-xl shadow-xl">CERRAR DETALLE</button>
             </div>
           </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center animate-slideUp">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
             <h3 className="text-2xl font-black uppercase mb-8 pro-font">¿Eliminar juego?</h3>
             <div className="flex gap-3">
               <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 font-black uppercase text-xs text-gray-400 pro-font">Cancelar</button>
               <button onClick={() => { setCollection(collection.filter(g => g.id !== confirmDelete)); setConfirmDelete(null); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg pro-font">Eliminar</button>
             </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;