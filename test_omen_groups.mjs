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
const fbx = loader.parse(omenBuf.buffer, '');

console.log('--- CHECKING OMEN MESH GEOMETRY & GROUPS ---');
fbx.traverse(child => {
  if (child.isMesh) {
    console.log('Mesh Name:', child.name);
    console.log('Mesh Type:', child.type);
    console.log('Geometry groups count:', child.geometry.groups.length);
    console.log('Geometry groups:', child.geometry.groups);
    console.log('Original Materials:', child.material);
  }
});
