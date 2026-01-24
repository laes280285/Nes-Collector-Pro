
import React from 'react';
import { Trash2, Edit2, Calendar, User, Tag } from 'lucide-react';
import { Game, ViewMode } from '../types';

interface GameCardProps {
  game: Game;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, viewMode, onDelete, onEdit }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
          <img 
            src={game.coverUrl || `https://picsum.photos/seed/${game.id}/200`} 
            alt={game.name} 
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/nes/200')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{game.name}</h3>
          <p className="text-xs text-gray-500 truncate">{game.developer} • {game.year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(game)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(game.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group animate-fadeIn">
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        <img 
          src={game.coverUrl || `https://picsum.photos/seed/${game.id}/400`} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
          <div className="flex justify-between items-center text-white">
            <button onClick={() => onEdit(game)} className="p-1 hover:text-blue-400"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(game.id)} className="p-1 hover:text-red-400"><Trash2 size={16}/></button>
          </div>
        </div>
      </div>
      <div className="p-2">
        <h3 className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">{game.name}</h3>
        <p className="text-[10px] text-gray-500 truncate">{game.year}</p>
      </div>
    </div>
  );
};
