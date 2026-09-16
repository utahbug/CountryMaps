// Optional packaging only: GitHub Pages can also serve the project root as-is.
import './build-thumbnails.mjs';
import {registry} from '../lib/maps.js';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
const files=['index.html','africa/index.html','styles.css','favicon.svg','favicon-32x32.png','apple-touch-icon.png','icon-192.png','icon-512.png','site.webmanifest','robots.txt','.nojekyll','js/app.js','lib/maps.js','lib/map-configs.mjs','lib/unit-presentation.mjs','lib/drop-validation.mjs','lib/regions.mjs','lib/label-placement.mjs','lib/reveal-labels.mjs','lib/engines/activities.mjs','lib/engines/drag-controller.mjs','lib/engines/pan-controller.mjs','data/africa.json','data/canada.json','data/central-america.json','data/south-america.json'];
files.push(...Object.keys(registry).map(id=>'assets/maps/'+id+'.svg'));
fs.mkdirSync(out,{recursive:true});
for(const relative of files){
 const source=path.join(root,relative),destination=path.join(out,relative);
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(source,destination);
}
console.log('Copied '+files.length+' static files to dist/. No bundler, dependencies, or deployment.');
