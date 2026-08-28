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

console.log('Root FBX pos:', fbx.position, 'rot:', fbx.rotation, 'scale:', fbx.scale);
console.log('Child 0 pos:', fbx.children[0].position, 'rot:', fbx.children[0].rotation, 'scale:', fbx.children[0].scale);

// The clean way to normalize any FBX:
// 1. Reset root fbx
fbx.position.set(0, 0, 0);
fbx.rotation.set(0, 0, 0);
fbx.scale.set(1, 1, 1);

// 2. Reset child
const mesh = fbx.children[0];
mesh.position.set(0, 0, 0);
mesh.rotation.set(-Math.PI / 2, 0, Math.PI); // Rotate Z-up to Y-up and face forward
mesh.scale.set(1, 1, 1);

// 3. Measure raw bounds of normalized mesh
const rawBox = new THREE.Box3().setFromObject(fbx);
const rawHeight = rawBox.max.y - rawBox.min.y;
console.log('Raw upright height:', rawHeight);

// 4. Scale so total height is EXACTLY 1.85 meters
const targetHeight = 1.85;
const scale = targetHeight / rawHeight;
fbx.scale.set(scale, scale, scale);

// 5. Shift so feet are exactly at Y = 0, center at X = 0, Z = 0
const scaledBox = new THREE.Box3().setFromObject(fbx);
fbx.position.y = -scaledBox.min.y;
fbx.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
fbx.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;

const finalBox = new THREE.Box3().setFromObject(fbx);
console.log('--- FINAL PERFECT STANDING OMEN ---');
console.log('Min:', finalBox.min);
console.log('Max:', finalBox.max);
console.log('Size (meters):', finalBox.getSize(new THREE.Vector3()));
console.log('Feet at Y =', finalBox.min.y.toFixed(3));
console.log('Head at Y =', finalBox.max.y.toFixed(3));
