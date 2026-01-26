
import React from 'react';
import { Trash2, Edit2, Gamepad2 } from 'lucide-react';
import { Game, ViewMode } from '../types';

interface GameCardProps {
  game: Game;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
  onSelect: (game: Game) => void;
  consoleColor?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ game, viewMode, onDelete, onEdit, onSelect, consoleColor }) => {
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
            src={game.coverUrl || `https://picsum.photos/seed/${game.id}/200`} 
            alt={game.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight">{game.name}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{game.year} • {game.developer}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(game)} className="p-2 text-gray-400 hover:text-blue-500"><Edit2 size={18} /></button>
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
          src={game.coverUrl || `https://picsum.photos/seed/${game.id}/400`} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
           <Gamepad2 size={10} className="text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center text-white">
            <button onClick={() => onEdit(game)} className="p-2 bg-white/10 rounded-full hover:bg-blue-500/80 transition-colors"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(game.id)} className="p-2 bg-white/10 rounded-full hover:bg-red-500/80 transition-colors"><Trash2 size={16}/></button>
          </div>
        </div>
      </div>
      <div className="p-2 pb-3">
        <h3 className="text-[10px] font-black text-gray-800 line-clamp-2 leading-tight uppercase tracking-tighter h-6">{game.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[8px] font-black text-gray-400 uppercase">{game.year}</span>
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: consoleColor }}
          ></div>
        </div>
      </div>
    </div>
  );
};
