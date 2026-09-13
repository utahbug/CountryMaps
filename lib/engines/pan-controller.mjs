// Explorer/Reveal pointer navigation. Puzzle owns a separate DragController.
export function clampPan(view, width=800, height=730) {
  // A small margin permits panning even at Fit, without stranding the map.
  const padX=view.w*.2, padY=view.h*.2;
  return {...view,
    x:Math.max(-padX,Math.min(width-view.w+padX,view.x)),
    y:Math.max(-padY,Math.min(height-view.h+padY,view.y))};
}

export class PanController {
  active=null;
  constructor(onPan,onTap,{width=800,height=730,threshold=6}={}) {
    this.onPan=onPan;this.onTap=onTap;
    this.width=width;this.height=height;this.threshold=threshold;
  }
  begin(event,source,view,inverse,countryId=null) {
    if(this.active||event.isPrimary===false||event.button!==0||!inverse)return false;
    this.active={pointerId:event.pointerId,source,view:{...view},
      inverse:{a:inverse.a,b:inverse.b,c:inverse.c,d:inverse.d},
      startX:event.clientX,startY:event.clientY,countryId,moved:false};
    try {source.setPointerCapture(event.pointerId);}
    catch {this.cancel();return false;}
    source.dataset.panPointer=String(event.pointerId);
    return true;
  }
  move(event) {
    const state=this.active;
    if(!state||event.pointerId!==state.pointerId)return false;
    const dx=event.clientX-state.startX,dy=event.clientY-state.startY;
    if(Math.hypot(dx,dy)>=this.threshold)state.moved=true;
    if(state.moved) {
      state.source.classList.add('is-panning');
      const m=state.inverse;
      this.onPan(clampPan({...state.view,
        x:state.view.x-(m.a*dx+m.c*dy),
        y:state.view.y-(m.b*dx+m.d*dy)},this.width,this.height));
    }
    return true;
  }
  finish(event) {
    if(!this.active||event.pointerId!==this.active.pointerId)return false;
    this.move(event); // A final delta counts even if no pointermove arrived.
    const state=this.active;
    this.cancel(); // Release ownership before lostpointercapture can fire.
    if(!state.moved&&state.countryId)this.onTap(state.countryId);
    return true;
  }
  lost(event) {
    if(this.active&&event.pointerId===this.active.pointerId)this.cancel();
  }
  cancel() {
    const state=this.active;
    this.active=null;
    if(!state)return;
    state.source.classList.remove('is-panning');
    delete state.source.dataset.panPointer;
    try {if(state.source.hasPointerCapture(state.pointerId))state.source.releasePointerCapture(state.pointerId);}catch{}
  }
}

