// Screen-space helper placement: favor the Atlantic notch beside visible land,
// not the viewport corner. Geometry and control hit tests use the same space.
export function helperPlacement(width,height,blocked,geography={x:width*.3,y:height*.12,w:width*.55,h:height*.76}){
 const margin=8,w=Math.min(width<651?126:158,width-2*margin),h=width<651?140:166;
 const preferred={x:geography.x+geography.w*.25-w/2,y:geography.y+geography.h*.6-h/2};
 const candidates=[];
 for(let row=0;row<=16;row++)for(let col=0;col<=16;col++){
  const x=margin+col*Math.max(0,width-w-2*margin)/16,y=margin+row*Math.max(0,height-h-2*margin)/16;
  candidates.push({x,y,w,h,preference:Math.hypot(x-preferred.x,y-preferred.y)/Math.max(width,height)});
 }
 candidates.sort((a,b)=>a.preference-b.preference);
 let best=null;
 for(const b of candidates){
  let hits=0;
  for(let iy=0;iy<9;iy++)for(let ix=0;ix<9;ix++)if(blocked(b.x+ix*w/8,b.y+iy*h/8))hits++;
  const score=hits*100+b.preference,result={...b,score,hits};
  if(!hits)return result;
  if(!best||score<best.score)best=result;
 }
 return best;
}
