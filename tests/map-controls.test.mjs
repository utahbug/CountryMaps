import test from 'node:test';
import assert from 'node:assert/strict';
import {capitalLabelPositions} from '../lib/capital-labels.mjs';
test('capital labels avoid viewport navigation without changing their content/state',()=>{
 const item={id:'TUN',w:90,h:40,anchor:{x:340,y:30},fitsInside:true,slot:0};
 const result=capitalLabelPositions({w:400,h:500},[item],{obstacles:[{x:260,y:6,w:132,h:44}]});
 assert.equal(result.TUN.strategy,'fallback');assert(result.TUN.y>50);
});
