// Joint, proximity-first placement in screen space. Geometry callbacks are supplied
// by the renderer so narrow countries and ocean gaps aren't reduced to bounding boxes.
export function capitalLabelPositions(viewport,items,{pad=8,obstacles=[],landAt=()=>false}={}){
 const overlap=(a,b)=>a.x<b.x+b.w+4&&a.x+a.w+4>b.x&&a.y<b.y+b.h+4&&a.y+a.h+4>b.y;
 const fits=b=>b.x>=pad&&b.y>=pad&&b.x+b.w<=viewport.w-pad&&b.y+b.h<=viewport.h-pad&&!obstacles.some(o=>overlap(b,o));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const edge=(b,p)=>({x:Math.max(b.x,Math.min(b.x+b.w,p.x)),y:Math.max(b.y,Math.min(b.y+b.h,p.y))});
 const lists=items.map(item=>{
  const anchor={x:Math.max(pad,Math.min(viewport.w-pad,item.anchor.x)),y:Math.max(pad,Math.min(viewport.h-pad,item.anchor.y))},list=[];
  const add=(b,strategy)=>{
   if(!fits(b))return;
   if(strategy!=='inside'&&item.country&&overlap(b,item.country))return;
   const end=edge(b,anchor),length=distance(anchor,end);let land=0,cross=0;
   if(strategy!=='inside'){
    for(let y=0;y<=4;y++)for(let x=0;x<=6;x++)if(landAt(b.x+b.w*x/6,b.y+b.h*y/4))land++;
    for(let i=1;i<12;i++)if(landAt(anchor.x+(end.x-anchor.x)*i/12,anchor.y+(end.y-anchor.y)*i/12,item.id))cross++;
   }
   list.push({...b,strategy,leader:strategy==='inside'?null:{start:anchor,end},score:(strategy==='inside'?0:strategy==='adjacent'?500:850)+land*180+cross*12+length+distance({x:b.x+b.w/2,y:b.y+b.h/2},anchor)*.12});
  };
  for(const b of item.insideCandidates||[])add(b,'inside');
  if(item.fitsInside)add({x:item.anchor.x-item.w/2,y:item.anchor.y-item.h/2,w:item.w,h:item.h},'inside');
  // Search every side near the geography, not just its bounding-box corners.
  const c=item.country||{x:anchor.x,y:anchor.y,w:0,h:0};
  for(let ring=0;ring<4;ring++)for(let n=0;n<16;n++){
   const angle=n*Math.PI/8,rx=item.w/2+12+ring*24,ry=item.h/2+12+ring*24;
   add({x:anchor.x+Math.cos(angle)*rx-item.w/2,y:anchor.y+Math.sin(angle)*ry-item.h/2,w:item.w,h:item.h},'adjacent');
  }
  for(const b of [{x:c.x-item.w-8,y:anchor.y-item.h/2},{x:c.x+c.w+8,y:anchor.y-item.h/2},{x:anchor.x-item.w/2,y:c.y-item.h-8},{x:anchor.x-item.w/2,y:c.y+c.h+8}])add({...b,w:item.w,h:item.h},'adjacent');
  // Shared ocean lanes: choose by short, clear association rather than fixed slots.
  for(let row=0;row<=16;row++)for(let col=0;col<=12;col++)add({x:pad+col*Math.max(0,viewport.w-item.w-2*pad)/12,y:pad+row*Math.max(0,viewport.h-item.h-2*pad)/16,w:item.w,h:item.h},'fallback');
  list.sort((a,b)=>a.score-b.score);
  return list.slice(0,100);
 });
 const crosses=(a,b)=>{if(!a||!b)return false;const side=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return side(a.start,a.end,b.start)*side(a.start,a.end,b.end)<0&&side(b.start,b.end,a.start)*side(b.start,b.end,a.end)<0;};
 const cuts=(line,box)=>line&&Array.from({length:15},(_,i)=>({x:line.start.x+(line.end.x-line.start.x)*(i+1)/16,y:line.start.y+(line.end.y-line.start.y)*(i+1)/16})).some(p=>p.x>box.x&&p.x<box.x+box.w&&p.y>box.y&&p.y<box.y+box.h);
 let best=null,score=Infinity;
 if(items.length===1)best=[lists[0][0]];
 else for(const a of lists[0]||[])for(const b of lists[1]||[]){if(overlap(a,b)||cuts(a.leader,b)||cuts(b.leader,a))continue;const total=a.score+b.score+(crosses(a.leader,b.leader)?180:0);if(total<score){score=total;best=[a,b];}}
 // Extremely constrained viewports still use separate, edge-contained slots.
 if(!best)best=items.map((item,i)=>({x:pad,y:i?viewport.h-pad-item.h:pad,w:item.w,h:item.h,strategy:'fallback',leader:{start:item.anchor,end:{x:pad+item.w,y:i?viewport.h-pad-item.h/2:pad+item.h/2}}}));
 return Object.fromEntries(items.map((item,i)=>[item.id,best[i]]));
}
