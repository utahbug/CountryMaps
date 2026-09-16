import {countryRegion} from '../lib/regions.mjs';
const mode=new URLSearchParams(location.search).get('mode')==='puzzle'?'puzzle':'reveal';
const data=await(await fetch('../data/africa.json')).json(),reference=await(await fetch('../data/africa-learning.json')).json();
const frame=document.querySelector('iframe'),out=document.querySelector('#results');frame.src='../?map=africa&mode='+mode;
frame.onload=()=>{document.querySelector('#run').disabled=false;out.textContent='Ready';};
document.querySelector('#run').onclick=()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};try{
 const d=frame.contentDocument,w=frame.contentWindow,q=s=>d.querySelector(s),click=s=>q(s).click();
 const shape=id=>q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const current=()=>q('[data-learning-country]')?.dataset.learningCountry;
 click('[data-action="reset"]');ok(!current(),'no initial recap');
 const map=q('.map-viewport').getBoundingClientRect(),panel=q('.map-panel').getBoundingClientRect(),view=q('#africa-map').getAttribute('viewBox');
 for(const c of data.countries){
   const prior=current();
   if(mode==='puzzle'){click('[data-piece="'+c.id+'"]');ok(current()===prior,'selection does not reveal recap');shape(c.id==='DZA'?'EGY':'DZA');ok(current()===prior,'incorrect placement keeps prior recap');click('[data-piece="'+c.id+'"]');}
   shape(c.id);ok(current()===c.id,'latest country '+c.id);ok(d.querySelectorAll('.activity-learning-card').length===1,'one card');
   ok(q('.activity-learning-card p').textContent===reference.units[c.id].summary,'canonical description');
   ok(q('.activity-learning-card small').textContent.includes(countryRegion(c.id).name),'canonical region');
   ok(q('.activity-learning-card').scrollHeight<=q('.activity-learning-card').clientHeight,'card text fits');
   ok(q('.map-viewport').getBoundingClientRect().top===map.top&&q('.map-panel').getBoundingClientRect().height===panel.height,'map and panel remain stable');
   ok(q('#africa-map').getAttribute('viewBox')===view,'viewport stays stable');
   if(mode==='reveal'){shape(c.id);ok(current()===c.id,'hide retains recap');ok(q('[data-country="'+c.id+'"]').getAttribute('aria-pressed')==='false','hide unchanged');}
   else ok(q('progress').value===data.countries.indexOf(c)+1,'placement score unchanged');
 }
 const last=current();
 if(mode==='reveal'){click('[data-action="reveal-all"]');ok(current()===last,'Reveal All retains last individual card');}
 else {click('[data-piece-filter="islands"]');ok(current()===last,'filter preserves recap');click('[data-action="preview"]');click('[data-action="preview"]');ok(current()===last,'reference view preserves recap');}
 click('[data-action="reset"]');ok(!current(),'Reset clears recap');ok(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
 out.textContent='PASS: '+n+' '+mode+' learning checks at '+w.innerWidth+' × '+w.innerHeight;
 }catch(e){out.textContent='FAIL after '+n+': '+e.message}};
