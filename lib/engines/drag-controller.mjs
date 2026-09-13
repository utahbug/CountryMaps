// Owns pointer identity synchronously, independently of UI render timing.
export class DragController {
  active = null;
  constructor(onChange, onDrop) {
    this.onChange = onChange;
    this.onDrop = onDrop;
  }
  begin(event, country, source) {
    if (this.active || event.isPrimary === false || event.button !== 0)
      return false;
    this.active = {
      pointerId: event.pointerId,
      country,
      source,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
    };
    source.classList.add('dragging');
    try {
      source.setPointerCapture(event.pointerId);
    } catch {
      this.cancel();
      return false;
    }
    this.onChange(this.active);
    return true;
  }
  move(event) {
    if (!this.active || event.pointerId !== this.active.pointerId) return false;
    this.active = { ...this.active, x: event.clientX, y: event.clientY };
    this.onChange(this.active);
    return true;
  }
  finish(event) {
    if (!this.active || event.pointerId !== this.active.pointerId) return false;
    const current = this.active;
    // Clear ownership before releasePointerCapture (lostcapture can fire reentrantly).
    this.cancel();
    this.onDrop(
      current.country,
      event.clientX,
      event.clientY,
      Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      ) < 6,
    );
    return true;
  }
  lost(event) {
    if (this.active && event.pointerId === this.active.pointerId) this.cancel();
  }
  cancel() {
    const previous = this.active;
    this.active = null;
    if (previous) {
      previous.source.classList.remove('dragging');
      try {
        if (previous.source.hasPointerCapture(previous.pointerId))
          previous.source.releasePointerCapture(previous.pointerId);
      } catch {}
    }
    this.onChange(null);
  }
}

