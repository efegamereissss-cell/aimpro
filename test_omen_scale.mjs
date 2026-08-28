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

// Reset root transforms if needed
const mesh = omenObj.children[0];
console.log('Mesh pos:', mesh.position, 'rot:', mesh.rotation, 'scale:', mesh.scale);

const scaleFactor = 1.85 / 0.01623;
console.log('Scaling whole group by', scaleFactor);
omenObj.scale.setScalar(scaleFactor);

const box = new THREE.Box3().setFromObject(omenObj);
console.log('After scaling: size is', box.getSize(new THREE.Vector3()));
