import React from 'react';
import { Trash2, Edit2, Gamepad2, Slash, Calendar, DollarSign, TrendingUp, Check } from 'lucide-react';
import { Game, ViewMode, User } from '../types';

interface GameCardProps {
  game: Game;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
  onSelect: (game: Game) => void;
  consoleColor?: string;
  currentUser: User;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  game, viewMode, onDelete, onEdit, onSelect, consoleColor, currentUser,
  isEditMode, isSelected, onToggleSelect
}) => {
  const isVip = currentUser.role !== 'standard';

  const handleCardClick = () => {
    if (isEditMode && onToggleSelect) {
      onToggleSelect(game.id);
    } else {
      onSelect(game);
    }
  };

  if (viewMode === 'list') {
    const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
      <div 
        onClick={handleCardClick}
        className={`bg-white rounded-2xl shadow-sm border p-3 flex items-center gap-4 animate-fadeIn group cursor-pointer active:scale-98 transition-all hover:shadow-md ${isSelected ? 'border-red-500 bg-red-50/30' : 'border-gray-100'}`}
      >
        {isEditMode && (
          <div className="flex-shrink-0">
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 border-red-600' : 'bg-gray-50 border-gray-200'}`}>
              {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
          </div>
        )}
        <div 
          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 shadow-inner"
          style={{ borderColor: consoleColor || '#f3f4f6' }}
        >
          <img 
            src={game.coverUrl} 
            alt={game.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight">{game.name}</h3>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-tighter whitespace-nowrap">
              {game.year}
            </span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate mb-1">{game.developer}</p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
              <Calendar size={10} className="text-gray-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase">{formatDate(game.dateAdded)}</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
              <DollarSign size={10} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-600">${game.costPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
              <TrendingUp size={10} className="text-blue-500" />
              <span className="text-[9px] font-black text-blue-600">${game.marketPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {!isEditMode && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => onDelete(game.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden relative group animate-fadeIn transition-transform active:scale-95 cursor-pointer ${isSelected ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-100'}`}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 border-red-600 shadow-lg' : 'bg-white/80 backdrop-blur-sm border-gray-200'}`}>
            {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
          </div>
        </div>
      )}
      <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
        <img 
          src={game.coverUrl} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
           <Gamepad2 size={10} className="text-white" />
        </div>
      </div>
      <div className="p-2 pb-3">
        <h3 className="text-[10px] font-black text-gray-800 line-clamp-2 leading-tight uppercase tracking-tighter h-6">{game.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[8px] font-black text-gray-400 uppercase">{game.year}</span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: consoleColor }}></div>
        </div>
      </div>
    </div>
  );
};
