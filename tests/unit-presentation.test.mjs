import test from 'node:test';
import assert from 'node:assert/strict';
import {mapDefinitions} from '../lib/map-configs.mjs';
import {unitPresentation,unitSvgAttributes,unitLegend} from '../lib/unit-presentation.mjs';
test('all 13 Canada units use a shared color and non-color classification',()=>{
 const config=mapDefinitions.canada;
 for(const unit of config.manifest.units){
  const style=unitPresentation(config,unit),province=unit.unitType==='province';
  assert.equal(style.label,province?'Province':'Territory');assert.equal(style.fill,province?'#90bfd3':'#e1bc70');assert.equal(style.dash,province?'':'5 3');
  assert.match(unitSvgAttributes(config,unit),/vector-effect="non-scaling-stroke"/);
 }
 const legend=unitLegend(config);assert.match(legend,/Province/);assert.match(legend,/Territory/);assert.match(legend,/solid outline/);assert.match(legend,/dashed outline/);
 assert.equal(config.mapOnly,true);assert.ok(config.dataUrl);
});
test('unclassified Africa presentation remains unchanged',()=>{
 const unit={color:'#abcdef'};assert.equal(unitSvgAttributes(mapDefinitions.africa,unit),'fill="#abcdef"');assert.equal(unitLegend(mapDefinitions.africa),'');
});
