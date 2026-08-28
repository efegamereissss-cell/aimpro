import * as THREE from 'three';
import fs from 'fs';

const havenPath = './public/models/haven_c_site/source/Site C haven.fbx';
const omenPath = './public/models/omen_bot/source/New_Omen.fbx';

console.log('Haven size (MB):', (fs.statSync(havenPath).size / (1024 * 1024)).toFixed(2));
console.log('Omen size (MB):', (fs.statSync(omenPath).size / (1024 * 1024)).toFixed(2));

const omenTexDir = './public/models/omen_bot/textures';
console.log('Omen textures:', fs.readdirSync(omenTexDir));
