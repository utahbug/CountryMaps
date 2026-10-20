const data=await(await fetch('../data/africa.json')).json(),facts=await(await fetch('../data/africa-facts.json')).json();
document.querySelector('#run').onclick=()=>{let n=0;const out=document.querySelector('#results'),w=document.querySelector('iframe').contentWindow,d=w.document,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],ok=(v,m)=>{if(!v)throw Error(m);n++;},click=s=>q(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})),change=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new w.Event('change',{bubbles:true}));},query=value=>{q('#country-search').value=value;q('#country-search').dispatchEvent(new w.Event('input',{bubbles:true}));},view=()=>q('#africa-map').getAttribute('viewBox'),cards=()=>all('[data-learning-unit]').map(c=>c.dataset.learningUnit);try{
 click('[data-action="reset"]');query('');click('[data-list-order="az"]');change('#fact-sort','name');w.scrollTo(0,0);const start=view();
 ok(new Set(cards()).size===54&&cards().length===54,'54 cards exactly once');
 for(const c of data.countries){for(const selector of ['path[data-country="'+c.id+'"]','[data-list-country="'+c.id+'"]']){const y=w.scrollY;click(selector);const panel=q('.explorer-facts');ok(!panel.hidden&&panel.querySelector('strong').textContent===c.name,'panel '+c.id);ok(q('path[data-country="'+c.id+'"]').classList.contains('selected'),'highlight '+c.id);ok(w.scrollY===y&&view()===start,'no scroll/zoom '+c.id);ok(panel.textContent.includes(Math.round(facts.units[c.id].population.value).toLocaleString('en-US')),'canonical population '+c.id);const b=panel.getBoundingClientRect(),v=q('.map-viewport').getBoundingClientRect();ok(b.left>=0&&b.right<=w.innerWidth&&panel.scrollWidth<=panel.clientWidth,'facts fit '+c.id);ok(w.innerWidth<=650?b.top>=v.bottom-1:panel.classList.contains('facts-below')?b.top>=v.bottom-1:b.left>=v.left&&b.top>=v.top&&b.right<=v.right+1&&b.bottom<=v.bottom+1,'responsive location '+c.id);}ok(q('[data-learning-unit="'+c.id+'"] .country-facts-grid').textContent.includes('2025 est.'),'card metrics '+c.id);}
 query('Rwanda');let y=w.scrollY;click('[data-list-country="RWA"]');ok(w.scrollY===y&&q('.explorer-facts').textContent.includes('Rwanda'),'search locates without scroll');query('');
 for(const[field,first,last]of [['name','DZA','ZWE'],['date','LBR','SSD'],['area','DZA','SYC'],['population','NGA','SYC']]){change('#fact-sort',field);ok(cards()[0]===first&&cards().at(-1)===last,'sort '+field);change('#fact-order','last');ok(cards()[0]===last&&cards().at(-1)===first,'reverse '+field);ok(cards().length===54,'sort keeps 54');}
 click('[data-list-order="small"]');ok(cards().length===16,'small subset retained');click('[data-list-order="region"]');ok(all('.learning-region-heading').length===5&&cards().length===54,'canonical region groups');query('Algeria');ok(cards().length===1,'search still works');query('');click('[data-list-order="az"]');
 click('[data-action="zoom-in"]');click('[data-action="right"]');const moved=view(),scroll=w.scrollY;click('path[data-country="COD"]');ok(view()===moved&&w.scrollY===scroll,'manual map context preserved');click('[data-action="fit"]');
 for(const id of ['DZA','COD','ZAF','SYC']){
 click('path[data-country="'+id+'"]');
 for(const action of ['zoom-in','right','down','fit']){
  click('[data-action="'+action+'"]');const panel=q('.explorer-facts'),b=panel.getBoundingClientRect(),v=q('.map-viewport').getBoundingClientRect();
  if(!panel.classList.contains('facts-below')){
   ok(b.left>=v.left&&b.top>=v.top&&b.right<=v.right+1&&b.bottom<=v.bottom+1,'transformed card contained');
   const inverse=q('#africa-map').getScreenCTM().inverse(),paths=all('path[data-country],path[data-territory]');
   for(let y=b.top;y<=b.bottom;y+=10)for(let x=b.left;x<=b.right;x+=10){const p=new w.DOMPoint(x,y).matrixTransform(inverse);ok(!paths.some(path=>path.isPointInFill(p)),'facts do not cover geography');}
  }else ok(b.top>=v.bottom-1,'crowded/phone facts immediately below');
 }
}
 for(const region of ['west','north','central','east','southern','all']){
 change('#practice-region',region);click('[data-list-country="COD"]');const panel=q('.explorer-facts'),b=panel.getBoundingClientRect(),v=q('.map-viewport').getBoundingClientRect();
 ok(panel.classList.contains('facts-below')?b.top>=v.bottom-1:b.left>=v.left&&b.top>=v.top&&b.right<=v.right+1&&b.bottom<=v.bottom+1,'regional facts fit '+region);
 }
 // Text-resize fixture, not a substitute for physical browser/assistive technology checks.
 const enlarged=d.createElement('style');enlarged.textContent='.explorer-facts{font-size:32px}.explorer-facts > strong{font-size:32px}.explorer-facts > p{font-size:24px}.explorer-facts .country-facts-grid{font-size:26px}.explorer-facts .country-facts-grid dt{font-size:24px}';d.head.append(enlarged);w.dispatchEvent(new w.Event('resize'));
 ok(q('.explorer-facts').scrollWidth<=q('.explorer-facts').clientWidth,'enlarged facts readable');enlarged.remove();w.dispatchEvent(new w.Event('resize'));
 const collection=q('.current-country-reference'),history=q('.historical-reference');ok(!!(collection.compareDocumentPosition(history)&w.Node.DOCUMENT_POSITION_FOLLOWING),'history follows cards');ok(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
 out.textContent='PASS: '+n+' Explorer factual/sorting/selection checks at '+w.innerWidth;
}catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
