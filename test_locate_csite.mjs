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

console.log('--- FINDING C-SITE BOXES AND COURTYARD IN HAVEN FBX ---');
fbx.traverse(child => {
  if (child.isMesh && (child.name.includes('box') || child.name.includes('sol') || child.name.includes('herbe'))) {
    const box = new THREE.Box3().setFromObject(child);
    const center = box.getCenter(new THREE.Vector3());
    console.log('Mesh:', child.name, 'Center in cm:', center, 'Size:', box.getSize(new THREE.Vector3()));
  }
});
