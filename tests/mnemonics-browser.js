import {mnemonicCandidates} from '../lib/mnemonics.mjs';
document.querySelector('#run').onclick=async()=>{
 let n=0;const assert=(v,m)=>{if(!v)throw Error(m);n++;};
 const d=document.querySelector('iframe').contentDocument,w=d.defaultView,q=s=>d.querySelector(s),click=s=>q(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true})),reset=()=>click('[data-action="reset"]');
 const originalMatch=w.matchMedia;
 try{
  reset();const canonical=[...d.querySelectorAll('path[data-country]')].map(e=>e.getAttribute('d'));
  for(const c of mnemonicCandidates){
   reset();click('[data-piece="'+c.units[0]+'"]');const overlay=q('.mnemonic-overlay');
   assert(overlay?.dataset.mnemonic===c.id,'candidate '+c.id);
   assert(overlay.textContent.includes(c.caption),'caption '+c.id);
   assert(w.getComputedStyle(overlay).pointerEvents==='none','non-interactive');
   const b=overlay.getBoundingClientRect(),host=q('.map-viewport').getBoundingClientRect();assert(b.left>=host.left&&b.right<=host.right&&b.top>=host.top&&b.bottom<=host.bottom,'overlay fits');
   for(const id of c.units){const path=q('path[data-country="'+id+'"]');assert(!path.hasAttribute('transform')&&!path.getAnimations().length,'canonical map not animated '+id);}
   click('[data-piece="DZA"]');assert(!q('.mnemonic-overlay'),'switch clears');
   click('[data-piece="'+c.units[0]+'"]');assert(!q('.mnemonic-overlay'),'repeat pick quiet');
  }
  reset();click('[data-piece="BWA"]');await new Promise(r=>setTimeout(r,1450));assert(!q('.mnemonic-overlay'),'automatic expiry');
  reset();click('[data-piece="CMR"]');reset();assert(!q('.mnemonic-overlay'),'Reset clears');
  w.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:originalMatch.call(w,query);
  click('[data-piece="SLE"]');assert(q('.mnemonic-overlay').dataset.reducedMotion==='true','reduced motion');assert(!q('.mnemonic-overlay').getAnimations({subtree:true}).length,'static reduced-motion equivalent');w.matchMedia=originalMatch;
  for(const end of ['pointercancel','lostpointercapture']){
   reset();const piece=q('[data-piece="BWA"]');piece.setPointerCapture=()=>{};piece.hasPointerCapture=()=>false;
   piece.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,pointerId:41,pointerType:'touch',isPrimary:true,button:0,clientX:10,clientY:10}));
   assert(q('.mnemonic-overlay')&&q('.drag-preview'),'drag and mnemonic coexist');
   d.dispatchEvent(new w.PointerEvent(end,{bubbles:true,pointerId:42}));assert(q('.mnemonic-overlay'),'second pointer cannot cancel sketch');
   d.dispatchEvent(new w.PointerEvent(end,{bubbles:true,pointerId:41}));assert(!q('.mnemonic-overlay')&&!q('.drag-preview'),'owned cancellation cleans both');
  }
  reset();click('[data-piece="BWA"]');click('[data-country="BWA"]');assert(q('progress').value===1&&!q('.mnemonic-overlay'),'tap placement clears sketch');
  click('[data-piece="CMR"]');click('[data-action="preview"]');assert(!q('.mnemonic-overlay'),'reference view clears');click('[data-action="preview"]');
  assert(q('progress').value===1,'reference return preserves score');
  reset();assert(canonical.every((path,i)=>d.querySelectorAll('path[data-country]')[i].getAttribute('d')===path&&!d.querySelectorAll('path[data-country]')[i].hasAttribute('transform')),'canonical transforms unchanged');
  assert(d.documentElement.scrollWidth<=w.innerWidth,'no overflow');
  document.querySelector('#results').textContent='PASS: '+n+' mnemonic checks at '+w.innerWidth+' × '+w.innerHeight;
 }catch(e){document.querySelector('#results').textContent='FAIL after '+n+': '+e.message;}finally{w.matchMedia=originalMatch;}
};
