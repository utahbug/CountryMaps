import {runPhoneRevealChecks} from './phone-reveal-browser.js';
// Test-only harness, excluded from dist. Uses the real app DOM and event handlers.
// Synthetic PointerEvents cannot acquire native capture, so only capture is stubbed.
const frame=document.querySelector('iframe'),results=document.querySelector('#results');
if(new URLSearchParams(location.search).get('mode')==='reveal')frame.src='../?map=africa&mode=reveal';
document.querySelector('#run').onclick=()=>{
 let checks=0;
 try{
  const w=frame.contentWindow,d=w.document,svg=d.querySelector('#africa-map');
  if(!svg)throw Error('Explorer not loaded');
  const q=s=>d.querySelector(s),box=()=>svg.getAttribute('viewBox'),selected=()=>q('path[data-country].selected')?.dataset.name||q('path[data-territory].selected title')?.textContent||'Africa';
  const assert=(condition,label)=>{if(!condition)throw Error(label);checks++;};
  const captured=new Set(),originals=['setPointerCapture','hasPointerCapture','releasePointerCapture'].map(k=>svg[k]);
  svg.setPointerCapture=id=>captured.add(id);svg.hasPointerCapture=id=>captured.has(id);svg.releasePointerCapture=id=>{captured.delete(id);send('lostpointercapture',svg,id);};
  const send=(type,target=svg,id=71,x=150,y=150,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y}));
  const start=()=>send('pointerdown',q('[data-country="DZA"]'));
  const clean=()=>assert(!svg.hasAttribute('data-pan-pointer')&&!svg.classList.contains('is-panning')&&!captured.size&&!q('.drag-preview'),'no stranded gesture state');
  const reset=()=>q('[data-action="reset"]').click();
  try{
   if(new URL(w.location.href).searchParams.get('mode')==='reveal'){
    runPhoneRevealChecks({w,d,svg,send,assert,reset,clean,box});
    results.textContent='PASS: '+checks+' stable Reveal checks at '+w.innerWidth+' × '+w.innerHeight+'. Touch PointerEvents; capture stubbed.';return;
   }
   reset();assert(w.getComputedStyle(svg).touchAction==='none','one-finger map gesture owns touch');
   assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
   start();send('pointermove',svg,71,153,152);send('pointerup',svg,71,153,152);assert(selected()==='Algeria','tap jitter selects original country');assert(box()==='0 0 800 730','tap does not pan');clean();
   reset();start();const initial=box();send('pointermove',svg,71,190,180);assert(box()!==initial,'touch swipe pans');assert(selected()==='Africa','swipe does not select');
   const owned=box();send('pointerdown',q('[data-country="EGY"]'),72,200,200,false);send('pointermove',svg,72,250,250,false);send('pointerup',svg,72,250,250,false);send('pointercancel',svg,72);assert(box()===owned&&svg.dataset.panPointer==='71','second pointer cannot steal drag');
   send('pointerup',svg,71,190,180);q('[data-country="EGY"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));assert(selected()==='Africa','compatibility click after drag suppressed');clean();
   for(const end of ['pointercancel','lostpointercapture','reset','scroll','blur']){
    reset();start();send('pointermove',svg,71,180,175);
    if(end==='reset')reset();else if(end==='scroll'||end==='blur')w.dispatchEvent(new w.Event(end));else send(end);
    // Native cancellation/loss releases capture in the browser; mirror that here.
    captured.clear();send('pointerup',svg,71,180,175);clean();assert(selected()==='Africa','cancelled gesture never selects: '+end);
    start();send('pointerup');assert(selected()==='Algeria','fresh tap after '+end);clean();
   }
   for(let i=0;i<30;i++){reset();start();send('pointermove',svg,71,180,180);send('pointermove',svg,71,150,150);send('pointerup');assert(selected()==='Africa','out-and-back remains drag');clean();}
   reset();q('[data-action="zoom-in"]').click();assert(box().split(' ')[2]==='480','zoom works');start();send('pointermove',svg,71,170,165);send('pointerup',svg,71,170,165);const zoomed=box();q('[data-action="right"]').click();assert(box()!==zoomed,'arrow pan works');q('[data-action="fit"]').click();assert(box()==='0 0 800 730','Fit restores map');
   q('[data-country="EGY"]').dispatchEvent(new w.KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));assert(selected()==='Egypt','keyboard country activation');reset();clean();
   start();send('pointerup');assert(box()==='0 0 800 730','first map tap retains full continent');
   start();send('pointerup');assert(Number(box().split(' ')[2])<800,'second map tap focuses country');
   const focused=box();send('pointerdown',q('[data-country="EGY"]'));send('pointerup');assert(box()==='0 0 800 730'&&selected()==='Egypt','different country returns to continent');
   q('[data-list-country="EGY"]').click();assert(box()==='0 0 800 730','repeat card keeps context');q('[data-focus-unit="EGY"]').click();assert(Number(box().split(' ')[2])<800,'explicit card focus');
   q('[data-action="fit"]').click();start();send('pointerup');assert(box()==='0 0 800 730','new selection after Fit preserves fit');
   start();send('pointermove',svg,71,175,165);send('pointerup',svg,71,175,165);assert(box().split(' ')[2]==='800','pan on selected country does not focus');clean();
   const panned=box();send('pointerdown',q('[data-country="EGY"]'));send('pointerup');assert(box()==='0 0 800 730','new country selection resets manual pan');reset();
   for(const id of ['CAF','COD']){
    q('[data-list-country="'+id+'"]').click();
    const label=q('.selected-country-overlay'),before=label.getBoundingClientRect(),map=svg.getBoundingClientRect();
    assert(!label.hidden&&label.textContent===selected(),'overlay agrees with top name');
    assert(w.getComputedStyle(label).pointerEvents==='none','overlay cannot intercept input');
    assert(before.left>=map.left&&before.right<=map.right&&before.top>=map.top&&before.bottom<=map.bottom,'long label stays inside map viewport');
    assert(label.scrollWidth<=label.clientWidth,'long name wraps without overflow');
    q('[data-action="zoom-in"]').click();q('[data-action="right"]').click();
    const after=label.getBoundingClientRect();assert(before.x!==after.x||before.y!==after.y,'label follows country during zoom and pan');
    assert(after.left>=map.left&&after.right<=map.right&&after.top>=map.top&&after.bottom<=map.bottom,'moved label remains inside viewport');
   }
   reset();assert(q('.selected-country-overlay').hidden,'Reset hides selected label');
   reset();const revealMode=new URL(w.location.href).searchParams.get('mode')==='reveal';
   for(let i=0;i<10;i++){
    start();send('pointerup');
    assert((Number(box().split(' ')[2])===800)===(i%2===0),'repeated taps alternate Fit and focus');
    if(revealMode){
     const visible=i%2===0;assert(q('[data-country="DZA"]').getAttribute('aria-pressed')===String(visible),'Reveal independently toggles name state');
     assert(q('.selected-country-overlay').hidden===!visible,'hidden name removed from adjacent overlay');
     assert(q('.map-readout strong').textContent===(visible?'Algeria':'Africa'),'top name follows Reveal visibility');
     assert(q('[data-list-country="DZA"] .list-name').textContent===(visible?'Algeria':'Country 1'),'list does not leak hidden name');
    }else assert(selected()==='Algeria','Explorer selection survives every focus toggle');
   }
   if(revealMode){
    reset();q('[data-list-country="DZA"]').click();q('[data-list-country="EGY"]').click();q('[data-list-country="DZA"]').click();
    assert(q('[data-country="DZA"]').getAttribute('aria-pressed')==='false'&&q('[data-country="EGY"]').getAttribute('aria-pressed')==='true','country visibility toggles independently');
    q('[data-action="reveal-all"]').click();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===54,'Reveal All shows all 54');
    q('[data-list-country="DZA"]').click();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===53,'revealed country can hide after Reveal All');
    reset();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===0&&box()==='0 0 800 730','Reset hides all names and restores Fit');
   }
   reset();const countryCount=d.querySelectorAll('path[data-country]').length;assert(countryCount===54,'exactly 54 scored country paths');
   const score=q('.map-readout span').textContent;
   for(const id of ['SAH','BRT','SOL']){
    reset();const shape=q('[data-territory="'+id+'"]');assert(!!shape&&w.getComputedStyle(shape).pointerEvents!=='none','territory map can receive pointer input');
    send('pointerdown',shape);send('pointerup');assert(shape.getAttribute('aria-pressed')==='true','territory tap identifies it');
    assert(box()==='0 0 800 730','territory first selection preserves Fit');assert(q('.map-readout span').textContent===score,'territory does not affect country score');
    assert(!q('.special-status-card').hidden&&q('.special-status-card').textContent.includes(shape.getAttribute('aria-label').split(' — ')[0]),'special-status detail card identifies area');
    q('[data-list-country="'+id+'"]').click();assert(Number(box().split(' ')[2])<800,'repeat territory selection focuses');
    assert(!q('[data-piece="'+id+'"]'),'territory has no puzzle piece');
   }
   reset();
   results.textContent='PASS: '+checks+' checks at '+w.innerWidth+' × '+w.innerHeight+' in '+new URL(w.location.href).searchParams.get('mode')+'. Touch PointerEvents through actual activity; capture stubbed. Hardware touch not tested.';
  }finally{['setPointerCapture','hasPointerCapture','releasePointerCapture'].forEach((k,i)=>svg[k]=originals[i]);}
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}
};
