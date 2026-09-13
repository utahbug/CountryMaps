import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = JSON.parse(
  fs.readFileSync(new URL('../data/africa.manifest.json', import.meta.url)),
);
const sourceBytes = fs.readFileSync(
  new URL('../source-data/ne_10m_admin_0_countries.geojson', import.meta.url),
);
const source = JSON.parse(sourceBytes);
const byId = new Map(source.features.map((f) => [f.properties.ADM0_A3, f]));
const project = ([lon, lat]) => {
  const p = (lat * Math.PI) / 180,
    d = ((lon - 15) * Math.PI) / 180,
    k = Math.sqrt(2 / (1 + Math.cos(p) * Math.cos(d)));
  return [k * Math.cos(p) * Math.sin(d), -k * Math.sin(p)];
};
const polygons = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
const records = [...manifest.countries, ...manifest.context].map(
  ([id, name]) => ({
    id,
    name,
    polygons: (manifest.sourceGroups[id] || [id]).flatMap((key) => {
      if (!byId.has(key)) throw Error('Missing source ' + key);
      return polygons(byId.get(key).geometry).map((poly) =>
        poly.map((ring) => ring.map(project)),
      );
    }),
  }),
);

// Dissolve shared source edges inside explicitly grouped countries (Somalia).
// Natural Earth's adjoining polygons share identical vertices.
for (const c of records.filter(
  (c) => (manifest.sourceGroups[c.id] || []).length > 1,
)) {
  const edges = new Map();
  for (const poly of c.polygons)
    for (const ring of poly)
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i],
          b = ring[i + 1],
          ak = a.join(','),
          bk = b.join(',');
        const key = [ak, bk].sort().join('|');
        if (edges.has(key)) edges.delete(key);
        else edges.set(key, { a, b, ak, bk });
      }
  const starts = new Map([...edges.values()].map((e) => [e.ak, e]));
  const merged = [];
  while (starts.size) {
    const first = starts.values().next().value;
    let edge = first;
    const ring = [first.a];
    let guard = 0;
    do {
      starts.delete(edge.ak);
      ring.push(edge.b);
      if (edge.bk === first.ak) break;
      edge = starts.get(edge.bk);
      if (!edge) throw Error('Unclosed grouped-country boundary');
      if (++guard > 100000) throw Error('Boundary loop');
    } while (true);
    merged.push([ring]);
  }
  c.polygons = merged;
}

const points = records.flatMap((c) => c.polygons.flat(2));
const xs = points.map((p) => p[0]),
  ys = points.map((p) => p[1]);
const minX = xs.reduce((a, b) => Math.min(a, b), Infinity),
  minY = ys.reduce((a, b) => Math.min(a, b), Infinity),
  maxX = xs.reduce((a, b) => Math.max(a, b), -Infinity),
  maxY = ys.reduce((a, b) => Math.max(a, b), -Infinity);
const scale = Math.min(750 / (maxX - minX), 680 / (maxY - minY));
const ox = (800 - (maxX - minX) * scale) / 2,
  oy = (730 - (maxY - minY) * scale) / 2;
const insideRing = (p, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i],
      b = ring[j];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
};
const inside = (p, poly) =>
  insideRing(p, poly[0]) && !poly.slice(1).some((r) => insideRing(p, r));
function boundaryDistance(p, ring) {
  return Math.min(
    ...ring.slice(1).map((b, i) => {
      const a = ring[i],
        dx = b[0] - a[0],
        dy = b[1] - a[1],
        t = Math.max(
          0,
          Math.min(
            1,
            ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) /
              (dx * dx + dy * dy || 1),
          ),
        );
      return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    }),
  );
}
const countries = records.map((c, i) => {
  const polys = c.polygons.map((poly) =>
    poly.map((r) =>
      r.map(([x, y]) => [
        +((x - minX) * scale + ox).toFixed(3),
        +((y - minY) * scale + oy).toFixed(3),
      ]),
    ),
  );
  const all = polys.flat(2),
    xx = all.map((p) => p[0]),
    yy = all.map((p) => p[1]);
  const box = [
    Math.min(...xx),
    Math.min(...yy),
    Math.max(...xx),
    Math.max(...yy),
  ];
  let anchor = polys[0][0][0],
    best = -1;
  for (const poly of polys) {
    const r = poly[0],
      x0 = Math.min(...r.map((p) => p[0])),
      x1 = Math.max(...r.map((p) => p[0])),
      y0 = Math.min(...r.map((p) => p[1])),
      y1 = Math.max(...r.map((p) => p[1]));
    for (let x = 0; x < 25; x++)
      for (let y = 0; y < 25; y++) {
        const p = [
          x0 + ((x + 0.5) * (x1 - x0)) / 25,
          y0 + ((y + 0.5) * (y1 - y0)) / 25,
        ];
        if (inside(p, poly)) {
          const dist = Math.min(
            ...poly.map((ring) => boundaryDistance(p, ring)),
          );
          if (dist > best) {
            best = dist;
            anchor = p;
          }
        }
      }
  }
  const path = polys
    .map((poly) =>
      poly.map((r) => 'M' + r.map((p) => p.join(',')).join('L') + 'Z').join(''),
    )
    .join('');
  return {
    id: c.id,
    name: c.name,
    path,
    bounds: box,
    anchor: anchor.map((n) => +n.toFixed(3)),
    inset: manifest.insets.includes(c.id),
    aliases: manifest.aliases[c.id] || [],
    color: ['#94b9aa', '#d7bc76', '#b9afcd', '#99bcd0', '#d9aa8d'][i % 5],
  };
});
if (countries.length - manifest.context.length !== manifest.expectedCount)
  throw Error('Manifest count mismatch');
const data = {
  id: manifest.id,
  name: manifest.name,
  width: 800,
  height: 730,
  countries: countries.slice(0, manifest.expectedCount),
  context: countries.slice(manifest.expectedCount),
  sourceSha256: crypto.createHash('sha256').update(sourceBytes).digest('hex'),
};
fs.writeFileSync(
  new URL('../data/africa.json', import.meta.url),
  JSON.stringify(data),
);
console.log(
  'Generated ' +
    data.countries.length +
    ' countries; ' +
    data.countries.filter((c) => c.inset).length +
    ' puzzle insets. SHA256 ' +
    data.sourceSha256,
);
