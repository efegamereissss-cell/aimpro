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

const wrapper = new THREE.Group();
const inner = new THREE.Group();

// 1. Rotate to align Z-up with Three.js Y-up and face forward (+Z)
inner.rotation.set(-Math.PI / 2, 0, Math.PI);
// 2. Scale 210.84cm -> 1.85m
const s = 1.85 / 210.84;
inner.scale.setScalar(s);
// 3. Center horizontally and place feet on Y=0
inner.position.set(0.1, 0, 0);

wrapper.add(inner);
inner.add(omenObj);

const finalBox = new THREE.Box3().setFromObject(wrapper);
console.log('--- PERFECT OMEN BOUNDS ---');
console.log('Min:', finalBox.min);
console.log('Max:', finalBox.max);
console.log('Dimensions (meters):', finalBox.getSize(new THREE.Vector3()));
console.log('Head Y range:', (finalBox.max.y - 0.25).toFixed(2), 'to', finalBox.max.y.toFixed(2), 'meters');
