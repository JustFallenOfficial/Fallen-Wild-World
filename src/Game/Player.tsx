import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Raycaster, Vector2, Euler, Group } from 'three';
import { PointerLockControls } from '@react-three/drei';
import { useGameStore } from '../store';
import * as THREE from 'three';

const SPEED = 5;
const JUMP_FORCE = 6;

export function Player() {
  const { camera, scene } = useThree();
  const [ref, api] = useSphere(() => ({ mass: 1, type: 'Dynamic', position: [0, 80, 0], args: [1] }));
  const velocity = useRef([0, 0, 0]);
  const weaponRef = useRef<Group>(null);
  
  const [isSwinging, setIsSwinging] = useState(false);
  
  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v));
  }, [api.velocity]);

  const { menuState, setMenuState, gameMode, addToInventory, inventory, removeFromInventory, spawnObject, hotbar, selectedSlot } = useGameStore();
  const activeItem = hotbar[selectedSlot];

  const keys = useRef({ forward: false, backward: false, left: false, right: false, jump: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      
      const controls = useGameStore.getState().settings.controls;

      // Numbers for hotbar
      if (e.code >= 'Digit1' && e.code <= 'Digit6') {
        const slot = parseInt(e.key) - 1;
        useGameStore.getState().setSelectedSlot(slot);
      }

      switch (e.code) {
        case controls.forward: keys.current.forward = true; break;
        case controls.backward: keys.current.backward = true; break;
        case controls.left: keys.current.left = true; break;
        case controls.right: keys.current.right = true; break;
        case controls.jump: keys.current.jump = true; break;
        case controls.interact: 
          if(menuState === 'playing') {
            document.exitPointerLock();
            setMenuState('inventory'); 
          }
          break;
        case 'Escape':
          if(menuState === 'playing') {
            document.exitPointerLock();
            setMenuState('main');
          }
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const controls = useGameStore.getState().settings.controls;
      switch (e.code) {
        case controls.forward: keys.current.forward = false; break;
        case controls.backward: keys.current.backward = false; break;
        case controls.left: keys.current.left = false; break;
        case controls.right: keys.current.right = false; break;
        case controls.jump: keys.current.jump = false; break;
      }
    };
    
    // Interaction logic
    const getHitData = (object: THREE.Object3D): any => {
      let curr: THREE.Object3D | null = object;
      while (curr) {
        if (curr.userData?.type) return curr.userData;
        curr = curr.parent;
      }
      return null;
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (menuState !== 'playing' || !document.pointerLockElement) return;
      
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(0, 0), camera);
      
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (e.button === 0) { // Left click - pickup/mine
        setIsSwinging(true);
        setTimeout(() => setIsSwinging(false), 200);

        const hit = intersects.find(i => getHitData(i.object));
        const groundHit = intersects.find(i => !getHitData(i.object));

        if (hit && hit.distance < 10) {
           const data = getHitData(hit.object);
           if (!data) return;
           const { type, id, pickable } = data;
           
           if (type === 'tree') {
             addToInventory('log', 2);
             useGameStore.getState().destroyFeature(id);
           } else if (type === 'stone_node') {
             addToInventory('stone', 2);
             useGameStore.getState().destroyFeature(id);
           } else if (pickable) {
             addToInventory(type, 1);
             useGameStore.getState().removeObject(id);
           }
        } else if (groundHit && groundHit.distance < 10) {
           // Place a block
           const state = useGameStore.getState();
           const selectedItem = state.hotbar[state.selectedSlot];
           if (!selectedItem) return;

           if (state.gameMode === 'creative' || state.inventory[selectedItem] > 0) {
              const pos = groundHit.point.clone().add(groundHit.face!.normal.clone().multiplyScalar(0.5));
              state.spawnObject({
                type: selectedItem as any,
                position: [pos.x, pos.y, pos.z],
                rotation: [0, camera.rotation.y, 0],
                isStatic: true
              });
              if(state.gameMode !== 'creative') state.removeFromInventory(selectedItem, 1);
           }
        }
      }
    };
    
    // Feature: Press F to freeze object you are looking at
    const handleFKey = (e: KeyboardEvent) => {
       if(e.code === 'KeyF' && menuState === 'playing' && document.pointerLockElement) {
          const raycaster = new Raycaster();
          raycaster.setFromCamera(new Vector2(0, 0), camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
          const hit = intersects.find(i => getHitData(i.object)?.pickable);
          if (hit && hit.distance < 10) {
             const data = getHitData(hit.object);
             useGameStore.getState().updateObject(data.id, { isStatic: !data.isStatic });
          }
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseClick);
    window.addEventListener('keydown', handleFKey);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseClick);
      window.removeEventListener('keydown', handleFKey);
    };
  }, [camera, scene, menuState, gameMode, inventory, addToInventory, removeFromInventory, spawnObject, setMenuState]);

  useFrame(() => {
    if (menuState !== 'playing') return;
    
    // Safety check - physics sync
    if (ref.current) {
       camera.position.copy(ref.current.position);
    }
    
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0));
    const sideVector = new Vector3((keys.current.left ? 1 : 0) - (keys.current.right ? 1 : 0), 0, 0);

    direction.subVectors(frontVector, sideVector);
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(SPEED);
    }
    
    // Apply only Y rotation from camera to avoid flying into sky or digging into ground
    const euler = new Euler(0, camera.rotation.y, 0, 'YXZ');
    direction.applyEuler(euler);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (keys.current.jump && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }
    
    // Head Bob animation
    if (direction.lengthSq() > 0 && Math.abs(velocity.current[1]) < 0.2) {
      const time = performance.now() / 150;
      camera.position.y += Math.sin(time) * 0.06;
    }

    // Weapon sync & swing animation
    if (weaponRef.current) {
      weaponRef.current.position.copy(camera.position);
      weaponRef.current.rotation.copy(camera.rotation);
      
      const targetX = isSwinging ? -1.0 : 0;
      weaponRef.current.children[0].rotation.x = THREE.MathUtils.lerp(
        weaponRef.current.children[0].rotation.x, targetX, 0.4
      );
    }
  });

  const toolColor = activeItem === 'log' ? '#5c4033' : activeItem === 'plank' ? '#d4a373' : activeItem === 'stone' ? '#7f8c8d' : '#888888';

  return (
    <>
      <mesh ref={ref as any} visible={false}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial />
      </mesh>

      {menuState === 'playing' && (
        <group ref={weaponRef}>
          <group position={[0.6, -0.4, -1]} rotation={[-0.2, 0.2, 0.4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.15, 0.15, 0.8]} />
              <meshStandardMaterial color={toolColor} roughness={0.7} />
            </mesh>
          </group>
        </group>
      )}

      {menuState === 'playing' && (
        <PointerLockControls 
          pointerSpeed={useGameStore.getState().settings.mouseSensitivity}
          onUnlock={() => {
            if (useGameStore.getState().menuState === 'playing') {
              useGameStore.getState().setMenuState('main');
            }
          }}
        />
      )}
    </>
  );
}
