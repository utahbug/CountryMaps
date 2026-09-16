import {africaPracticeSubsets} from './practice-subsets.mjs';
import {africaRegions} from './regions.mjs';

// Stable values are quiz answers; labels are presentation text, not inferred from names.
export const unitTypes={
 country:{label:'Country'},
 state:{label:'State'},
 province:{label:'Province'},
 territory:{label:'Territory'},
 'overseas-department-region':{label:'Overseas department/region'},
};
// capital:null means not researched yet. See MAP_CONFIGURATION.md for the capital schema.
const unit=(id,name,unitType,parentSovereignState=null)=>({
 id,name,unitType,isSovereign:unitType==='country',capital:null,parentSovereignState,
});
export const unitTypeLabel=unit=>unitTypes[unit.unitType]?.label||unit.unitType;
// Includes learnable context by reference; never use this list as the Puzzle scoring manifest.
export function plannedLearningUnits(config){
 return [...(config.manifest.units||[]),...(config.context.features||[]).filter(u=>u.visible&&u.learnable)];
}
export function plannedUnitCounts(config){
 const units=plannedLearningUnits(config);
 return {playable:config.manifest.expectedCount,learnable:units.length,
 sovereignCountries:units.filter(u=>u.unitType==='country'&&u.isSovereign).length,
 territorialUnits:units.filter(u=>!u.isSovereign).length};
}
const countryTerms={singular:'country',plural:'countries'};
const activities={explorer:{repeatSelection:'toggle-focus'},reveal:{selection:'toggle-name',phoneNavigation:false},puzzle:{clues:'region-then-destination'}};
const planned=(id,name,unitType,terminology,units,context=[])=>({
 id,name,status:'ready',mapOnly:true,dataUrl:new URL('../data/'+id+'.json',import.meta.url),unitType,terminology,
 source:{status:'selected',name:id==='canada'?'Natural Earth Admin 1, 1:50m':'Natural Earth Admin 0, 1:10m',license:'Public domain',attribution:'Not required; voluntarily credited',documentation:'docs/AMERICAS_DATA.md'},
 manifest:{expectedCount:units.length,units},regions:null,
 visualClassification:id==='canada'?{legendTitle:'Provinces and territories',types:{province:{label:'Province',color:'#90bfd3',boundary:'solid'},territory:{label:'Territory',color:'#e1bc70',boundary:'dashed'}}}:null,
 learning:{unitType:{enabled:false,answerField:'unitType'},capital:{enabled:false,answerField:'capital'}},
 activities:{...activities,puzzle:{clues:false}},smallUnits:{policy:'accurate-geometry-with-optional-puzzle-insets'},context:{features:context},
});
const countries=rows=>rows.map(([id,name])=>unit(id,name,'country'));
// Canonical manifests: the Americas expose only map views; Africa retains all activities.
export const mapDefinitions={
 'united-states':{
  id:'united-states',name:'United States',status:'planned',showOnHome:true,unitType:'state',terminology:{singular:'state',plural:'states'},
  source:{status:'not-selected',name:null,license:null,attribution:null},
  manifest:{expectedCount:50,units:[
   ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
   ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
   ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
   ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
   ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ].map(([code,name])=>({...unit('US-'+code,name,'state',{id:'USA',name:'United States'}),regionId:null,playable:true,scored:false,insetGroup:['AK','HI'].includes(code)?code.toLowerCase():null,...(code==='UT'?{relatedProject:null}:{})}))},
  regions:null,context:{features:[]},
  insets:{status:'planned',preserveCanonicalGeometry:true,groups:{ak:{unitIds:['US-AK'],label:'Alaska',placement:null,scale:null},hi:{unitIds:['US-HI'],label:'Hawaii',placement:null,scale:null}}},
  smallUnits:{policy:'accurate-geometry-with-optional-puzzle-insets'},
  learning:{capital:{enabled:false,answerField:'capital'},region:{enabled:false,answerField:'regionId'}},
  activities:{explorer:{enabled:false,status:'planned'},reveal:{enabled:false,status:'planned'},puzzle:{enabled:false,status:'planned'}},
 },
 africa:{eyebrow:'COUNTRIES OF THE WORLD',id:'africa',name:'Africa',status:'ready',unitType:'country',terminology:countryTerms,
  dataUrl:new URL('../data/africa.json',import.meta.url),
  source:{status:'selected',name:'Natural Earth Admin 0, 1:10m',license:'Public domain',attribution:'Not required; voluntarily credited',documentation:'docs/DATA.md'},
  manifest:{expectedCount:54,path:'data/africa.manifest.json'},regions:africaRegions,practiceSubsets:africaPracticeSubsets,activities,
  smallUnits:{policy:'accurate-geometry-with-optional-puzzle-insets',manifestField:'insets'},
  context:{manifest:'data/africa.territories.json',legend:'Somaliland is identified separately; its geometry belongs to the Somalia puzzle piece.'}},
 canada:planned('canada','Canada','province/territory',{singular:'province or territory',plural:'provinces and territories'},[
  ['CA-AB','Alberta'],['CA-BC','British Columbia'],['CA-MB','Manitoba'],['CA-NB','New Brunswick'],['CA-NL','Newfoundland and Labrador'],['CA-NS','Nova Scotia'],['CA-ON','Ontario'],['CA-PE','Prince Edward Island'],['CA-QC','Quebec'],['CA-SK','Saskatchewan'],
 ].map(([id,name])=>unit(id,name,'province',{id:'CAN',name:'Canada'})).concat([
  ['CA-NT','Northwest Territories'],['CA-NU','Nunavut'],['CA-YT','Yukon'],
 ].map(([id,name])=>unit(id,name,'territory',{id:'CAN',name:'Canada'})))),
 'central-america':planned('central-america','Central America','country',countryTerms,countries([
  ['BLZ','Belize'],['GTM','Guatemala'],['SLV','El Salvador'],['HND','Honduras'],['NIC','Nicaragua'],['CRI','Costa Rica'],['PAN','Panama'],
 ])),
 'south-america':planned('south-america','South America','country',countryTerms,countries([
  ['ARG','Argentina'],['BOL','Bolivia'],['BRA','Brazil'],['CHL','Chile'],['COL','Colombia'],['ECU','Ecuador'],['GUY','Guyana'],['PRY','Paraguay'],['PER','Peru'],['SUR','Suriname'],['URY','Uruguay'],['VEN','Venezuela'],
 ]),[{...unit('GUF','French Guiana','overseas-department-region',{id:'FRA',name:'France'}),classification:'Overseas department/region of France',visible:true,learnable:true,playable:false}]),
};
export function terminology(config){
 const {singular,plural}=config.terminology;
 return {singular,plural,title:singular[0].toUpperCase()+singular.slice(1),pluralTitle:plural[0].toUpperCase()+plural.slice(1)};
}
