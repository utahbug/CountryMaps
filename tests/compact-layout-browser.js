const f=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=async()=>{let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++;},wait=()=>new Promise(r=>setTimeout(r,100)),go=async path=>{f.src=path;await new Promise(r=>f.onload=r);await wait();};try{
 for(const route of ['africa/','?map=africa&mode=explorer','?map=africa&mode=capitals','?map=africa&mode=puzzle','?map=canada']){
 await go('../'+route);const w=f.contentWindow,d=w.document,q=s=>d.querySelector(s),svg=q('#africa-map')||q('.africa-landing-map');
 ok(svg,'map loads '+route);ok(d.documentElement.scrollWidth<=w.innerWidth,'no overflow '+route);
 const b=svg.getBoundingClientRect();ok(b.top<(route.includes('canada')?320:270),'map starts early '+route);ok(b.width>250&&b.height>250,'useful map size '+route);
 if(route==='africa/'){ok(q('.africa-landing-activities').getBoundingClientRect().bottom<b.bottom,'activity choices within composition');continue;}
 const vb=()=>svg.getAttribute('viewBox'),fit=vb();ok(fit!=='0 0 800 730','fit uses geography '+route);
 if(route.includes('explorer')){const y=w.scrollY;q('.country-list [data-list-country]').click();ok(w.scrollY===y,'locator keeps map visible');}
 if(route.includes('puzzle')){ok(q('.map-readout .toolbar-actions'),'actions next to current piece');for(const btn of d.querySelectorAll('.map-readout .toolbar-actions button:not([hidden])')){if(w.getComputedStyle(btn).display==='none')continue;const icon=btn.querySelector('svg').getBoundingClientRect();ok(icon.width>=18,'readable action icon');if(w.innerWidth>650)ok(w.getComputedStyle(btn.querySelector('.action-label')).display!=='none','desktop action label');}}
 if(route.includes('capitals')){
 ok(!q('.activity-learning-slot'),'no duplicate description');ok([...q('.map-tools').children].filter(e=>e.getBoundingClientRect().width).length===7,'single-pointer zoom/pan/Fit alternatives');
 svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
 const send=(t,target,x,y,id=1)=>target.dispatchEvent(new w.PointerEvent(t,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:id===1,button:0,clientX:x,clientY:y}));
 const x=b.x+b.width*.6,y=b.y+b.height*.4;
 send('pointerdown',svg,x,y);send('pointermove',d,x+25,y+20);send('pointerup',d,x+25,y+20);ok(vb()!==fit,'touch pan');ok(!q('.capital-country-label'),'pan never selects');
 const moved=vb();send('pointerdown',svg,x-20,y);send('pointerdown',svg,x+20,y,2);send('pointermove',d,x+50,y,2);send('pointerup',d,x+50,y,2);send('pointerup',d,x-20,y);ok(vb()!==moved,'pinch zoom');
 const pinched=vb();svg.dispatchEvent(new w.WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:x,clientY:y,deltaY:-80}));ok(vb()!==pinched,'wheel zoom');
 svg.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));ok(vb()===fit,'keyboard fit');
 for(const id of ['DZA','COD','RWA','BDI','MUS','SYC']){q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));q('[data-country="'+id+'"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait();const frame=q('.reveal-label-layer').getBoundingClientRect();for(const l of d.querySelectorAll('.capital-country-label')){const r=l.getBoundingClientRect();ok(r.left>=frame.left&&r.right<=frame.right&&r.top>=frame.top&&r.bottom<=frame.bottom,'label fits '+id);}}
 send('pointerdown',svg,x,y);send('pointercancel',d,x,y);q('[data-action="reset"]').click();ok(vb()===fit&&!q('.capital-country-label'),'cancel then reset');
 }
 }
 out.textContent='PASS '+n+' compact layout/navigation assertions at '+f.contentWindow.innerWidth;
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}};
