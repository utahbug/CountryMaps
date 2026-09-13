import test from 'node:test';
import assert from 'node:assert/strict';
import {PanController,clampPan} from '../lib/engines/pan-controller.mjs';
const view={x:100,y:100,w:400,h:365},matrix={a:2,b:0,c:0,d:2};
const event=(pointerId=1,x=100,y=100)=>({pointerId,clientX:x,clientY:y,button:0,isPrimary:true});
function setup(){
 const pans=[],taps=[],classes=new Set(),captures=new Set();
 const source={dataset:{},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)},setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>{captures.delete(id);pan.lost({pointerId:id});}};
 const pan=new PanController(v=>pans.push(v),id=>taps.push(id));
 const begin=()=>pan.begin(event(),source,view,matrix,'DZA');
 const clean=()=>{assert.equal(pan.active,null);assert.equal(classes.size,0);assert.equal(captures.size,0);assert.deepEqual(source.dataset,{});};
 return {pan,source,pans,taps,begin,clean};
}
test('tap jitter selects once; meaningful movement uses frozen screen transform',()=>{
 const s=setup();s.begin();s.pan.move(event(1,103,102));assert.equal(s.pans.length,0);s.pan.finish(event(1,103,102));assert.deepEqual(s.taps,['DZA']);s.clean();
 s.begin();s.pan.move(event(1,120,110));assert.deepEqual(s.pans.at(-1),{...view,x:60,y:80});s.pan.move(event(1,130,115));assert.deepEqual(s.pans.at(-1),{...view,x:40,y:70});s.pan.finish(event(1,130,115));assert.equal(s.taps.length,1);s.clean();
});
test('drag returning to origin and final-up-only movement never select',()=>{
 const s=setup();s.begin();s.pan.move(event(1,115));s.pan.finish(event());assert.equal(s.taps.length,0);s.clean();
 s.begin();s.pan.finish(event(1,120));assert.equal(s.taps.length,0);s.clean();
});
test('second pointer cannot replace, finish, move, or cancel active pointer',()=>{
 const s=setup();s.begin();assert.equal(s.pan.begin(event(2),s.source,view,matrix,'EGY'),false);
 assert.equal(s.pan.move(event(2,140)),false);assert.equal(s.pan.finish(event(2)),false);s.pan.lost(event(2));assert.equal(s.pan.active.pointerId,1);s.pan.finish(event());s.clean();
 assert.equal(s.pan.begin({...event(2),isPrimary:false},s.source,view,matrix),false);
});
test('cancel, lost capture, and reset cleanup are repeatable and allow fresh dragging',()=>{
 const s=setup();for(let i=0;i<200;i++){s.begin();s.pan.move(event(1,120));if(i%2)s.pan.lost(event());else s.pan.cancel();s.pan.cancel();s.pan.finish(event());s.clean();}assert.equal(s.taps.length,0);
 s.begin();s.pan.finish(event());assert.deepEqual(s.taps,['DZA']);s.clean();
});
test('capture failure, missing transform, and secondary mouse button leave no state',()=>{
 const s=setup();s.source.setPointerCapture=()=>{throw Error('capture unavailable');};assert.equal(s.begin(),false);s.clean();
 assert.equal(s.pan.begin(event(),s.source,view,null),false);assert.equal(s.pan.begin({...event(),button:2},s.source,view,matrix),false);s.clean();
});
test('pan bounds preserve a reachable map at Fit and at maximum zoom',()=>{
 assert.deepEqual(clampPan({x:9999,y:-9999,w:800,h:730}),{x:160,y:-146,w:800,h:730});
 assert.deepEqual(clampPan({x:9999,y:-9999,w:100,h:100}),{x:720,y:-20,w:100,h:100});
});
