// Measured screen-space cards stay independent of the geographic SVG transform.
export function factsPlacement(width,height,w,h,geography,selected,blocked,overlaps=()=>false){
 const margin=8;if(w+margin*2>width||h+margin*2>height)return null;
 const preferred={x:geography.x+geography.w*.25-w/2,y:geography.y+geography.h*.58-h/2};
 const candidates=[];
 for(let row=0;row<=16;row++)for(let col=0;col<=16;col++){
  const x=margin+col*(width-w-2*margin)/16,y=margin+row*(height-h-2*margin)/16;
  const distance=Math.hypot(x+w/2-selected.x,y+h/2-selected.y);
  candidates.push({x,y,w,h,score:Math.hypot(x-preferred.x,y-preferred.y)+distance*.35});
 }
 candidates.sort((a,b)=>a.score-b.score);
 for(const b of candidates){
  if(overlaps(b))continue;
  let collision=false;
  // Include a small breathing margin around the measured card.
  for(let y=b.y-4;y<=b.y+h+4&&!collision;y+=8)for(let x=b.x-4;x<=b.x+w+4;x+=8)if(blocked(x,y)){collision=true;break;}
  if(!collision)return b;
 }
 return null; // Crowded/zoomed views use the adjacent fallback, never cover land.
}
