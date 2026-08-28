import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

globalThis.window = { innerWidth: 1920, innerHeight: 1080 };
globalThis.document = {
  createElement: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} }),
  createElementNS: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} })
};

const loader = new FBXLoader();
const havenBuf = fs.readFileSync('./public/models/haven_c_site/source/Site C haven.fbx');
const fbx = loader.parse(havenBuf.buffer, '');

// Strip lights
const lights = [];
fbx.traverse(c => { if (c.isLight) lights.push(c); });
lights.forEach(l => l.parent && l.parent.remove(l));

// Find walls near C-Long corridor (sols: X = -5.50m, Z from -7m to +13m)
console.log('--- FINDING C-LONG WALLS IN HAVEN FBX ---');
fbx.traverse(c => {
  if (c.isMesh) {
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    // Convert to meters
    const cx = center.x / 100;
    const cz = center.z / 100;
    if (cx >= -12 && cx <= 2 && cz >= -10 && cz <= 15) {
      if (c.name.includes('Mur') || c.name.includes('wall') || c.name.includes('pCube') || c.name.includes('box')) {
        console.log(`Wall/Obstacle: ${c.name} | Pos: (${cx.toFixed(2)}m, ${(center.y/100).toFixed(2)}m, ${cz.toFixed(2)}m) | Size: (${(size.x/100).toFixed(2)}m, ${(size.y/100).toFixed(2)}m, ${(size.z/100).toFixed(2)}m)`);
      }
    }
  }
});
