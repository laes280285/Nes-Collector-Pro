
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { Game, ViewMode, GroupBy, AppSettings, UrgentItem } from './types';
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
  Library
} from 'lucide-react';

const STORAGE_KEY = 'nes_collection_v1';
const URGENT_KEY = 'nes_urgent_list';
const SETTINGS_KEY = 'nes_app_settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [collection, setCollection] = useState<Game[]>([]);
  const [urgentList, setUrgentList] = useState<UrgentItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    viewMode: 'icon',
    columns: 3,
    groupBy: 'none'
  });

  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [newGameForm, setNewGameForm] = useState<Partial<Game>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [newUrgentTitle, setNewUrgentTitle] = useState('');

  const frontPhotoRef = useRef<HTMLInputElement>(null);
  const backPhotoRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCollection(JSON.parse(saved));

    const savedUrgent = localStorage.getItem(URGENT_KEY);
    if (savedUrgent) setUrgentList(JSON.parse(savedUrgent));

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
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

  // Handlers
  const handleFetchMetadata = async () => {
    if (!searchName.trim()) return;
    setIsSearching(true);
    const data = await fetchGameMetadata(searchName);
    if (data) {
      setNewGameForm({
        ...newGameForm,
        name: data.name || searchName,
        developer: data.developer,
        year: data.year,
        genre: data.genre,
        coverUrl: data.coverUrl
      });
    }
    setIsSearching(false);
  };

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setNewGameForm({ ...newGameForm, cartridgeFrontPhoto: reader.result as string });
        } else {
          setNewGameForm({ ...newGameForm, cartridgeBackPhoto: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGame = () => {
    if (!newGameForm.name) return;
    
    const game: Game = {
      id: crypto.randomUUID(),
      name: newGameForm.name,
      developer: newGameForm.developer || 'Unknown',
      year: newGameForm.year || 'Unknown',
      genre: newGameForm.genre || 'Unknown',
      coverUrl: newGameForm.coverUrl || '',
      cartridgeFrontPhoto: newGameForm.cartridgeFrontPhoto,
      cartridgeBackPhoto: newGameForm.cartridgeBackPhoto,
      dateAdded: Date.now(),
    };

    setCollection([game, ...collection]);
    setNewGameForm({});
    setSearchName('');
    setActiveTab('home');
  };

  const handleUpdateGame = () => {
    if (!editGame) return;
    setCollection(collection.map(g => g.id === editGame.id ? editGame : g));
    setEditGame(null);
  };

  const deleteGame = (id: string) => {
    setCollection(collection.filter(g => g.id !== id));
    setConfirmDelete(null);
  };

  const addUrgentItem = () => {
    if (newUrgentTitle.trim() && urgentList.length < 10) {
      setUrgentList([...urgentList, { id: crypto.randomUUID(), title: newUrgentTitle.trim() }]);
      setNewUrgentTitle('');
    }
  };

  const removeUrgentItem = (id: string) => {
    setUrgentList(urgentList.filter(item => item.id !== id));
  };

  const getGroupedCollection = (): Record<string, Game[]> => {
    if (settings.groupBy === 'none') return { "Todos": collection };
    
    return collection.reduce((acc, game) => {
      const key = game[settings.groupBy as keyof Game] as string || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(game);
      return acc;
    }, {} as Record<string, Game[]>);
  };

  const grouped = getGroupedCollection();

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-sm nes-font mb-4">MI ESTADO</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-black">{collection.length}</p>
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Juegos en total</p>
          </div>
          <Library size={48} className="opacity-20" />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ChevronRight className="text-red-600" size={20} />
            Recientes
          </h2>
          <button onClick={() => setActiveTab('collection')} className="text-xs text-blue-600 font-bold">Ver todos</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {collection.slice(0, 4).map(game => (
            <div key={game.id} className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex gap-3 items-center">
              <img src={game.coverUrl} className="w-12 h-12 rounded bg-gray-100 object-cover" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{game.name}</p>
                <p className="text-[10px] text-gray-400">{game.year}</p>
              </div>
            </div>
          ))}
          {collection.length === 0 && (
            <div className="col-span-2 text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No hay juegos registrados</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
            Lista Urgente
          </h2>
          <button onClick={() => setShowUrgentModal(true)} className="text-xs text-blue-600 font-bold">Gestionar</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y overflow-hidden">
          {urgentList.length > 0 ? urgentList.slice(0, 10).map((item, idx) => (
            <div key={item.id} className="p-3 flex items-center gap-3">
              <span className="text-red-600 font-bold text-xs">{idx + 1}.</span>
              <p className="text-sm font-medium text-gray-700">{item.title}</p>
            </div>
          )) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400 italic">No tienes juegos en tu lista de deseos.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderCollection = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
        <h2 className="font-bold text-gray-800">Toda la Colección</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setSettings({ ...settings, viewMode: 'icon' })}
            className={`p-2 rounded ${settings.viewMode === 'icon' ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
          >
            <Library size={20} />
          </button>
          <button 
            onClick={() => setSettings({ ...settings, viewMode: 'list' })}
            className={`p-2 rounded ${settings.viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {(Object.entries(grouped) as [string, Game[]][]).map(([groupName, games]) => (
        <div key={groupName} className="space-y-3">
          {settings.groupBy !== 'none' && (
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1 mt-4">{groupName} ({games.length})</h3>
          )}
          <div className={
            settings.viewMode === 'list' 
              ? "space-y-3" 
              : `grid gap-3 grid-cols-${settings.columns}`
          }>
            {games.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                viewMode={settings.viewMode} 
                onDelete={(id) => setConfirmDelete(id)}
                onEdit={(g) => setEditGame(g)}
              />
            ))}
          </div>
        </div>
      ))}

      {collection.length === 0 && (
        <div className="text-center py-20">
          <Library size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Tu estante está vacío</p>
          <button onClick={() => setActiveTab('register')} className="mt-4 text-red-600 font-bold underline">Empieza a coleccionar</button>
        </div>
      )}
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Registrar Cartucho</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Juego</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Ej: Super Mario Bros 3"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
              <button 
                onClick={handleFetchMetadata}
                disabled={isSearching}
                className="bg-blue-600 text-white px-4 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[16/9] bg-gray-50 border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
              {newGameForm.coverUrl ? (
                <img src={newGameForm.coverUrl} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <Library size={32} className="text-gray-300 mb-2" />
                  <span className="text-[10px] font-bold text-gray-400 text-center px-2">PORTADA AUTO (BOX ART)</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => frontPhotoRef.current?.click()}
                className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
              >
                {newGameForm.cartridgeFrontPhoto ? (
                  <img src={newGameForm.cartridgeFrontPhoto} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={32} className="text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold text-gray-400 text-center px-2 uppercase">Frente Cartucho</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={frontPhotoRef} 
                  onChange={(e) => handleCapturePhoto(e, 'front')} 
                  className="hidden" 
                />
              </div>

              <div 
                onClick={() => backPhotoRef.current?.click()}
                className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
              >
                {newGameForm.cartridgeBackPhoto ? (
                  <img src={newGameForm.cartridgeBackPhoto} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={32} className="text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold text-gray-400 text-center px-2 uppercase">Atrás Cartucho</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={backPhotoRef} 
                  onChange={(e) => handleCapturePhoto(e, 'back')} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Desarrollador" 
                value={newGameForm.developer || ''}
                onChange={e => setNewGameForm({...newGameForm, developer: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
              <input 
                type="text" 
                placeholder="Año" 
                value={newGameForm.year || ''}
                onChange={e => setNewGameForm({...newGameForm, year: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <input 
              type="text" 
              placeholder="Género" 
              value={newGameForm.genre || ''}
              onChange={e => setNewGameForm({...newGameForm, genre: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          <button 
            onClick={handleSaveGame}
            disabled={!newGameForm.name}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Save size={20} />
            GUARDAR EN COLECCIÓN
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Ajustes de Vista</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-3">Estilo de Cuadrícula (Columnas)</label>
            <div className="flex justify-between bg-gray-50 p-1 rounded-xl">
              {[3, 4, 5, 6].map(num => (
                <button 
                  key={num}
                  onClick={() => setSettings({ ...settings, columns: num })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm ${settings.columns === num ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-3">Agrupar por</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'Ninguno' },
                { id: 'genre', label: 'Género' },
                { id: 'year', label: 'Año' },
                { id: 'developer', label: 'Desarrollador' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setSettings({ ...settings, groupBy: opt.id as GroupBy })}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${settings.groupBy === opt.id ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'collection' && renderCollection()}
      {activeTab === 'register' && renderRegister()}
      {activeTab === 'settings' && renderSettings()}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Eliminar juego?</h3>
            <p className="text-gray-500 mb-6">Esta acción no se puede deshacer de tu colección.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">Cancelar</button>
              <button onClick={() => deleteGame(confirmDelete)} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {editGame && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Editar Juego</h3>
              <button onClick={() => setEditGame(null)}><X /></button>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full p-3 bg-gray-50 border rounded-xl"
                value={editGame.name}
                onChange={e => setEditGame({...editGame, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
                  value={editGame.developer}
                  placeholder="Desarrollador"
                  onChange={e => setEditGame({...editGame, developer: e.target.value})}
                />
                <input 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
                  value={editGame.year}
                  placeholder="Año"
                  onChange={e => setEditGame({...editGame, year: e.target.value})}
                />
              </div>
              <input 
                className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
                value={editGame.genre}
                placeholder="Género"
                onChange={e => setEditGame({...editGame, genre: e.target.value})}
              />
              <button onClick={handleUpdateGame} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Actualizar</button>
            </div>
          </div>
        </div>
      )}

      {showUrgentModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Lista Urgente</h3>
              <button onClick={() => setShowUrgentModal(false)}><X /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newUrgentTitle}
                onChange={e => setNewUrgentTitle(e.target.value)}
                placeholder="Título deseado..."
                disabled={urgentList.length >= 10}
                className="flex-1 px-4 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              <button 
                onClick={addUrgentItem}
                className="bg-yellow-500 text-white p-2 rounded-xl"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {urgentList.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium">{item.title}</span>
                  <button onClick={() => removeUrgentItem(item.id)} className="text-red-400"><Trash2 size={18} /></button>
                </div>
              ))}
              {urgentList.length >= 10 && <p className="text-[10px] text-center text-red-500 font-bold">Límite de 10 juegos alcanzado</p>}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
