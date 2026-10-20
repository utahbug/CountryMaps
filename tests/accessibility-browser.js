const f=document.querySelector('iframe'),out=document.querySelector('#results');
const wait=()=>new Promise(r=>setTimeout(r,120));
async function go(p){f.src='../'+p;await new Promise(r=>f.onload=r);await wait();}
function doubleText(w){const sizes=[...w.document.querySelectorAll('body *')].map(e=>[e,w.getComputedStyle(e).fontSize]);for(const[e,size]of sizes)e.style.fontSize=parseFloat(size)*2+'px';}
document.querySelector('#route').onchange=e=>go(e.target.value);
document.querySelector('#resize').onclick=()=>{doubleText(f.contentWindow);out.textContent='200% text-only resize simulation; inspect controls, cards and popups.';};
document.querySelector('#run').onclick=async()=>{
 const report=[];out.textContent='Running';delete out.dataset.complete;
 try{for(const route of ['','africa/','?map=africa&mode=explorer','?map=africa&mode=capitals','?map=africa&mode=puzzle','?map=canada','?map=central-america','?map=south-america']){
  await go(route);const w=f.contentWindow,d=w.document;
  const script=d.createElement('script');script.src=new URL('./vendor/axe.min.js',location.href);d.head.append(script);await new Promise((r,reject)=>{script.onload=r;script.onerror=reject;});
  const result=await w.axe.run(d,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
  const describe=v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
  const row={route,violations:result.violations.map(describe),incomplete:result.incomplete.map(describe),overflow:d.documentElement.scrollWidth>w.innerWidth};
  const phonePuzzle=route.includes('mode=puzzle')&&w.innerWidth<=650;
  if(phonePuzzle){d.querySelector('[data-piece-filter="central"]').click();d.querySelector('[data-action="skip-piece"]').click();d.querySelector('[data-action="skip-piece"]').click();await wait();}
  doubleText(w);await wait();row.doubleTextOverflow=d.documentElement.scrollWidth>w.innerWidth;
  if(phonePuzzle){const skip=d.querySelector('[data-action="skip-piece"]').getBoundingClientRect(),controls=d.querySelector('.map-tools').getBoundingClientRect();row.stationControlOverlap=skip.left<controls.right&&skip.right>controls.left&&skip.top<controls.bottom&&skip.bottom>controls.top;}
  report.push(row);out.textContent=JSON.stringify(report,null,2);
 }out.dataset.complete='true';}catch(error){out.textContent='FAIL: '+error.message;}
};
