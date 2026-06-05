import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'survival' | 'creative';
export type MenuState = 'main' | 'playing' | 'settings' | 'inventory' | 'character_editor';

export interface WorldObject {
  id: string;
  type: 'log' | 'plank' | 'stone' | 'leaf';
  position: [number, number, number];
  rotation: [number, number, number];
  isStatic: boolean;
  color?: string;
}

interface GameState {
  menuState: MenuState;
  gameMode: GameMode;
  health: number;
  hunger: number;
  timeOfDay: number; // 0 to 24
  inventory: Record<string, number>;
  objects: WorldObject[];
  
  hotbar: string[];
  selectedSlot: number;
  destroyedFeatures: string[];

  character: {
    name: string;
    skinColor: string;
    shirtColor: string;
  };

  // Settings
  settings: {
    saturation: number;
    shadows: boolean;
    ambientLight: boolean;
    fpsLimit: number;
    vsync: boolean; // Mock
    fullscreen: boolean;
    mouseSensitivity: number;
    controls: {
      forward: string;
      backward: string;
      left: string;
      right: string;
      jump: string;
      interact: string;
    };
  };

  setMenuState: (s: MenuState) => void;
  setGameMode: (m: GameMode) => void;
  setHealth: (h: number) => void;
  setHunger: (h: number) => void;
  setTimeOfDay: (t: number) => void;
  addToInventory: (item: string, amount: number) => void;
  removeFromInventory: (item: string, amount: number) => void;

  setSelectedSlot: (slot: number) => void;
  destroyFeature: (id: string) => void;
  
  spawnObject: (obj: Omit<WorldObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<WorldObject>) => void;
  removeObject: (id: string) => void;
  
  updateSettings: (updates: Partial<GameState['settings']>) => void;
  updateCharacter: (updates: Partial<GameState['character']>) => void;
  
  resetWorld: () => void;
}

const initialSettings = {
  saturation: 100,
  shadows: true,
  ambientLight: true,
  fpsLimit: 60,
  vsync: true,
  fullscreen: false,
  mouseSensitivity: 0.5,
  controls: {
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    interact: 'KeyE'
  }
};

const initialCharacter = {
  name: 'Survivor',
  skinColor: '#f1c27d',
  shirtColor: '#4ade80'
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      menuState: 'character_editor',
      gameMode: 'survival',
      health: 100,
      hunger: 100,
      timeOfDay: 12,
      inventory: { log: 0, plank: 0, stone: 0, leaf: 0, apple: 0, stick: 0 },
      objects: [],
      hotbar: ['log', 'plank', 'stone', 'stick', 'apple', 'leaf'],
      selectedSlot: 0,
      destroyedFeatures: [],
      settings: initialSettings,
      character: initialCharacter,

      setMenuState: (s) => set({ menuState: s }),
      setGameMode: (m) => set({ gameMode: m }),
      setHealth: (h) => set({ health: Math.max(0, Math.min(100, h)) }),
      setHunger: (h) => set({ hunger: Math.max(0, Math.min(100, h)) }),
      setTimeOfDay: (t) => set({ timeOfDay: t % 24 }),
      addToInventory: (item, amount) =>
        set((state) => ({
          inventory: { ...state.inventory, [item]: (state.inventory[item] || 0) + amount }
        })),
      removeFromInventory: (item, amount) =>
        set((state) => {
          const current = state.inventory[item] || 0;
          return {
            inventory: { ...state.inventory, [item]: Math.max(0, current - amount) }
          };
        }),

      setSelectedSlot: (slot) => set({ selectedSlot: Math.max(0, Math.min(5, slot)) }),
      destroyFeature: (id) => set((state) => ({ destroyedFeatures: [...state.destroyedFeatures, id] })),

      spawnObject: (obj) =>
        set((state) => ({
          objects: [...state.objects, { ...obj, id: Math.random().toString(36).substring(2, 9) }]
        })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((o) => (o.id === id ? { ...o, ...updates } : o))
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((o) => o.id !== id)
        })),

      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      
      updateCharacter: (updates) =>
        set((state) => ({ character: { ...state.character, ...updates } })),

      resetWorld: () => set({ menuState: 'character_editor', objects: [], inventory: { log: 0, plank: 0, stone: 0 }, destroyedFeatures: [], health: 100, hunger: 100, timeOfDay: 8 }),
    }),
    {
      name: 'fallens-wild-world-storage',
      partialize: (state) => ({ objects: state.objects, inventory: state.inventory, settings: state.settings, character: state.character, hotbar: state.hotbar, destroyedFeatures: state.destroyedFeatures, health: state.health, hunger: state.hunger, timeOfDay: state.timeOfDay }),
    }
  )
);
