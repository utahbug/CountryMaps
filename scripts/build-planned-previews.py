"""Home-only silhouettes from the pinned public-domain source; no playable data."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
features = json.loads((root / 'source-data/ne_10m_admin_0_countries.geojson').read_text(encoding='utf-8'))['features']
areas = {
    'europe': (-25, 34, 46, 72, lambda p: p['CONTINENT'] == 'Europe'),
    'asia': (25, -12, 180, 78, lambda p: p['CONTINENT'] == 'Asia' or p['ADM0_A3'] == 'RUS'),
    'middle-east': (24, 10, 64, 43, lambda p: p['ADM0_A3'] in {'EGY','TUR','CYP','SYR','LBN','ISR','PSX','JOR','IRQ','IRN','SAU','YEM','OMN','ARE','QAT','BHR','KWT'}),
}

def clip(points, axis, limit, greater):
    out = []
    if not points:
        return out
    a = points[-1]
    for b in points:
        ina, inb = (a[axis] >= limit, b[axis] >= limit) if greater else (a[axis] <= limit, b[axis] <= limit)
        if ina != inb:
            t = (limit-a[axis])/(b[axis]-a[axis])
            out.append([a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])])
        if inb:
            out.append(b)
        a = b
    return out

for name, (left, bottom, right, top, include) in areas.items():
    paths = []
    xscale = .65 if name == 'europe' else .85
    for f in features:
        if not include(f['properties']):
            continue
        g = f['geometry']
        for polygon in g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]:
            points = polygon[0]
            for axis, limit, greater in [(0,left,True),(0,right,False),(1,bottom,True),(1,top,False)]:
                points = clip(points, axis, limit, greater)
            kept = []
            for x, y in points:
                if not kept or (x-kept[-1][0])**2+(y-kept[-1][1])**2 > .06**2:
                    kept.append((x,y))
            if len(kept) >= 3:
                paths.append('M'+'L'.join(f'{(x-left)*xscale:.2f},{top-y:.2f}' for x,y in kept)+'Z')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 '+f'{(right-left)*xscale+4:.2f} {top-bottom+4:.2f}'+'"><desc>Illustrative planned-area preview. Natural Earth public domain. Not a playable manifest.</desc><path fill="#98aaa0" d="'+' '.join(paths)+'"/></svg>\n'
    (root / f'assets/maps/{name}-planned.svg').write_text(svg, encoding='utf-8')
