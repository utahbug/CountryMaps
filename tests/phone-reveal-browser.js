// Browser integration checks for the existing <=650px phone breakpoint.
export function runPhoneRevealChecks({w,d,svg,send,assert,reset,clean,box}) {
 const q=s=>d.querySelector(s),signature=()=>{
  const b=svg.getBoundingClientRect(),m=svg.getScreenCTM();
  return [b.x,b.y,b.width,b.height,m.a,m.d,m.e,m.f].map(n=>Math.round(n*1000));
 };
 reset();const initial=signature();
 const stable=()=>{assert(box()==='0 0 800 730','phone Reveal always fitted');assert(JSON.stringify(signature())===JSON.stringify(initial),'map position, size and geographic transform never jump');};
 const tap=id=>{send('pointerdown',q('[data-country="'+id+'"]'));send('pointerup');};
 assert(q('.map-tools').hidden,'phone navigation controls hidden');
 assert(w.getComputedStyle(svg).touchAction==='pan-y','phone map permits page scrolling without map panning');
 stable();
 const ids=['DZA','COD','ZAF','MDG','SEN','CAF'];
 for(const id of ids){
  tap(id);stable();assert(q('[data-country="'+id+'"]').getAttribute('aria-pressed')==='true','country revealed by tap');
  const label=q('.selected-country-overlay'),b=label.getBoundingClientRect(),v=svg.getBoundingClientRect();
  assert(!label.hidden&&label.scrollWidth<=label.clientWidth,'revealed name readable and wrapped');
  assert(b.left>=v.left&&b.right<=v.right&&b.top>=v.top&&b.bottom<=v.bottom,'label contained inside viewport');
 }
 for(const id of ids){tap(id);stable();assert(q('[data-country="'+id+'"]').getAttribute('aria-pressed')==='false','independent name hidden by another tap');}
 for(let i=0;i<12;i++){tap('DZA');stable();assert(q('[data-country="DZA"]').getAttribute('aria-pressed')===String(i%2===0),'repeat tap toggles only visibility');}
 tap('COD');const before=q('.map-readout span').textContent;
 send('pointerdown',q('[data-country="COD"]'));send('pointermove',svg,71,195,190);send('pointerup',svg,71,195,190);
 stable();clean();assert(q('.map-readout span').textContent===before,'swipe changes neither name visibility nor score');
 for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',q('[data-country="COD"]'));send(end);send('pointerup');clean();stable();assert(q('.map-readout span').textContent===before,'cancelled gesture does not toggle');}
 for(const action of ['zoom-in','zoom-out','left','right','up','down','fit']){q('[data-action="'+action+'"]').click();stable();}
 for(const id of ['CAF','COD']){q('[data-list-country="'+id+'"]').click();stable();}
 q('#country-search').value='madagascar';q('#country-search').dispatchEvent(new w.Event('input',{bubbles:true}));q('[data-list-country="MDG"]').click();stable();
 reset();stable();
 q('[data-action="reveal-all"]').click();stable();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===54,'Reveal All reveals 54 countries');
 assert([...d.querySelectorAll('.list-name')].every(e=>!/^Country \d+$/.test(e.textContent)),'Reveal All shows every country name in the keyed list');
 tap('DZA');stable();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===53,'one name can hide after Reveal All');
 reset();stable();assert(d.querySelectorAll('path[data-country][aria-pressed="true"]').length===0,'Reset hides all country names');assert(q('.selected-country-overlay').hidden,'Reset clears adjacent label');
 assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');clean();
}
