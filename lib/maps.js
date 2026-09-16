import {mapDefinitions} from './map-configs.mjs?v=learning';
export const registry=Object.fromEntries(Object.entries(mapDefinitions).filter(([,c])=>c.status==='ready'&&c.dataUrl).map(([id,c])=>[id,{name:c.name,url:c.dataUrl}]));
export const modes = ['explorer', 'reveal', 'puzzle'];
export const titles = { explorer: 'Explorer', reveal: 'Reveal', puzzle: 'Puzzle' };
const cache = new Map();
export async function loadMap(id) {
  if (!registry[id]) throw Error('This map is not available. The first edition includes Africa.');
  if (!cache.has(id)) {
    const response = await fetch(registry[id].url);
    if (!response.ok) throw Error('The map data could not be loaded.');
    const data = prepareMap(await response.json(),mapDefinitions[id]);
    if(data.config.referenceUrl){const facts=await fetch(data.config.referenceUrl);if(!facts.ok)throw Error('Learning reference could not be loaded.');data.reference=await facts.json();}
    if (data.countries.length !== new Set(data.countries.map(c=>c.id)).size) throw Error('Duplicate unit IDs.');
    cache.set(id, data);
  }
  return cache.get(id);
}
// Keep the legacy Africa field as an alias, never a second manifest or geometry copy.
export function prepareMap(data,config){
 const units=data.units||data.countries;
 if(!units||units.length!==config.manifest.expectedCount||new Set(units.map(c=>c.id)).size!==units.length)throw Error('Invalid playable-unit manifest.');
 if(config.manifest.units&&config.manifest.units.some(unit=>!units.some(candidate=>candidate.id===unit.id)))throw Error('Playable IDs do not match the manifest.');
 return {...data,units,countries:units,context:data.context||[],config};
}
export const findUnits=(data,query)=>findCountries(data,query);
export function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase();
}
export function findCountries(data, query) {
  const q = normalize(query.trim());
  return (data.units||data.countries).filter(c => [c.name, c.id, ...(c.aliases||[])].some(n => normalize(n).includes(q)));
}
export function insetTransform(c) {
  const [x0,y0,x1,y1]=c.bounds,scale=Math.min(128/(x1-x0),112/(y1-y0));
  return {scale,x:680-(x0+x1)*scale/2,y:115-(y0+y1)*scale/2};
}
export function pieceViewBox(c) {
  const [x0,y0,x1,y1]=c.bounds,p=Math.max(x1-x0,y1-y0)*.08;
  return [x0-p,y0-p,x1-x0+p*2,y1-y0+p*2].join(' ');
}
// Small units share one geographic-size frame instead of each being enlarged to
// fill its card. The whole card remains the generous pointer target.
export function usesPieceScaleFrame(c) {
  const [x0,y0,x1,y1]=c.bounds;
  return !!c.inset||Math.min(x1-x0,y1-y0)<28;
}
export function pieceDisplayViewBox(c) {
  if(!usesPieceScaleFrame(c))return pieceViewBox(c);
  const [x0,y0,x1,y1]=c.bounds,cx=(x0+x1)/2,cy=(y0+y1)/2,w=140,h=96;
  return [cx-w/2,cy-h/2,w,h].join(' ');
}
export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
