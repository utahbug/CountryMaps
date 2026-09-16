const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const intersects=(a,b,gap=0)=>a.x+a.w+gap>b.x&&b.x+b.w+gap>a.x&&a.y+a.h+gap>b.y&&b.y+b.h+gap>a.y;
const overlapArea=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
const insideViewport=(b,v,pad)=>b.x>=pad&&b.y>=pad&&b.x+b.w<=v.w-pad+.01&&b.y+b.h<=v.h-pad+.01;
const lineEnd=(anchor,box)=>({x:clamp(anchor.x,box.x,box.x+box.w),y:clamp(anchor.y,box.y,box.y+box.h)});
const candidateBox=(x,y,item)=>({x,y,w:item.w,h:item.h});
const available=(box,placed,gap)=>!placed.some(p=>intersects(box,p,gap));

// Screen-space placement shared by Explorer and Reveal. Each result identifies
// its placement strategy so the renderer can draw leaders only when needed.
export function placeRevealLabels(viewport,items,{pad=8,gap=4}={}){
 const positions={},placed=[];
 const ordered=[...items].sort((a,b)=>Number(b.fitsInside)-Number(a.fitsInside)||(b.country.w*b.country.h)-(a.country.w*a.country.h)||a.anchor.y-b.anchor.y);
 for(const item of ordered){
  const anchor={x:clamp(item.anchor.x,pad,viewport.w-pad),y:clamp(item.anchor.y,pad,viewport.h-pad)};
  let chosen=null;
  if(item.fitsInside){
   const box=candidateBox(clamp(anchor.x-item.w/2,pad,viewport.w-pad-item.w),clamp(anchor.y-item.h/2,pad,viewport.h-pad-item.h),item);
   if(insideViewport(box,viewport,pad)&&available(box,placed,gap))chosen={...box,strategy:'inside'};
  }
  if(!chosen){
   const c=item.country,d=10;
   const adjacent=[
    candidateBox(c.x+c.w+d,anchor.y-item.h/2,item),candidateBox(c.x-item.w-d,anchor.y-item.h/2,item),
    candidateBox(anchor.x-item.w/2,c.y-item.h-d,item),candidateBox(anchor.x-item.w/2,c.y+c.h+d,item)
   ].filter(b=>insideViewport(b,viewport,pad)&&available(b,placed,gap));
   const clean=adjacent.filter(b=>(item.neighbors||[]).reduce((sum,n)=>sum+overlapArea(b,n),0)<=item.w*item.h*.16);
   const pool=clean.length?clean:adjacent;
   if(pool.length){
    const box=pool.sort((a,b)=>Math.hypot(a.x+a.w/2-anchor.x,a.y+a.h/2-anchor.y)-Math.hypot(b.x+b.w/2-anchor.x,b.y+b.h/2-anchor.y))[0];
    chosen={...box,strategy:'adjacent'};
   }
  }
  if(!chosen){
   const candidates=[],yStep=Math.max(3,item.h+gap),xStep=Math.max(3,item.w+gap);
   for(let y=pad;y<=viewport.h-pad-item.h+.01;y+=yStep)candidates.push(candidateBox(pad,y,item),candidateBox(viewport.w-pad-item.w,y,item));
   for(let x=pad;x<=viewport.w-pad-item.w+.01;x+=xStep)candidates.push(candidateBox(x,pad,item),candidateBox(x,viewport.h-pad-item.h,item));
   candidates.sort((a,b)=>Math.hypot(a.x+a.w/2-anchor.x,a.y+a.h/2-anchor.y)-Math.hypot(b.x+b.w/2-anchor.x,b.y+b.h/2-anchor.y));
   let box=candidates.find(b=>available(b,placed,gap));
   // Dense Reveal All layouts may need an additional organized lane just inside the edge.
   if(!box){
    outer:for(let y=pad;y<=viewport.h-pad-item.h;y+=3)for(let x=pad;x<=viewport.w-pad-item.w;x+=3){
     const next=candidateBox(x,y,item);if(available(next,placed,gap)){box=next;break outer;}
    }
   }
   if(box)chosen={...box,strategy:'lane'};
  }
  if(!chosen)return null;
  const end=lineEnd(anchor,chosen);
  positions[item.id]={x:chosen.x,y:chosen.y,strategy:chosen.strategy,leader:chosen.strategy==='inside'?null:{start:anchor,end}};
  placed.push(chosen);
 }
 return positions;
}

export function labelsDoNotOverlap(items,positions,gap=0){
 const boxes=items.map(item=>({...positions[item.id],w:item.w,h:item.h}));
 return boxes.every((a,i)=>boxes.every((b,j)=>i===j||!intersects(a,b,gap)));
}
