const data=await(await fetch('../data/africa.json')).json(),frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=async()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;};const w=frame.contentWindow,d=w.document,originalMedia=w.matchMedia;try{
 const q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)],click=s=>q(s).click(),score=()=>q('progress').value,wait=ms=>new Promise(r=>setTimeout(r,ms));
 const reset=()=>click('[data-action="reset"]');const place=id=>{click('[data-piece="'+id+'"]');q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 const clean=()=>{ok(!q('[data-reward-clone]'),'no visual copies');ok(all('path[data-country]').every(p=>!p.style.opacity&&!p.style.transform),'canonical paths restored');ok(!q('.drag-preview'),'no drag preview');};
 reset();if(new URLSearchParams(location.search).has('demo')){for(const c of data.countries)place(c.id);for(let elapsed=0;(q('.completion').hidden||q('[data-reward-clone]'))&&elapsed<6000;elapsed+=50)await wait(50);ok(score()===54&&!q('.completion').hidden,'visible 54/54');clean();out.textContent='PASS: live completion demonstration';return;}const path=q('[data-country="DZA"]'),geometry=path.getAttribute('d'),box=q('.map-viewport').getBoundingClientRect();place('DZA');
 ok(score()===1,'score updates immediately');ok(q('[data-reward-clone]'),'pop starts after placement');ok((w.innerWidth<=650?q('.map-readout strong').textContent!=='Algeria':!q('[data-piece="AGO"]').disabled),'next piece available immediately');ok(path.getAttribute('d')===geometry&&!path.style.transform,'canonical geometry unchanged');
 ok(q('.map-viewport').getBoundingClientRect().top===box.top,'no map shift');await wait(500);clean();
 place('AGO');reset();clean();await wait(500);ok(score()===0,'cancel cannot restore score');
 for(const c of data.countries)place(c.id);
 const station=q('.side-panel').getBoundingClientRect(),stationBox=[station.x,station.y,station.width,station.height].join(',');ok(score()===54,'all 54 placed');ok(q('.completion').hidden,'message waits for reunion');await wait(600);
 if(w.innerWidth<=650){const b=q('.side-panel').getBoundingClientRect();ok([b.x,b.y,b.width,b.height].join(',')===stationBox,'fixed phone station unchanged during assembly');}ok(all('[data-reward-clone]').length===54,'all country shapes separate');const keys=q('[data-reward-clone]').getAnimations()[0].effect.getKeyframes();ok(keys.some(k=>k.transform.includes('translate')),'geographic translation stage');
 reset();clean();await wait(1400);ok(q('.completion').hidden&&score()===0,'Reset cancels final callback');
 // Complete again while deliberately zoomed/panned; finish in full Africa view.
 click('[data-action="zoom-in"]');click('[data-action="left"]');const changed=q('#africa-map').getAttribute('viewBox');
 for(const c of data.countries)place(c.id);for(let elapsed=0;(q('.completion').hidden||q('[data-reward-clone]'))&&elapsed<6000;elapsed+=50)await wait(50);clean();
 const card=q('.completion'),r=card.getBoundingClientRect(),v=q('.map-viewport').getBoundingClientRect();
 ok(!card.hidden&&card.textContent.includes('Africa complete')&&card.textContent.includes('54 / 54'),'visible completion card');ok(r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom,'completion within map');ok(q('#africa-map').getAttribute('viewBox')!==changed,'completed full map restored');
 q('.completion button').click();clean();ok(score()===0&&card.hidden,'Play again resets');
 // Reduced motion uses the real app preference lookup with a fixture override.
 w.matchMedia=query=>query.includes('prefers-reduced-motion')?{matches:true}:originalMedia.call(w,query);
 place('DZA');ok(q('[data-reward-clone]').getAnimations()[0].effect.getKeyframes().every(k=>!k.transform),'reduced motion highlight only');
 for(const c of data.countries.filter(c=>c.id!=='DZA'))place(c.id);ok(!q('.completion').hidden,'reduced completion message immediate');reset();clean();w.matchMedia=originalMedia;
 place('DZA');click('[data-action="preview"]');clean();click('[data-action="preview"]');reset();
 place('DZA');q('.mode-links a[href*="mode=capitals"]').click();await wait(50);clean();ok(d.title.includes('Capitals'),'activity switch works');await wait(500);ok(!q('[data-reward-clone]'),'no late copies after navigation');
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no overflow');out.textContent='PASS: '+n+' reward checks at '+w.innerWidth+'px';
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}finally{w.matchMedia=originalMedia;}};
