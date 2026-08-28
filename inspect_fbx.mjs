import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';

// Node.js canvas polyfill mock for FBXLoader
if (!globalThis.window) {
  globalThis.window = {
    innerWidth: 1920,
    innerHeight: 1080
  };
  globalThis.document = {
    createElement: () => ({
      getContext: () => ({}),
      style: {}
    })
  };
}

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
  let havenMeshCount = 0;
  havenObj.traverse(child => {
    if (child.isMesh) {
      havenMeshCount++;
      if (havenMeshCount <= 10) {
        console.log(' Haven Mesh:', child.name, 'vertices:', child.geometry.attributes.position.count, 'mat:', child.material?.name || typeof child.material);
      }
    }
  });
  console.log('Total Haven meshes:', havenMeshCount);
} catch (e) {
  console.error('Error parsing Haven:', e);
}

try {
  const omenBuffer = fs.readFileSync('./public/models/omen_bot/source/New_Omen.fbx');
  const omenObj = fbxLoader.parse(omenBuffer.buffer, '');
  const omenBox = new THREE.Box3().setFromObject(omenObj);
  const omenSize = omenBox.getSize(new THREE.Vector3());
  const omenCenter = omenBox.getCenter(new THREE.Vector3());
  console.log('--- OMEN BOT FBX ---');
  console.log('Omen Size:', omenSize);
  console.log('Omen Center:', omenCenter);
  let omenMeshCount = 0;
  omenObj.traverse(child => {
    if (child.isMesh) {
      omenMeshCount++;
      console.log(' Omen Mesh:', child.name, 'vertices:', child.geometry.attributes.position.count, 'mat:', child.material?.name || typeof child.material);
    }
  });
  console.log('Total Omen meshes:', omenMeshCount);
} catch (e) {
  console.error('Error parsing Omen:', e);
}
