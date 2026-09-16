import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pieceDisplayViewBox,pieceViewBox,usesPieceScaleFrame} from '../lib/maps.js';

const data=JSON.parse(await readFile(new URL('../data/africa.json',import.meta.url),'utf8'));
const requested=['RWA','BDI','LSO','SWZ','GMB','DJI','MWI','CPV','COM','MUS','SYC','STP'];

test('small puzzle countries use one map-scale tray frame instead of tight enlargement',()=>{
 for(const id of requested){
  const country=data.countries.find(c=>c.id===id);assert.ok(country,id);
  const display=pieceDisplayViewBox(country).split(' ').map(Number);
  if(usesPieceScaleFrame(country)){
   assert.deepEqual(display.slice(2),[140,96],id+' shared scale frame');
   assert.notEqual(pieceDisplayViewBox(country),pieceViewBox(country),id+' not tightly enlarged');
  }else assert.equal(pieceDisplayViewBox(country),pieceViewBox(country));
 }
});
