import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PuzzleEngine,RevealEngine} from '../lib/engines/activities.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const data=read('data/africa.json'),manifest=read('data/africa.manifest.json'),source=read('source-data/ne_10m_admin_0_countries.geojson');
test('all African mainland source records have an explicit country or context treatment',()=>{
 const used=new Set(manifest.countries.flatMap(([id])=>manifest.sourceGroups[id]||[id]));
 const context=new Set(data.context.map(c=>c.id));
 for(const f of source.features.filter(f=>f.properties.CONTINENT==='Africa'))assert.ok(used.has(f.properties.ADM0_A3)||context.has(f.properties.ADM0_A3),f.properties.ADMIN);
 assert.deepEqual([...context],['SAH','BRT','SOL']);
 for(const c of data.context){assert.ok(c.path.length>0);assert.ok(c.classification);assert.ok(c.description);}
});
test('territories never increment the 54-country Reveal or Puzzle score',()=>{
 const ids=data.countries.map(c=>c.id),puzzle=new PuzzleEngine(ids),reveal=new RevealEngine(ids);
 assert.equal(ids.length,54);assert.deepEqual(ids,manifest.countries.map(([id])=>id));
 for(const c of data.context){assert.equal(puzzle.place(c.id,true),false);assert.equal(reveal.reveal(c.id),false);}
 assert.equal(puzzle.placed.size,0);assert.equal(reveal.revealed.size,0);
 for(const id of ids)puzzle.place(id,true);reveal.revealAll();assert.equal(puzzle.placed.size,54);assert.equal(reveal.revealed.size,54);
 assert.equal(data.context.find(c=>c.id==='SOL').puzzleGroup,'SOM');
});
