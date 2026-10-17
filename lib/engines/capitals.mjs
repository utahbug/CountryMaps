// Shared three-stage learning cycle. The Set keeps compatibility with map highlighting.
export class CapitalsEngine {
 constructor(ids,{limit=2}={}){this.ids=new Set(ids);this.limit=limit;this.revealed=new Set();this.states=new Map();this.slots=new Map();}
 state(id){return this.states.get(id)||0;}
 toggle(id){
  if(!this.ids.has(id))return false;
  const next=(this.state(id)+1)%3;
  if(!next){this.revealed.delete(id);this.states.delete(id);this.slots.delete(id);return true;}
  if(!this.revealed.has(id)){
   if(this.revealed.size>=this.limit){const oldest=this.revealed.values().next().value;this.revealed.delete(oldest);this.states.delete(oldest);this.slots.delete(oldest);}
   this.slots.set(id,[0,1].find(slot=>![...this.slots.values()].includes(slot))||0);
   this.revealed.add(id);
  }
  this.states.set(id,next);return true;
 }
 clear(){this.revealed.clear();this.states.clear();this.slots.clear();}
 reset(){this.clear();}
}
