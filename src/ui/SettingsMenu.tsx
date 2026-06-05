import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { Monitor, Droplets, MousePointer2, Keyboard } from 'lucide-react';
import { motion } from 'motion/react';

export function SettingsMenu() {
  const { settings, updateSettings, setMenuState } = useGameStore();
  const [activeTab, setActiveTab] = useState<'video' | 'controls'>('video');
  const [recordingKey, setRecordingKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (recordingKey) {
        updateSettings({ controls: { ...settings.controls, [recordingKey]: e.code } });
        setRecordingKey(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recordingKey, settings.controls, updateSettings]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-[600px] h-[80vh] bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col shadow-2xl overflow-hidden relative"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
          <div className="flex gap-4">
             <button 
                className={`text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'video' ? 'bg-orange-400 text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                onClick={() => setActiveTab('video')}
             >
                Video
             </button>
             <button 
                className={`text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'controls' ? 'bg-orange-400 text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                onClick={() => setActiveTab('controls')}
             >
                Controls & Mouse
             </button>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8 flex-grow overflow-y-auto">
          {activeTab === 'video' && (
             <>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-white/60 uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-orange-400" /> Color Saturation
                    </label>
                    <span className="text-xs text-white font-mono">{settings.saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="200" 
                    value={settings.saturation}
                    onChange={(e) => updateSettings({ saturation: Number(e.target.value) })}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none accent-orange-400"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                       onClick={() => updateSettings({ shadows: !settings.shadows })}>
                    <span className="text-xs uppercase tracking-widest text-white/80">Dynamic Shadows</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.shadows ? 'bg-orange-400' : 'bg-gray-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.shadows ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                       onClick={() => updateSettings({ ambientLight: !settings.ambientLight })}>
                    <span className="text-xs uppercase tracking-widest text-white/80">Ambient Light</span>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.ambientLight ? 'bg-orange-400' : 'bg-gray-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.ambientLight ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-white/60 uppercase tracking-widest">FPS Limit</label>
                    <span className="text-xs text-white font-mono">{settings.fpsLimit === 0 ? 'Unlimited' : settings.fpsLimit}</span>
                  </div>
                  <input 
                    type="range" min="0" max="144" step="10"
                    value={settings.fpsLimit}
                    onChange={(e) => updateSettings({ fpsLimit: Number(e.target.value) })}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none accent-blue-400"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    className={`flex-1 py-4 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${settings.vsync ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/5'}`}
                    onClick={() => updateSettings({ vsync: !settings.vsync })}
                  >
                    V-Sync
                  </button>
                  <button
                    className={`flex-1 py-4 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${settings.fullscreen ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/5'}`}
                    onClick={() => {
                       updateSettings({ fullscreen: !settings.fullscreen });
                       if (!settings.fullscreen) {
                         document.documentElement.requestFullscreen().catch(() => {});
                       } else {
                         document.exitFullscreen().catch(() => {});
                       }
                    }}
                  >
                    Fullscreen
                  </button>
                </div>
             </>
          )}

          {activeTab === 'controls' && (
             <>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-white/60 uppercase tracking-widest flex items-center gap-2">
                      <MousePointer2 className="w-3 h-3 text-orange-400" /> Mouse Sensitivity
                    </label>
                    <span className="text-xs text-white font-mono">{settings.mouseSensitivity.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="2" step="0.1"
                    value={settings.mouseSensitivity}
                    onChange={(e) => updateSettings({ mouseSensitivity: Number(e.target.value) })}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none accent-orange-400"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                   <h3 className="text-xs text-white/60 uppercase tracking-widest flex items-center gap-2 mb-2"><Keyboard className="w-3 h-3 text-orange-400" /> Keybinds</h3>
                   
                   {Object.entries(settings.controls).map(([action, key]) => (
                      <div key={action} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                         <span className="text-xs uppercase tracking-widest text-white/80">{action}</span>
                         <button 
                           className={`px-4 py-2 rounded border text-xs font-mono transition-colors ${recordingKey === action ? 'bg-orange-400 text-black border-orange-400 animate-pulse' : 'bg-black/40 border-white/20 text-white hover:bg-white/10'}`}
                           onClick={() => setRecordingKey(action)}
                         >
                           {recordingKey === action ? 'PRESS KEY' : key.replace('Key', '')}
                         </button>
                      </div>
                   ))}
                </div>
             </>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40 shrink-0">
          <button
            className="w-full bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all uppercase tracking-widest text-sm border border-white/20"
            onClick={() => setMenuState('main')}
          >
            Back to Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
