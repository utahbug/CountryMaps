import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapDefinitions} from '../lib/map-configs.mjs';
import {learningFilters,filteredUnits} from '../lib/practice-subsets.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/africa.json',import.meta.url))),filters=learningFilters(mapDefinitions.africa);
test('practice subsets reuse canonical IDs and all 54 have one primary region',()=>{
 const ids=new Set(data.countries.map(c=>c.id));
 for(const f of Object.values(filters)){if(!f.ids)continue;assert.equal(new Set(f.ids).size,f.ids.length);for(const id of f.ids)assert.ok(ids.has(id));}
 const regions=Object.entries(mapDefinitions.africa.regions).filter(([id])=>id!=='all');
 for(const id of ids)assert.equal(regions.filter(([,r])=>r.ids.includes(id)).length,1);
 assert.equal(filteredUnits(data.countries,filters.az).length,54);
 assert.deepEqual(filters.islands.ids,['CPV','COM','MDG','MUS','STP','SYC']);
 assert.equal(filters.small.ids.length,16);
 for(const f of Object.values(filters))for(const c of filteredUnits(data.countries,f))assert.ok(data.countries.includes(c));
});
