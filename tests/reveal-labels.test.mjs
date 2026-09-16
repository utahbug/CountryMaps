import test from 'node:test';
import assert from 'node:assert/strict';
import {placeRevealLabels,labelsDoNotOverlap} from '../lib/reveal-labels.mjs';
test('measured fractional labels stay inside safe bounds and do not overlap',()=>{
 for(const viewport of [{w:341.33,h:410},{w:381.33,h:410},{w:510,h:520},{w:810,h:610}]){
  const items=Array.from({length:9},(_,i)=>({id:String(i),w:120.65,h:i%2?28.3:45.25,anchor:{x:i%2?-200:viewport.w+200,y:i*70},country:{x:i*50,y:i*30,w:15,h:20}}));
  const placed=placeRevealLabels(viewport,items);assert.ok(placed);
  for(const a of items){const p=placed[a.id];assert.ok(p.x>=8&&p.y>=8&&p.x+a.w<=viewport.w-8+.001&&p.y+a.h<=viewport.h-8+.001);
   for(const b of items){if(a===b)continue;const q=placed[b.id];assert.ok(p.x+a.w<=q.x||q.x+b.w<=p.x||p.y+a.h<=q.y||q.y+b.h<=p.y);}
  }
 }
});
test('structured placement uses inside, adjacent, and lane strategies with leaders where needed',()=>{
 const viewport={w:500,h:360};
 const items=[
  {id:'large',w:70,h:24,anchor:{x:250,y:180},country:{x:160,y:100,w:180,h:160},fitsInside:true,neighbors:[]},
  {id:'small',w:80,h:24,anchor:{x:390,y:170},country:{x:380,y:160,w:20,h:20},fitsInside:false,neighbors:[]},
  {id:'crowded',w:90,h:24,anchor:{x:250,y:180},country:{x:240,y:170,w:20,h:20},fitsInside:false,neighbors:[{x:0,y:0,w:500,h:360}]}
 ];
 const placed=placeRevealLabels(viewport,items);assert.ok(placed);assert.equal(placed.large.strategy,'inside');
 assert.equal(placed.large.leader,null);assert.ok(['adjacent','lane'].includes(placed.small.strategy));
 assert.ok(placed.small.leader);assert.ok(placed.crowded.leader);assert.ok(labelsDoNotOverlap(items,placed));
});
test('unpackable names request the measured compact layout fallback',()=>{
 assert.equal(placeRevealLabels({w:100,h:100},[{id:'x',w:95,h:95,anchor:{x:50,y:50},country:{x:50,y:50,w:1,h:1}}]),null);
});
