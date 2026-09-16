import {africaRegions,practiceSet,fittedRegion} from '../lib/regions.mjs';
const data=await (await fetch('../data/africa.json')).json();
const frame=document.querySelector('iframe'),results=document.querySelector('#results');
const nextFrame=w=>new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
document.querySelector('#run').onclick=async()=>{
 let checks=0;const assert=(value,label)=>{if(!value)throw Error(label);checks++;};
 try{
  for(const mode of ['reveal']){
   frame.src='../?map=africa&mode='+mode;
   await new Promise(resolve=>frame.onload=resolve);
   const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s);
   while(!q('#practice-region'))await nextFrame(w);
   const change=async id=>{q('#practice-region').value=id;q('#practice-region').dispatchEvent(new w.Event('change',{bubbles:true}));await nextFrame(w);};
   for(const region of ['north','west','central','east','southern','all']){
    await change(region);
    const subset=practiceSet(data,region),ids=subset.countries.map(c=>c.id),svg=q('#africa-map'),fit=fittedRegion(subset,region);
    const view=()=>svg.getAttribute('viewBox'),expected=view();
    const actual=svg.viewBox.baseVal;
    assert(actual.width<=fit.w&&actual.height<=fit.h,'Reveal fit reduces empty margins');
    assert(new URL(w.location.href).searchParams.get('region')===(region==='all'?null:region),'region URL');
    assert(view()===expected,'region fitted '+region);assert(q('#practice-region').value===region,'selector persists');
    assert(q('#practice-region').getBoundingClientRect().height>=44,'touch target');
    assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
    assert(d.querySelectorAll('path[data-country]').length===ids.length,'only subset geometry');
    assert(d.querySelectorAll('.country-list [data-list-country]').length===ids.length,'only subset list');
    const b=svg.getBoundingClientRect();
    for(const c of subset.countries){
     const path=q('[data-country="'+c.id+'"]'),r=path.getBoundingClientRect();
     assert(path.getAttribute('d')===c.path,'canonical geometry '+c.id);
     assert(r.left>=b.left-.1&&r.top>=b.top-.1&&r.right<=b.right+.1&&r.bottom<=b.bottom+.1,'country fully in fitted view '+c.id);
    }
    const capture=new Set();svg.setPointerCapture=id=>capture.add(id);svg.hasPointerCapture=id=>capture.has(id);svg.releasePointerCapture=id=>capture.delete(id);
    const send=(type,target=svg,x=100,y=100)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,pointerId:17,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y}));
    const tap=id=>{send('pointerdown',q('[data-country="'+id+'"]'));send('pointerup');};
    if(mode==='reveal'){
     for(const id of ids){tap(id);assert(view()===expected,'Reveal selection stays fitted');assert(q('[data-reveal-country="'+id+'"]'),'name shown');tap(id);assert(!q('[data-reveal-country="'+id+'"]'),'name hidden');}
     tap(ids[0]);tap(ids[1]);assert(d.querySelectorAll('[data-reveal-country]').length===2,'independent names');
     if(w.innerWidth>650){
      q('[data-action="zoom-in"]').click();q('[data-action="right"]').click();
      const manual=view();tap(ids[2]);assert(view()===manual,'regional Reveal preserves manual zoom/pan');
     }
     const studyView=view();q('[data-action="reveal-all"]').click();assert(d.querySelectorAll('[data-reveal-country]').length===ids.length,'Reveal All subset count');assert(view()===studyView,'Reveal All retains current view');
     const viewport=q('.map-viewport').getBoundingClientRect();
     for(const label of d.querySelectorAll('[data-reveal-country]')){const r=label.getBoundingClientRect();assert(r.left>=viewport.left+7.9&&r.top>=viewport.top+7.9&&r.right<=viewport.right-7.9&&r.bottom<=viewport.bottom-7.9,'bounded region label');assert(label.scrollWidth<=label.clientWidth+1&&label.scrollHeight<=label.clientHeight+1,'wrapped label');}
     q('[data-action="reset"]').click();assert(view()===expected&&d.querySelectorAll('[data-reveal-country]').length===0,'Reset fits region and clears names');
     send('pointerdown',q('[data-country="'+ids[0]+'"]'));send('pointermove',svg,150,150);send('pointerup',svg,150,150);assert(!d.querySelector('[data-reveal-country]'),'swipe not tap');if(w.innerWidth<=650)assert(view()===expected,'phone region stays fitted');
    }else{
     tap(ids[0]);assert(view()===expected,'first Explorer selection retains regional context');tap(ids[0]);assert(view()!==expected,'second Explorer selection focuses');tap(ids[0]);assert(view()===expected,'third Explorer selection restores regional context');
     q('[data-action="zoom-in"]').click();assert(view()!==expected,'Explorer zoom works');q('[data-action="fit"]').click();assert(view()===expected,'Fit restores regional bounds');
    }
    q('[data-action="reset"]').click();
    const search=q('#country-search');search.value=subset.countries[0].name;search.dispatchEvent(new w.Event('input',{bubbles:true}));assert(d.querySelectorAll('.country-list [data-list-country]').length>=1,'regional search');q('[data-list-country="'+ids[0]+'"]').click();assert(view()===expected,'search activation keeps regional fit');
   }
   assert(d.querySelectorAll('path[data-country]').length===54,'All Africa restores 54');
  }
  results.textContent='PASS: '+checks+' regional checks at '+frame.contentWindow.innerWidth+' × '+frame.contentWindow.innerHeight+'. All six Reveal sets. Synthetic touch; capture stubbed.';
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}
};
