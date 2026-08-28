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
const havenBuf = fs.readFileSync('./public/models/haven_c_site/source/Site C haven.fbx');
const havenObj = loader.parse(havenBuf.buffer, '');

// Group unique material names and mesh names
const matNames = new Set();
const meshNames = [];
havenObj.traverse(child => {
  if (child.isMesh) {
    meshNames.push(child.name);
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => matNames.add(m.name));
      } else {
        matNames.add(child.material.name);
      }
    }
  }
});

console.log('Unique Material Names in Haven (', matNames.size, '):');
console.log(Array.from(matNames));
