import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const luminance=hex=>{const v=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
test('shared text, focus and geographic-boundary palette meets contrast thresholds',()=>{
 for(const pair of [['#59665f','#f7f4ec'],['#285d52','#fffdf8'],['#ffffff','#285448'],['#214e3f','#edf5eb']])assert.ok(contrast(...pair)>=4.5,pair.join(' on '));
 assert.ok(contrast('#863a22','#fffdf8')>=3);
 for(const id of ['africa','canada','central-america','south-america']){const data=JSON.parse(readFileSync(new URL('../data/'+id+'.json',import.meta.url)));for(const c of data.units||data.countries)assert.ok(contrast('#405647',c.color)>=3,id+': '+c.id);}
});
