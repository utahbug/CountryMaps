import test from 'node:test';
import assert from 'node:assert/strict';
import {factsPlacement} from '../lib/facts-placement.mjs';
test('facts prefer visible Atlantic notch and stay inside measured viewport',()=>{
 const geo={x:200,y:50,w:500,h:600},p=factsPlacement(900,700,205,190,geo,{x:500,y:350},()=>false);
 assert(p.x>100&&p.y<350);assert(p.x>=8&&p.y>=8&&p.x+p.w<=892&&p.y+p.h<=692);
});
test('facts avoid land and fall back when no open area can contain the card',()=>{
 const geo={x:100,y:10,w:500,h:500};
 const p=factsPlacement(800,600,200,180,geo,{x:400,y:200},(x,y)=>x>250&&y<500);
 assert(p&&p.x+p.w<260);
 assert.equal(factsPlacement(800,600,200,180,geo,{x:400,y:200},()=>true),null);
 assert.equal(factsPlacement(200,100,205,190,geo,{x:0,y:0},()=>false),null);
});
