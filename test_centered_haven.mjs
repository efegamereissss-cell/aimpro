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

// Scale and offset
fbx.scale.set(0.01, 0.01, 0.01);
fbx.position.set(1.75, 0, 5.0);

console.log('--- HAVEN C-SITE COURTYARD CENTERED AT (0,0,0) ---');
fbx.traverse(c => {
  if (c.isMesh && (c.name.startsWith('sols') || c.name.includes('box'))) {
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log(`Mesh: ${c.name} | World Center: (${center.x.toFixed(2)}m, ${center.y.toFixed(2)}m, ${center.z.toFixed(2)}m) | Size: (${size.x.toFixed(2)}m, ${size.y.toFixed(2)}m, ${size.z.toFixed(2)}m)`);
  }
});
