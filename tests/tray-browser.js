const data=await(await fetch('../data/africa.json')).json();
const frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};try{
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],click=s=>q(s).click();
 const reset=()=>click('[data-action="reset"]'),score=()=>q('progress').value;
 const clean=()=>ok(!q('.drag-preview')&&!q('.dragging')&&!q('.status').dataset.activePointer,'no stranded drag state');
 const send=(type,target,x,y,id=77,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
 const begin=id=>{const p=q('[data-piece="'+id+'"]');p.setPointerCapture=()=>{};p.hasPointerCapture=()=>false;const b=p.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;send('pointerdown',p,x,y);return {p,x,y};};
 reset();const phone=w.innerWidth<=650,side=q('.side-panel'),tray=q('#piece-tray');
 ok(w.getComputedStyle(side).position===(phone?'absolute':'static'),'phone stage / desktop sidebar');
 if(phone){
 const visible=()=>all('[data-piece]').filter(e=>!e.hidden),active=()=>visible()[0]?.dataset.piece;
 ok(visible().length===1,'one active piece');
 const v=q('.map-viewport').getBoundingClientRect(),b=side.getBoundingClientRect();
 ok(b.left>=v.left&&b.right<=v.right&&b.top>=v.top&&b.bottom<=v.bottom,'stage contained in map');
 ok(b.bottom<=w.innerHeight,'piece visible without scrolling');
 const first=active();for(let i=0;i<54;i++){click('[data-action="skip-piece"]');ok(score()===0,'skip never scores');}
 ok(active()===first,'skipped pieces cycle back');
 ok(w.getComputedStyle(visible()[0]).touchAction==='none','drag owns touch');
 }
 // Upward touch drag from the actual card into the canonical country.
 const s=begin('DZA');send('pointermove',d,s.x,s.y-16);
 send('pointerdown',q('[data-piece="AGO"]'),s.x,s.y,78,false);send('pointerup',d,s.x,s.y,78,false);ok(q('.drag-preview')&&s.p.classList.contains('dragging'),'second pointer does not steal');
 const a=data.countries.find(c=>c.id==='DZA').anchor,p=new w.DOMPoint(...a).matrixTransform(q('#africa-map').getScreenCTM());
 send('pointermove',d,p.x,p.y);send('pointerup',d,p.x,p.y);ok(score()===1,'tray-to-map drag places');clean();
 ok(all('[data-piece]').at(-1).dataset.piece==='DZA','completed card at end');
 const first=all('[data-piece]').find(el=>!el.disabled&&!el.hidden);
 first.click();q('[data-country="'+first.dataset.piece+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(score()===2,'tap-to-place');
 for(const filter of ['islands','small','west','az']){const b=q('[data-piece-filter="'+filter+'"]');if(!b)continue;b.click();ok(score()===2,'filter preserves score');}
 for(const ending of ['pointercancel','lostpointercapture','reset']){const s=begin('BEN');send('pointermove',d,s.x,s.y-15);if(ending==='reset')reset();else send(ending,d,s.x,s.y);clean();}
 if(phone){
  reset();click('[data-piece-filter="islands"]');
  for(let i=0;i<6;i++){const card=all('[data-piece]').find(e=>!e.hidden);ok(!!card,'island queued');const id=card.dataset.piece;card.click();q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
  ok(score()===6&&all('[data-piece]').every(e=>e.hidden),'subset completion has no completed tray');
  click('[data-piece-filter="small"]');ok(score()===6&&all('[data-piece]').filter(e=>!e.hidden).length===1,'filter selects remaining without resetting');
  click('[data-action="preview"]');ok(side.hidden,'staged piece hidden in reference view');click('[data-action="preview"]');ok(!side.hidden,'stage restored after reference');
  click('[data-piece-filter="az"]');
 }
 reset();for(let i=0;i<54;i++){const card=phone?all('[data-piece]').find(e=>!e.hidden):all('[data-piece]').find(e=>!e.disabled);const id=card.dataset.piece;card.click();q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(score()===i+1,'automatic sequence '+id);if(phone&&i===52)ok(q('[data-action="skip-piece"]').disabled,'last piece cannot loop');}

 ok(all('[data-piece]').every(el=>el.disabled),'all pieces completed');reset();ok(score()===0&&all('[data-piece]').every(el=>!el.disabled),'Reset restores all cards');
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal page overflow');
 out.textContent='PASS: '+n+' tray checks at '+w.innerWidth+' × '+w.innerHeight+'; synthetic touch with capture stub.';
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
