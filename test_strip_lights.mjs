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

// Strip all embedded Maya lights
const lightsToRemove = [];
fbx.traverse(child => {
  if (child.isLight) {
    lightsToRemove.push(child);
  }
});
lightsToRemove.forEach(l => {
  if (l.parent) l.parent.remove(l);
});

console.log('Removed', lightsToRemove.length, 'embedded Maya lights with 100,000 intensity!');

// Check remaining lights
let remainingLights = 0;
fbx.traverse(child => {
  if (child.isLight) remainingLights++;
});
console.log('Remaining lights in FBX:', remainingLights);
