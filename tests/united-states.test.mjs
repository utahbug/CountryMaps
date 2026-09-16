import test from 'node:test';
import assert from 'node:assert/strict';
import {mapDefinitions,unitTypeLabel} from '../lib/map-configs.mjs';
import {registry,loadMap} from '../lib/maps.js';
const config=mapDefinitions['united-states'];
test('United States is planned, contains only 50 unique states and cannot load',async()=>{
 assert.equal(config.status,'planned');assert.equal(config.showOnHome,true);assert.equal(config.dataUrl,undefined);assert.equal(registry['united-states'],undefined);
 assert.equal(config.manifest.expectedCount,50);assert.equal(config.manifest.units.length,50);assert.equal(new Set(config.manifest.units.map(u=>u.id)).size,50);
 for(const u of config.manifest.units){assert.equal(u.unitType,'state');assert.equal(unitTypeLabel(u),'State');assert.equal(u.capital,null);assert.equal(u.regionId,null);assert.equal(u.parentSovereignState.id,'USA');assert.equal(u.scored,false);assert.equal(u.path,undefined);}
 assert.ok(!config.manifest.units.some(u=>['US-DC','US-PR','US-GU'].includes(u.id)));await assert.rejects(loadMap('united-states'),/not available/);
 for(const activity of Object.values(config.activities))assert.equal(activity.enabled,false);
});
test('Alaska/Hawaii inset metadata and optional Utah project link do not duplicate geometry or counties',()=>{
 for(const code of ['AK','HI']){const u=config.manifest.units.find(u=>u.id==='US-'+code);assert.deepEqual(config.insets.groups[u.insetGroup].unitIds,[u.id]);assert.equal(config.insets.groups[u.insetGroup].placement,null);}
 assert.equal(config.insets.preserveCanonicalGeometry,true);
 const utah=config.manifest.units.find(u=>u.id==='US-UT');assert.equal(utah.name,'Utah');assert.equal(utah.relatedProject,null);assert.equal(utah.counties,undefined);
});
