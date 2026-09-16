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
 reset();
 for(const path of d.querySelectorAll('path[data-country]')){
  assert(path.querySelector('title').textContent===path.dataset.name,'native hover identifies '+path.dataset.name);
  assert(path.getAttribute('aria-label')==='Reveal '+path.dataset.name,'map accessible name');
  for(const pointerType of ['mouse','touch']){
   path.dispatchEvent(new w.PointerEvent('pointerover',{bubbles:true,pointerType}));
   path.dispatchEvent(new w.PointerEvent('pointerout',{bubbles:true,pointerType}));
   assert(path.getAttribute('aria-pressed')==='false'&&labels().length===0,'hover never reveals');
  }
  tap(path.dataset.country);
  path.dispatchEvent(new w.PointerEvent('pointerout',{bubbles:true,pointerType:'mouse'}));
  assert(path.getAttribute('aria-pressed')==='true'&&labels().length===1,'pointer leaving retains persistent name');
  assert(q('[data-number="'+path.dataset.country+'"]').hasAttribute('hidden'),'no visible numeric map label');
  tap(path.dataset.country);
 }
 reset();const baseline=signature(),fitted=box();assert(svg.viewBox.baseVal.width<800&&svg.viewBox.baseVal.height<730,'tighter initial fit');
 const ids=['MAR','TUN','SOM','ZAF','CPV','MUS','SYC','CAF','COD'];
 for(const id of ids){tap(id);assert(signature()===baseline,'tap preserves exact map '+id);assert(q('[data-reveal-country="'+id+'"]'),'name revealed '+id);visible();}
 assert(labels().length===2&&q('[data-reveal-country=CAF]')&&q('[data-reveal-country=COD]'),'only newest pair persists');
 for(const id of ['CAF','COD']){tap(id);assert(!q('[data-reveal-country="'+id+'"]'),'only own name hidden '+id);assert(signature()===baseline,'hide preserves map');}
 for(let i=0;i<12;i++){tap('COD');assert(labels().length===(i%2?0:1),'repeated toggle');}
 reset();const phone=w.innerWidth<=650;
 assert(q('.map-tools').hidden===phone,'navigation appropriate to device');
 if(!phone){q('[data-action="zoom-in"]').click();q('[data-action="right"]').click();assert(box()!==fitted,'manual navigation works');}
 const manual=signature();
 for(const id of ids){tap(id);assert(signature()===manual,'selection preserves manual view '+id);visible();}
 q('[data-action="reveal-all"]').click();assert(labels().length===54,'Reveal All has 54 persistent names');assert(signature()===manual,'Reveal All preserves viewport');visible();
 tap('COD');assert(labels().length===53&&!q('[data-reveal-country="COD"]'),'hide one after Reveal All');
 q('[data-action="reveal-all"]').click();visible();
 const clear=q('[data-action="clear-labels"]'),recap=q('[data-learning-country]')?.dataset.learningCountry;
 assert(clear.getAttribute('aria-label')==='Clear revealed labels'&&clear.getBoundingClientRect().height>=44,'accessible Clear control');
 clear.click();assert(labels().length===0&&signature()===manual,'Clear removes all labels without moving map');
 assert(q('[data-learning-country]')?.dataset.learningCountry===recap,'Clear retains learning context');
 for(const id of ['SDN','SSD','COD'])tap(id);
 assert(labels().length===2&&!q('[data-reveal-country="SDN"]'),'Clear restores FIFO after Reveal All');
 assert(q('.map-progress').textContent==='2 / 54','counter follows persistent labels');
 tap('SSD');tap('SSD');tap('COG');
 assert(!q('[data-reveal-country="COD"]')&&q('[data-reveal-country="SSD"]')&&q('[data-reveal-country="COG"]'),'re-revealed country is newest');
 reset();assert(labels().length===0&&box()===fitted,'Reset clears all names and fits');
 send('pointerdown',q('[data-country="MAR"]'));send('pointermove',svg,71,195,185);send('pointerup',svg,71,195,185);assert(labels().length===0,'pan is not tap');if(phone)assert(box()===fitted,'phone swipe cannot move map');clean();
 for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',q('[data-country="MAR"]'));send(end);send('pointerup');assert(labels().length===0,'cancel never reveals');}
 reset();
 assert(!q('#activity-side-panel')&&!q('.country-list')&&!q('#country-search'),'no Reveal country panel');
 assert(!q('[data-action="toggle-panel"]'),'no obsolete list toggle');
 const workspace=q('.workspace').getBoundingClientRect(),mapPanel=q('.map-panel').getBoundingClientRect();
 assert(Math.abs(workspace.width-mapPanel.width)<2,'map fills reclaimed workspace width');
 assert(q('.activity-learning-slot'),'learning card retained below map');
 assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');

 assert(q('.map-caption').hidden&&q('.territory-legend').hidden,'no permanent map guidance');
 assert(q('.status').classList.contains('sr-only'),'status is announced without a permanent instruction card');
 const info=q('[popovertarget="puzzle-instructions"]');info.click();
 assert(q('#puzzle-instructions').matches(':popover-open'),'instructions open');
 assert(q('#instructions').textContent.includes('two labels')&&q('#instructions').textContent.includes('special-status'),'guidance in info popup');
 q('[popovertargetaction="hide"]').click();assert(!q('#puzzle-instructions').matches(':popover-open'),'instructions dismiss');
 if(!phone)for(const button of q('.map-tools').querySelectorAll('button')){
  assert(button.getBoundingClientRect().height>=44&&button.getBoundingClientRect().width>=44,'map control touch target');
  assert(parseFloat(w.getComputedStyle(button).borderTopWidth)===0,'borderless map control');
  assert(button.title&&button.getAttribute('aria-label'),'map control label and tooltip');
 }
 assert(q('.map-readout strong').textContent==='Africa','stable map heading');
 assert(q('.map-progress').textContent==='0 / 54','compact authoritative progress');
 assert(q('.map-readout #practice-region'),'region selector belongs to map header');
 assert(!q('.activity-commandbar #practice-region'),'no detached region control');
 assert(d.querySelectorAll('#practice-region').length===1,'single region selector');
 assert(q('#practice-region').getBoundingClientRect().height>=44,'region touch target');
 assert(q('.map-readout').getBoundingClientRect().height<=50,'compact map header');

 const region=q('#practice-region');region.value='west';region.dispatchEvent(new w.Event('change',{bubbles:true}));
 const regionalBox=box();tap('GHA');q('[data-action="clear-labels"]').click();
 assert(q('#practice-region').value==='west'&&box()===regionalBox&&labels().length===0,'Clear preserves practice region and fit');
 q('#practice-region').value='all';q('#practice-region').dispatchEvent(new w.Event('change',{bubbles:true}));
 const measure=q('.region-select-width'),control=q('#practice-region');
 assert(measure.textContent===control.selectedOptions[0].textContent,'width follows active region');
 assert(Math.abs(measure.getBoundingClientRect().width-control.getBoundingClientRect().width)<2,'select matches text-sized wrapper');
 assert(w.getComputedStyle(q('.region-select-wrap'),'::after').pointerEvents==='none','caret cannot intercept taps');

}
