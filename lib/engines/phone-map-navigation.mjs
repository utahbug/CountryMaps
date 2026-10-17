// Separate ownership for phone map navigation; never handles a piece drag.
export class PhoneMapNavigation {
 constructor(read,change,tap,{width=800,height=730}={}){this.read=read;this.change=change;this.tap=tap;this.width=width;this.height=height;this.points=new Map();}
 get active(){return this.points.size>0;}
 snapshot(){const p=[...this.points.values()],a=p[0],b=p[1]||a;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};}
 rebase(){this.base={...this.read(),...this.snapshot()};}
 begin(e,source){
  if(e.button!==0||this.points.size>=2||this.points.has(e.pointerId)||(!this.active&&e.isPrimary===false))return false;
  if(!this.active){this.source=source;this.moved=false;this.target=e.target;}
  this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{source.setPointerCapture(e.pointerId);}catch{this.cancel();return false;}
  if(this.points.size===2)this.moved=true;
  this.rebase();return true;
 }
 move(e){
  if(!this.points.has(e.pointerId))return false;
  this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=this.snapshot(),b=this.base,dx=p.x-b.x,dy=p.y-b.y;
  if(Math.hypot(dx,dy)>6)this.moved=true;
  if(!this.moved)return true;
  const ratio=b.d>0&&p.d>0?b.d/p.d:1,v=b.view;
  const w=Math.max(55,Math.min(this.width*1.2,v.w*ratio)),scale=w/v.w,h=v.h*scale;
  const anchorX=b.inverse.a*b.x+b.inverse.c*b.y+b.inverse.e,anchorY=b.inverse.b*b.x+b.inverse.d*b.y+b.inverse.f;
  const x=anchorX-(anchorX-v.x)*scale-(b.inverse.a*dx+b.inverse.c*dy)*scale;
  const y=anchorY-(anchorY-v.y)*scale-(b.inverse.b*dx+b.inverse.d*dy)*scale;
  this.change({x:Math.max(-w*.8,Math.min(this.width-w*.2,x)),y:Math.max(-h*.8,Math.min(this.height-h*.2,y)),w,h});return true;
 }
 finish(e){
  if(!this.points.has(e.pointerId))return false;
  this.move(e);const tap=!this.moved&&this.points.size===1,target=this.target;
  this.points.delete(e.pointerId);this.release(e.pointerId);
  if(this.active)this.rebase();else this.base=null;
  if(tap)this.tap(target,e.clientX,e.clientY);return true;
 }
 release(id){try{if(this.source.hasPointerCapture(id))this.source.releasePointerCapture(id);}catch{}}
 lost(e){if(this.points.has(e.pointerId))this.cancel();}
 cancel(){const ids=[...this.points.keys()];this.points.clear();this.base=null;for(const id of ids)this.release(id);}
}
