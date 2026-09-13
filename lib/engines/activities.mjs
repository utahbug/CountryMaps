export class ExplorerEngine {
  selected = null;
  constructor(ids) {
    this.ids = new Set(ids);
  }
  select(id) {
    if (!this.ids.has(id)) return false;
    this.selected = id;
    return true;
  }
  reset() {
    this.selected = null;
  }
}
export class RevealEngine {
  revealed = new Set();
  constructor(ids) {
    this.ids = new Set(ids);
  }
  reveal(id) {
    if (!this.ids.has(id)) return false;
    this.revealed.add(id);
    return true;
  }
  toggle(id) {
    if (!this.ids.has(id)) return false;
    if (this.revealed.has(id)) this.revealed.delete(id);
    else this.revealed.add(id);
    return true;
  }
  revealAll() {
    this.revealed = new Set(this.ids);
  }
  reset() {
    this.revealed.clear();
  }
}
export class PuzzleEngine {
  placed = new Set();
  preview = false;
  constructor(ids) {
    this.ids = new Set(ids);
  }
  place(id, correct) {
    if (this.preview || !correct || !this.ids.has(id) || this.placed.has(id))
      return false;
    this.placed.add(id);
    return true;
  }
  reset() {
    this.placed.clear();
    this.preview = false;
  }
}
