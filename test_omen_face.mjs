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

let mesh = null;
fbx.traverse(c => { if (c.isMesh) mesh = c; });

const posAttr = mesh.geometry.attributes.position;
const group1 = mesh.geometry.groups[1]; // Head
let headCenter = new THREE.Vector3();
for (let i = group1.start; i < group1.start + group1.count; i++) {
  headCenter.x += posAttr.getX(i);
  headCenter.y += posAttr.getY(i);
  headCenter.z += posAttr.getZ(i);
}
headCenter.divideScalar(group1.count);
console.log('Head Center in raw FBX:', headCenter);

// Check normals of head to find which way the face looks
const normAttr = mesh.geometry.attributes.normal;
let headNormal = new THREE.Vector3();
for (let i = group1.start; i < group1.start + group1.count; i++) {
  headNormal.x += normAttr.getX(i);
  headNormal.y += normAttr.getY(i);
  headNormal.z += normAttr.getZ(i);
}
headNormal.divideScalar(group1.count).normalize();
console.log('Head Face Normal (looking direction in raw FBX):', headNormal);
