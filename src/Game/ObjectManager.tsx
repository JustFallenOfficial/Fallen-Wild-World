import React, { useRef } from 'react';
import { useBox, useCylinder } from '@react-three/cannon';
import { useGameStore, WorldObject } from '../store';
import * as THREE from 'three';

export function ObjectManager() {
  const objects = useGameStore((state) => state.objects);

  return (
    <>
      {objects.map((obj) => (
        <Interactable key={obj.id} obj={obj} />
      ))}
    </>
  );
}

function Interactable({ obj }: { obj: WorldObject }) {
  // Use Box for everything for simplicity, plank/log/stone just different dimensions
  const args: [number, number, number] = 
    obj.type === 'log' ? [1, 3, 1] :
    obj.type === 'plank' ? [2, 0.2, 2] :
    obj.type === 'stone' ? [1, 1, 1] : [1, 1, 1];

  const [ref] = useBox(() => ({
    mass: obj.isStatic ? 0 : 5,
    type: obj.isStatic ? 'Static' : 'Dynamic',
    position: obj.position,
    rotation: obj.rotation,
    args
  }), useRef(null), [obj.isStatic]); // Re-init physics when isStatic changes

  const color = 
    obj.type === 'log' ? '#5c4033' :
    obj.type === 'plank' ? '#d4a373' :
    obj.type === 'stone' ? '#888888' : '#4ade80';

  return (
    <mesh 
      ref={ref} 
      castShadow 
      receiveShadow
      userData={{ type: obj.type, id: obj.id, pickable: true, isStatic: obj.isStatic }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
      
      {/* Visual indicator that item is frozen */}
      {obj.isStatic && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(...args)]} />
          <lineBasicMaterial attach="material" color="cyan" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

// A generic hook import helper workaround removed
