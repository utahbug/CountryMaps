// Compact previews derived from the same published geometry as the map views.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {registry} from '../lib/maps.js';
import {mapDefinitions} from '../lib/map-configs.mjs';
export function thumbnailPath(path){
 return path.replace(/M([^Z]+)Z/g,(_,ring)=>{
  const points=ring.split('L').map(p=>p.split(',').map(Number)),kept=[points[0]];
  for(const p of points.slice(1)){const last=kept.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>=.8)kept.push(p);}
  // Preserve small islands instead of discarding a ring that becomes too small.
  return 'M'+(kept.length>=4?kept:points).map(p=>p.map(v=>+v.toFixed(1)).join(',')).join('L')+'Z';
 });
}
fs.mkdirSync(new URL('../assets/maps/',import.meta.url),{recursive:true});
for(const [id,entry] of Object.entries(registry)){
 const bytes=fs.readFileSync(entry.url),data=JSON.parse(bytes),config=mapDefinitions[id];
 const units=data.units||data.countries;
 const paths=[...units,...data.context].map(unit=>{
  const style=config.visualClassification?.types[unit.unitType];
  const color=style?.color||(unit.classification?'#cfc9b9':'#83aa9a');
  return '<path data-unit="'+unit.id+'" d="'+thumbnailPath(unit.path)+'" fill="'+color+'"'+(style?.boundary==='dashed'?' stroke-dasharray="2 1"':'')+'/>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+data.width+' '+data.height+'" data-source-sha256="'+crypto.createHash('sha256').update(bytes).digest('hex')+'"><g stroke="#f7f4ec" stroke-width="1.8" stroke-linejoin="round">'+paths+'</g></svg>\n';
 fs.writeFileSync(new URL('../assets/maps/'+id+'.svg',import.meta.url),svg);
 console.log(id+': '+Buffer.byteLength(svg)+' bytes');
}
