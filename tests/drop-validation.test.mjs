import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptsGeometryDrop,acceptsInsetDrop,draggedBounds} from '../lib/drop-validation.mjs';
const viewport={x:0,y:0,w:400,h:400};
const shape=(x,y,w,h,small=false)=>({bounds:{x,y,w,h},center:{x:x+w/2,y:y+h/2},small,contains:p=>p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h});
const points=b=>Array.from({length:400},(_,i)=>({x:b.x+(i%20+.5)*b.w/20,y:b.y+(Math.floor(i/20)+.5)*b.h/20}));
test('normal geometry accepts meaningful overlap, rejects slivers and wrong neighbors',()=>{
 const target=shape(100,100,100,100),piece={x:150,y:100,w:100,h:100};
 assert.equal(acceptsGeometryDrop({points:points(piece),piece,target,neighbors:[],viewport}),true);
 const far={...piece,x:190};assert.equal(acceptsGeometryDrop({points:points(far),piece:far,target,neighbors:[],viewport}),false);
 const wrong={...piece,x:170};assert.equal(acceptsGeometryDrop({points:points(wrong),piece:wrong,target,neighbors:[shape(200,100,100,100)],viewport}),false);
});
test('narrow targets receive tolerance only after true overlap and lose to nearer intersected neighbors',()=>{
 const target=shape(100,100,8,80,true),piece={x:106,y:100,w:8,h:80};
 assert.equal(acceptsGeometryDrop({points:points(piece),piece,target,neighbors:[],viewport}),true);
 assert.equal(acceptsGeometryDrop({points:points(piece),piece,target,neighbors:[shape(108,100,8,80,true)],viewport}),false);
 const missed={...piece,x:109};assert.equal(acceptsGeometryDrop({points:points(missed),piece:missed,target,neighbors:[],viewport}),false);
});
test('inset bounds permit an outside cursor and reject zero overlap or offscreen zones',()=>{
 const target={x:100,y:100,w:80,h:80};
 assert.equal(acceptsInsetDrop({x:72,y:120,w:40,h:40},target,viewport),true);
 assert.equal(acceptsInsetDrop({x:59,y:120,w:40,h:40},target,viewport),false);
 assert.equal(acceptsInsetDrop({x:100,y:100,w:40,h:40},target,{x:0,y:0,w:90,h:90}),false);
 assert.deepEqual(draggedBounds({bounds:[0,0,10,20],anchor:[2,10]},100,100,2),{x:96,y:80,w:20,h:40});
});

test('inset overlap loses to nearer visible neighboring geography',()=>{
 const target={x:150,y:100,w:80,h:80},piece={x:125,y:110,w:40,h:40};
 assert.equal(acceptsInsetDrop(piece,target,viewport),true);
 assert.equal(acceptsInsetDrop(piece,target,viewport,[shape(110,100,40,80)]),false);
 // The inset masks the underlying geography; hidden neighbors cannot reject a correct drop.
 assert.equal(acceptsInsetDrop({x:160,y:120,w:40,h:40},target,viewport,[shape(150,100,80,80)]),true);
});

test('small-country tolerance rejects a mostly-neighbor drop even with a distant neighbor center',()=>{
 const target=shape(100,100,8,80,true),piece={x:107.5,y:100,w:8,h:80},neighbor=shape(108,0,180,300);
 assert.equal(acceptsGeometryDrop({points:points(piece),piece,target,neighbors:[neighbor],viewport}),false);
});
