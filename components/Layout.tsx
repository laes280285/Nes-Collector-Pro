import React from 'react';
import { Home, Library, PlusCircle, Settings as SettingsIcon, Shield, Trophy } from 'lucide-react';
import { ConsoleId, CONSOLES, Game } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeConsole: ConsoleId | 'all';
  setActiveConsole: (id: ConsoleId | 'all') => void;
  onOpenRegister: () => void;
  hideEmpty: boolean;
  collection: Game[];
  uiScale?: 'min' | 'med' | 'max';
  collectorLevel?: string;
  collectorIcon?: string;
  onOpenAchievements?: () => void;
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
  uiScale = 'med',
  collectorLevel = 'Novato',
  collectorIcon = '',
  onOpenAchievements
}) => {
  const currentConsoleData = CONSOLES.find(c => c.id === activeConsole);
  const themeColor = currentConsoleData?.color || '#dc2626';

  const visibleConsoles = React.useMemo(() => {
    if (!hideEmpty) return CONSOLES;
    const consoleIdsWithGames = new Set(collection.map(g => g.consoleId));
    return CONSOLES.filter(c => consoleIdsWithGames.has(c.id));
  }, [hideEmpty, collection]);

  const paddingScale = uiScale === 'min' ? 'py-3 px-1.5' : uiScale === 'med' ? 'py-6 px-3' : 'py-8 px-5';
  const headerHeight = uiScale === 'min' ? 'h-6' : uiScale === 'med' ? 'h-10' : 'h-14';

  return (
    <div className={`flex flex-col min-h-screen ${uiScale === 'min' ? 'pb-[calc(env(safe-area-inset-bottom)+3.5rem)]' : uiScale === 'max' ? 'pb-[calc(env(safe-area-inset-bottom)+6rem)]' : 'pb-[calc(env(safe-area-inset-bottom)+5rem)]'}`}>
      <header className="sticky top-0 z-50 shadow-sm">
        <div 
          className={`${paddingScale} transition-all duration-300 relative overflow-hidden`} 
          style={{ backgroundColor: (activeConsole === 'all' || activeTab === 'home' || activeTab === 'settings') ? '#0a0a0a' : themeColor }}
        >
          {currentConsoleData?.secondaryColor && (activeConsole !== 'all' && activeTab === 'collection') && (
            <div 
              className="absolute top-0 bottom-0 -right-4 w-32 skew-x-[-30deg] opacity-60 shadow-[0_0_40px_rgba(0,0,0,0.3)] z-0" 
              style={{ backgroundColor: currentConsoleData.secondaryColor }}
            ></div>
          )}
          <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
            <div className={`flex items-center gap-3 ${headerHeight}`}>
              <img 
                src="https://lh3.googleusercontent.com/d/1UFaiz33dmWOocrSre7pXmewkabxMaCoW" 
                alt="Logo" 
                className="h-full w-auto block object-contain brightness-125"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg";
                }}
              />
              <div className="flex flex-col -space-y-0.5">
                 <span className="text-[8px] font-black text-white/60 tracking-[0.4em] leading-none uppercase">Nintendo</span>
                 <div className="flex items-center gap-2">
                    <span className={`pro-font text-white ${uiScale === 'min' ? 'text-xs' : uiScale === 'max' ? 'text-2xl' : 'text-xl'} tracking-[0.1em] leading-none`}>COLLECTOR</span>
                    <div className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/20 backdrop-blur-sm gold-glow">
                       <span className="text-[8px] font-black italic text-white leading-none">PRO</span>
                    </div>
                 </div>
              </div>
            </div>

            <div 
              onClick={onOpenAchievements}
              className="flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-all group"
            >
              <div className={`${uiScale === 'min' ? 'h-6' : uiScale === 'med' ? 'h-10' : 'h-12'} aspect-square flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-white/5 rounded-full blur-md group-hover:bg-white/10 transition-colors"></div>
                {collectorIcon ? (
                  <img src={collectorIcon} alt="Rank" className="h-full w-full object-contain drop-shadow-lg relative z-10" referrerPolicy="no-referrer" />
                ) : (
                  <Shield className="h-full w-auto text-yellow-400 fill-yellow-400 drop-shadow-md relative z-10" />
                )}
              </div>
              <span className="text-[6px] font-black text-white/70 uppercase tracking-tighter leading-none">{collectorLevel}</span>
            </div>
          </div>
        </div>

        {activeTab === 'collection' && (
          <div className={`bg-white border-b border-gray-100 overflow-x-auto no-scrollbar flex gap-1.5 ${uiScale === 'min' ? 'p-1' : 'p-1.5'} animate-fadeIn scroll-smooth`}>
            <button
              onClick={() => setActiveConsole('all')}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-black transition-all border-2 flex items-center justify-center ${uiScale === 'min' ? 'min-w-[40px] h-6' : uiScale === 'max' ? 'min-w-[80px] h-12 text-xs' : 'min-w-[50px] h-8'} ${activeConsole === 'all' ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-50 text-gray-400 hover:bg-gray-50'}`}
            >
              🌎 TODOS
            </button>
            {visibleConsoles.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConsole(c.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-lg transition-all border-2 flex items-center justify-center ${uiScale === 'min' ? 'min-w-[50px] h-7' : uiScale === 'max' ? 'min-w-[100px] h-14' : 'min-w-[70px] h-9'} ${activeConsole === c.id ? 'bg-opacity-10 scale-102 border-gray-950' : 'border-gray-50 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                style={{ 
                  borderColor: activeConsole === c.id ? c.color : '#f9fafb',
                  backgroundColor: activeConsole === c.id ? `${c.color}10` : 'transparent'
                }}
              >
                <img 
                  src={c.logo} 
                  alt={c.name} 
                  className="block object-contain w-auto"
                  style={{ height: uiScale === 'min' ? '18px' : uiScale === 'max' ? '32px' : '24px', maxWidth: '100%' }}
                  loading="eager"
                />
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={`flex-1 max-w-2xl mx-auto w-full ${uiScale === 'min' ? 'p-2' : uiScale === 'max' ? 'p-6' : 'p-4'} overflow-y-auto`}>
        {children}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-[100]`}>
        <div className={`flex justify-around items-center ${uiScale === 'min' ? 'px-4 py-1.5' : uiScale === 'max' ? 'px-8 py-5' : 'px-6 py-3'}`}>
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'home' ? 'text-gray-950 scale-105' : 'text-gray-400'}`}
          >
            <Home size={uiScale === 'min' ? 16 : uiScale === 'max' ? 28 : 22} />
            <span className={`${uiScale === 'min' ? 'text-[7px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black uppercase tracking-widest leading-none`}>Resumen</span>
          </button>
          <button 
            onClick={() => setActiveTab('collection')}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'collection' ? 'text-gray-950 scale-105' : 'text-gray-400'}`}
          >
            <Library size={uiScale === 'min' ? 16 : uiScale === 'max' ? 28 : 22} />
            <span className={`${uiScale === 'min' ? 'text-[7px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black uppercase tracking-widest leading-none`}>Estante</span>
          </button>
          <button 
            onClick={onOpenRegister}
            className={`flex flex-col items-center gap-0.5 text-gray-400 hover:text-red-600 transition-all`}
          >
            <div className={`bg-red-600 rounded-full shadow-lg text-white active:scale-95 transition-transform ${uiScale === 'min' ? 'p-1.5 -mt-6' : uiScale === 'max' ? 'p-4 -mt-12' : 'p-2 -mt-8'}`}>
              <PlusCircle size={uiScale === 'min' ? 20 : uiScale === 'max' ? 40 : 32} strokeWidth={2.5} />
            </div>
            <span className={`${uiScale === 'min' ? 'text-[7px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black uppercase tracking-widest mt-0.5 leading-none`}>Añadir</span>
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'achievements' ? 'text-gray-950 scale-105' : 'text-gray-400'}`}
          >
            <Trophy size={uiScale === 'min' ? 16 : uiScale === 'max' ? 28 : 22} />
            <span className={`${uiScale === 'min' ? 'text-[7px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black uppercase tracking-widest leading-none`}>Logros</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'settings' ? 'text-gray-950 scale-105' : 'text-gray-400'}`}
          >
            <SettingsIcon size={uiScale === 'min' ? 16 : uiScale === 'max' ? 28 : 22} />
            <span className={`${uiScale === 'min' ? 'text-[7px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]'} font-black uppercase tracking-widest leading-none`}>Opciones</span>
          </button>
        </div>
      </nav>
    </div>
  );
};