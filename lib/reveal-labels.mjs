// Place measured labels in free rectangles; never overlap another name.
export function placeRevealLabels(viewport,items){
 const pad=8,gap=3,positions={};
 let free=[{x:pad,y:pad,w:viewport.w-2*pad,h:viewport.h-2*pad}];
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 for(const item of [...items].sort((a,b)=>b.h-a.h||b.w-a.w)){
  let best=null,score=Infinity;
  const c=item.country,a=item.anchor;
  const preferred=[[c.x+c.w+10,a.y-item.h/2],[c.x-item.w-10,a.y-item.h/2],[a.x-item.w/2,c.y-item.h-10],[a.x-item.w/2,c.y+c.h+10]];
  for(const r of free){
   if(item.w>r.w||item.h>r.h)continue;
   for(const [px,py] of preferred){
    const box={x:Math.max(r.x,Math.min(r.x+r.w-item.w,px)),y:Math.max(r.y,Math.min(r.y+r.h-item.h,py)),w:item.w,h:item.h};
    const cost=Math.hypot(box.x+item.w/2-a.x,box.y+item.h/2-a.y)+overlap(box,c)*4;
    if(cost<score){score=cost;best=box;}
   }
  }
  if(!best)return null;
  positions[item.id]={x:best.x,y:best.y};
  const used={x:best.x-gap,y:best.y-gap,w:best.w+gap*2,h:best.h+gap*2},next=[];
  for(const r of free){
   if(!overlap(r,used)){next.push(r);continue;}
   if(used.x>r.x)next.push({...r,w:used.x-r.x});
   if(used.x+used.w<r.x+r.w)next.push({...r,x:used.x+used.w,w:r.x+r.w-used.x-used.w});
   if(used.y>r.y)next.push({...r,h:used.y-r.y});
   if(used.y+used.h<r.y+r.h)next.push({...r,y:used.y+used.h,h:r.y+r.h-used.y-used.h});
  }
  free=next.filter((r,i)=>!next.some((s,j)=>i!==j&&s.x<=r.x&&s.y<=r.y&&s.x+s.w>=r.x+r.w&&s.y+s.h>=r.y+r.h&&(j<i||s.w*s.h>r.w*r.h)));
 }
 return positions;
}
