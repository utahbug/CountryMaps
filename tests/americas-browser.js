const frame=document.querySelector('iframe'),results=document.querySelector('#results');
const next=w=>new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
document.querySelector('#run').onclick=async()=>{
 let checks=0;const assert=(ok,name)=>{if(!ok)throw Error(name);checks++;};
 try{
 for(const id of ['canada','central-america','south-america']){
  const data=await (await fetch('../data/'+id+'.json')).json();
  const loaded=new Promise(resolve=>frame.onload=resolve);frame.src='../?map='+id;await loaded;
  const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s);
  for(let i=0;i<100&&!q('.map-canvas');i++)await next(w);
  assert(q('.map-canvas'),id+' loads');const svg=q('.map-canvas'),view=()=>svg.getAttribute('viewBox');
  assert(q('h1').textContent.includes('Map view'),'map-only heading');
  assert(![...d.querySelectorAll('a')].some(a=>/mode=(reveal|puzzle)/.test(a.href)),'no unfinished activity links');
  assert(!q('#piece-tray')&&!q('[data-action="reveal-all"]'),'no puzzle or Reveal controls');
  assert(d.documentElement.scrollWidth<=w.innerWidth,'no page overflow');
  assert(svg.getBoundingClientRect().width>200,'usable map width');
  assert(d.querySelectorAll('path[data-country]').length===data.units.length,'all primary geometry');
  const all=[...data.units,...data.context];
  for(const c of all){
   const path=q('[data-country="'+c.id+'"],[data-territory="'+c.id+'"]');assert(path.getAttribute('d')===c.path,'exact geometry '+c.id);
   const fit=svg.getBoundingClientRect(),b=path.getBoundingClientRect();assert(b.left>=fit.left-.1&&b.right<=fit.right+.1&&b.top>=fit.top-.1&&b.bottom<=fit.bottom+.1,'fit contains '+c.id);
   const row=q('[data-list-country="'+c.id+'"]');assert(row.getBoundingClientRect().height>=44,'touch row '+c.id);row.click();assert(q('.map-readout strong').textContent.includes(c.name),'select '+c.id);
   const label=q('.selected-country-overlay'),lb=label.getBoundingClientRect(),vb=q('.map-viewport').getBoundingClientRect();assert(lb.left>=vb.left&&lb.right<=vb.right+.1&&lb.top>=vb.top&&lb.bottom<=vb.bottom+.1,'label visible '+c.id);
   if(id==='canada'){assert(path.style.strokeDasharray===(c.unitType==='territory'?'5, 3':'')||path.style.strokeDasharray===(c.unitType==='territory'?'5 3':''),'non-color boundary '+c.id);assert(row.textContent.includes(c.unitType==='province'?'Province':'Territory'),'text type '+c.id);}
   q('[data-action="fit"]').click();
  }
  if(id==='canada'){assert(q('.unit-type-legend').textContent.includes('Province')&&q('.unit-type-legend').textContent.includes('Territory'),'legend');const paths=[...d.querySelectorAll('path[data-country]')];assert(new Set(paths.map(p=>p.style.fill)).size===2,'two type colors');}
  if(id==='south-america'){q('[data-list-country="GUF"]').click();assert(q('.map-readout strong').textContent.includes('French Guiana'),'Guiana selectable');assert(q('.selected-country-overlay').textContent.includes('France'),'Guiana France identification');assert(q('.map-readout span').textContent.includes('12 countries + 1 territorial unit'),'separate counts');}
  const input=q('#country-search');input.value=all.at(-1).name;input.dispatchEvent(new w.Event('input',{bubbles:true}));assert(q('[data-list-country="'+all.at(-1).id+'"]'),'search works');
  q('[data-action="reset"]').click();assert(view()==='0 0 800 730','reset fit');q('[data-action="zoom-in"]').click();assert(view()!=='0 0 800 730','manual zoom');
  const before=view();q('[data-action="right"]').click();assert(view()!==before,'directional pan');
  const captures=new Set();svg.setPointerCapture=id=>captures.add(id);svg.hasPointerCapture=id=>captures.has(id);svg.releasePointerCapture=id=>captures.delete(id);
  const send=(type,x)=>svg.dispatchEvent(new w.PointerEvent(type,{bubbles:true,pointerId:4,isPrimary:true,pointerType:'touch',button:0,clientX:x,clientY:150}));const panned=view();send('pointerdown',200);send('pointermove',150);send('pointerup',150);assert(view()!==panned,'direct touch pan');assert(q('.selected-country-overlay').hidden,'pan does not select');
  q('[data-action="fit"]').click();assert(view()==='0 0 800 730','fit restores');
  const reloaded=new Promise(resolve=>frame.onload=resolve);frame.src='../?map='+id+'&mode=puzzle';await reloaded;
  for(let i=0;i<100&&!frame.contentDocument.querySelector('.map-canvas');i++)await next(frame.contentWindow);
  assert(!frame.contentDocument.querySelector('#piece-tray'),'direct puzzle URL does not expose unfinished activity');
 }
 results.textContent='PASS: '+checks+' Americas map-only checks at '+innerWidth+' × '+innerHeight+'. All 33 geographic units, navigation, metadata cues, search, fit, zoom and synthetic touch pan.';
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}
};
