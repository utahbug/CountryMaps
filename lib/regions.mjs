// UN M49 geographic grouping, restricted to the canonical sovereign-country manifest.
// IDs only: all geometry, names, aliases, and puzzle treatments stay in africa.json.
export const africaRegions={
 all:{name:'All Africa',ids:null,context:null},
 north:{name:'North Africa',ids:['DZA','EGY','LBY','MAR','SDN','TUN'],context:['SAH','BRT']},
 west:{name:'West Africa',ids:['BEN','BFA','CPV','CIV','GMB','GHA','GIN','GNB','LBR','MLI','MRT','NER','NGA','SEN','SLE','TGO'],context:[]},
 central:{name:'Central Africa',ids:['AGO','CMR','CAF','TCD','COG','COD','GNQ','GAB','STP'],context:[]},
 east:{name:'East Africa',ids:['BDI','COM','DJI','ERI','ETH','KEN','MDG','MWI','MUS','MOZ','RWA','SYC','SOM','SSD','UGA','TZA','ZMB','ZWE'],context:['SOL']},
 southern:{name:'Southern Africa',ids:['BWA','SWZ','LSO','NAM','ZAF'],context:[]},
};
export function practiceSet(data,region='all'){
 if(region==='all')return data;
 const config=(data.config?data.config.regions:africaRegions)?.[region];
 if(!config)throw Error('Unknown map region.');
 if(region==='all')return data;
 const ids=new Set(config.ids),countries=(data.units||data.countries).filter(c=>ids.has(c.id));
 if(countries.length!==ids.size)throw Error('Region references a missing unit.');
 return {...data,name:config.name,countries,units:countries,context:data.context.filter(c=>config.context.includes(c.id))};
}
export function fittedRegion(data,region='all'){
 if(region==='all')return {x:0,y:0,w:data.width,h:data.height};
 const shapes=[...(data.units||data.countries),...data.context];
 const x=Math.min(...shapes.map(c=>c.bounds[0])),y=Math.min(...shapes.map(c=>c.bounds[1]));
 const right=Math.max(...shapes.map(c=>c.bounds[2])),bottom=Math.max(...shapes.map(c=>c.bounds[3]));
 const pad=Math.max(right-x,bottom-y)*.055;
 return {x:x-pad,y:y-pad,w:right-x+pad*2,h:bottom-y+pad*2};
}

// Shared by optional Puzzle clues and regional practice selectors.
export function countryRegion(countryId,regions=africaRegions){
 return Object.entries(regions).find(([id,region])=>id!=='all'&&region.ids.includes(countryId))?.[1]||null;
}

export function countryRegionId(countryId,regions=africaRegions){
 return Object.keys(regions).find(id=>regions[id].ids?.includes(countryId))||null;
}
export function groupedCountries(countries,regions=africaRegions){
 return Object.entries(regions).filter(([id])=>id!=='all').map(([id,region])=>({id,name:region.name,countries:countries.filter(c=>region.ids.includes(c.id)).sort((a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'}))}));
}
