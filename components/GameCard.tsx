import React from 'react';
import { Trash2, Edit2, Gamepad2, Slash } from 'lucide-react';
import { Game, ViewMode, User } from '../types';

interface GameCardProps {
  game: Game;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
  onSelect: (game: Game) => void;
  consoleColor?: string;
  currentUser: User;
}

export const GameCard: React.FC<GameCardProps> = ({ game, viewMode, onDelete, onEdit, onSelect, consoleColor, currentUser }) => {
  const isVip = currentUser.role !== 'standard';

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onSelect(game)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-4 animate-fadeIn group cursor-pointer active:scale-98 transition-transform"
      >
        <div 
          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2"
          style={{ borderColor: consoleColor || '#f3f4f6' }}
        >
          <img 
            src={game.coverUrl} 
            alt={game.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight">{game.name}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{game.year} • {game.developer}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={() => onDelete(game.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onSelect(game)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group animate-fadeIn transition-transform active:scale-95 cursor-pointer"
    >
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