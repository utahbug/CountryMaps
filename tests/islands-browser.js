const frame=document.querySelector('iframe'),out=document.querySelector('#results');
document.querySelector('#run').onclick=async()=>{
 const button=document.querySelector('#run');button.disabled=true;let n=0;
 const ok=(v,m)=>{if(!v)throw Error(m);n++;},wait=ms=>new Promise(r=>setTimeout(r,ms));
 try{
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),click=s=>q(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true})),choose=id=>click('[data-piece="'+id+'"]');
 click('[data-piece-filter="az"]');click('[data-action="reset"]');
 for(const id of ['CPV','COM','MUS','SYC','STP']){
  choose(id);const ripple=q('[data-ocean-clue="'+id+'"]');ok(ripple,'automatic pre-placement '+id);
  ok(q('progress').value===0,'no score from clue');ok(q('.puzzle-clue').dataset.level==='0','clue progression unchanged');
  ok(Number(ripple.querySelector('circle').getAttribute('r'))>=28,'broad radius');
  ok(w.getComputedStyle(ripple).pointerEvents==='none','non-blocking');
  await wait(350);const circle=ripple.querySelector('circle');ok(Number(w.getComputedStyle(circle).opacity)>.2,'visible pre-placement stroke');
  choose(id);ok(q('[data-ocean-clue]')===ripple,'no replay while selected');
  choose('MDG');ok(!q('[data-ocean-clue]'),'Madagascar excluded and previous cleaned');
 }
 choose('CPV');await wait(2500);ok(!q('[data-ocean-clue]'),'expires');choose('CPV');ok(!q('[data-ocean-clue]'),'no endless replay');
 click('[data-action="clue"]');click('[data-action="clue"]');ok(q('[data-ocean-clue="CPV"]'),'location help replays');
 click('[data-country="CPV"]');ok(q('progress').value===1,'placement preserved');ok(!q('[data-ocean-clue="CPV"]'),'placement cleans ripple');
 choose('COM');click('[data-action="reset"]');ok(!q('[data-ocean-clue]'),'Reset cleanup');
 choose('SYC');click('[data-action="preview"]');ok(!q('[data-ocean-clue]'),'reference cleanup');click('[data-action="preview"]');
 if(w.innerWidth<=650){click('[data-piece-filter="islands"]');const before=q('[data-ocean-clue]')?.dataset.oceanClue;click('[data-action="skip-piece"]');ok(!q('[data-ocean-clue="'+before+'"]'),'Skip cleans old island');ok(q('progress').value===0,'Skip preserves score');}
 ok(d.documentElement.scrollWidth<=w.innerWidth,'no overflow');
 click('[data-action="reset"]');out.textContent='PASS: '+n+' island timing/visibility checks at '+w.innerWidth;
 }catch(e){out.textContent='FAIL after '+n+': '+e.message;}finally{button.disabled=false;}
};

