import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {mapDefinitions} from '../lib/map-configs.mjs';
import {prepareMap} from '../lib/maps.js';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
test('Africa geometry remains byte-identical to the pre-Americas implementation',()=>assert.equal(crypto.createHash('sha256').update(read('data/africa.json')).digest('hex'),'6f91f0298ea77aa080b4910b3bfbcf627ca1b00e366533458f0a5eef9356e827'));
for(const id of ['canada','central-america','south-america'])test(id+' geometry exactly covers its manifest and fits the shared viewport',()=>{
 const config=mapDefinitions[id],data=JSON.parse(read('data/'+id+'.json'));
 prepareMap(data,config);assert.deepEqual(data.units.map(u=>u.id),config.manifest.units.map(u=>u.id));
 assert.equal(data.source.sha256,crypto.createHash('sha256').update(read(data.source.path)).digest('hex'));
 for(const unit of [...data.units,...data.context]){
  assert.ok(unit.path.startsWith('M')&&unit.path.endsWith('Z'));assert.ok(!/NaN|Infinity/.test(unit.path));
  const [x,y,r,b]=unit.bounds;assert.ok(x>=0&&y>=0&&r<=800&&b<=730&&r>x&&b>y,unit.id);
  assert.ok(unit.anchor[0]>=x&&unit.anchor[0]<=r&&unit.anchor[1]>=y&&unit.anchor[1]<=b);
  assert.ok(unit.unitType);assert.ok(Object.hasOwn(unit,'capital'));assert.ok(Object.hasOwn(unit,'parentSovereignState'));assert.equal(unit.scored,false);
  assert.equal((unit.path.match(/M/g)||[]).length>=unit.sourcePolygonCount,true);
 }
 if(id==='south-america'){assert.equal(data.context.length,1);const guiana=data.context[0];assert.equal(guiana.id,'GUF');assert.equal(guiana.parentSovereignState.id,'FRA');assert.equal(guiana.playable,false);assert.equal(data.units.filter(u=>u.isSovereign).length,12);}
 if(id==='canada'){assert.equal(data.units.filter(u=>u.unitType==='province').length,10);assert.equal(data.units.filter(u=>u.unitType==='territory').length,3);}
});
