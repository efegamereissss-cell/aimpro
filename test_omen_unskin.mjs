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

// Convert SkinnedMesh to static THREE.Mesh
let omenStaticMesh = null;
fbx.traverse(child => {
  if (child.isMesh && child.name === 'New_Omen') {
    omenStaticMesh = new THREE.Mesh(child.geometry, child.material);
    omenStaticMesh.name = 'Omen_Static_Mesh';
  }
});

console.log('Converted SkinnedMesh to static Mesh:', omenStaticMesh ? 'SUCCESS' : 'FAILED');
console.log('Static Mesh geometry vertices:', omenStaticMesh.geometry.attributes.position.count);

// Apply transforms on static mesh
omenStaticMesh.rotation.set(-Math.PI / 2, 0, Math.PI);
omenStaticMesh.geometry.computeBoundingBox();
const rawBox = omenStaticMesh.geometry.boundingBox;
console.log('Raw Box:', rawBox);
const rawHeight = rawBox.max.z - rawBox.min.z; // Z is UP in raw FBX geometry
console.log('Raw Height (cm):', rawHeight);

// Scale to exact 1.85m (185cm)
const scale = 1.85 / (rawHeight / 100); // from cm to m
console.log('Scale factor:', scale);
omenStaticMesh.scale.set(scale * 0.01, scale * 0.01, scale * 0.01);

const testGroup = new THREE.Group();
testGroup.add(omenStaticMesh);

const finalBox = new THREE.Box3().setFromObject(testGroup);
console.log('Final Static Omen Bounding Box:');
console.log('Min:', finalBox.min);
console.log('Max:', finalBox.max);
console.log('Height:', (finalBox.max.y - finalBox.min.y).toFixed(3), 'meters');
