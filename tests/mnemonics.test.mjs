import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mnemonicCandidates} from '../lib/mnemonics.mjs';
test('all 17 mnemonic candidates are independent, brief and use canonical country IDs',()=>{
 const ids=new Set(JSON.parse(fs.readFileSync(new URL('../data/africa.manifest.json',import.meta.url))).countries.map(c=>c[0]));
 assert.equal(mnemonicCandidates.length,17);assert.equal(new Set(mnemonicCandidates.map(c=>c.id)).size,17);
 for(const c of mnemonicCandidates){assert.equal(typeof c.enabled,'boolean');assert(['Keep','Revise','Remove'].includes(c.review));assert(c.duration>=700&&c.duration<=1500);assert(c.units.every(id=>ids.has(id)));assert(c.caption);}
 assert.deepEqual(mnemonicCandidates.find(c=>c.id==='southern-three').units,['ZAF','LSO','SWZ']);
});
