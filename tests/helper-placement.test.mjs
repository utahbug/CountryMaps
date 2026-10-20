import test from 'node:test';import assert from 'node:assert/strict';import {helperPlacement} from '../lib/helper-placement.mjs';
test('helper moves up and inward, preserves size and avoids land/control space',()=>{
 for(const [w,h] of [[374,470],[414,500],[900,650],[1180,740]]){
  const first=helperPlacement(w,h,()=>false);assert.ok(first.x>8);assert.ok(first.y<h-first.h-8);assert.equal(first.w,w<651?126:158);assert.equal(first.h,w<651?140:166);
  const blocked=(x,y)=>x>=first.x&&x<=first.x+first.w&&y>=first.y&&y<=first.y+first.h;
  const next=helperPlacement(w,h,blocked);assert.equal(next.hits,0);assert.ok(next.x>=8&&next.y>=8&&next.x+next.w<=w-8+.01&&next.y+next.h<=h-8+.01);
 }
});
test('preferred notch follows transformed visible geography rather than a fixed corner',()=>{
 const left=helperPlacement(900,650,()=>false,{x:250,y:40,w:400,h:450});
 const right=helperPlacement(900,650,()=>false,{x:480,y:100,w:350,h:400});
 assert.ok(right.x>left.x);assert.ok(right.y>left.y);assert.equal(right.w,left.w);assert.equal(right.h,left.h);
});
