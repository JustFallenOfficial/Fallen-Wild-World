import React from 'react';
import { useGameStore } from '../store';
import { User, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function HUD() {
  const { health, hunger, inventory, gameMode, timeOfDay, setMenuState, settings } = useGameStore();

  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between font-sans">
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      
      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-start p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
        
        {/* Left: Stats */}
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-40 h-4 bg-gray-900 rounded-full border border-white/20 overflow-hidden">
                <div 
                  className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all" 
                  style={{ width: `${health}%` }} 
                />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">Vitality</span>
            </div>
            
            {gameMode === 'survival' && (
              <div className="flex items-center gap-2">
                <div className="w-40 h-4 bg-gray-900 rounded-full border border-white/20 overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all" 
                    style={{ width: `${hunger}%` }} 
                  />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-widest">Hunger</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Time */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-4 border border-white/10 rounded-xl text-center shadow-lg">
          <div className="text-xl font-light text-white tracking-[0.3em]">{formatTime(timeOfDay)}</div>
          <div className="text-[10px] text-orange-200 uppercase tracking-widest mt-1">Clear Skies • Day 12</div>
        </div>

        {/* Right: Actions / Info */}
        <div className="flex gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-green-400 font-mono tracking-tighter">
              FPS: {settings.fpsLimit === 0 ? 'UNL/144' : settings.fpsLimit} • VSYNC: {settings.vsync ? 'ON' : 'OFF'}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest mr-2">{useGameStore(s => s.character.name)}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: useGameStore(s => s.character.shirtColor) }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: useGameStore(s => s.character.skinColor) }} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs shadow-sm">
                <Users size={14} />
              </div>
              <button 
                onClick={() => setMenuState('settings')}
                className="w-8 h-8 cursor-pointer hover:bg-white/20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs shadow-sm transition-colors"
                title="Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 p-8 flex flex-col items-center gap-6 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white/80 text-[10px] tracking-widest uppercase flex gap-4 font-bold shadow-lg">
          <span>[WASD] Move</span>
          <span>[Space] Jump</span>
          <span>[LMB] Use</span>
          <span>[F] Freeze</span>
          <span>[E] Inv/Craft</span>
        </div>

        <div className="flex gap-2 bg-black/80 p-2 rounded-xl border border-white/10 shadow-2xl">
          {useGameStore(s => s.hotbar).map((item, i) => {
            const isSelected = i === useGameStore(s => s.selectedSlot); 
            const eIcon = item === 'log' ? '🪵' : item === 'plank' ? '🪚' : item === 'stone' ? '🪨' : item === 'leaf' ? '🌿' : item === 'apple' ? '🍎' : item === 'stick' ? '🦯' : '📦';
            return (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                key={i} 
                className={`w-14 h-14 rounded border flex flex-col items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-white/10 border-white/20 ring-2 ring-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.4)]' 
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="text-2xl drop-shadow-md">
                  {eIcon}
                </div>
                <span className="text-[9px] text-white/40 mt-1 uppercase font-bold">{i + 1}</span>
                <span className="absolute top-1 right-1.5 text-[9px] text-white/60 font-mono font-bold">
                  {gameMode === 'creative' ? '∞' : inventory[item] || 0}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
