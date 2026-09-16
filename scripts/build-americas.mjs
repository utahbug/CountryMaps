// Generate only the three map-only datasets. Africa and its builder are untouched.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {mapDefinitions} from '../lib/map-configs.mjs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url));
const files={country:'source-data/ne_10m_admin_0_countries.geojson',province:'source-data/ne_50m_admin_1_states_provinces.geojson'};
const bytes=Object.fromEntries(Object.entries(files).map(([key,path])=>[key,read(path)]));
const source=Object.fromEntries(Object.entries(bytes).map(([key,value])=>[key,JSON.parse(value)]));
const polygons=g=>g.type==='Polygon'?[g.coordinates]:g.coordinates;
const inside=(point,ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
const bounds=points=>points.reduce((b,[x,y])=>[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)],[Infinity,Infinity,-Infinity,-Infinity]);
for(const [id,center] of Object.entries({canada:[-95,60],'central-america':[-85,14],'south-america':[-60,-20]})){
 const config=mapDefinitions[id],key=id==='canada'?'province':'country',r=Math.PI/180,l0=center[0]*r,p0=center[1]*r;
 const project=([lon,lat])=>{const p=lat*r,d=lon*r-l0,k=Math.sqrt(2/(1+Math.sin(p0)*Math.sin(p)+Math.cos(p0)*Math.cos(p)*Math.cos(d)));return [k*Math.cos(p)*Math.sin(d),-k*(Math.cos(p0)*Math.sin(p)-Math.sin(p0)*Math.cos(p)*Math.cos(d))];};
 const metadata=[...config.manifest.units,...config.context.features];
 const records=metadata.map(unit=>{
  const feature=source[key].features.find(f=>key==='province'?f.properties.iso_3166_2===unit.id:f.properties.ADM0_A3===(unit.id==='GUF'?'FRA':unit.id));
  if(!feature)throw Error('Missing source unit '+unit.id);
  let parts=polygons(feature.geometry);
  // Retain whole France polygons within French Guiana's geographic envelope, not mainland France or other overseas regions.
  if(unit.id==='GUF')parts=parts.filter(poly=>poly[0].every(([lon,lat])=>lon>=-55&&lon<=-50&&lat>=1&&lat<=7));
  if(!parts.length)throw Error('No polygons for '+unit.id);
  return {unit,parts:parts.map(poly=>poly.map(ring=>ring.map(project))),sourcePolygonCount:parts.length};
 });
 const b=bounds(records.flatMap(c=>c.parts.flat(2))),scale=Math.min(744/(b[2]-b[0]),674/(b[3]-b[1]));
 const ox=(800-(b[2]-b[0])*scale)/2,oy=(730-(b[3]-b[1])*scale)/2;
 const geometry=records.map(({unit,parts,sourcePolygonCount},i)=>{
  const polys=parts.map(poly=>poly.map(ring=>ring.map(([x,y])=>[+((x-b[0])*scale+ox).toFixed(3),+((y-b[1])*scale+oy).toFixed(3)])));
  // Interior anchor on the largest polygon. No island geometry is moved or enlarged.
  const area=ring=>Math.abs(ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0));
  const largest=[...polys].sort((a,b)=>area(b[0])-area(a[0]))[0],bb=bounds(largest[0]),middle=[(bb[0]+bb[2])/2,(bb[1]+bb[3])/2];
  let anchor=largest[0][0],distance=Infinity;
  for(let x=0;x<31;x++)for(let y=0;y<31;y++){const p=[bb[0]+(x+.5)*(bb[2]-bb[0])/31,bb[1]+(y+.5)*(bb[3]-bb[1])/31],d=Math.hypot(p[0]-middle[0],p[1]-middle[1]);if(d<distance&&inside(p,largest[0])&&!largest.slice(1).some(ring=>inside(p,ring))){anchor=p;distance=d;}}
  return {...unit,playable:unit.playable!==false,scored:false,aliases:[],path:polys.map(poly=>poly.map(ring=>'M'+ring.map(p=>p.join(',')).join('L')+'Z').join('')).join(''),bounds:bounds(polys.flat(2)),anchor:anchor.map(n=>+n.toFixed(3)),color:['#94b9aa','#d7bc76','#b9afcd','#99bcd0','#d9aa8d'][i%5],sourcePolygonCount};
 });
 const data={id,name:config.name,width:800,height:730,units:geometry.slice(0,config.manifest.expectedCount),context:geometry.slice(config.manifest.expectedCount),projection:{name:'Spherical Lambert azimuthal equal-area',center},source:{path:files[key],sha256:crypto.createHash('sha256').update(bytes[key]).digest('hex'),version:'v5.1.2'}};
 fs.writeFileSync(new URL('../data/'+id+'.json',import.meta.url),JSON.stringify(data));
 console.log(id+': '+data.units.length+' primary units + '+data.context.length+' context units');
}
