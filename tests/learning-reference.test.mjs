import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapDefinitions} from '../lib/map-configs.mjs';
import {countryRegion} from '../lib/regions.mjs';
import {referenceFilters,relatedHistory} from '../lib/learning-reference.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/africa.json',import.meta.url))),ref=JSON.parse(fs.readFileSync(new URL('../data/africa-learning.json',import.meta.url))),ids=new Set(data.countries.map(c=>c.id));
test('54 fact records reference exactly the canonical manifest and regions',()=>{
 assert.deepEqual(new Set(Object.keys(ref.units)),ids);
 for(const [id,f] of Object.entries(ref.units)){
  assert(countryRegion(id,mapDefinitions.africa.regions));assert(f.summary.length<150);assert.equal(f.capital,null);
  for(const n of f.neighborIds){assert(ids.has(n),n);assert(ref.units[n].neighborIds.includes(id),id+' / '+n);}
 }
 assert.equal(referenceFilters(ref,data.countries).landlocked.ids.length,16);
 assert.equal(referenceFilters(ref,data.countries).coastal.ids.length,38);
});
test('typed historical relationships support one or multiple modern units',()=>{
 assert.equal(new Set(ref.history.map(h=>h.id)).size,ref.history.length);
 for(const h of ref.history){assert(h.type&&h.period&&h.note&&h.sources.length);for(const id of h.currentUnitIds)assert(ids.has(id));assert(h.sources.every(s=>s.startsWith('https://')));}
 assert.equal(relatedHistory(ref,'MLI').find(h=>h.id==='mali-federation').currentUnitIds.length,2);
});
