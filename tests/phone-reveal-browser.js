// Real DOM regression checks for Reveal on phones, tablets, and desktop.
export function runPhoneRevealChecks({w,d,svg,send,assert,reset,clean,box}){
 const q=s=>d.querySelector(s),labels=()=>[...d.querySelectorAll('[data-reveal-country]')];
 const tap=id=>{send('pointerdown',q('[data-country="'+id+'"]'));send('pointerup');};
 const signature=()=>{const b=svg.getBoundingClientRect(),m=svg.getScreenCTM();return JSON.stringify([box(),b.x,b.y,b.width,b.height,m.a,m.d,m.e,m.f]);};
 const visible=()=>{
  const b=q('.map-viewport').getBoundingClientRect(),all=labels();
  for(const el of all){const r=el.getBoundingClientRect();
   assert(r.left>=b.left+7.9&&r.top>=b.top+7.9&&r.right<=b.right-7.9&&r.bottom<=b.bottom-7.9,'fully bounded '+el.dataset.revealCountry);
   assert(el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1,'unclipped text '+el.dataset.revealCountry);
   assert(w.getComputedStyle(el).pointerEvents==='none','label passes taps');
   for(const other of all){if(el===other)continue;const o=other.getBoundingClientRect();assert(r.right<=o.left+.1||o.right<=r.left+.1||r.bottom<=o.top+.1||o.bottom<=r.top+.1,'names do not overlap');}
  }
 };
 reset();const baseline=signature();assert(box()==='0 0 800 730','initial fit');
 const ids=['MAR','TUN','SOM','ZAF','CPV','MUS','SYC','CAF','COD'];
 for(const id of ids){tap(id);assert(signature()===baseline,'tap preserves exact map '+id);assert(q('[data-reveal-country="'+id+'"]'),'name revealed '+id);visible();}
 assert(labels().length===9,'all nine names persist');
 for(const id of ids){tap(id);assert(!q('[data-reveal-country="'+id+'"]'),'only own name hidden '+id);assert(signature()===baseline,'hide preserves map');}
 for(let i=0;i<12;i++){tap('COD');assert(labels().length===(i%2?0:1),'repeated toggle');}
 reset();const phone=w.innerWidth<=650;
 assert(q('.map-tools').hidden===phone,'navigation appropriate to device');
 if(!phone){q('[data-action="zoom-in"]').click();q('[data-action="right"]').click();assert(box()!=='0 0 800 730','manual navigation works');}
 const manual=signature();
 for(const id of ids){tap(id);assert(signature()===manual,'selection preserves manual view '+id);visible();}
 q('[data-action="reveal-all"]').click();assert(labels().length===54,'Reveal All has 54 persistent names');assert(signature()===manual,'Reveal All preserves viewport');visible();
 tap('COD');assert(labels().length===53&&!q('[data-reveal-country="COD"]'),'hide one after Reveal All');
 q('[data-action="reveal-all"]').click();visible();
 reset();assert(labels().length===0&&box()==='0 0 800 730','Reset clears all names and fits');
 send('pointerdown',q('[data-country="MAR"]'));send('pointermove',svg,71,195,185);send('pointerup',svg,71,195,185);assert(labels().length===0,'pan is not tap');if(phone)assert(box()==='0 0 800 730','phone swipe cannot move map');clean();
 for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',q('[data-country="MAR"]'));send(end);send('pointerup');assert(labels().length===0,'cancel never reveals');}
 reset();q('[data-list-country="COD"]').click();q('[data-list-country="CAF"]').click();assert(labels().length===2,'list selections independent');assert(box()==='0 0 800 730','list never focuses');visible();
 const search=q('#country-search');search.value='Morocco';search.dispatchEvent(new w.Event('input',{bubbles:true}));q('[data-list-country="MAR"]').click();assert(labels().length===3&&box()==='0 0 800 730','search selection preserves others and viewport');
 reset();assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
 assert(q('label[for="country-search"]').classList.contains('sr-only'),'search label visually hidden but associated');
 assert(q('#country-search').placeholder==='Country name…','search placeholder preserved');
 assert(!q('.reveal-state'),'no redundant row action text');
 for(const row of d.querySelectorAll('.country-list button')){
  assert(row.getBoundingClientRect().height>=44,'row touch target');
  assert(parseFloat(w.getComputedStyle(row).paddingTop)<=3,'compact row padding');
  row.click();assert(row.getAttribute('aria-pressed')==='true','whole row reveals');
  row.click();assert(row.getAttribute('aria-pressed')==='false','whole row hides');
 }

}
