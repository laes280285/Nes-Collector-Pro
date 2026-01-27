import React from 'react';
import { Home, Library, PlusCircle, Settings as SettingsIcon, Users } from 'lucide-react';
import { ConsoleId, CONSOLES, Game, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeConsole: ConsoleId | 'all';
  setActiveConsole: (id: ConsoleId | 'all') => void;
  onOpenRegister: () => void;
  hideEmpty: boolean;
  collection: Game[];
  currentUser: User | null;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  activeConsole, 
  setActiveConsole,
  onOpenRegister,
  hideEmpty,
  collection,
  currentUser
}) => {
  const currentConsoleData = CONSOLES.find(c => c.id === activeConsole);
  const themeColor = currentConsoleData?.color || '#dc2626';

  const visibleConsoles = React.useMemo(() => {
    if (!hideEmpty) return CONSOLES;
    const consoleIdsWithGames = new Set(collection.map(g => g.consoleId));
    return CONSOLES.filter(c => consoleIdsWithGames.has(c.id));
  }, [hideEmpty, collection]);

  const noTextConsoles: ConsoleId[] = ['nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch', 'switch2'];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 z-50 shadow-md">
        <div 
          className="p-4 transition-colors duration-300" 
          style={{ backgroundColor: (activeConsole === 'all' || activeTab === 'home' || activeTab === 'admin' || activeTab === 'settings') ? '#1f2937' : themeColor }}
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center h-10">
              <img 
                src="logo.png" 
                alt="Nintendo Collector" 
                className="h-full w-auto object-contain brightness-110 drop-shadow-md"
              />
            </div>
            <div className="flex items-center gap-2">
               {currentUser?.role === 'standard' ? (
                 <div className="bg-gray-400/50 px-2 py-0.5 rounded border border-white/30 backdrop-blur-sm">
                   <span className="text-[10px] font-black text-white italic">ESTANDAR</span>
                 </div>
               ) : (
                 <div className="gold-glow px-2 py-0.5 rounded border border-yellow-500/50 backdrop-blur-sm">
                   <span className="text-[10px] font-black italic">PRO</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {activeTab === 'collection' && (
          <div className="bg-white border-b border-gray-200 overflow-x-auto no-scrollbar flex gap-1 p-2 animate-fadeIn">
            <button
              onClick={() => setActiveConsole('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${activeConsole === 'all' ? 'border-gray-800 bg-gray-800 text-white shadow-inner' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
            >
              🏠 TODO
            </button>
            {visibleConsoles.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConsole(c.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 flex items-center gap-2 ${activeConsole === c.id ? 'bg-opacity-10 shadow-sm' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                style={{ 
                  borderColor: activeConsole === c.id ? c.color : '#f3f4f6',
                  color: activeConsole === c.id ? c.color : undefined,
                  backgroundColor: activeConsole === c.id ? `${c.color}20` : undefined
                }}
              >
                <img src={c.logo} alt={c.name} className={`${noTextConsoles.includes(c.id) ? 'h-5' : 'h-3'} w-auto object-contain`} />
                {!noTextConsoles.includes(c.id) && c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-gray-900 scale-110' : 'text-gray-400'}`}
        >
          <Home size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Resumen</span>
        </button>
        <button 
          onClick={() => setActiveTab('collection')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'collection' ? 'text-gray-900 scale-110' : 'text-gray-400'}`}
        >
          <Library size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Estante</span>
        </button>
        <button 
          onClick={onOpenRegister}
          className={`flex flex-col items-center gap-1 text-gray-400 hover:text-red-600 transition-all`}
        >
          <div className="bg-red-600 p-2 rounded-full shadow-lg -mt-8 text-white active:scale-90 transition-transform">
            <PlusCircle size={32} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Añadir</span>
        </button>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'text-gray-900 scale-110' : 'text-gray-400'}`}
          >
            <Users size={22} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-gray-900 scale-110' : 'text-gray-400'}`}
        >
          <SettingsIcon size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Opciones</span>
        </button>
      </nav>
    </div>
  );
};