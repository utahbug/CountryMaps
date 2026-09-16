import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapDefinitions} from '../lib/map-configs.mjs';
import {registry} from '../lib/maps.js';
test('planned Home areas have previews but no enabled activity or dataset',()=>{
 for(const id of ['europe','asia','middle-east']){
  const c=mapDefinitions[id];assert.equal(c.status,'planned');assert(c.showOnHome);
  assert(!registry[id]);assert(!c.dataUrl);assert.equal(c.manifest.units.length,0);
  assert(Object.values(c.activities).every(a=>!a.enabled));
  assert(fs.readFileSync(new URL('../'+c.preview,import.meta.url),'utf8').includes('<path'));
 }
 assert.equal(mapDefinitions['middle-east'].coverage.kind,'overlapping-learning-region');
 assert.equal(mapDefinitions['middle-east'].coverage.exclusive,false);
 assert(mapDefinitions.asia.coverage.submaps.includes('south-asia'));
});
