// All distances are rendered CSS pixels. No geometry or snap coordinates change.
export const overlapArea=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
const expand=(b,p)=>({x:b.x-p,y:b.y-p,w:b.w+2*p,h:b.h+2*p});
const inBox=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
export function draggedBounds(country,x,y,scale){
 const [left,top,right,bottom]=country.bounds;
 return {x:x+(left-country.anchor[0])*scale,y:y+(top-country.anchor[1])*scale,w:(right-left)*scale,h:(bottom-top)*scale};
}
export function acceptsInsetDrop(piece,target,viewport,neighbors=[]){
 // Existing insets are rectangular drop zones. Check visible overlap, not the cursor.
 const clipped={x:Math.max(target.x,viewport.x),y:Math.max(target.y,viewport.y)};
 clipped.w=Math.max(0,Math.min(target.x+target.w,viewport.x+viewport.w)-clipped.x);
 clipped.h=Math.max(0,Math.min(target.y+target.h,viewport.y+viewport.h)-clipped.y);
 const area=Math.min(piece.w*piece.h,clipped.w*clipped.h);
 if(area<=0)return false;
 const direct=overlapArea(piece,clipped)/area;
 // Tolerance alone cannot accept a piece that misses the actual zone entirely.
 if(!(direct>=.35||(direct>=.12&&overlapArea(piece,expand(clipped,8))/area>=.45)))return false;
 const center={x:piece.x+piece.w/2,y:piece.y+piece.h/2},destination={x:target.x+target.w/2,y:target.y+target.h/2};
 const distance=p=>Math.hypot(center.x-p.x,center.y-p.y);
 // Consider visible neighboring geography only, never countries hidden by the inset.
 // A closer intersected neighbor wins ambiguous edge drops; an inset overlap is still required.
 return !neighbors.some(n=>{
  if(!overlapArea(piece,n.bounds)||distance(n.center)+1>=distance(destination))return false;
  let hits=0;
  for(let row=0;row<5;row++)for(let col=0;col<5;col++){
   const p={x:piece.x+(col+.5)*piece.w/5,y:piece.y+(row+.5)*piece.h/5};
   if(!inBox(p,target)&&inBox(p,viewport)&&n.contains(p))hits++;
  }
  return hits>=2;
 });
}
export function acceptsGeometryDrop({points,piece,target,neighbors,viewport}){
 if(!points.length||!overlapArea(piece,target.bounds))return false;
 const inside=p=>inBox(p,viewport)&&target.contains(p);
 const direct=points.filter(inside).length/points.length;
 if(direct<.05)return false; // Genuine intended-shape overlap required before tolerance.
 const candidates=neighbors.filter(n=>overlapArea(piece,n.bounds));
 const competing=candidates.map(n=>({target:n,overlap:points.filter(p=>inBox(p,viewport)&&n.contains(p)).length/points.length}));
 const strongest=Math.max(0,...competing.map(n=>n.overlap));
 if(direct>=.30&&direct>=strongest*.8)return true;
 if(!target.small||strongest>direct*4)return false;
 const radius=8,offsets=[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[5.65,5.65],[5.65,-5.65],[-5.65,5.65],[-5.65,-5.65]];
 const near=points.filter(p=>offsets.some(([x,y])=>inside({x:p.x+x,y:p.y+y}))).length/points.length;
 if(near<.45)return false;
 const center={x:points.reduce((s,p)=>s+p.x,0)/points.length,y:points.reduce((s,p)=>s+p.y,0)/points.length};
 const distance=c=>Math.hypot(center.x-c.x,center.y-c.y);
 // Only compare intersected destinations; a nearby but unrelated center cannot win.
 return !competing.some(n=>n.overlap>=.05&&distance(n.target.center)+1<distance(target.center));
}
