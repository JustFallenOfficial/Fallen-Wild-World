import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { AnimatePresence } from 'motion/react';

import { useGameStore } from './store';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { SettingsMenu } from './ui/SettingsMenu';
import { InventoryMenu } from './ui/InventoryMenu';
import { CharacterEditor } from './ui/CharacterEditor';
import { Player } from './Game/Player';
import { World } from './Game/World';
import { ObjectManager } from './Game/ObjectManager';

function Lighting() {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const settings = useGameStore(s => s.settings);
  const scene = useThree(s => s.scene);
  
  const isNight = timeOfDay < 6 || timeOfDay > 18;
  const dayLight = Math.max(0, Math.sin(((timeOfDay - 6) / 24) * Math.PI * 2));
  
  const sunAzimuth = ((timeOfDay - 6) / 24) * Math.PI * 2;
  const sunPosition = new THREE.Vector3(
     Math.cos(sunAzimuth) * 500,
     Math.sin(sunAzimuth) * 500,
     0
  );

  useFrame(() => {
     const t = useGameStore.getState().timeOfDay;
     const dl = Math.max(0, Math.sin(((t - 6) / 24) * Math.PI * 2));
     const fc = new THREE.Color().lerpColors(new THREE.Color('#030712'), new THREE.Color('#a8c0ff'), dl);
     if (scene.fog) {
        (scene.fog as THREE.Fog).color.copy(fc);
     } else {
        scene.fog = new THREE.Fog(fc, 30, 300);
     }
  });

  return (
    <group>
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        turbidity={isNight ? 1 : 4} 
        rayleigh={isNight ? 0.1 : 2} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      {dayLight < 0.2 && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      
      <ambientLight intensity={settings.ambientLight ? (0.1 + dayLight * 0.4) : 0.1} />
      <directionalLight 
        castShadow={settings.shadows}
        position={sunPosition} 
        intensity={dayLight * 3} 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1000}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
    </group>
  );
}

function GameLoop() {
  const setTimeOfDay = useGameStore(s => s.setTimeOfDay);
  
  useFrame((state, delta) => {
     // Advance time slowly
     const current = useGameStore.getState().timeOfDay;
     setTimeOfDay(current + delta * 0.05);
  });
  return null;
}

export default function App() {
  const menuState = useGameStore(s => s.menuState);
  const settings = useGameStore(s => s.settings);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans" style={{ filter: `saturate(${settings.saturation}%)` }}>
      
      {/* 3D Canvas */}
      <Canvas 
        shadows={settings.shadows}
        gl={{ powerPreference: "high-performance", antialias: false }} 
        camera={{ position: [0, 5, 0], fov: 75 }}
      >
        <Suspense fallback={null}>
          <Lighting />
          
          <Physics gravity={[0, -12, 0]}>
            <Player />
            <World />
            <ObjectManager />
          </Physics>

          {menuState === 'playing' && <GameLoop />}
        </Suspense>
      </Canvas>

      {/* 2D UI Overlay */}
      <HUD />
      <AnimatePresence>
        {menuState === 'character_editor' && <CharacterEditor />}
        {menuState === 'main' && <MainMenu />}
        {menuState === 'settings' && <SettingsMenu />}
        {menuState === 'inventory' && <InventoryMenu />}
      </AnimatePresence>
    </div>
  );
}
