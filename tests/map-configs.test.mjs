import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapDefinitions,terminology,unitTypeLabel,plannedLearningUnits,plannedUnitCounts} from '../lib/map-configs.mjs';
import {registry,loadMap,prepareMap,findUnits} from '../lib/maps.js';
import {practiceSet,countryRegion,africaRegions} from '../lib/regions.mjs';
import {ExplorerEngine,RevealEngine,PuzzleEngine} from '../lib/engines/activities.mjs';
test('map-only datasets are registered while canonical manifests remain metadata only',async()=>{
 assert.deepEqual(Object.keys(registry),['africa','canada','central-america','south-america']);
 for(const id of ['canada','central-america','south-america']){
  const config=mapDefinitions[id];assert.equal(config.status,'ready');assert.equal(config.mapOnly,true);assert.ok(fs.existsSync(config.dataUrl));
  assert.equal(config.source.status,'selected');assert.equal(config.regions,null);
  assert.ok(!/"(?:path|bounds|anchor|geometry)":/.test(JSON.stringify(config.manifest.units)));
  assert.ok(registry[id]);
 }
});
test('future playable manifests have exactly 13, 7 and 12 unique units',()=>{
 for(const [id,count] of [['canada',13],['central-america',7],['south-america',12]]){
  const c=mapDefinitions[id];assert.equal(c.manifest.expectedCount,count);assert.equal(new Set(c.manifest.units.map(u=>u.id)).size,count);
 }
 const canada=mapDefinitions.canada;assert.equal(canada.manifest.units.filter(u=>u.unitType==='province').length,10);assert.equal(canada.manifest.units.filter(u=>u.unitType==='territory').length,3);
 assert.equal(terminology(canada).plural,'provinces and territories');
 const south=mapDefinitions['south-america'];assert.ok(!south.manifest.units.some(u=>u.id==='GUF'));assert.equal(south.context.features[0].playable,false);
});
test('all three existing engines accept Canadian units without geometry or country assumptions',()=>{
 const ids=mapDefinitions.canada.manifest.units.map(u=>u.id),explorer=new ExplorerEngine(ids),reveal=new RevealEngine(ids),puzzle=new PuzzleEngine(ids);
 for(const id of ids){explorer.select(id);assert.equal(explorer.selected,id);reveal.toggle(id);assert.equal(puzzle.place(id,true),true);}
 assert.equal(reveal.revealed.size,13);assert.equal(puzzle.placed.size,13);assert.equal(puzzle.place('GUF',true),false);
 reveal.reset();puzzle.reset();assert.equal(reveal.revealed.size,0);assert.equal(puzzle.placed.size,0);
});
test('adapter preserves canonical Africa identity and generic regional/search support',()=>{
 const raw=JSON.parse(fs.readFileSync(new URL('../data/africa.json',import.meta.url))),data=prepareMap(raw,mapDefinitions.africa);
 assert.equal(data.units,raw.countries);assert.equal(data.countries,data.units);assert.equal(data.config.regions,africaRegions);
 const west=practiceSet(data,'west');assert.equal(west.units,west.countries);assert.ok(west.units.every(u=>data.units.includes(u)));assert.equal(countryRegion('BEN',data.config.regions).name,'West Africa');
 const canada=prepareMap({units:mapDefinitions.canada.manifest.units},mapDefinitions.canada);
 assert.equal(findUnits(canada,'Nunavut')[0].id,'CA-NU');assert.equal(practiceSet(canada),canada);assert.throws(()=>practiceSet(canada,'north'));
 assert.throws(()=>prepareMap({units:[]},mapDefinitions.canada));
 assert.throws(()=>prepareMap({units:canada.units.map((u,i)=>i?u:{...u,id:'INVALID'})},mapDefinitions.canada),/manifest/);
});

test('Canada teaches explicit Province vs Territory answers with parent-state metadata',()=>{
 const config=mapDefinitions.canada;
 for(const u of config.manifest.units){
  assert.ok(['province','territory'].includes(u.unitType));assert.equal(unitTypeLabel(u),u.unitType==='province'?'Province':'Territory');
  assert.deepEqual(u.parentSovereignState,{id:'CAN',name:'Canada'});assert.equal(u.isSovereign,false);assert.equal('type' in u,false);
 }
 assert.equal(config.learning.unitType.answerField,'unitType');assert.equal(config.learning.unitType.enabled,false);
 assert.deepEqual(plannedUnitCounts(config),{playable:13,learnable:13,sovereignCountries:0,territorialUnits:13});
});
test('French Guiana is visible and learnable independently of sovereign-country scoring',()=>{
 const config=mapDefinitions['south-america'],feature=config.context.features[0],learning=plannedLearningUnits(config);
 assert.equal(feature.unitType,'overseas-department-region');assert.equal(feature.classification,'Overseas department/region of France');
 assert.deepEqual(feature.parentSovereignState,{id:'FRA',name:'France'});assert.equal(feature.isSovereign,false);
 assert.equal(learning.find(u=>u.id==='GUF'),feature);assert.ok(learning.includes(config.manifest.units[0]));
 assert.deepEqual(plannedUnitCounts(config),{playable:12,learnable:13,sovereignCountries:12,territorialUnits:1});
 const explorer=new ExplorerEngine(learning.map(u=>u.id)),reveal=new RevealEngine(learning.map(u=>u.id)),puzzle=new PuzzleEngine(config.manifest.units.map(u=>u.id));
 explorer.select('GUF');assert.equal(explorer.selected,'GUF');reveal.toggle('GUF');assert.ok(reveal.revealed.has('GUF'));assert.equal(puzzle.place('GUF',true),false);
});
test('capital metadata is optional, preserves role information, and enables no learning UI',()=>{
 for(const id of ['canada','central-america','south-america']){
  const config=mapDefinitions[id];assert.equal(config.learning.capital.enabled,false);
  for(const u of plannedLearningUnits(config)){assert.ok(u.unitType);assert.equal(u.capital,null);assert.ok(Object.hasOwn(u,'parentSovereignState'));}
 }
 // Test fixture metadata only: no city facts or geographic shapes are being created.
 const config=mapDefinitions.canada;
 const units=config.manifest.units.map((u,i)=>i?u:{...u,capital:{name:'Example City',role:'capital',additionalSeats:[{name:'Example Seat',role:'seat-of-government'}],source:null}});
 const prepared=prepareMap({units},config);assert.equal(prepared.units[0].capital,units[0].capital);assert.equal(prepared.units[0].capital.additionalSeats[0].role,'seat-of-government');
});
