const frame=document.querySelector('iframe'),results=document.querySelector('#results');
const tick=w=>new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
document.querySelector('#run').onclick=async()=>{
 let checks=0;const assert=(ok,message)=>{if(!ok)throw Error(message);checks++;};
 try{
 const loaded=new Promise(resolve=>frame.onload=resolve);frame.src='../';await loaded;
 const w=frame.contentWindow,d=w.document,q=s=>d.querySelector(s);
 const wait=async selector=>{for(let i=0;i<100&&!q(selector);i++)await tick(w);assert(q(selector),'arrived '+selector);};
 await wait('.maps-home');assert(d.title==='CountryMaps · All Maps','root title');
 const cards=[...d.querySelectorAll('a.map-card')];assert(cards.length===4,'four available map cards');const planned=q('.map-card-planned');assert(planned&&planned.textContent.includes('United States')&&planned.textContent.includes('50'),'planned US tile');assert(!planned.querySelector('a')&&!planned.hasAttribute('href')&&!planned.hasAttribute('tabindex'),'no unfinished US link');
 assert(d.documentElement.scrollWidth<=w.innerWidth,'no home horizontal overflow');
 for(const card of cards){const img=card.querySelector('img');if(!img.complete)await new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;});assert(img.complete&&img.naturalWidth>0,'real map thumbnail loaded');assert(img.getBoundingClientRect().width>=80,'recognizable preview size');assert(card.querySelector('.map-card-activities').textContent===(card.getAttribute('href')==='?map=africa'?'Explorer / Reveal / Puzzle':'Map only for now'),'available activities only');assert(card.getBoundingClientRect().height>=44,'large touch card');assert(!/reveal|puzzle/.test(card.getAttribute('href')),'card opens working map entry');}
 if(w.innerWidth<=650)assert(cards.at(-1).getBoundingClientRect().bottom<820,'minimal phone scrolling');
 for(const id of ['africa','canada','central-america','south-america']){
  q('.map-card[href="?map='+id+'"]').click();await wait(id==='africa'?'.activity-cards':'.map-canvas');
  assert(q('h1').textContent.includes(id==='africa'?'Africa':id==='canada'?'Canada':id==='central-america'?'Central America':'South America'),'correct map '+id);
  assert(q('.site-header .all-maps-link').getBoundingClientRect().height>=44,'visible return target');
  if(id==='africa'){
   assert(d.querySelectorAll('.activity-cards a').length===3,'Africa activities retained');
   for(const mode of ['explorer','reveal','puzzle']){
    const link=q('a[href="?map=africa&mode='+mode+'"]');link.click();await wait('.map-canvas');await tick(w);
    assert(q('h1').textContent.toLowerCase().includes(mode),'Africa '+mode+' loads');
   }
  }else assert(![...d.querySelectorAll('a')].some(a=>/mode=(reveal|puzzle)/.test(a.href)),'no unfinished mode links');
  q('.site-header .all-maps-link').click();await wait('.maps-home');assert(!w.location.search,'return uses short root URL');assert(!q('.drag-preview'),'no stranded drag preview');
 }
 q('.map-card[href="?map=canada"]').click();await wait('.map-canvas');q('.site-header [data-home]').click();await wait('.maps-home');assert(!w.location.search,'brand returns home');
 results.textContent='PASS: '+checks+' home/navigation checks at '+innerWidth+' × '+innerHeight+'. Root hub, all cards, Africa activities, return links and no unfinished links.';
 }catch(e){results.textContent='FAIL after '+checks+' checks: '+e.message;}
};
