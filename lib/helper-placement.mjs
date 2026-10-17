// Screen-space helper placement. Prefer southwest ocean; avoid land and controls.
export function helperPlacement(width,height,blocked){
 const margin=8,w=Math.min(width<651?126:158,width-2*margin),h=width<651?140:166;
 const candidates=[];
 for(let row=0;row<=8;row++)for(let col=0;col<=8;col++){
  const x=margin+col*(width-w-2*margin)/8,y=margin+row*(height-h-2*margin)/8;
  candidates.push({x,y,w,h,preference:Math.hypot(x-margin,y-(height-h-margin))/Math.max(width,height)});
 }
 candidates.sort((a,b)=>a.preference-b.preference);
 let best=null;
 for(const b of candidates){
  let hits=0;
  for(let iy=0;iy<6;iy++)for(let ix=0;ix<6;ix++)if(blocked(b.x+ix*w/5,b.y+iy*h/5))hits++;
  const score=hits*100+b.preference,result={...b,score,hits};
  if(!hits)return result;
  if(!best||score<best.score)best=result;
 }
 return best;
}
