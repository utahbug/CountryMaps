import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RevealEngine} from '../lib/engines/activities.mjs';
const ids=JSON.parse(fs.readFileSync(new URL('../data/africa.json',import.meta.url))).countries.map(c=>c.id);
test('each of 54 countries toggles independently and repeatedly',()=>{
 const e=new RevealEngine(ids);
 for(let round=0;round<4;round++){
  for(const [i,id] of ids.entries()){assert.equal(e.toggle(id),true);assert.ok(e.revealed.has(id));assert.equal(e.revealed.size,i+1);}
  for(const [i,id] of ids.entries()){assert.equal(e.toggle(id),true);assert.ok(!e.revealed.has(id));assert.equal(e.revealed.size,53-i);}
 }
});
test('Reveal All remains idempotent, toggles hide afterward, and Reset clears names',()=>{
 const e=new RevealEngine(ids);e.revealAll();e.revealAll();assert.equal(e.revealed.size,54);
 e.toggle(ids[0]);assert.equal(e.revealed.size,53);e.toggle(ids[0]);assert.equal(e.revealed.size,54);
 for(const invalid of ['SAH','SOL','BRT','bad'])assert.equal(e.toggle(invalid),false);
 e.reset();e.reset();assert.equal(e.revealed.size,0);
});
