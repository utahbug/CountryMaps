// Screen-space placement shared by Explorer and Reveal; no geographic distortion.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
export function placeCountryLabel({viewport,label,country,anchor,neighbors=[]}) {
 const pad=8,gap=12,w=Math.min(label.w,viewport.w-2*pad),h=Math.min(label.h,viewport.h-2*pad);
 const cx=clamp(anchor.x,pad,viewport.w-pad),cy=clamp(anchor.y,pad,viewport.h-pad);
 const candidates=[
  [country.x+country.w+gap,cy-h/2], [country.x-gap-w,cy-h/2],
  [cx-w/2,country.y-gap-h], [cx-w/2,country.y+country.h+gap],
  [country.x-gap-w,country.y-gap-h], [country.x+country.w+gap,country.y-gap-h],
  [country.x-gap-w,country.y+country.h+gap], [country.x+country.w+gap,country.y+country.h+gap]
 ];
 let best=null;
 for(const [rawX,rawY] of candidates){
  const box={x:clamp(rawX,pad,viewport.w-pad-w),y:clamp(rawY,pad,viewport.h-pad-h),w,h};
  const area=Math.max(1,w*h),selectedOverlap=overlap(box,country)/area;
  const landOverlap=Math.min(1,neighbors.reduce((sum,b)=>sum+overlap(box,b),0)/area);
  const distance=Math.hypot(box.x+w/2-cx,box.y+h/2-cy)/Math.max(viewport.w,viewport.h);
  // Avoid the selected country first, then prefer nearby open space.
  const score=selectedOverlap*1000+landOverlap*40+distance*4;
  if(!best||score<best.score)best={...box,score};
 }
 return {x:best.x,y:best.y};
}
