// Test-only harness, excluded from dist. Uses the real app DOM and event handlers.
// Synthetic PointerEvents cannot acquire native capture, so only capture is stubbed.
const frame=document.querySelector('iframe'),results=document.querySelector('#results');
if(new URLSearchParams(location.search).get('mode')==='reveal')frame.src='../?map=africa&mode=reveal';
document.querySelector('#run').onclick=()=>{
 let checks=0;
 try{
  const w=frame.contentWindow,d=w.document,svg=d.querySelector('#africa-map');
  if(!svg)throw Error('Explorer not loaded');
  const q=s=>d.querySelector(s),box=()=>svg.getAttribute('viewBox'),selected=()=>q('.map-readout strong').textContent;
  const assert=(condition,label)=>{if(!condition)throw Error(label);checks++;};
  const captured=new Set(),originals=['setPointerCapture','hasPointerCapture','releasePointerCapture'].map(k=>svg[k]);
  svg.setPointerCapture=id=>captured.add(id);svg.hasPointerCapture=id=>captured.has(id);svg.releasePointerCapture=id=>{captured.delete(id);send('lostpointercapture',svg,id);};
  const send=(type,target=svg,id=71,x=150,y=150,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y}));
  const start=()=>send('pointerdown',q('[data-country="DZA"]'));
  const clean=()=>assert(!svg.hasAttribute('data-pan-pointer')&&!svg.classList.contains('is-panning')&&!captured.size&&!q('.drag-preview'),'no stranded gesture state');
  const reset=()=>q('[data-action="reset"]').click();
  try{
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
   const focused=box();send('pointerdown',q('[data-country="EGY"]'));send('pointerup');assert(box()===focused&&selected()==='Egypt','different country preserves zoom and center');
   q('[data-list-country="EGY"]').click();assert(box()!==focused,'repeat via list focuses same country');
   q('[data-action="fit"]').click();start();send('pointerup');assert(box()==='0 0 800 730','new selection after Fit preserves fit');
   start();send('pointermove',svg,71,175,165);send('pointerup',svg,71,175,165);assert(box().split(' ')[2]==='800','pan on selected country does not focus');clean();
   const panned=box();send('pointerdown',q('[data-country="EGY"]'));send('pointerup');assert(box()===panned,'first selection preserves manual pan');reset();
   for(const id of ['CAF','COD']){
    q('[data-list-country="'+id+'"]').click();
    const label=q('.selected-country-overlay'),before=label.getBoundingClientRect(),map=svg.getBoundingClientRect();
    assert(!label.hidden&&label.textContent===selected(),'overlay agrees with top name');
    assert(w.getComputedStyle(label).pointerEvents==='none','overlay cannot intercept input');
    assert(before.left>=map.left&&before.right<=map.right&&before.top>map.top+map.height/2&&before.bottom<=map.bottom,'long label fits lower map viewport');
    assert(label.scrollWidth<=label.clientWidth,'long name wraps without overflow');
    q('[data-action="zoom-in"]').click();q('[data-action="right"]').click();
    const after=label.getBoundingClientRect();assert(before.x===after.x&&before.y===after.y,'label stays fixed during zoom and pan');
   }
   reset();assert(q('.selected-country-overlay').hidden,'Reset hides selected label');
   results.textContent='PASS: '+checks+' checks at '+w.innerWidth+' × '+w.innerHeight+' in '+new URL(w.location.href).searchParams.get('mode')+'. Touch PointerEvents through actual activity; capture stubbed. Hardware touch not tested.';
  }finally{['setPointerCapture','hasPointerCapture','releasePointerCapture'].forEach((k,i)=>svg[k]=originals[i]);}
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}
};
