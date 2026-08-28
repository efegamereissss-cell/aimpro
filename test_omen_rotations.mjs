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

const staticMesh = new THREE.Mesh(mesh.geometry.clone());

// We want raw normal (1, 0, 0) to become (0, 0, 1) and raw up (0, 0, 1) to become (0, 1, 0)
// Test rotation:
// 1. Rotate around Y by -PI/2 so +X becomes +Z
// 2. Rotate around X by -PI/2 so +Z becomes +Y
// Let's test Euler order 'YXZ' or 'ZXY'
const testRotations = [
  new THREE.Euler(-Math.PI / 2, 0, -Math.PI / 2, 'XYZ'),
  new THREE.Euler(-Math.PI / 2, 0, Math.PI / 2, 'XYZ'),
  new THREE.Euler(-Math.PI / 2, -Math.PI / 2, 0, 'XYZ'),
  new THREE.Euler(-Math.PI / 2, Math.PI / 2, 0, 'XYZ'),
  new THREE.Euler(0, -Math.PI / 2, -Math.PI / 2, 'ZYX'),
  new THREE.Euler(0, Math.PI / 2, -Math.PI / 2, 'ZYX')
];

const rawFace = new THREE.Vector3(1, 0, 0);
const rawUp = new THREE.Vector3(0, 0, 1);

testRotations.forEach((euler, idx) => {
  const q = new THREE.Quaternion().setFromEuler(euler);
  const faceWorld = rawFace.clone().applyQuaternion(q);
  const upWorld = rawUp.clone().applyQuaternion(q);
  console.log(`Rotation #${idx} (${euler._x.toFixed(2)}, ${euler._y.toFixed(2)}, ${euler._z.toFixed(2)}):`);
  console.log(`  Face -> (${faceWorld.x.toFixed(2)}, ${faceWorld.y.toFixed(2)}, ${faceWorld.z.toFixed(2)})`);
  console.log(`  Up   -> (${upWorld.x.toFixed(2)}, ${upWorld.y.toFixed(2)}, ${upWorld.z.toFixed(2)})`);
});
