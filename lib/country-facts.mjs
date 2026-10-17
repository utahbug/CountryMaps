// Comparable factual fields; politicalDate describes an event, never country age.
export const factSorts={name:{label:'Country name',orders:['A–Z','Z–A']},date:{label:'Independence / state date',orders:['Oldest first','Newest first']},area:{label:'Land area',orders:['Largest first','Smallest first']},population:{label:'Population',orders:['Highest first','Lowest first']}};
export function sortFactUnits(units,reference,field='name',order='first'){
 const name=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'}),value=u=>{const f=reference.units[u.id]?.facts;return field==='date'?f?.politicalDate?.date:field==='area'?f?.landArea?.value:f?.population?.value;};
 return [...units].sort((a,b)=>{let comparison;if(field==='name')comparison=name(a,b);else {const av=value(a),bv=value(b);if(av==null||bv==null)return av==null?(bv==null?name(a,b):1):-1;comparison=field==='date'?av.localeCompare(bv):bv-av;}return (order==='last'?-1:1)*comparison||name(a,b);});
}
export function dateText(event){return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(event.date+'T00:00:00Z'));}
export function factsMarkup(facts,region,esc){
 const number=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:0}),e=facts.politicalDate;
 return '<dl class="country-facts-grid"><div><dt>'+esc(e.label)+'</dt><dd>'+dateText(e)+'</dd></div><div><dt>Land area <small>('+facts.landArea.year+')</small></dt><dd>'+number(facts.landArea.value)+' km²</dd></div><div><dt>Population <small>('+facts.population.year+' est.)</small></dt><dd>'+number(facts.population.value)+'</dd></div><div><dt>Region</dt><dd>'+esc(region)+'</dd></div></dl>';
}
export function selectedFacts(unit,reference,region,esc){const f=reference.units[unit.id]?.facts;return f?'<strong>'+esc(unit.name)+'</strong>'+factsMarkup(f,region,esc)+'<p>'+esc(f.politicalDate.note)+'</p>':'';}
