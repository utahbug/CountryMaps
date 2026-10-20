const data=await(await fetch('../data/africa.json')).json();
const frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=async()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};try{
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),click=s=>q(s).click(),svg=q('#africa-map');
 const box=()=>{const b=q('.side-panel').getBoundingClientRect();return [b.x,b.y,b.width,b.height].join(',');};
 const view=()=>svg.getAttribute('viewBox'),score=()=>q('progress').value;
 const active=()=>q('[data-piece]:not([hidden])');
 const filter=id=>{const select=q('#phone-piece-filter');select.value=id;select.dispatchEvent(new w.Event('change',{bubbles:true}));ok(q('#phone-piece-filter').value===id,'semantic filter selected '+id);};
 const send=(type,target,x,y,id=31,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
 svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
 const pan=()=>{const b=svg.getBoundingClientRect(),x=b.x+b.width*.7,y=b.y+b.height*.35;send('pointerdown',svg,x,y);send('pointermove',d,x+14,y+12);send('pointerup',d,x+14,y+12);};
 const pinch=()=>{const b=svg.getBoundingClientRect(),x=b.x+b.width*.55,y=b.y+b.height*.4;send('pointerdown',svg,x-35,y);send('pointerdown',svg,x+35,y,32,false);send('pointermove',d,x+48,y,32,false);send('pointerup',d,x+48,y,32,false);send('pointerup',d,x-35,y);};
 const point=id=>new w.DOMPoint(...data.countries.find(c=>c.id===id).anchor).matrixTransform(svg.getScreenCTM());
 click('[data-action="reset"]');const fixed=box(),full=view();
 ok(active().getAttribute('aria-pressed')==='true','first piece automatically active');
 const first=active().dataset.piece,wrong=point('ZAF');send('pointerdown',svg,wrong.x,wrong.y);send('pointerup',d,wrong.x,wrong.y);
 ok(score()===0&&active().dataset.piece===first&&active().getAttribute('aria-pressed')==='true','incorrect tap keeps piece active');
 const firstPoint=point(first);send('pointerdown',svg,firstPoint.x,firstPoint.y);send('pointerup',d,firstPoint.x,firstPoint.y);
 ok(score()===1&&active().dataset.piece!==first&&active().getAttribute('aria-pressed')==='true','tap without selection places and activates next');
 click('[data-action="reset"]');
 for(const set of ['north','west','central','east','southern','islands','small','az']){
  await new Promise(r=>setTimeout(r,0));filter(set);const fit=view(),before=score();ok(set==='az'?fit===full:fit!==full,'filter fits '+set);ok(box()===fixed,'filter cannot move box '+set);
  pan();ok(view()!==fit,'pan '+set);pinch();ok(view()!==fit,'pinch '+set);ok(box()===fixed,'gestures cannot transform box '+set);ok(score()===before,'gesture never places');
  click('[data-action="phone-fit"]');ok(view()===fit,'Fit restores subset');
  pinch();pan();const card=active(),id=card.dataset.piece,b=card.getBoundingClientRect();card.setPointerCapture=()=>{};card.hasPointerCapture=()=>false;
  const p=point(id);send('pointerdown',card,b.x+b.width/2,b.y+b.height/3,40);const v=view();send('pointerdown',svg,p.x,p.y,41,false);send('pointermove',d,p.x+70,p.y,41,false);send('pointerup',d,p.x+70,p.y,41,false);ok(view()===v,'map cannot steal piece drag');send('pointermove',d,p.x,p.y,40);send('pointerup',d,p.x,p.y,40);ok(score()===before+1,'transformed drop '+id);ok(!q('.drag-preview'),'clean preview');
  click('[data-action="phone-fit"]');pinch();pan();const next=active(),nextId=next.dataset.piece;ok(next.getAttribute('aria-pressed')==='true','next automatically active');pan();ok(score()===before+1,'armed map pan never places');const t=point(nextId);send('pointerdown',q('[data-country="'+nextId+'"]'),t.x,t.y);send('pointerup',d,t.x,t.y);ok(score()===before+2,'transformed tap '+nextId);
 }

 click('[data-action="reset"]');filter('small');
 for(const id of ['GMB','TGO','BEN','RWA','BDI','DJI','SWZ','LSO','MWI','CPV','COM','MUS','SYC','STP']){
  for(let i=0;i<54&&active()?.dataset.piece!==id;i++)click('[data-action="skip-piece"]');
  await new Promise(r=>setTimeout(r,0));ok(active()?.dataset.piece===id,'queue reaches '+id);const ripple=q('[data-ocean-clue="'+id+'"]'),transform=ripple?.getAttribute('transform');pinch();pan();
  if(['CPV','COM','MUS','SYC','STP'].includes(id)){
   ok(!!ripple,'pre-placement island ripple '+id);ok(q('[data-ocean-clue="'+id+'"]')===ripple&&ripple.getAttribute('transform')===transform,'pan/pinch preserve geographic ripple, no replay');
   ok(ripple.closest('svg')===svg,'ripple shares transformed map space');
  }
  const before=score(),card=active(),b=card.getBoundingClientRect(),p=point(id);card.setPointerCapture=()=>{};card.hasPointerCapture=()=>false;
  send('pointerdown',card,b.x+50,b.y+30,40);send('pointermove',d,p.x,p.y,40);send('pointerup',d,p.x,p.y,40);ok(score()===before+1,'small/island transformed placement '+id);ok(box()===fixed,'small-country box stays fixed');ok(!q('[data-ocean-clue="'+id+'"]'),'placed island ripple removed');
 }
 for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',svg,150,300);send('pointerdown',svg,220,300,32,false);send(end,d,220,300,32,false);const v=view();send('pointermove',d,300,400);ok(view()===v,'cancel clears both pointers');}
 send('pointerdown',svg,150,300);click('[data-action="reset"]');const resetView=view();send('pointermove',d,300,400);ok(view()===resetView&&score()===0,'Reset clears gesture');
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no page overflow');ok(q('[data-action="skip-piece"]').getBoundingClientRect().top>=q('.side-panel').getBoundingClientRect().bottom,'Skip below box');ok(w.getComputedStyle(q('[data-action="skip-piece"]')).fontWeight==='400','Skip not bold');
 out.textContent='PASS: '+n+' phone navigation checks at '+w.innerWidth+'; synthetic touch, capture stubbed.';
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
