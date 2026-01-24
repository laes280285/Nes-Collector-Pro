
import React from 'react';
import { Home, Library, PlusCircle, Settings as SettingsIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="bg-red-600 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-lg font-bold nes-font tracking-tighter text-xs">NES COLLECTOR</h1>
          <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-400 flex items-center justify-center">
            <span className="text-[10px] font-bold">PRO</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-red-600' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('collection')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'collection' ? 'text-red-600' : 'text-gray-500'}`}
        >
          <Library size={24} />
          <span className="text-xs font-medium">Colección</span>
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'register' ? 'text-red-600' : 'text-gray-500'}`}
        >
          <PlusCircle size={32} strokeWidth={2.5} className="-mt-6 bg-white rounded-full" />
          <span className="text-xs font-medium">Registrar</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-red-600' : 'text-gray-500'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-xs font-medium">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};
