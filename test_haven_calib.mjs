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
const havenObj = loader.parse(havenBuf.buffer, '');

// Scale by 0.01 to convert cm to meters
havenObj.scale.set(0.01, 0.01, 0.01);
havenObj.position.set(25.89, 0, -4.16);

const box = new THREE.Box3().setFromObject(havenObj);
console.log('--- CALIBRATED HAVEN C-SITE MAP (METERS) ---');
console.log('Min:', box.min);
console.log('Max:', box.max);
console.log('Dimensions (m):', box.getSize(new THREE.Vector3()));
console.log('Center (m):', box.getCenter(new THREE.Vector3()));
