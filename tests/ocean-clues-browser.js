const data=await(await fetch('../data/africa.json')).json();
const frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=async()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};try{
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),click=s=>q(s).click(),svg=q('#africa-map');
 const choose=id=>click('[data-piece="'+id+'"]'),clue=()=>click('[data-action="clue"]'),reset=()=>click('[data-action="reset"]');
 const view=()=>svg.getAttribute('viewBox'),score=()=>q('progress').value;
 const send=(type,target,x,y,id=31,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
 svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
 reset();
 for(const id of ['CPV','COM','MUS','SYC','STP']){
  choose(id);if(w.innerWidth<=650){click('[data-piece-filter="islands"]');choose(id);click('[data-action="phone-fit"]');}const before=view(),top=q('.map-viewport').getBoundingClientRect().top;clue();ok(!q('.ocean-clue')&&!q('.clue-target'),'region clue has no destination');clue();
  const group=q('[data-ocean-clue="'+id+'"]'),ring=group?.querySelector('circle'),c=data.countries.find(c=>c.id===id);
  ok(group&&group.children.length===2,'two ocean ripples '+id);ok(!q('.clue-target'),'no exact/red cue '+id);
  ok(w.getComputedStyle(ring).pointerEvents==='none','nonblocking '+id);
  const matrix=group.getScreenCTM(),mapMatrix=svg.getScreenCTM(),point=new w.DOMPoint(0,0).matrixTransform(matrix);
  const expected=new w.DOMPoint(Math.round((c.bounds[0]+c.bounds[2])/40)*20,Math.round((c.bounds[1]+c.bounds[3])/40)*20).matrixTransform(mapMatrix);
  ok(Math.hypot(point.x-expected.x,point.y-expected.y)<.1,'group center transformed correctly '+id);
  ok(+ring.getAttribute('r')>=Math.hypot(c.bounds[2]-c.bounds[0],c.bounds[3]-c.bounds[1])*.7,'broader than geometry '+id);
  ok(view()===before&&score()===0&&q('.map-viewport').getBoundingClientRect().top===top,'no camera/layout/score change '+id);
  if(w.innerWidth<=650){
   const b=svg.getBoundingClientRect(),x=b.x+b.width*.6,y=b.y+b.height*.4;
   send('pointerdown',svg,x,y);send('pointermove',d,x+18,y+10);send('pointerup',d,x+18,y+10);
   send('pointerdown',svg,x-35,y);send('pointerdown',svg,x+35,y,32,false);send('pointermove',d,x+50,y,32,false);send('pointerup',d,x+50,y,32,false);send('pointerup',d,x-35,y);
   ok(view()!==before,'touch pan/pinch changed view');
  }else click('[data-action="zoom-in"]');
  const updated=group.getScreenCTM(),mapUpdated=svg.getScreenCTM();ok(Math.abs(updated.a-mapUpdated.a)<.001,'ripple follows map scale '+id);
  clue();ok(q('#ocean-clue-layer').children.length===1,'repeat replaces ripple');if(w.innerWidth>650)click('[data-action="zoom-out"]');
  const p=new w.DOMPoint(...c.anchor).matrixTransform(svg.getScreenCTM()),piece=q('[data-piece="'+id+'"]'),b=piece.getBoundingClientRect();piece.setPointerCapture=()=>{};piece.hasPointerCapture=()=>false;
  send('pointerdown',piece,b.x+30,b.y+30,40);send('pointermove',d,p.x,p.y,40);send('pointerup',d,p.x,p.y,40);
  ok(score()===1&&!q('.ocean-clue')&&!q('.drag-preview'),'transformed island placement cleans ripple '+id);reset();
 }
 click('[data-piece-filter="az"]');choose('RWA');clue();clue();ok(q('.clue-target')&&!q('.ocean-clue'),'mainland cue unchanged');
 choose('MDG');clue();clue();ok(q('[data-country="MDG"].clue-target')&&!q('.ocean-clue'),'large Madagascar retains normal clue');
 choose('CPV');clue();clue();choose('COM');ok(!q('.ocean-clue'),'piece change cleanup');clue();clue();click('[data-piece-filter="islands"]');ok(!q('.ocean-clue'),'filter cleanup');
 choose('CPV');clue();clue();if(w.innerWidth<=650){click('[data-action="skip-piece"]');ok(!q('.ocean-clue'),'Skip cleanup');}
 reset();choose('CPV');clue();clue();click('[data-action="preview"]');ok(!q('.ocean-clue'),'reference preview cleanup');click('[data-action="preview"]');
 choose('CPV');clue();clue();await new Promise(r=>setTimeout(r,2300));ok(!q('.ocean-clue'),'ripple expires');clue();ok(q('.ocean-clue'),'repeat after expiry');reset();ok(!q('.ocean-clue')&&score()===0,'Reset cleanup');
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
 out.textContent='PASS: '+n+' ocean clue checks at '+w.innerWidth+'px; synthetic touch/capture stub.';
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
