import {insetTransform} from '../lib/maps.js';
const data=await (await fetch('../data/africa.json')).json(),frame=document.querySelector('iframe'),results=document.querySelector('#results'),button=document.querySelector('#run');
const ids=['GMB','BEN','TGO','RWA','BDI','DJI','SWZ','LSO','MWI','CPV','COM','MUS','SYC','STP'];
button.onclick=()=>{
 let checks=0;const assert=(value,label)=>{if(!value)throw Error(label);checks++;};
 try{
  const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s),svg=q('#africa-map');
  const reset=()=>q('[data-action="reset"]').click(),score=()=>q('progress').value;
  const send=(type,target,x,y,id=91,primary=true)=>target.dispatchEvent(new w.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,isPrimary:primary,button:0,clientX:x,clientY:y}));
  const begin=id=>{const p=q('[data-piece="'+id+'"]');p.setPointerCapture=()=>{};p.hasPointerCapture=()=>false;send('pointerdown',p,10,10);return p;};
  const finish=(x,y)=>{send('pointermove',d,x,y);send('pointerup',d,x,y);};
  const clean=()=>assert(!q('.drag-preview')&&!q('.piece.dragging')&&!q('.status').dataset.activePointer,'drag cleanup');
  const rect=el=>{const b=el.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};};
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const outside=(p,b)=>p.x<b.x||p.x>b.x+b.w||p.y<b.y||p.y>b.y+b.h;
  for(const id of ids){
   reset();const c=data.countries.find(c=>c.id===id);q('[data-piece="'+id+'"]').click();
   const trayPiece=q('[data-piece="'+id+'"]'),trayView=trayPiece.querySelector('svg').getAttribute('viewBox').split(' ').map(Number);
   assert(trayPiece.classList.contains('small-scale-piece')&&trayView[2]===140&&trayView[3]===96,'map-scale tray frame '+id);
   assert(trayPiece.getBoundingClientRect().width>=44&&trayPiece.getBoundingClientRect().height>=44,'large tray hit target '+id);
   assert(trayPiece.querySelector('small').textContent.includes('large touch area'),'scale explanation '+id);
   if(c.inset)assert(q('.inset text').textContent==='Enlarged helper','inset clearly marked helper '+id);
   const geometry=q('[data-country="'+id+'"]'),original=geometry.getAttribute('d'),unit=svg.getScreenCTM().a,scale=unit*(c.inset?insetTransform(c).scale:1);
   const pw=(c.bounds[2]-c.bounds[0])*scale,ph=(c.bounds[3]-c.bounds[1])*scale,ax=(c.anchor[0]-c.bounds[0])*scale,ay=(c.anchor[1]-c.bounds[1])*scale;
   let near,far;
   if(c.inset){
    const b=rect(q('[data-inset-hit="'+id+'"]'));
    const poses=[.4,.55,.7,.85].flatMap(f=>[{x:b.x+b.w-pw*f,y:b.y+(b.h-ph)/2},{x:b.x-pw*(1-f),y:b.y+(b.h-ph)/2},{x:b.x+(b.w-pw)/2,y:b.y-ph*(1-f)},{x:b.x+(b.w-pw)/2,y:b.y+b.h-ph*f}]);
    const distance=p=>Math.hypot(p.x+pw/2-b.x-b.w/2,p.y+ph/2-b.y-b.h/2);poses.sort((a,b)=>distance(a)-distance(b));
    const pose=poses.find(p=>outside({x:p.x+ax,y:p.y+ay},b)&&overlap({...p,w:pw,h:ph},b)/Math.min(pw*ph,b.w*b.h)>=.35);
    assert(pose,'outside-anchor overlap fixture '+id);near={x:pose.x+ax,y:pose.y+ay};far={x:b.x-pw-30,y:b.y-ph-30};
   }else{
    const matrix=svg.getScreenCTM(),inverse=matrix.inverse(),a=new w.DOMPoint(...c.anchor).matrixTransform(matrix),samples=[];
    for(let row=0;row<30;row++)for(let col=0;col<30;col++){const p=new w.DOMPoint(c.bounds[0]+(col+.5)*(c.bounds[2]-c.bounds[0])/30,c.bounds[1]+(row+.5)*(c.bounds[3]-c.bounds[1])/30);if(geometry.isPointInFill(p))samples.push(p.matrixTransform(matrix));}
    for(let distance=1;distance<15&&!near;distance++)for(const [dx,dy] of [[distance,0],[-distance,0],[0,distance],[0,-distance]]){
     const p={x:a.x+dx,y:a.y+dy};if(geometry.isPointInFill(new w.DOMPoint(p.x,p.y).matrixTransform(inverse)))continue;
     const share=samples.filter(s=>geometry.isPointInFill(new w.DOMPoint(s.x+dx,s.y+dy).matrixTransform(inverse))).length/samples.length;
     if(share>=.35){near=p;break;}
    }
    assert(near,'narrow-country outside-anchor overlap fixture '+id);far={x:rect(svg).x+5,y:rect(svg).y+5};
   }
   // Region clue and requested highlight must not alter validation or scoring.
   q('[data-action="clue"]').click();q('[data-action="clue"]').click();
   begin(id);const ghost=q('.drag-preview'),ghostShape=ghost.querySelector('path').getBoundingClientRect(),mapShape=geometry.getBoundingClientRect();
   assert(ghost.dataset.visualScale==='map','map-scale drag marker '+id);
   assert(Math.abs(ghostShape.width-mapShape.width)<1.5&&Math.abs(ghostShape.height-mapShape.height)<1.5,'drag silhouette matches map scale '+id);
   assert(ghost.getBoundingClientRect().width>=44&&ghost.getBoundingClientRect().height>=44,'invisible drag frame '+id);
   finish(near.x,near.y);assert(score()===1&&q('[data-piece="'+id+'"]').disabled,'forgiving intended overlap accepted '+id);clean();
   assert(geometry.getAttribute('d')===original&&!geometry.hasAttribute('transform'),'canonical outline and snap unchanged '+id);assert(q('.puzzle-clue').dataset.level==='0'&&!q('.clue-target'),'placement clears clue');
   reset();begin(id);finish(far.x,far.y);assert(score()===0&&!q('[data-piece="'+id+'"]').disabled,'miss rejected '+id);clean();
   // Dropping on a neighboring country's actual geography never solves an inset piece.
   const neighborId={GMB:'SEN',BEN:'TGO',TGO:'BEN',RWA:'BDI',BDI:'RWA',DJI:'ERI',SWZ:'ZAF',LSO:'ZAF',MWI:'MOZ',CPV:'SEN',COM:'MDG',MUS:'MDG',SYC:'SOM',STP:'GAB'}[id];
   const neighbor=data.countries.find(c=>c.id===neighborId),point=new w.DOMPoint(...neighbor.anchor).matrixTransform(svg.getScreenCTM());begin(id);finish(point.x,point.y);assert(score()===0,'neighbor rejected '+id+' over '+neighborId);clean();
   for(let repeat=0;repeat<3;repeat++){reset();begin(id);finish(near.x,near.y);assert(score()===1,'repeated overlap drop '+id);clean();}
  }
  reset();for(const c of data.countries){
   begin(c.id);let point;
   if(c.inset){const b=rect(q('[data-inset-hit="'+c.id+'"]')),scale=svg.getScreenCTM().a*insetTransform(c).scale;point={x:b.x+b.w/2+(c.anchor[0]-(c.bounds[0]+c.bounds[2])/2)*scale,y:b.y+b.h/2+(c.anchor[1]-(c.bounds[1]+c.bounds[3])/2)*scale};}
   else point=new w.DOMPoint(...c.anchor).matrixTransform(svg.getScreenCTM());
   finish(point.x,point.y);assert(q('[data-piece="'+c.id+'"]').disabled,'all-country aligned drop '+c.id);
  }
  assert(score()===54&&!q('.completion').hidden,'54/54 completion unchanged');reset();assert(score()===0&&!q('.clue-target'),'Reset clean');clean();assert(d.documentElement.scrollWidth<=w.innerWidth,'no horizontal overflow');
  results.textContent='PASS: '+checks+' overlap/drop checks at '+w.innerWidth+' × '+w.innerHeight+'. All 14 requested countries and 54 aligned placements. Synthetic touch; capture stubbed.';
 }catch(error){results.textContent='FAIL after '+checks+' checks: '+error.message;}
};
