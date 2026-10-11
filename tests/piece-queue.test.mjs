import test from 'node:test';
import assert from 'node:assert/strict';
import {PieceQueue} from '../lib/piece-queue.mjs';
test('phone queue rotates skips, excludes completed, respects subsets and resets',()=>{
 const q=new PieceQueue(),ids=['a','b','c'],placed=new Set();
 assert.equal(q.next(ids,placed),'a');assert.equal(q.skip('a',ids,placed),'b');
 placed.add('b');assert.equal(q.next(ids,placed),'c');assert.equal(q.skip('c',ids,placed),'a');
 assert.equal(q.next(['c'],placed),'c');assert.equal(q.skip('c',['c'],placed),'c');
 placed.add('c');assert.equal(q.next(['c'],placed),null);
 q.reset(ids);placed.clear();assert.equal(q.next(ids,placed),'a');
});
