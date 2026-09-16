// Optional learning content uses unit IDs, not a second manifest or geometry.
export function referenceFilters(reference,units){
 return {coastal:{name:'Coastal',ids:units.filter(u=>!reference.units[u.id]?.landlocked).map(u=>u.id)},landlocked:{name:'Landlocked',ids:units.filter(u=>reference.units[u.id]?.landlocked).map(u=>u.id)}};
}
export function relatedHistory(reference,id){return reference.history.filter(entry=>entry.currentUnitIds.includes(id));}
export function geographicType(config,fact,id){return config.practiceSubsets?.islands?.ids.includes(id)?'Island':fact.landlocked?'Landlocked':'Coastal';}
export function learningCard(unit,{reference,config,region,byId,escape:esc}){
 const fact=reference.units[unit.id];if(!fact)return null;
 const history=relatedHistory(reference,unit.id);
 return '<article class="learning-card" data-learning-unit="'+unit.id+'"><button data-list-country="'+unit.id+'" aria-label="'+esc(unit.name)+'"><strong class="list-name">'+esc(unit.name)+'</strong><small>'+esc(region+' · '+geographicType(config,fact,unit.id))+'</small><span>'+esc(fact.summary)+'</span></button><details><summary>More about '+esc(unit.name)+'</summary><p><strong>Region:</strong> '+esc(region)+'</p><p><strong>Geography:</strong> '+esc(geographicType(config,fact,unit.id))+'</p><p><strong>Neighbors:</strong> '+(fact.neighborIds.length?fact.neighborIds.map(id=>esc(byId.get(id).name)).join(', '):'No land neighbors.')+'</p>'+(fact.borderNote?'<p>'+esc(fact.borderNote)+'</p>':'')+(history.length?'<p><strong>Names & history:</strong> '+history.map(h=>'<a href="#history-'+h.id+'">'+esc(h.name)+'</a>').join(' · ')+'</p>':'')+'<button type="button" data-focus-unit="'+unit.id+'">Focus on map</button></details></article>';
}
export function historySection(reference,byId,esc){
 return '<section class="historical-reference" aria-labelledby="history-heading"><details class="history-disclosure"><summary id="history-heading">Former Names, States, and Historical Entities</summary><p>Older names are not always former countries. These links identify related modern geography, not historical borders.</p><div class="history-grid">'+reference.history.map(h=>'<details id="history-'+h.id+'"><summary><strong>'+esc(h.name)+'</strong><small>'+esc(h.type+' · '+h.period)+'</small><span>'+esc(h.note)+'</span></summary><p>Related today: '+h.currentUnitIds.map(id=>'<button type="button" data-reference-unit="'+id+'">'+esc(byId.get(id).name)+'</button>').join(' ')+'</p><p>'+h.sources.map(url=>'<a href="'+esc(url)+'" target="_blank" rel="noopener">Source ↗</a>').join(' · ')+'</p></details>').join('')+'</div></details></section>';
}
