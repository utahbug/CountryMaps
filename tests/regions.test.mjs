import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {africaRegions,practiceSet,fittedRegion} from '../lib/regions.mjs';
import {RevealEngine,PuzzleEngine} from '../lib/engines/activities.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/africa.json',import.meta.url)));
test('five regional subsets partition all 54 canonical countries exactly once',()=>{
 const ids=Object.entries(africaRegions).filter(([id])=>id!=='all').flatMap(([,r])=>r.ids);
 assert.equal(ids.length,54);assert.equal(new Set(ids).size,54);
 assert.deepEqual([...ids].sort(),data.countries.map(c=>c.id).sort());
 assert.deepEqual(Object.values(africaRegions).slice(1).map(r=>r.ids.length),[6,16,9,18,5]);
 assert.equal(practiceSet(data),data);assert.throws(()=>practiceSet(data,'invalid'));
});
test('regional data reuses canonical objects and fitted bounds contain all polygons including islands',()=>{
 for(const id of Object.keys(africaRegions)){
  const subset=practiceSet(data,id),view=fittedRegion(subset,id);
  for(const c of subset.countries)assert.equal(c,data.countries.find(original=>original.id===c.id));
  for(const c of [...subset.countries,...subset.context]){
   assert.ok(c.bounds[0]>=view.x&&c.bounds[1]>=view.y&&c.bounds[2]<=view.x+view.w&&c.bounds[3]<=view.y+view.h,c.name);
  }
 }
 assert.ok(africaRegions.north.ids.includes('SDN'));assert.ok(africaRegions.east.ids.includes('SSD'));
 assert.ok(africaRegions.central.ids.includes('AGO'));assert.ok(africaRegions.east.ids.includes('ZMB'));
});
test('Reveal and future Puzzle reuse the same region subsets without counting territories',()=>{
 for(const id of Object.keys(africaRegions)){
  const subset=practiceSet(data,id),ids=subset.countries.map(c=>c.id),reveal=new RevealEngine(ids),puzzle=new PuzzleEngine(ids);
  reveal.revealAll();assert.equal(reveal.revealed.size,ids.length);
  for(const country of ids)assert.equal(puzzle.place(country,true),true);
  for(const c of data.countries.filter(c=>!ids.includes(c.id))){assert.equal(reveal.toggle(c.id),false);assert.equal(puzzle.place(c.id,true),false);}
  for(const c of data.context){assert.equal(reveal.toggle(c.id),false);assert.equal(puzzle.place(c.id,true),false);}
  assert.equal(puzzle.placed.size,ids.length);reveal.reset();puzzle.reset();assert.equal(reveal.revealed.size+puzzle.placed.size,0);
 }
});

test('all 54 countries have a shared regional clue and territories do not',async()=>{
 const {countryRegion}=await import('../lib/regions.mjs');
 for(const c of data.countries){
  const region=countryRegion(c.id);assert.ok(region,c.name);
  assert.equal(Object.values(africaRegions).filter(r=>r.ids?.includes(c.id)).length,1);
  assert.equal(region,Object.values(africaRegions).find(r=>r.ids?.includes(c.id)));
 }
 for(const c of data.context)assert.equal(countryRegion(c.id),null);
});

test('Explorer groups contain canonical countries once each, alphabetically within each region',async()=>{
 const {groupedCountries,countryRegionId}=await import('../lib/regions.mjs'),groups=groupedCountries(data.countries);
 const flat=groups.flatMap(g=>g.countries);assert.equal(flat.length,54);assert.equal(new Set(flat.map(c=>c.id)).size,54);
 for(const group of groups){
  assert.deepEqual(group.countries.map(c=>c.name),group.countries.map(c=>c.name).sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
  for(const c of group.countries){assert.equal(countryRegionId(c.id),group.id);assert.equal(c,data.countries.find(n=>n.id===c.id));}
 }
});
