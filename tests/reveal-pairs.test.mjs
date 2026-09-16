import test from 'node:test';
import assert from 'node:assert/strict';
import {RevealEngine} from '../lib/engines/activities.mjs';
test('limited Reveal uses FIFO, preserves pairs and restarts after Clear/Reset',()=>{
 const e=new RevealEngine(['SDN','SSD','COD','COG'],{limit:2});
 const check=ids=>assert.deepEqual([...e.revealed],ids);
 e.toggle('SDN');e.toggle('SSD');check(['SDN','SSD']);
 e.reveal('SDN');e.toggle('COD');check(['SSD','COD']);
 e.toggle('SSD');e.toggle('SSD');e.toggle('COG');check(['SSD','COG']);
 assert.equal(e.toggle('invalid'),false);check(['SSD','COG']);
 e.revealAll();assert.equal(e.revealed.size,4);
 e.toggle('COD');assert.equal(e.revealed.size,3);e.toggle('COD');assert.equal(e.revealed.size,4);
 for(const action of ['clear','reset']){
  e[action]();check([]);e.reveal('SDN');e.reveal('SSD');e.reveal('COD');check(['SSD','COD']);e.revealAll();
 }
});
