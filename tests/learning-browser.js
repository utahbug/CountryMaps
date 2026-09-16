import {africaRegions} from '../lib/regions.mjs';
import {africaPracticeSubsets} from '../lib/practice-subsets.mjs';
const ref=await(await fetch('../data/africa-learning.json')).json(),frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++};try{
 const d=frame.contentDocument,w=frame.contentWindow,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],click=s=>q(s).click(),view=()=>q('#africa-map').getAttribute('viewBox');
 const filter=id=>click('[data-list-order="'+id+'"]'),search=text=>{q('#country-search').value=text;q('#country-search').dispatchEvent(new w.Event('input',{bubbles:true}))};
 filter('az');ok(all('[data-learning-unit]').length===54,'54 cards');ok(new Set(all('[data-learning-unit]').map(c=>c.dataset.learningUnit)).size===54,'unique cards');
 ok(!q('.history-disclosure').open,'history secondary by default');
 ok(q('.side-panel h2').textContent==='Find a country','compact locator heading');
 ok(!q('.side-panel .learning-card'),'no learning cards in locator');
 ok(q('.current-country-reference').previousElementSibling===q('.workspace'),'cards immediately after map workspace');
 ok(q('.current-country-reference').getBoundingClientRect().top-q('.workspace').getBoundingClientRect().bottom<24,'no large gap below map');
 ok(w.getComputedStyle(q('.learning-grid')).gridTemplateColumns.split(' ').length===(w.innerWidth>650?2:1),'responsive card columns');
 for(const card of all('[data-learning-unit]'))ok(card.querySelector('summary > span').textContent.trim().length>0,'visible summary');
 ok(q('.map-caption').hidden&&q('.territory-legend').hidden,'permanent map hints removed');
 const controls=all('.map-tools button');ok(controls.length===7,'seven map controls retained');
 ok(q('.map-tools').getBoundingClientRect().height<=50,'compact single control row');
 for(const button of controls){const box=button.getBoundingClientRect();ok(box.width>=44&&box.height>=44,'44px map control target');ok(w.getComputedStyle(button).borderTopWidth==='0px','borderless control');ok(button.title&&button.getAttribute('aria-label'),'control labels and tooltips');}
 const initial=view();
 const names=all('[data-learning-unit] .list-name').map(el=>el.textContent);ok(JSON.stringify(names)===JSON.stringify([...names].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}))),'alphabetical cards');
 for(const id of Object.keys(ref.units)){const pageY=w.scrollY,listY=q('.country-list').scrollTop;click('[data-list-country="'+id+'"]');ok(q('[data-country="'+id+'"]').classList.contains('selected'),'map '+id);ok(!q('[data-learning-unit="'+id+'"] details').open,'locator leaves card closed '+id);ok(w.scrollY===pageY&&q('.country-list').scrollTop===listY,'locator preserves scroll');ok(view()===initial,'card preserves context');click('[data-card-country="'+id+'"]');ok(q('[data-learning-unit="'+id+'"] details').open,'card expands');click('[data-card-country="'+id+'"]');ok(!q('[data-learning-unit="'+id+'"] details').open,'card collapses');q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(q('[data-learning-unit="'+id+'"]').classList.contains('active'),'map opens matching card');const focus=q('[data-focus-unit="'+id+'"]'),rect=focus.getBoundingClientRect();ok(rect.width>=44&&rect.height>=44,'focus icon touch target');ok(focus.title==='Focus on map'&&focus.getAttribute('aria-label')==='Focus on map','focus icon accessible name');ok(focus.querySelector('svg')&&!focus.textContent.trim(),'icon replaces visible text');ok(w.getComputedStyle(focus).borderTopWidth==='0px','borderless focus icon');ok(view()===initial,'map selection keeps context');}
 for(const [id,total] of [['coastal',38],['landlocked',16],['islands',6],['small',16]]){filter(id);ok(all('[data-learning-unit]').length===total,'filter '+id);if(africaPracticeSubsets[id])ok(all('[data-learning-unit]').every(c=>africaPracticeSubsets[id].ids.includes(c.dataset.learningUnit)),'canonical '+id);search('Algeria');ok(q('[data-list-country="DZA"]'),'global search');search('');}
 filter('islands');q('[data-country="DZA"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(q('[data-learning-unit="DZA"] details').open,'map selection restores filtered card');
 filter('region');ok(all('.country-region').length===5,'five regions');ok(all('[data-learning-unit]').length===54,'54 grouped');
 for(const [id,r] of Object.entries(africaRegions).filter(([id])=>id!=='all')){click('[data-focus-region="'+id+'"]');const fit=view();for(const unit of r.ids){click('[data-list-country="'+unit+'"]');ok(view()===fit,'regional context');}}
 filter('az');click('[data-focus-unit="DZA"]');ok(view()!==initial,'explicit focus');const focused=view();click('[data-list-country="EGY"]');ok(view()===focused,'card keeps manual view');
 click('[data-learning-unit="BEN"] a[href="#history-dahomey"]');ok(q('#history-dahomey').open,'historical name link expands without leaving Explorer');
 for(const h of ref.history){ok(q('#history-'+h.id),'history '+h.id);for(const id of h.currentUnitIds){click('#history-'+h.id+' [data-reference-unit="'+id+'"]');ok(q('[data-country="'+id+'"]').classList.contains('selected'),'modern link');}}
 click('[data-action="fit"]');filter('az');ok(q('.map-panel').getBoundingClientRect().top<230,'map appears early');ok(d.documentElement.scrollWidth<=w.innerWidth,'no overflow');
 for(const el of all('.learning-card > button,.learning-card summary'))ok(el.getBoundingClientRect().height>=44,'touch target');
 ok(q('.map-readout #practice-region'),'compact header');out.textContent='PASS: '+n+' learning checks at '+w.innerWidth+' × '+w.innerHeight;
 }catch(e){out.textContent='FAIL after '+n+': '+e.message}};

document.querySelector("#run").disabled=false;
