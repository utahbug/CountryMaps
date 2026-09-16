import test from 'node:test';
import assert from 'node:assert/strict';
import {placeCountryLabel} from '../lib/label-placement.mjs';
const base={viewport:{w:400,h:410},label:{w:140,h:60},country:{x:160,y:150,w:70,h:90},anchor:{x:195,y:195}};
const inside=(p,b=base)=>{assert.ok(p.x>=8&&p.y>=8);assert.ok(p.x+b.label.w<=b.viewport.w-8);assert.ok(p.y+b.label.h<=b.viewport.h-8);};
test('label avoids selected bounds and prefers a neighboring open side',()=>{
 const input={...base,neighbors:[{x:230,y:0,w:170,h:410}]};const p=placeCountryLabel(input);inside(p);assert.ok(p.x+140<=base.country.x||p.y+60<=150||p.y>=240);assert.ok(p.x+140<=230);
});
test('edge and off-screen countries keep long labels inside every target viewport',()=>{
 for(const w of [358,398,518,800])for(const x of [-900,0,w-30,w+600])for(const y of [-600,0,390,1000]){
  const input={...base,viewport:{w,h:410},country:{x,y,w:80,h:80},anchor:{x:x+40,y:y+40}};inside(placeCountryLabel(input),input);
 }
});
test('right edge selects another side rather than clipping or covering the country',()=>{
 const p=placeCountryLabel({...base,country:{x:340,y:150,w:50,h:90},anchor:{x:365,y:195}});inside(p);assert.ok(p.x+140<=340||p.y+60<=150||p.y>=240);
});
test('panning geographic bounds recalculates nearby label position',()=>{
 const before=placeCountryLabel(base),after=placeCountryLabel({...base,country:{...base.country,x:220},anchor:{...base.anchor,x:255}});assert.notDeepEqual(before,after);inside(after);
});
test('large countries use an inside label without a leader',()=>{
 const p=placeCountryLabel({viewport:{w:500,h:400},label:{w:80,h:24},country:{x:120,y:80,w:260,h:220},anchor:{x:250,y:190},neighbors:[]});
 assert.equal(p.strategy,'inside');assert.equal(p.leader,null);inside(p,{viewport:{w:500,h:400},label:{w:80,h:24}});
});
