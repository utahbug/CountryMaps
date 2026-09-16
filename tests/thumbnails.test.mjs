import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {registry} from '../lib/maps.js';
for(const [id,entry] of Object.entries(registry))test(id+' preview preserves real map membership and current geometry provenance',()=>{
 const bytes=fs.readFileSync(entry.url),data=JSON.parse(bytes),svg=fs.readFileSync(new URL('../assets/maps/'+id+'.svg',import.meta.url),'utf8');
 assert.ok(svg.includes('data-source-sha256="'+crypto.createHash('sha256').update(bytes).digest('hex')+'"'));
 assert.deepEqual([...svg.matchAll(/data-unit="([^"]+)"/g)].map(m=>m[1]),[...(data.units||data.countries),...data.context].map(u=>u.id));
 assert.ok(svg.includes('viewBox="0 0 '+data.width+' '+data.height+'"'));assert.ok(!/NaN|Infinity|<script|<image/.test(svg));
 assert.ok(Buffer.byteLength(svg)<200000,'compact preview asset');
});
