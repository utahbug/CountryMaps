import {escapeHTML as esc} from './maps.js';
// One presentation contract for Explorer, Reveal, Puzzle targets, pieces and previews.
export function unitPresentation(config,unit){
 const type=config.visualClassification?.types[unit.unitType];
 return {fill:type?.color||unit.color,label:type?.label||'',dash:type?.boundary==='dashed'?'5 3':''};
}
export function unitSvgAttributes(config,unit,fallback={}){
 const p=unitPresentation(config,unit);
 return 'fill="'+esc(p.fill)+'"'+(p.label?' stroke="#284c48" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-dasharray="'+p.dash+'"':Object.entries(fallback).map(([key,value])=>' '+key+'="'+esc(value)+'"').join(''));
}
export function unitLegend(config){
 const visual=config.visualClassification;if(!visual)return '';
 return '<div class="unit-type-legend" role="group" aria-label="'+esc(visual.legendTitle)+'">'+Object.values(visual.types).map(type=>'<span><i aria-hidden="true" style="background:'+esc(type.color)+';border-style:'+esc(type.boundary)+'"></i>'+esc(type.label)+' <small>('+esc(type.boundary)+' outline)</small></span>').join('')+'</div>';
}
