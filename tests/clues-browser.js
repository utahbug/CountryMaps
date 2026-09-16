import {countryRegion} from '../lib/regions.mjs';
const frame=document.querySelector('iframe'),results=document.querySelector('#results');
const data=await (await fetch('../data/africa.json')).json();
document.querySelector('#run').onclick=async()=>{
 let checks=0;const assert=(value,label)=>{if(!value)throw Error(label);checks++;};
 const button=document.querySelector('#run');button.disabled=true;
 try{
  const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)];
  const reset=()=>q('[data-action="reset"]').click(),clue=()=>q('[data-action="clue"]').click(),choose=id=>q('[data-piece="'+id+'"]').click();
  const level=()=>q('.puzzle-clue').dataset.level,score=()=>q('progress').value;
  const view=()=>q('#africa-map').getAttribute('viewBox');
  reset();assert(score()===0&&level()==='0','initial state');const initialView=view();
  for(const c of data.countries){
   choose(c.id);assert(level()==='0'&&!q('.clue-target'),'active country clears previous clue');
   clue();assert(level()==='1','first clue level');assert(q('#clue-text').textContent.includes(countryRegion(c.id).name),'shared regional clue '+c.id);
   assert(!q('.clue-target'),'first clue never reveals destination');assert(score()===0&&view()===initialView,'first clue no placement or camera changes');
   clue();assert(level()==='2'&&q('[data-country="'+c.id+'"].clue-target'),'second clue outlines actual country');
   if(c.inset)assert(q('[data-inset-hit="'+c.id+'"].clue-target')&&q('[data-inset-target="'+c.id+'"].clue-target'),'small-country inset destination outlined');
   assert(score()===0&&!q('[data-piece="'+c.id+'"]').disabled&&view()===initialView,'second clue never places or moves piece');
   clue();assert(level()==='2'&&score()===0,'repeated clue is optional repeat highlight');
  }
  reset();choose('DZA');clue();clue();await new Promise(resolve=>setTimeout(resolve,3000));assert(!q('.clue-target')&&level()==='2','pulse expires completely');clue();assert(q('.clue-target'),'expired clue can be requested again');
  reset();assert(level()==='0'&&!q('.clue-target')&&score()===0,'Reset clears pulse and clue');
  clue();assert(level()==='1'&&!q('.clue-target'),'Reset restores region-first progression');
  choose('COD');assert(level()==='0','country change resets first clue');clue();clue();
  q('[data-action="preview"]').click();assert(q('.puzzle-clue').hidden&&!q('.clue-target'),'Reveal preview clears clue and pulse');q('[data-action="preview"]').click();assert(!q('.puzzle-clue').hidden&&level()==='0','clean return to Puzzle');
  reset();choose('DZA');clue();clue();q('[data-country="EGY"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(score()===0&&level()==='2','incorrect placement preserves score and requested clue');
  choose('DZA');q('[data-country="DZA"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(score()===1&&level()==='0'&&!q('.clue-target'),'correct placement clears clue');
  // Exercise real drag handlers with synthetic touch; native capture alone is stubbed.
  reset();const piece=q('[data-piece="DZA"]'),svg=q('#africa-map');let captured=false;
  piece.setPointerCapture=()=>captured=true;piece.hasPointerCapture=()=>captured;piece.releasePointerCapture=()=>captured=false;
  const send=(type,target,id,x,y,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
  choose('DZA');clue();clue();send('pointerdown',piece,41,50,50);clue();assert(level()==='2','clue cannot steal active drag');
  send('pointerdown',q('[data-piece="EGY"]'),42,55,55,false);send('pointerup',d,42,200,200,false);assert(q('.drag-preview')&&piece.classList.contains('dragging'),'second pointer cannot steal drag');
  send('pointermove',d,41,-40,-40);send('pointerup',d,41,-40,-40);assert(score()===0&&!q('.drag-preview')&&!piece.classList.contains('dragging')&&level()==='2','incorrect drag recovers with clue intact');
  for(const end of ['pointercancel','lostpointercapture']){send('pointerdown',piece,41,50,50);send(end,d,41,50,50);assert(!q('.drag-preview')&&!piece.classList.contains('dragging'),'cancel cleanup with clue '+end);}
  send('pointerdown',piece,41,50,50);reset();assert(!q('.drag-preview')&&!q('.clue-target')&&!piece.classList.contains('dragging')&&level()==='0','Reset during drag clears temporary states');
  // Correct touch drag into original geography after abnormal states.
  const fresh=q('[data-piece="DZA"]');fresh.setPointerCapture=()=>{};fresh.hasPointerCapture=()=>false;
  const c=data.countries.find(c=>c.id==='DZA'),point=new w.DOMPoint(...c.anchor).matrixTransform(svg.getScreenCTM());
  send('pointerdown',fresh,41,50,50);clue();assert(level()==='0','first clue ignored while dragging');send('pointerup',d,41,point.x,point.y);assert(score()===1&&!q('.drag-preview'),'correct drag still places normally');
  reset();
  for(const c of data.countries){choose(c.id);clue();clue();const target=q(c.inset?'[data-inset-hit="'+c.id+'"]':'[data-country="'+c.id+'"]');target.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(q('[data-piece="'+c.id+'"]').disabled,'place '+c.id);assert(level()==='0'&&!q('.clue-target'),'placement clears clue '+c.id);}
  assert(score()===54&&q('[data-action="clue"]').disabled&&!q('.completion').hidden,'completion unchanged, clue disabled');
  reset();choose('COD');clue();const panel=q('.map-panel').getBoundingClientRect(),hint=q('.puzzle-clue').getBoundingClientRect(),map=q('.map-viewport').getBoundingClientRect();
  assert(hint.top>=panel.top&&hint.bottom<=map.top+.1&&map.top-hint.bottom<2,'clue immediately beside map');assert(q('[data-action="clue"]').getBoundingClientRect().height>=44,'touch target');
  assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');assert(q('#clue-text').scrollWidth<=q('#clue-text').clientWidth+1,'long clue wraps');
  if(w.innerWidth<=650)assert(w.getComputedStyle(q('.map-panel')).position==='sticky','phone clue stays with sticky map');
  reset();results.textContent='PASS: '+checks+' Puzzle clue checks at '+w.innerWidth+' × '+w.innerHeight+'. Synthetic touch, native capture stubbed.';
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}finally{button.disabled=false;}
};
