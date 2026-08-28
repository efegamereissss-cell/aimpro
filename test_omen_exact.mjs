import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

globalThis.window = { innerWidth: 1920, innerHeight: 1080 };
globalThis.document = {
  createElement: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} }),
  createElementNS: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} })
};

const loader = new FBXLoader();
const omenBuf = fs.readFileSync('./public/models/omen_bot/source/New_Omen.fbx');
const omenObj = loader.parse(omenBuf.buffer, '');

const mesh = omenObj.children[0];
mesh.rotation.set(-Math.PI / 2, 0, Math.PI);
mesh.scale.set(0.0088, 0.0088, 0.0088);
mesh.position.set(0, 0, 0);

const box = new THREE.Box3().setFromObject(omenObj);
console.log('--- CORRECT OMEN MODEL DIMENSIONS (METERS) ---');
console.log('Min:', box.min);
console.log('Max:', box.max);
console.log('Size:', box.getSize(new THREE.Vector3()));
console.log('Center:', box.getCenter(new THREE.Vector3()));
