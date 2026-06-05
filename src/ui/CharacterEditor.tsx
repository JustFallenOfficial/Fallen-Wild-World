import React, { useState } from 'react';
import { useGameStore } from '../store';
import { User, Palette } from 'lucide-react';
import { motion } from 'motion/react';

export function CharacterEditor() {
  const { character, updateCharacter, setMenuState } = useGameStore();
  const [name, setName] = useState(character.name || '');
  const [skinColor, setSkinColor] = useState(character.skinColor || '#f1c27d');
  const [shirtColor, setShirtColor] = useState(character.shirtColor || '#4ade80');

  const handleSave = () => {
    updateCharacter({ name: name || 'Survivor', skinColor, shirtColor });
    setMenuState('main');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-xl"
    >
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-10 rounded-2xl w-full max-w-md text-white shadow-2xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-emerald-400 flex justify-center items-center gap-3">
            <User className="w-6 h-6" /> Character Editor
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2"></div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-2xl border-2 border-white/10 flex flex-col relative overflow-hidden shadow-2xl bg-white/5">
              <div className="w-16 h-16 rounded-full mx-auto mt-4 z-10 transition-colors duration-300" style={{ backgroundColor: skinColor }}></div>
              <div className="w-24 h-20 mx-auto mt-1 rounded-t-3xl transition-colors duration-300" style={{ backgroundColor: shirtColor }}></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs uppercase tracking-widest text-white/50">Character Name</label>
             <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter survivor name..." 
                className="bg-black/40 border border-white/20 rounded-lg p-4 text-white font-bold outline-none focus:border-emerald-400 transition-colors uppercase tracking-widest text-sm"
             />
          </div>

          <div className="flex gap-4">
             <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Skin Tone
                </label>
                <input 
                  type="color" 
                  value={skinColor} 
                  onChange={(e) => setSkinColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer bg-black flex-1 border border-white/20"
                />
             </div>
             <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Shirt Color
                </label>
                <input 
                  type="color" 
                  value={shirtColor} 
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer bg-black flex-1 border border-white/20"
                />
             </div>
          </div>
        </div>

        <button
          className="mt-4 bg-emerald-500 text-black py-4 rounded-xl font-black hover:bg-emerald-400 transition-all uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(52,211,153,0.4)]"
          onClick={handleSave}
        >
          Confirm Identity
        </button>
      </div>
    </motion.div>
  );
}
