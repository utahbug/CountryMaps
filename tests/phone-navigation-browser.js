const data=await(await fetch('../data/africa.json')).json();
const frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};try{
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),click=s=>q(s).click(),svg=q('#africa-map');
 const box=()=>{const b=q('.side-panel').getBoundingClientRect();return [b.x,b.y,b.width,b.height].join(',');};
 const view=()=>svg.getAttribute('viewBox'),score=()=>q('progress').value;
 const active=()=>q('[data-piece]:not([hidden])');
 const send=(type,target,x,y,id=31,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
 svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
 const pan=()=>{const b=svg.getBoundingClientRect(),x=b.x+b.width*.7,y=b.y+b.height*.35;send('pointerdown',svg,x,y);send('pointermove',d,x+14,y+12);send('pointerup',d,x+14,y+12);};
 const pinch=()=>{const b=svg.getBoundingClientRect(),x=b.x+b.width*.55,y=b.y+b.height*.4;send('pointerdown',svg,x-35,y);send('pointerdown',svg,x+35,y,32,false);send('pointermove',d,x+48,y,32,false);send('pointerup',d,x+48,y,32,false);send('pointerup',d,x-35,y);};
 const point=id=>new w.DOMPoint(...data.countries.find(c=>c.id===id).anchor).matrixTransform(svg.getScreenCTM());
 click('[data-action="reset"]');const fixed=box(),full=view();
 for(const filter of ['north','west','central','east','southern','islands','small','az']){
  click('[data-piece-filter="'+filter+'"]');const fit=view(),before=score();ok(filter==='az'?fit===full:fit!==full,'filter fits '+filter);ok(box()===fixed,'filter cannot move box '+filter);
  pan();ok(view()!==fit,'pan '+filter);pinch();ok(view()!==fit,'pinch '+filter);ok(box()===fixed,'gestures cannot transform box '+filter);ok(score()===before,'gesture never places');
  click('[data-action="phone-fit"]');ok(view()===fit,'Fit restores subset');
  pinch();pan();const card=active(),id=card.dataset.piece,b=card.getBoundingClientRect();card.setPointerCapture=()=>{};card.hasPointerCapture=()=>false;
  const p=point(id);send('pointerdown',card,b.x+b.width/2,b.y+b.height/3,40);const v=view();send('pointerdown',svg,p.x,p.y,41,false);send('pointermove',d,p.x+70,p.y,41,false);send('pointerup',d,p.x+70,p.y,41,false);ok(view()===v,'map cannot steal piece drag');send('pointermove',d,p.x,p.y,40);send('pointerup',d,p.x,p.y,40);ok(score()===before+1,'transformed drop '+id);ok(!q('.drag-preview'),'clean preview');
  click('[data-action="phone-fit"]');pinch();pan();const next=active(),nextId=next.dataset.piece;next.click();pan();ok(score()===before+1,'armed map pan never places');const t=point(nextId);send('pointerdown',q('[data-country="'+nextId+'"]'),t.x,t.y);send('pointerup',d,t.x,t.y);ok(score()===before+2,'transformed tap '+nextId);
 }

 click('[data-action="reset"]');click('[data-piece-filter="small"]');
 for(const id of ['GMB','TGO','BEN','RWA','BDI','DJI','SWZ','LSO','MWI','CPV','COM','MUS','SYC','STP']){
  for(let i=0;i<54&&active()?.dataset.piece!==id;i++)click('[data-action="skip-piece"]');
  ok(active()?.dataset.piece===id,'queue reaches '+id);pinch();pan();const before=score(),card=active(),b=card.getBoundingClientRect(),p=point(id);card.setPointerCapture=()=>{};card.hasPointerCapture=()=>false;
  send('pointerdown',card,b.x+50,b.y+30,40);send('pointermove',d,p.x,p.y,40);send('pointerup',d,p.x,p.y,40);ok(score()===before+1,'small/island transformed placement '+id);ok(box()===fixed,'small-country box stays fixed');
 }
 for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',svg,150,300);send('pointerdown',svg,220,300,32,false);send(end,d,220,300,32,false);const v=view();send('pointermove',d,300,400);ok(view()===v,'cancel clears both pointers');}
 send('pointerdown',svg,150,300);click('[data-action="reset"]');const resetView=view();send('pointermove',d,300,400);ok(view()===resetView&&score()===0,'Reset clears gesture');
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no page overflow');ok(q('[data-action="skip-piece"]').getBoundingClientRect().top>=q('.side-panel').getBoundingClientRect().bottom,'Skip below box');ok(w.getComputedStyle(q('[data-action="skip-piece"]')).fontWeight==='400','Skip not bold');
 out.textContent='PASS: '+n+' phone navigation checks at '+w.innerWidth+'; synthetic touch, capture stubbed.';
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
