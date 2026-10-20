import test from 'node:test';import assert from 'node:assert/strict';
import {capitalLabelPositions} from '../lib/capital-labels.mjs';
test('inside candidates win over distant lanes and paired labels stay separate',()=>{
 const a={id:'A',w:140,h:60,anchor:{x:300,y:200},insideCandidates:[{x:250,y:170,w:100,h:60}]};
 const b={id:'B',w:120,h:45,anchor:{x:365,y:245},country:{x:360,y:240,w:10,h:10}};
 const p=capitalLabelPositions({w:700,h:500},[a,b]);assert.equal(p.A.strategy,'inside');assert.equal(p.A.leader,null);
 assert(p.A.x+p.A.w<=p.B.x||p.B.x+p.B.w<=p.A.x||p.A.y+p.A.h<=p.B.y||p.B.y+p.B.h<=p.A.y);
 assert(Math.hypot(p.B.leader.end.x-365,p.B.leader.end.y-245)<120);
});
test('leader attaches to nearest label edge',()=>{
 const p=capitalLabelPositions({w:500,h:400},[{id:'A',w:120,h:50,anchor:{x:240,y:200}}]).A;
 assert(p.leader.end.x>=p.x&&p.leader.end.x<=p.x+p.w);assert(p.leader.end.y>=p.y&&p.leader.end.y<=p.y+p.h);
});
test('offscreen geography uses visible nearby edge callouts',()=>{
 const p=capitalLabelPositions({w:390,h:430},[{id:'A',w:160,h:90,anchor:{x:-200,y:220},country:{x:-250,y:200,w:50,h:40}},{id:'B',w:160,h:80,anchor:{x:800,y:230},country:{x:790,y:200,w:20,h:40}}]);
 for(const b of Object.values(p))assert(b.x>=8&&b.y>=8&&b.x+b.w<=382&&b.y+b.h<=422);
});
