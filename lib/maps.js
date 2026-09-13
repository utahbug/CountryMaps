// Each approved continent or regional map is registered here once.
export const registry = {
  africa: { name: 'Africa', url: new URL('../data/africa.json', import.meta.url) },
};
export const modes = ['explorer', 'reveal', 'puzzle'];
export const titles = { explorer: 'Explorer', reveal: 'Reveal', puzzle: 'Puzzle' };
const cache = new Map();
export async function loadMap(id) {
  if (!registry[id]) throw Error('This map is not available. The first edition includes Africa.');
  if (!cache.has(id)) {
    const response = await fetch(registry[id].url);
    if (!response.ok) throw Error('The map data could not be loaded.');
    const data = await response.json();
    if (data.countries.length !== new Set(data.countries.map(c=>c.id)).size) throw Error('Duplicate country IDs.');
    cache.set(id, data);
  }
  return cache.get(id);
}
export function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase();
}
export function findCountries(data, query) {
  const q = normalize(query.trim());
  return data.countries.filter(c => [c.name, c.id, ...c.aliases].some(n => normalize(n).includes(q)));
}
export function insetTransform(c) {
  const [x0,y0,x1,y1]=c.bounds,scale=Math.min(128/(x1-x0),112/(y1-y0));
  return {scale,x:680-(x0+x1)*scale/2,y:115-(y0+y1)*scale/2};
}
export function pieceViewBox(c) {
  const [x0,y0,x1,y1]=c.bounds,p=Math.max(x1-x0,y1-y0)*.08;
  return [x0-p,y0-p,x1-x0+p*2,y1-y0+p*2].join(' ');
}
export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
