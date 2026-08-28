import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as fflate from 'fflate';
import fs from 'fs';

// Mock browser globals for FBXLoader in node
global.THREE = THREE;
global.fflate = fflate;

const fbxData = fs.readFileSync('C:/Users/eserh/Desktop/aim-trainer/public/models/rgx_karambit/source/hub.fbx');
const arrayBuffer = fbxData.buffer.slice(fbxData.byteOffset, fbxData.byteOffset + fbxData.byteLength);

const loader = new FBXLoader();
try {
  const fbx = loader.parse(arrayBuffer, '');
  console.log('FBX loaded successfully!');
  const box = new THREE.Box3().setFromObject(fbx);
  console.log('Bounding box min:', JSON.stringify(box.min));
  console.log('Bounding box max:', JSON.stringify(box.max));
  console.log('Bounding box size:', JSON.stringify(box.getSize(new THREE.Vector3())));
  console.log('Bounding box center:', JSON.stringify(box.getCenter(new THREE.Vector3())));
  
  let meshCount = 0;
  fbx.traverse(c => {
    if (c.isMesh) {
      meshCount++;
      console.log('Mesh name:', c.name, 'Geometry vertices:', c.geometry.attributes.position.count);
    }
  });
  console.log('Total meshes:', meshCount);
} catch (e) {
  console.error('FBX parse error:', e);
}
