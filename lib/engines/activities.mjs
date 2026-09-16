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
  allVisible = false;
  constructor(ids, {limit = Infinity} = {}) {
    this.ids = new Set(ids);
    this.limit = limit;
  }
  reveal(id) {
    if (!this.ids.has(id)) return false;
    this.revealed.add(id);
    // Set insertion order preserves reveal age, including hide/re-reveal.
    if (!this.allVisible) while (this.revealed.size > this.limit)
      this.revealed.delete(this.revealed.values().next().value);
    return true;
  }
  toggle(id) {
    if (!this.ids.has(id)) return false;
    if (this.revealed.has(id)) this.revealed.delete(id);
    else this.reveal(id);
    return true;
  }
  revealAll() {
    this.allVisible = true;
    this.revealed = new Set(this.ids);
  }
  clear() {
    this.revealed.clear();
    this.allVisible = false;
  }
  reset() {
    this.clear();
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
