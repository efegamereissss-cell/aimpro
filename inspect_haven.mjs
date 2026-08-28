import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

globalThis.window = {};
globalThis.document = {
  createElement: () => ({ getContext: () => ({}) }),
  createElementNS: () => ({ getContext: () => ({}) })
};

const fbxLoader = new FBXLoader();

try {
  const havenBuffer = fs.readFileSync('./public/models/haven_c_site/source/Site C haven.fbx');
  const havenObj = fbxLoader.parse(havenBuffer.buffer, '');
  const havenBox = new THREE.Box3().setFromObject(havenObj);
  const havenSize = havenBox.getSize(new THREE.Vector3());
  const havenCenter = havenBox.getCenter(new THREE.Vector3());
  console.log('--- HAVEN C-SITE FBX ---');
  console.log('Haven Size:', havenSize);
  console.log('Haven Center:', havenCenter);
  let count = 0;
  havenObj.traverse(child => {
    if (child.isMesh) {
      count++;
      if (count <= 15) {
        console.log(' Mesh:', child.name, 'verts:', child.geometry.attributes.position.count, 'mat:', child.material?.name || 'no-name');
      }
    }
  });
  console.log('Total meshes in Haven:', count);
} catch (e) {
  console.error('Error parsing Haven:', e);
}
