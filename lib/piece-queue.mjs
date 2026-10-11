// A rotating queue never drops skipped units; placed units are removed on read.
export class PieceQueue {
 constructor(){this.ids=[];}
 reset(ids){this.ids=[...ids];}
 remaining(ids,placed){
  const allowed=new Set(ids);this.ids=this.ids.filter(id=>allowed.has(id)&&!placed.has(id));
  for(const id of ids)if(!placed.has(id)&&!this.ids.includes(id))this.ids.push(id);
  return this.ids;
 }
 next(ids,placed){return this.remaining(ids,placed)[0]||null;}
 skip(id,ids,placed){const queue=this.remaining(ids,placed);const i=queue.indexOf(id);if(i>=0)queue.push(...queue.splice(i,1));return queue[0]||null;}
}
