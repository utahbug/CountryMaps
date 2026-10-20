// Stable viewport slots are independent of geographic zoom/pan.
export function capitalLabelPositions(viewport,items,{pad=8,slotHeight=140,obstacles=[]}={}){
 const intersects=(a,b)=>a.x<b.x+b.w+4&&a.x+a.w+4>b.x&&a.y<b.y+b.h+4&&a.y+a.h+4>b.y;
 const inside=b=>b.x>=pad&&b.y>=pad&&b.x+b.w<=viewport.w-pad&&b.y+b.h<=viewport.h-pad&&!obstacles.some(o=>intersects(b,o));
 const prepared=items.map(item=>{
  if(item.fitsInside||!item.country||item.country.w<36||item.country.h<30)return item;
  const c=item.country,gap=6,boxes=[
   {x:c.x+c.w+gap,y:item.anchor.y-item.h/2,w:item.w,h:item.h},
   {x:c.x-item.w-gap,y:item.anchor.y-item.h/2,w:item.w,h:item.h},
   {x:item.anchor.x-item.w/2,y:c.y-item.h-gap,w:item.w,h:item.h},
   {x:item.anchor.x-item.w/2,y:c.y+c.h+gap,w:item.w,h:item.h},
  ];
  const adjacent=boxes.find(b=>inside(b)&&!(item.neighbors||[]).some(n=>intersects(b,n)));
  return adjacent?{...item,adjacent,fitsInside:true}:item;
 });
 const candidates=prepared.map(item=>({...item,box:item.adjacent||{x:item.anchor.x-item.w/2,y:item.anchor.y-item.h/2,w:item.w,h:item.h},fallback:{x:pad,y:Math.max(pad,viewport.h-pad-((item.slot||0)+1)*slotHeight),w:item.w,h:item.h}}));
 const fallback=new Set(candidates.filter(i=>!i.fitsInside||!inside(i.box)).map(i=>i.id));
 // Recheck all pairs after downgrading: a newly reserved slot cannot cover an
 // earlier inside label. With two labels this converges in at most two passes.
 for(let pass=0;pass<candidates.length;pass++)for(let a=0;a<candidates.length;a++)for(let b=a+1;b<candidates.length;b++){
  const x=candidates[a],y=candidates[b];
  if(intersects(fallback.has(x.id)?x.fallback:x.box,fallback.has(y.id)?y.fallback:y.box)){
   if(!fallback.has(y.id))fallback.add(y.id);else fallback.add(x.id);
  }
 }
 return Object.fromEntries(candidates.map(i=>[i.id,{...(fallback.has(i.id)?i.fallback:i.box),strategy:fallback.has(i.id)?'fallback':i.adjacent?'adjacent':'inside'}]));
}
