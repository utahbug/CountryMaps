import {africaRegions,groupedCountries,practiceSet,fittedRegion} from '../lib/regions.mjs';
const data=await (await fetch('../data/africa.json')).json(),frame=document.querySelector('iframe'),results=document.querySelector('#results');
document.querySelector('#run').onclick=()=>{
 let count=0;const assert=(value,message)=>{if(!value)throw Error(message);count++;};
 try{
  const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],click=s=>q(s).click();
  const view=()=>q('#africa-map').getAttribute('viewBox'),signature=()=>{const b=q('#africa-map').getBoundingClientRect();return JSON.stringify([view(),b.x,b.y,b.width,b.height]);};
  const query=value=>{q('#country-search').value=value;q('#country-search').dispatchEvent(new w.Event('input',{bubbles:true}));};
  click('[data-action="reset"]');click('[data-action="fit"]');query('');click('[data-list-order="az"]');
  assert(q('[data-list-order="az"]').getAttribute('aria-pressed')==='true','A–Z selected');assert(all('.country-list [data-list-country]').length===54,'A–Z 54');
  assert(q('.map-readout #practice-region')&&!q('.activity-commandbar #practice-region'),'integrated map area');
  assert(q('.map-readout strong').textContent==='Africa','stable heading');
  assert(q('label[for="country-search"]').classList.contains('sr-only'),'search accessible without visible label');
  for(const [id,total] of [['islands',6],['small',16]]){
   click('[data-list-order="'+id+'"]');assert(all('.country-list [data-list-country]').length===total,'canonical subset '+id);
   query('Algeria');assert(all('.country-list [data-list-country]').length===1&&q('[data-list-country="DZA"]'),'search outside subset');query('');
  }
  click('[data-list-order="region"]');assert(all('.country-region').length===5,'five headings');assert(new Set(all('.country-list [data-list-country]').map(el=>el.dataset.listCountry)).size===54,'54 countries grouped once');
  for(const group of groupedCountries(data.countries)){
   const rows=[...q('#countries-'+group.id).querySelectorAll('[data-list-country]')];
   assert(JSON.stringify(rows.map(el=>el.dataset.listCountry))===JSON.stringify(group.countries.map(c=>c.id)),'alphabetical canonical group '+group.id);
   click('[data-focus-region="'+group.id+'"]');const fit=fittedRegion(practiceSet(data,group.id),group.id);
   assert(view()===[fit.x,fit.y,fit.w,fit.h].join(' '),'whole region fitted');assert(!q('#countries-'+group.id).hidden,'focused group expanded');
   const fitted=signature();
   for(const c of group.countries){
    click('[data-list-country="'+c.id+'"]');assert(q('.selected-country-overlay').textContent===c.name,'select '+c.id);assert(q('[data-country="'+c.id+'"]').classList.contains('selected'),'highlight '+c.id);assert(signature()===fitted,'selection keeps geographic context '+c.id);
    click('[data-list-country="'+c.id+'"]');assert(signature()===fitted,'repeat does not change regional view');
   }
   click('[data-action="zoom-in"]');click('[data-action="right"]');const manual=signature();click('[data-list-country="'+group.countries[0].id+'"]');assert(signature()===manual,'manual regional zoom/pan retained');
   click('[data-toggle-region="'+group.id+'"]');assert(q('#countries-'+group.id).hidden,'collapse');assert(signature()===manual,'collapse never moves map');click('[data-toggle-region="'+group.id+'"]');assert(!q('#countries-'+group.id).hidden,'expand');
   assert(all('path[data-country]').length===54,'all geometry stays canonical');
  }
  // Both list orders search all 54 even while focused on another region.
  for(const order of ['az','region']){
   click('[data-list-order="'+order+'"]');
   for(const c of data.countries){query(c.name);assert(q('.country-list [data-list-country="'+c.id+'"]'),'global search '+c.id+' '+order);}
   query('Algeria');const before=view();assert(q('[data-list-country="DZA"]'),'outside-region match');assert(view()===before,'typing never moves map');click('[data-list-country="DZA"]');assert(view()===before,'outside-region card keeps context');assert(q('[data-country="DZA"]').classList.contains('selected'),'outside search selection works');
   query('');
  }
  click('[data-action="fit"]');assert(view()==='0 0 800 730'&&q('#practice-region').value==='all','All Africa returns continent');assert(!q('.outside-region'),'All Africa restores all country styling');
  click('[data-action="reset"]');click('[data-list-order="az"]');click('[data-list-country="DZA"]');click('[data-list-country="DZA"]');assert(view()==='0 0 800 730','repeat card selection preserves context');click('[data-focus-unit="DZA"]');assert(view()!=='0 0 800 730','explicit focus');click('[data-action="fit"]');
  click('[popovertarget="explorer-filter-menu"]');
  assert(q('#explorer-filter-menu').matches(':popover-open'),'filter opens');
  for(const button of all('[data-list-order]'))assert(button.getBoundingClientRect().height>=44,'organization touch target');
  click('[data-list-order="region"]');for(const button of all('[data-focus-region],[data-toggle-region]'))assert(button.getBoundingClientRect().height>=44,'region touch target');
  assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
  results.textContent='PASS: '+count+' Explorer grouping checks at '+w.innerWidth+' × '+w.innerHeight+'. All 54 memberships, global search, stable region selection, manual navigation, collapse and full-continent return.';
 }catch(error){results.textContent='FAIL after '+count+' checks: '+error.message;}
};
