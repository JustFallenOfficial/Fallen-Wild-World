import React from 'react';
import { useGameStore } from '../store';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

const RECIPES = [
  { output: 'plank', outAmount: 4, input: 'log', inAmount: 1, name: 'Wood Planks', icon: '🪚' },
  { output: 'stone_brick', outAmount: 1, input: 'stone', inAmount: 2, name: 'Stone Brick', icon: '🧱' },
  { output: 'ladder', outAmount: 3, input: 'stick', inAmount: 7, name: 'Ladder', icon: '🪜' },
];

export function InventoryMenu() {
  const { inventory, gameMode, setMenuState, addToInventory, removeFromInventory, updateSettings, settings } = useGameStore();

  const handleCraft = (recipe: typeof RECIPES[0]) => {
    if (gameMode === 'creative') {
      addToInventory(recipe.output, recipe.outAmount);
      return;
    }
    if ((inventory[recipe.input] || 0) >= recipe.inAmount) {
      removeFromInventory(recipe.input, recipe.inAmount);
      addToInventory(recipe.output, recipe.outAmount);
    }
  };

  const getEmoji = (item: string) => {
    return item === 'log' ? '🪵' : item === 'plank' ? '🪚' : item === 'stone' ? '🪨' : item === 'leaf' ? '🌿' : item === 'apple' ? '🍎' : item === 'stick' ? '🦯' : '🔨';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-auto z-40 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-[800px] h-[450px] bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 flex shadow-2xl overflow-hidden relative"
      >
        <button 
          className="absolute top-4 right-4 z-10 text-white/50 hover:text-white"
          onClick={() => setMenuState('playing')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Workbench Side */}
        <div className="w-64 border-r border-white/10 p-6 flex flex-col gap-4">
          <h2 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/20 pb-2">
            Workbench
          </h2>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2">
            {RECIPES.map(r => {
              const canCraft = gameMode === 'creative' || (inventory[r.input] || 0) >= r.inAmount;
              return (
                <div 
                  key={r.output}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    canCraft 
                      ? 'bg-white/10 border-white/20 cursor-pointer ring-2 ring-orange-400/50 hover:bg-white/20' 
                      : 'bg-black/20 border-white/5 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => canCraft && handleCraft(r)}
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center text-white text-xl ${
                    r.output === 'plank' ? 'bg-[#5d4037]' : r.output === 'stone_brick' ? 'bg-[#90a4ae]' : 'bg-[#ffd54f]'
                  }`}>
                    {r.icon}
                  </div>
                  <div className="text-xs text-white">
                    <div className="font-bold uppercase">{r.name}</div>
                    <div className="opacity-60">{r.inAmount}x {r.input} &rarr; {r.outAmount}x {r.output}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Side */}
        <div className="flex-grow p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold uppercase tracking-widest text-sm">Materials Inventory</h2>
            {gameMode === 'creative' && (
              <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-bold uppercase">
                Creative Mode: Active
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-6 gap-3">
            {['log', 'plank', 'stone', 'leaf', 'apple', 'stick'].map((item, i) => (
              <div 
                key={item} 
                className={`aspect-square border rounded flex flex-col items-center justify-center relative bg-white/5 border-white/10 ${i === 3 ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="text-2xl">{getEmoji(item)}</div>
                <span className="absolute bottom-1 right-1 text-[10px] text-white/60 font-mono font-bold">
                  {gameMode === 'creative' ? '∞' : (inventory[item] || 0)}
                </span>
                <span className="absolute top-1 text-[8px] text-white/30 uppercase tracking-widest">{item}</span>
              </div>
            ))}
            {/* Empty slots */}
            {[...Array(6)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-white/5 border border-white/10 rounded"></div>
            ))}
          </div>

          <div className="mt-auto flex justify-between items-end bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col gap-3 w-1/2">
              <div className="text-[10px] text-white/60 uppercase tracking-widest">Color Saturation</div>
              <input 
                type="range" 
                min="0" max="200" 
                value={settings.saturation}
                onChange={(e) => updateSettings({ saturation: Number(e.target.value) })}
                className="w-full accent-orange-400 h-1 bg-white/20 rounded-full appearance-none outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateSettings({ shadows: !settings.shadows })}>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Dynamic Shadows</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.shadows ? 'bg-orange-400' : 'bg-gray-600'}`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.shadows ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateSettings({ ambientLight: !settings.ambientLight })}>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Ambient Light</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.ambientLight ? 'bg-orange-400' : 'bg-gray-600'}`}>
                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.ambientLight ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
