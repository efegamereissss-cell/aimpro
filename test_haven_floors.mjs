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

// Find all floors and open spaces
console.log('--- HAVEN C-SITE FLOORS AND WALLS ---');
fbx.traverse(c => {
  if (c.isMesh) {
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // In cm:
    if (c.name.startsWith('sols') || c.name.includes('sol') || c.name.includes('box')) {
      console.log(`Mesh: ${c.name} | Center: (${(center.x/100).toFixed(2)}m, ${(center.y/100).toFixed(2)}m, ${(center.z/100).toFixed(2)}m) | Size: (${(size.x/100).toFixed(2)}m, ${(size.y/100).toFixed(2)}m, ${(size.z/100).toFixed(2)}m)`);
    }
  }
});
