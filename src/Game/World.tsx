import React, { useMemo, useRef } from 'react';
import { useBox, useTrimesh } from '@react-three/cannon';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useGameStore } from '../store';

const WORLD_SIZE = 800;
const RESOLUTION = 100;

const noise2D = createNoise2D();

function getElevation(x: number, z: number) {
  let h = noise2D(x * 0.005, z * 0.005) * 30; // large mountains
  h += noise2D(x * 0.02, z * 0.02) * 10; // medium hills
  h += noise2D(x * 0.08, z * 0.08) * 2; // small noise
  if (h < 0) h *= 0.3; // flatten waterbeds
  return h;
}

export function World() {
  const destroyedFeatures = useGameStore(s => s.destroyedFeatures);

  const { vertices, indices, geometry, trees, rocks } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, RESOLUTION, RESOLUTION);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colorsArr = [];

    for (let i = 0; i < pos.count; i++) {
       const x = pos.getX(i);
       const z = pos.getZ(i);
       const h = getElevation(x, z);
       pos.setY(i, h);

       if (h < -3) {
         colorsArr.push(0.76, 0.69, 0.50); // deep sand
       } else if (h < 1) {
         const c = new THREE.Color("#e9c46a"); // sand/beach
         colorsArr.push(c.r, c.g, c.b);
       } else if (h < 15) {
         const c = new THREE.Color("#4ade80"); // grass
         colorsArr.push(c.r, c.g, c.b);
       } else if (h < 28) {
         const c = new THREE.Color("#9ca3af"); // rock / mountain
         colorsArr.push(c.r, c.g, c.b);
       } else {
         const c = new THREE.Color("#f9fafb"); // snow
         colorsArr.push(c.r, c.g, c.b);
       }
    }
    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));
    
    // Arrays strictly to avoid postMessage DataCloneError
    const vertsArray = Array.from(geo.attributes.position.array);
    const indicesArray = Array.from(geo.index!.array);

    // Generate trees and rocks
    const treeInstances = [];
    const rockInstances = [];
    
    // Procedural placement
    for (let i = 0; i < 2000; i++) {
       const x = (Math.random() - 0.5) * WORLD_SIZE;
       const z = (Math.random() - 0.5) * WORLD_SIZE;
       const h = getElevation(x, z);
       const id = `feature_${Math.round(x)}_${Math.round(z)}`;
       
       if (h > 1 && h < 18) {
          // Trees in grass and lower mountain
          const n = noise2D(x * 0.05, z * 0.05); // forest clustering
          if (n > 0.1) {
             const scale = 2 + Math.random() * 2;
             treeInstances.push({ id, position: [x, h, z] as const, scale });
          } else if (Math.random() > 0.95) {
             const scale = 3 + Math.random() * 4;
             rockInstances.push({ id, position: [x, h, z] as const, scale });
          }
       } else if (h >= 18 && h < 35) {
          // Rocks on mountain peaks
          if (Math.random() > 0.7) {
             const scale = 3 + Math.random() * 4;
             rockInstances.push({ id, position: [x, h, z] as const, scale });
          }
       }
    }

    return { vertices: vertsArray, indices: indicesArray, geometry: geo, trees: treeInstances, rocks: rockInstances };
  }, []);

  const [ref] = useTrimesh(() => ({
    args: [vertices, indices],
    type: 'Static',
    position: [0,0,0]
  }), useRef(null), [vertices, indices]);

  const activeTrees = useMemo(() => trees.filter(t => !destroyedFeatures.includes(t.id)), [destroyedFeatures, trees]);
  const activeRocks = useMemo(() => rocks.filter(r => !destroyedFeatures.includes(r.id)), [destroyedFeatures, rocks]);

  return (
    <group>
      <mesh ref={ref as any} geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.8} />
      </mesh>

      {/* Water Plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} roughness={0.1} />
      </mesh>

      {activeTrees.map((t) => (
         <Tree key={t.id} id={t.id} position={t.position} scale={t.scale} />
      ))}
      
      {activeRocks.map((r) => (
         <Rock key={r.id} id={r.id} position={r.position} scale={r.scale} />
      ))}
    </group>
  );
}

function Tree({ id, position, scale }: { id: string, position: readonly [number, number, number], scale: number }) {
  const trunkR = 0.6 * scale;
  const trunkH = 8 * scale;
  const leavesR = 4 * scale;
  const leavesH = 10 * scale;
  const yCenter = position[1] + trunkH / 2;
  
  const [ref] = useBox(() => ({ 
    type: 'Static', 
    position: [position[0], yCenter, position[2]], 
    args: [trunkR*2, trunkH, trunkR*2] 
  }));
  
  return (
    <group ref={ref as any} userData={{ id, type: 'tree', interactable: true }}>
       <mesh castShadow receiveShadow>
         <cylinderGeometry args={[trunkR*0.7, trunkR, trunkH, 6]} />
         <meshStandardMaterial color="#5c4033" />
       </mesh>
       <mesh position={[0, trunkH/2 + leavesH/2 - 1*scale, 0]} castShadow receiveShadow>
         <coneGeometry args={[leavesR, leavesH, 6]} />
         <meshStandardMaterial color="#4ade80" />
       </mesh>
    </group>
  );
}

function Rock({ id, position, scale }: { id: string, position: readonly [number, number, number], scale: number }) {
  const s = 1.5 * scale;
  const [ref] = useBox(() => ({ 
    type: 'Static', 
    position: [position[0], position[1] + s/2, position[2]], 
    args: [s, s, s] 
  }));
  
  return (
    <mesh ref={ref as any} castShadow receiveShadow rotation={[scale, scale*2, scale*0.5]} userData={{ id, type: 'stone_node', interactable: true }}>
      <dodecahedronGeometry args={[s, 0]} />
      <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
    </mesh>
  );
}
