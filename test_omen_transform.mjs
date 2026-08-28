import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

// Mock DOM
globalThis.window = { innerWidth: 1920, innerHeight: 1080 };
globalThis.document = {
  createElement: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} }),
  createElementNS: () => ({ getContext: () => ({}), addEventListener: () => {}, removeEventListener: () => {}, style: {} })
};

const loader = new FBXLoader();
const omenBuf = fs.readFileSync('./public/models/omen_bot/source/New_Omen.fbx');
const omenObj = loader.parse(omenBuf.buffer, '');

// Test transform
const wrapper = new THREE.Group();
omenObj.rotation.set(-Math.PI / 2, 0, Math.PI);
const scale = 1.85 / 210.84;
omenObj.scale.setScalar(scale);

// Center feet at Y = 0
const box = new THREE.Box3().setFromObject(omenObj);
console.log('Transformed Omen Box:');
console.log(' min:', box.min);
console.log(' max:', box.max);
console.log(' size:', box.getSize(new THREE.Vector3()));
console.log(' center:', box.getCenter(new THREE.Vector3()));
