import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptsIslandDrop} from '../lib/drop-validation.mjs';
test('island ocean radius is generous, viewport bounded, and excludes neighboring land',()=>{
 const target={x:100,y:100},viewport={x:0,y:0,w:200,h:200};
 assert(acceptsIslandDrop({x:125,y:100},target,viewport));
 assert(!acceptsIslandDrop({x:127,y:100},target,viewport));
 assert(!acceptsIslandDrop({x:-1,y:100},{x:10,y:100},viewport));
 assert(!acceptsIslandDrop({x:120,y:100},target,viewport,[{contains:p=>p.x>110}]));
});
