// Geographic learning subsets, not formal regions or land-area rankings.
export const africaPracticeSubsets={
 islands:{name:'Islands',ids:['CPV','COM','MDG','MUS','STP','SYC']},
 small:{name:'Small countries',ids:['GMB','TGO','BEN','RWA','BDI','DJI','SWZ','LSO','MWI','CPV','COM','MUS','SYC','STP','GNQ','GNB']},
};
export function learningFilters(config){
 return {az:{name:'A–Z',ids:null},...Object.fromEntries(Object.entries(config.regions||{}).filter(([id])=>id!=='all')),...(config.practiceSubsets||{})};
}
export function filteredUnits(units,filter){
 const ids=filter?.ids?new Set(filter.ids):null;
 return units.filter(c=>!ids||ids.has(c.id)).sort((a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'}));
}
