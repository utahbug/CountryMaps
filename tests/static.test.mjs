import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {registry,findCountries,normalize} from '../lib/maps.js';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('data/africa.json',root)));
test('final project has zero dependencies and no Cloudflare configuration',()=>{
 const pkg=JSON.parse(fs.readFileSync(new URL('package.json',root)));
 assert.equal(Object.keys(pkg.dependencies||{}).length,0);
 assert.equal(Object.keys(pkg.devDependencies||{}).length,0);
 for(const name of ['node_modules','.openai','wrangler.toml','wrangler.json','vite.config.ts','next.config.ts'])assert.equal(fs.existsSync(new URL(name,root)),false,name);
});
test('browser module imports resolve locally from any hosting subfolder',()=>{
 for(const file of ['js/app.js','lib/maps.js','lib/engines/activities.mjs','lib/engines/drag-controller.mjs','lib/engines/pan-controller.mjs']){
  const url=new URL(file,root),text=fs.readFileSync(url,'utf8');
  for(const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)){assert.ok(match[1].startsWith('.'));assert.ok(fs.existsSync(new URL(match[1],url)),match[1]);}
 }
 const index=fs.readFileSync(new URL('index.html',root),'utf8');
 for(const match of index.matchAll(/(?:src|href)="(\.\/[^"]+)"/g))assert.ok(fs.existsSync(new URL(match[1],root)),match[1]);
 assert.ok(fs.existsSync(new URL('.nojekyll',root)));
 assert.equal(Object.keys(registry).join(','),'africa,canada,central-america,south-america');
 assert.ok(fs.existsSync(fileURLToPath(registry.africa.url)));
});
test('all countries and common accent-free aliases are searchable',()=>{
 for(const c of data.countries)assert.ok(findCountries(data,c.name).some(result=>result.id===c.id));
 assert.equal(findCountries(data,'ivory')[0].id,'CIV');
 assert.equal(findCountries(data,'sao tome')[0].id,'STP');
 assert.equal(findCountries(data,'cape verde')[0].id,'CPV');
 assert.equal(findCountries(data,'swaziland')[0].id,'SWZ');
 assert.equal(normalize('Côte d’Ivoire'),'cote divoire');
 assert.equal(findCountries(data,'not-a-country').length,0);
});
test('pinned original boundary file matches generated provenance',()=>{
 const source=fs.readFileSync(new URL('source-data/ne_10m_admin_0_countries.geojson',root));
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),data.sourceSha256);
});

