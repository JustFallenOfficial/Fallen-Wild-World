import React, { useState } from 'react';
import { useGameStore } from '../store';
import { Settings, Globe, Play, Users, X, Hammer, Package } from 'lucide-react';
import { motion } from 'motion/react';

export function MainMenu() {
  const { setMenuState, setGameMode, resetWorld } = useGameStore();
  const [multiplayerMode, setMultiplayerMode] = useState(false);
  const [showDownloadInfo, setShowDownloadInfo] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-xl"
    >
      {showDownloadInfo && (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-black border border-white/20 p-8 rounded-2xl max-w-md flex flex-col gap-6 text-center shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-white/50 hover:text-white"
              onClick={() => setShowDownloadInfo(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold uppercase tracking-widest text-green-400">Download Full Game</h3>
            <p className="text-white/80 font-light text-sm leading-relaxed">
              To download the full source code and logic for this game to your PC, please use the AI Studio platform menu:
            </p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
              <ol className="list-decimal text-xs text-white/70 pl-4 flex flex-col gap-2 font-mono">
                <li>Look at the top right corner of your Google AI Studio workspace screen.</li>
                <li>Click the <strong className="text-white">Settings</strong> <span className="opacity-50">(or Share)</span> button.</li>
                <li>Select <strong className="text-white">Export to ZIP</strong> or <strong className="text-white">Export to GitHub</strong>.</li>
              </ol>
            </div>
            <button 
              className="mt-2 bg-green-500/20 text-green-400 border border-green-500/30 py-3 rounded-xl hover:bg-green-500/30 font-bold uppercase tracking-widest text-xs transition-colors"
              onClick={() => setShowDownloadInfo(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="bg-black/60 backdrop-blur-xl border border-white/20 p-10 rounded-2xl w-full max-w-lg text-white shadow-2xl flex flex-col gap-8"
      >
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-widest uppercase bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Fallens
          </h1>
          <h2 className="text-xl font-light tracking-[0.4em] text-white/80 uppercase">
            Wild World
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-4"></div>
        </div>

        {!multiplayerMode ? (
          <div className="flex flex-col gap-4">
            <button
              className="flex items-center justify-center gap-3 w-full bg-white/10 text-white border border-white/20 py-4 rounded-xl font-bold hover:bg-white/20 hover:ring-2 ring-orange-400/50 transition-all uppercase tracking-widest text-sm"
              onClick={() => {
                setGameMode('survival');
                setMenuState('playing');
              }}
            >
              <Play className="w-4 h-4" /> Start Survival
            </button>
            <button
              className="flex items-center justify-center gap-3 w-full bg-black/40 text-white/80 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-sm"
              onClick={() => {
                setGameMode('creative');
                setMenuState('playing');
              }}
            >
              <Hammer className="w-4 h-4" /> Start Creative
            </button>
            <button
              className="flex items-center justify-center gap-3 w-full bg-blue-500/10 text-blue-400 border border-blue-500/20 py-4 rounded-xl font-bold hover:bg-blue-500/20 transition-all uppercase tracking-widest text-sm"
              onClick={() => setMultiplayerMode(true)}
            >
              <Users className="w-4 h-4" /> Multiplayer
            </button>
            <button
              className="flex items-center justify-center gap-3 w-full bg-transparent text-white/50 py-4 rounded-xl font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
              onClick={() => setMenuState('settings')}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="text-[10px] uppercase tracking-widest text-green-500/50 hover:text-green-400 transition-colors"
                onClick={() => setShowDownloadInfo(true)}
              >
                Download Game (PC)
              </button>

              <button
                className="text-[10px] uppercase tracking-widest text-red-500/50 hover:text-red-400 transition-colors"
                onClick={resetWorld}
              >
                Wipe Local Save Data
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-black/40 border border-blue-500/20 p-6 rounded-xl flex flex-col gap-4">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Server Connect</label>
              <input 
                type="text" 
                placeholder="ENTER SERVER IP / CODE..." 
                className="bg-black/60 border border-white/10 rounded-lg p-4 text-white text-sm font-mono outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <button
              className="flex items-center justify-center gap-3 w-full bg-blue-500/20 text-blue-300 border border-blue-500/30 py-4 rounded-xl font-bold hover:bg-blue-500/40 hover:text-white transition-all uppercase tracking-widest text-sm"
              onClick={() => {
                alert("Multiplayer sync is conceptual in this sandbox preview.");
                setMenuState('playing');
              }}
            >
              Join Server
            </button>
            <button
              className="flex items-center justify-center gap-3 w-full bg-transparent text-white/50 py-3 rounded-xl font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
              onClick={() => setMultiplayerMode(false)}
            >
              Back
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
