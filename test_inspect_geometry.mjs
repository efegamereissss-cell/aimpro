import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

// Mock DOM for Node
globalThis.window = { innerWidth: 1920, innerHeight: 1080 };
globalThis.document = {
  createElement: (tag) => ({
    getContext: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {}
  }),
  createElementNS: () => ({
    getContext: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {}
  })
};

const loader = new FBXLoader();

console.log('--- INSPECTING HAVEN C-SITE FBX ---');
const havenBuf = fs.readFileSync('./public/models/haven_c_site/source/Site C haven.fbx');
const havenObj = loader.parse(havenBuf.buffer, '');

const hBox = new THREE.Box3().setFromObject(havenObj);
console.log('Haven Bounding Box: min', hBox.min, 'max', hBox.max);
console.log('Haven Dimensions:', hBox.getSize(new THREE.Vector3()));
console.log('Haven Center:', hBox.getCenter(new THREE.Vector3()));

let totalHavenVerts = 0;
let havenMeshes = [];
havenObj.traverse(child => {
  if (child.isMesh) {
    totalHavenVerts += child.geometry.attributes.position.count;
    havenMeshes.push({
      name: child.name,
      verts: child.geometry.attributes.position.count,
      mat: child.material ? (Array.isArray(child.material) ? child.material.map(m => m.name) : child.material.name) : 'none'
    });
  }
});
console.log('Total Haven Vertices:', totalHavenVerts);
console.log('Haven Meshes count:', havenMeshes.length);
console.log('Sample Meshes:', havenMeshes.slice(0, 10));

console.log('\n--- INSPECTING OMEN FBX ---');
const omenBuf = fs.readFileSync('./public/models/omen_bot/source/New_Omen.fbx');
const omenObj = loader.parse(omenBuf.buffer, '');
const oBox = new THREE.Box3().setFromObject(omenObj);
console.log('Omen Bounding Box: min', oBox.min, 'max', oBox.max);
console.log('Omen Dimensions:', oBox.getSize(new THREE.Vector3()));
console.log('Omen Center:', oBox.getCenter(new THREE.Vector3()));

let omenMeshes = [];
omenObj.traverse(child => {
  if (child.isMesh) {
    omenMeshes.push({
      name: child.name,
      verts: child.geometry.attributes.position.count,
      mat: child.material ? (Array.isArray(child.material) ? child.material.map(m => m.name) : child.material.name) : 'none'
    });
  }
});
console.log('Omen Meshes:', omenMeshes);
