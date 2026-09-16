// Optional learning content uses unit IDs, not a second manifest or geometry.
export function referenceFilters(reference,units){
 return {coastal:{name:'Coastal',ids:units.filter(u=>!reference.units[u.id]?.landlocked).map(u=>u.id)},landlocked:{name:'Landlocked',ids:units.filter(u=>reference.units[u.id]?.landlocked).map(u=>u.id)}};
}
export function relatedHistory(reference,id){return reference.history.filter(entry=>entry.currentUnitIds.includes(id));}
export function geographicType(config,fact,id){return config.practiceSubsets?.islands?.ids.includes(id)?'Island':fact.landlocked?'Landlocked':'Coastal';}
export function learningCard(unit,{reference,config,region,byId,escape:esc}){
 const fact=reference.units[unit.id];if(!fact)return null;
 const history=relatedHistory(reference,unit.id);
 return '<article class="learning-card" data-learning-unit="'+unit.id+'"><details><summary data-card-country="'+unit.id+'" aria-label="'+esc(unit.name)+'"><strong class="list-name">'+esc(unit.name)+'</strong><small>'+esc(region+' · '+geographicType(config,fact,unit.id))+'</small><span>'+esc(fact.summary)+'</span></summary><p><strong>Region:</strong> '+esc(region)+'</p><p><strong>Geography:</strong> '+esc(geographicType(config,fact,unit.id))+'</p><p><strong>Neighbors:</strong> '+(fact.neighborIds.length?fact.neighborIds.map(id=>esc(byId.get(id).name)).join(', '):'No land neighbors.')+'</p>'+(fact.borderNote?'<p>'+esc(fact.borderNote)+'</p>':'')+(history.length?'<p><strong>Names & history:</strong> '+history.map(h=>'<a href="#history-'+h.id+'">'+esc(h.name)+'</a>').join(' · ')+'</p>':'')+'<button type="button" class="card-map-focus" aria-label="Focus on map" title="Focus on map" data-focus-unit="'+unit.id+'"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 7 5-2 5 2v14l-5-2-5 2Z M8 5v14 M13 21l8-3v-5"/><path d="M21 6c0 3-4 7-4 7s-4-4-4-7a4 4 0 0 1 8 0Z"/><circle cx="17" cy="6" r="1.2"/></svg></button></details></article>';
}
export function historySection(reference,byId,esc){
 return '<section class="historical-reference" aria-labelledby="history-heading"><details class="history-disclosure"><summary id="history-heading">Former Names, States, and Historical Entities</summary><p>Older names are not always former countries. These links identify related modern geography, not historical borders.</p><div class="history-grid">'+reference.history.map(h=>'<details id="history-'+h.id+'"><summary><strong>'+esc(h.name)+'</strong><small>'+esc(h.type+' · '+h.period)+'</small><span>'+esc(h.note)+'</span></summary><p>Related today: '+h.currentUnitIds.map(id=>'<button type="button" data-reference-unit="'+id+'">'+esc(byId.get(id).name)+'</button>').join(' ')+'</p><p>'+h.sources.map(url=>'<a href="'+esc(url)+'" target="_blank" rel="noopener">Source ↗</a>').join(' · ')+'</p></details>').join('')+'</div></details></section>';
}

// One activity recap, using the same facts and classification as Explorer.
export function activityLearningCard(unit,{reference,config,region,completed=false,escape:esc}){
 const fact=reference?.units[unit?.id];if(!fact)return '';
 return '<article class="activity-learning-card" data-learning-country="'+unit.id+'"><strong>'+(completed?'✓ ':'')+esc(unit.name)+'</strong><small>'+esc(region+' · '+geographicType(config,fact,unit.id))+'</small><p>'+esc(fact.summary)+'</p></article>';
}
