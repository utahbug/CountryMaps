// Visual-only Web Animations: geometry and game state are never mutated.
export class PuzzleRewards {
 constructor(reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches){this.reduced=reduced;this.active=new Set();this.generation=0;}
 cancel(){this.generation++;for(const entry of this.active){entry.a.cancel();entry.cleanup();}this.active.clear();}
 async animate(node,frames,duration){
  if(!node)return;
  // Animate a non-interactive display copy; canonical paths stay unchanged for
  // hit-testing, neighbor tolerance and the next piece's pointer interactions.
  const copy=node.cloneNode(true),opacity=node.style.opacity;
  for(const attr of [...copy.attributes])if(attr.name.startsWith('data-')||['id','role','tabindex','aria-pressed'].includes(attr.name))copy.removeAttribute(attr.name);
  copy.setAttribute('data-reward-clone','');copy.setAttribute('aria-hidden','true');copy.style.pointerEvents='none';
  node.after(copy);node.style.opacity='0';
  let cleaned=false;const cleanup=()=>{if(cleaned)return;cleaned=true;copy.remove();if(opacity)node.style.opacity=opacity;else node.style.removeProperty('opacity');};
  const a=copy.animate(frames,{duration,easing:'ease-in-out'}),entry={a,cleanup};this.active.add(entry);
  try{await a.finished;}catch{}finally{a.cancel();cleanup();this.active.delete(entry);}
 }
 async placed(path,c,{complete=false,paths=[],center=[400,365],fit=()=>{},done=()=>{}}={}){
  const generation=this.generation,reduced=this.reduced();
  const [x,y]=c.anchor,around=t=>'translate('+x+'px,'+y+'px) '+t+' translate('+(-x)+'px,'+(-y)+'px)';
  const identity={transform:'none',transformOrigin:'0px 0px',transformBox:'view-box'};
  const pop=this.animate(path,reduced?[{filter:'brightness(1)'},{filter:'brightness(1.3)',offset:.45},{filter:'brightness(1)'}]:[
   identity,{...identity,transform:around('rotate(-2deg) scale(1.06)'),offset:.4},{...identity,transform:around('rotate(.6deg) scale(1.015)'),offset:.72},identity
  ],420);
  if(!complete)return pop;
  if(reduced){fit();done();return pop;}
  await pop;if(generation!==this.generation)return;
  // Every piece is already canonically placed; this transforms only its display.
  fit();
  const [cx,cy]=center,pulse='translate('+cx+'px,'+cy+'px) scale(1.012) translate('+(-cx)+'px,'+(-cy)+'px)';
  await Promise.all(paths.map(({node,unit})=>{
   const dx=unit.anchor[0]-cx,dy=unit.anchor[1]-cy,length=Math.hypot(dx,dy)||1;
   const out='translate('+(dx/length*10)+'px,'+(dy/length*10)+'px)';
   return this.animate(node,[identity,{...identity,offset:.1},{...identity,transform:out,offset:.34},{...identity,transform:out,offset:.46},{...identity,offset:.76},{...identity,transform:pulse,offset:.88},identity],1350);
  }));
  if(generation===this.generation)done();
 }
}
