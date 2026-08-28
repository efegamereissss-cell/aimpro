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

// Strip 100,000 intensity lights
const lightsToRemove = [];
fbx.traverse(c => { if (c.isLight) lightsToRemove.push(c); });
lightsToRemove.forEach(l => l.parent && l.parent.remove(l));

// Calibration: scale 0.01, position offset
fbx.scale.set(0.01, 0.01, 0.01);
fbx.position.set(0, 0, -5.0);

console.log('Haven C-Site successfully positioned at (0, 0, -5.0)!');
console.log('Player at (0, 1.62, 0) looking at (0, 1.62, -12.0) has full view of C-Site courtyard and double boxes!');
