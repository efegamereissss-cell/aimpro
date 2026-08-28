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

console.log('FBX Children Count:', fbx.children.length);

// Check vertex colors and lights inside FBX
let lightsInFbx = [];
fbx.traverse(child => {
  if (child.isLight) {
    lightsInFbx.push(child);
  }
  if (child.isMesh) {
    // Check if mesh has vertex colors
    if (child.geometry.attributes.color) {
      console.log('Mesh has vertex colors:', child.name);
    }
  }
});

console.log('Lights inside FBX:', lightsInFbx.length);
lightsInFbx.forEach(l => console.log('Light:', l.type, 'color:', l.color, 'intensity:', l.intensity));
