import {mapDefinitions} from '../lib/map-configs.mjs';
import {learningFilters,filteredUnits} from '../lib/practice-subsets.mjs';
const data=await (await fetch('../data/africa.json')).json();
document.querySelector('#run').onclick=()=>{let checks=0;const assert=(v,m)=>{if(!v)throw Error(m);checks++;};try{
 const d=document.querySelector('iframe').contentDocument,w=d.defaultView,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],click=s=>q(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const score=()=>q('progress').value,filter=id=>{click('[popovertarget="piece-filter-menu"]');click('[data-piece-filter="'+id+'"]');};
 click('[data-action="reset"]');
 click('[data-piece="TGO"]');click('[data-country="TGO"]');assert(score()===1,'place Togo');
 for(let repeat=0;repeat<3;repeat++)for(const [id,f] of Object.entries(learningFilters(mapDefinitions.africa))){
  filter(id);const visible=all('[data-piece]').filter(e=>!e.hidden),expected=filteredUnits(data.countries,f).sort((a,b)=>Number(a.id==='TGO')-Number(b.id==='TGO'));
  assert(JSON.stringify(visible.map(e=>e.dataset.piece))===JSON.stringify(expected.map(c=>c.id)),'canonical sorted subset '+id);
  assert(score()===1,'progress retained '+id);assert(q('[data-country="TGO"]').classList.contains('shown'),'Togo remains on map');
  assert(q('[data-piece="TGO"]').disabled,'placed piece disabled');assert(q('[data-piece="TGO"] span').textContent.startsWith('✓'),'completion visible');
  assert(!q('.drag-preview')&&!q('.clue-target'),'no stale drag/clue');assert(!q('#piece-filter-menu').matches(':popover-open'),'menu dismisses');
  assert(d.activeElement===q('[popovertarget="piece-filter-menu"]'),'focus returns');
 }
 for(const [id,f] of Object.entries(learningFilters(mapDefinitions.africa))){
  filter(id);click('[data-action="reset"]');const units=filteredUnits(data.countries,f),placed=[units[1].id,units[0].id];
  for(const country of placed){click('[data-piece="'+country+'"]');click('[data-country="'+country+'"]');}
  const expected=[...units.filter(c=>!placed.includes(c.id)),...units.filter(c=>placed.includes(c.id))].map(c=>c.id);
  assert(all('[data-piece]:not([hidden])').map(e=>e.dataset.piece).join(',')===expected.join(','),'unplaced then completed in '+id);
  assert(score()===2,'two placements counted in '+id);
 }
 filter('az');click('[data-action="reset"]');click('[data-piece="TGO"]');click('[data-country="TGO"]');
 click('[data-piece="DZA"]');const tray=q('#piece-tray');tray.scrollTop=200;
 const candidates=all('[data-piece]').filter(e=>!e.hidden&&!e.disabled),box=tray.getBoundingClientRect();
 const anchor=candidates.find(e=>e.dataset.piece!=='DZA'&&e.getBoundingClientRect().bottom>box.top&&e.getBoundingClientRect().top<box.bottom);
 const anchorTop=anchor?.getBoundingClientRect().top;
 click('[data-country="DZA"]');
 assert(score()===2,'second placement');
 const ordered=all('[data-piece]:not([hidden])');
 assert(ordered.slice(-2).map(e=>e.dataset.piece).join(',')==='DZA,TGO','completed group alphabetical');
 assert(ordered.slice(0,-2).every(e=>!e.disabled),'all unplaced first');
 if(anchor&&anchor.dataset.piece!=='DZA')assert(Math.abs(anchor.getBoundingClientRect().top-anchorTop)<2,'visible unplaced scroll anchor retained '+anchor.dataset.piece+' '+anchorTop+' -> '+anchor.getBoundingClientRect().top+' scroll '+tray.scrollTop);
 click('[data-action="reset"]');assert(all('[data-piece]').every(e=>!e.disabled),'Reset clears completed group');
 assert(all('[data-piece]').map(e=>e.dataset.piece).join(',')===filteredUnits(data.countries,null).map(c=>c.id).join(','),'Reset restores A–Z');
 click('[data-piece="TGO"]');click('[data-country="TGO"]');
 filter('small');assert(q('.subset-progress').textContent.includes('1 / 16')&&q('.map-progress').textContent.includes('1 / 54 placed'),'subset and total progress');
 click('[data-piece="RWA"]');click('[data-action="clue"]');assert(q('#clue-text').textContent.includes('East Africa'),'canonical clue');filter('islands');assert(q('.puzzle-clue').dataset.level==='0','filter clears clue');
 click('[data-action="preview"]');click('[data-action="preview"]');assert(all('[data-piece]:not([hidden])').length===6&&score()===1,'preview preserves filter and score');
 click('[data-action="reset"]');assert(score()===0&&all('[data-piece]:not([hidden])').length===6,'Reset retains filter and clears score');filter('az');assert(all('[data-piece]:not([hidden])').length===54,'all restored');
 const button=q('[popovertarget="piece-filter-menu"]');assert(button.getBoundingClientRect().height>=44,'touch target');button.click();
 assert(q('#piece-filter-menu').getBoundingClientRect().width<=w.innerWidth,'menu fits');assert(all('[data-piece-filter]').every(e=>e.getBoundingClientRect().height>=44),'menu touch targets');q('#piece-filter-menu').hidePopover();
 assert(d.documentElement.scrollWidth<=w.innerWidth,'no overflow');
 document.querySelector('#results').textContent='PASS: '+checks+' filter checks at '+w.innerWidth+' × '+w.innerHeight;
 }catch(e){document.querySelector('#results').textContent='FAIL '+checks+': '+e.message;}};
