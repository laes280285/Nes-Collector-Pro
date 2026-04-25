import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit2, Gamepad2, Slash, Calendar, DollarSign, TrendingUp, Check, Sparkles } from 'lucide-react';
import { Game, ViewMode } from '../types';

interface GameCardProps {
  game: Game;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
  onSelect: (game: Game) => void;
  consoleColor?: string;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  uiScale?: 'min' | 'med' | 'max';
  isJustAdded?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  game, viewMode, onDelete, onEdit, onSelect, consoleColor,
  isEditMode, isSelected, onToggleSelect, uiScale = 'med',
  isJustAdded = false
}) => {
  const handleCardClick = () => {
    if (isEditMode && onToggleSelect) {
      onToggleSelect(game.id);
    } else {
      onSelect(game);
    }
  };

  const textBase = uiScale === 'min' ? 'text-[8px]' : uiScale === 'max' ? 'text-lg' : 'text-sm';
  const labelBase = uiScale === 'min' ? 'text-[6px]' : uiScale === 'max' ? 'text-[11px]' : 'text-[9px]';
  const headerText = uiScale === 'min' ? 'text-[9px]' : uiScale === 'max' ? 'text-sm' : 'text-xs';

  if (viewMode === 'list') {
    const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.4 }}
        onClick={handleCardClick}
        className={`bg-white rounded-xl shadow-sm border ${uiScale === 'min' ? 'p-1.5 gap-2' : uiScale === 'max' ? 'p-6 gap-6' : 'p-2 gap-3'} flex items-center animate-fadeIn group cursor-pointer active:scale-99 transition-all hover:shadow-md ${isSelected ? 'border-red-500 bg-red-50/20' : 'border-gray-50'}`}
      >
        {isEditMode && (
          <div className="flex-shrink-0">
            <div className={`${uiScale === 'min' ? 'w-4 h-4' : uiScale === 'max' ? 'w-8 h-8' : 'w-5 h-5'} rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 border-red-600' : 'bg-gray-50 border-gray-200'}`}>
              {isSelected && <Check size={uiScale === 'min' ? 10 : uiScale === 'max' ? 18 : 12} className="text-white" strokeWidth={4} />}
            </div>
          </div>
        )}
        <div 
          className={`${uiScale === 'min' ? 'w-10 h-10' : uiScale === 'max' ? 'w-24 h-24' : 'w-12 h-12'} rounded-lg overflow-hidden flex-shrink-0 border shadow-inner`}
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
            <h3 className={`font-black text-gray-900 truncate uppercase ${headerText} tracking-tight`}>{game.name}</h3>
            <span className={`${uiScale === 'min' ? 'text-[6px]' : 'text-[8px]'} font-black px-1 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-tighter whitespace-nowrap retro-data`}>
              {game.year}
            </span>
          </div>
          <p className={`${labelBase} font-bold text-gray-400 uppercase tracking-widest truncate mb-1`}>{game.developer}</p>
          
          <div className={`flex items-center ${uiScale === 'min' ? 'gap-1' : 'gap-2'}`}>
            <div className="flex items-center gap-1 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
              <Calendar size={uiScale === 'min' ? 7 : uiScale === 'max' ? 14 : 10} className="text-gray-400" />
              <span className={`${uiScale === 'min' ? 'text-[7px]' : 'text-[9px]'} font-black text-gray-500 uppercase retro-data`}>{formatDate(game.dateAdded)}</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
              <DollarSign size={uiScale === 'min' ? 7 : uiScale === 'max' ? 14 : 10} className="text-emerald-500" />
              <span className={`${uiScale === 'min' ? 'text-[7px]' : 'text-[9px]'} font-black text-emerald-600 retro-data`}>${game.costPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
              <TrendingUp size={uiScale === 'min' ? 7 : uiScale === 'max' ? 14 : 10} className="text-blue-500" />
              <span className={`${uiScale === 'min' ? 'text-[7px]' : 'text-[9px]'} font-black text-blue-600 retro-data`}>${game.marketPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {!isEditMode && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(game.id); }} className={`p-2 text-gray-300 hover:text-red-500 transition-colors ${uiScale === 'min' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><Trash2 size={uiScale === 'min' ? 14 : uiScale === 'max' ? 24 : 16} /></button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 20, mass: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group transition-transform active:scale-98 cursor-pointer ${isSelected ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-50'}`}
    >
      <AnimatePresence>
        {isJustAdded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-visible"
          >
            <div className="relative w-full h-full">
              {/* HUMO / DUST */}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-white/60 blur-xl rounded-full"
              />
              
              {/* ESTRELLAS Y LÍNEAS DE IMPACTO */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ 
                    x: Math.cos(i * 60 * Math.PI / 180) * 80,
                    y: Math.sin(i * 60 * Math.PI / 180) * 80,
                    scale: [1, 1.2, 0],
                    rotate: 180,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="text-yellow-400 drop-shadow-md">
                    <Sparkles size={16} fill="currentColor" />
                  </div>
                  <div className="w-0.5 h-6 bg-white/40 blur-[0.5px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center" 
                    style={{ transform: `rotate(${i * 60}deg) translateY(-20px)` }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isEditMode && (
        <div className={`absolute ${uiScale === 'min' ? 'top-1 right-1' : 'top-2 right-2'} z-10`}>
          <div className={`${uiScale === 'min' ? 'w-4 h-4' : uiScale === 'max' ? 'w-8 h-8' : 'w-5 h-5'} rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 border-red-600 shadow-lg' : 'bg-white/90 backdrop-blur-sm border-gray-100'}`}>
            {isSelected && <Check size={uiScale === 'min' ? 10 : uiScale === 'max' ? 18 : 12} className="text-white" strokeWidth={4} />}
          </div>
        </div>
      )}
      <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
        <img 
          src={game.coverUrl} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
        <div className={`absolute ${uiScale === 'min' ? 'top-1 left-1 px-0.5' : 'top-1.5 left-1.5 px-1'} rounded bg-black/40 backdrop-blur-sm`}>
           <Gamepad2 size={uiScale === 'min' ? 6 : uiScale === 'max' ? 12 : 8} className="text-white" />
        </div>
      </div>
      <div className={`${uiScale === 'min' ? 'p-1 pb-1.5' : uiScale === 'max' ? 'p-4 pb-5' : 'p-1.5 pb-2'}`}>
        <h3 className={`${uiScale === 'min' ? 'text-[7.5px]' : uiScale === 'max' ? 'text-[12px]' : 'text-[9px]'} font-black text-gray-800 line-clamp-2 leading-tight uppercase tracking-tighter ${uiScale === 'min' ? 'h-4' : uiScale === 'max' ? 'h-7' : 'h-5'}`}>{game.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className={`${uiScale === 'min' ? 'text-[6px]' : uiScale === 'max' ? 'text-[10px]' : 'text-[7px]'} font-black text-gray-400 uppercase retro-data`}>{game.year}</span>
          <div className={`${uiScale === 'min' ? 'w-1 h-1' : uiScale === 'max' ? 'w-3 h-3' : 'w-1.5 h-1.5'} rounded-full`} style={{ backgroundColor: consoleColor }}></div>
        </div>
      </div>
    </motion.div>
  );
};
