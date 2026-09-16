// Experimental candidates. Change enabled/review, caption, decoration or motion
// here without changing placement, scoring, clue stages, or geographic data.
export const mnemonicCandidates=[
 {id:'cameroon-bird',units:['CMR'],caption:'Cameroon · bird head, beak and feathers',motion:'bird',decoration:'bird'},
 {id:'sierra-leone-ball',units:['SLE'],caption:'Sierra Leone · a spinning ball',motion:'spin'},
 {id:'gabon-texas',units:['GAB'],caption:'Gabon · a Texas-like silhouette',motion:'nod',decoration:'star'},
 {id:'botswana-boat',units:['BWA'],caption:'Botswana → boat',motion:'bob',decoration:'water'},
 {id:'zambia-lobes',units:['ZMB'],caption:'Zambia · two lobes, joined together',motion:'split'},
 {id:'somalia-horn',units:['SOM'],caption:'Somalia · the Horn of Africa',motion:'reach',decoration:'horn'},
 {id:'eritrea-elephant',units:['ERI'],caption:'Eritrea · head and long trunk',motion:'trunk',decoration:'eye'},
 {id:'burkina-bird',units:['BFA'],caption:'Burkina Faso · turn to see a bird',motion:'turn',decoration:'bird'},
 {id:'guinea-wig',units:['GIN'],caption:'Guinea · a settling hairpiece',motion:'wiggle',decoration:'hair'},
 {id:'niger-fish',units:['NER'],caption:'Niger · western tail, eastern body',motion:'fish',decoration:'fish'},
 {id:'congo-pair',units:['COG','COD'],caption:'Congo: smaller west · DRC: larger east',motion:'pair'},
 {id:'sudan-pair',units:['SDN','SSD'],caption:'Sudan above · South Sudan below',motion:'vertical'},
 {id:'m-pair',units:['MOZ','MDG'],caption:'Two Ms face across the Mozambique Channel',motion:'pair',decoration:'m'},
 {id:'senegal-gambia',units:['SEN','GMB'],caption:'Senegal wraps around The Gambia',motion:'hug'},
 {id:'southern-three',units:['ZAF','LSO','SWZ'],caption:'Lesotho enclosed · Eswatini on the eastern side',motion:'nest'},
 {id:'ethiopia-snout',units:['ETH'],caption:'Ethiopia · an experimental snout',motion:'sniff',decoration:'snout'},
 {id:'namibia-arm',units:['NAM'],caption:'Namibia · an arm reaching east',motion:'reach',decoration:'arm'},
].map(c=>({enabled:true,review:'Revise',duration:1300,...c}));

const decorations={
 bird:'<circle cx="87" cy="20" r="2"/><path d="m95 19 12 4-12 3M55 52l-12-8m13 15-15-5m17 12-15 1"/>',
 star:'<path d="m80 30 4 12 13 0-10 8 4 12-11-7-10 7 4-12-10-8h13Z"/>',
 water:'<path d="M30 89q12-6 24 0t24 0t24 0t24 0M40 95q12-5 24 0t24 0t24 0"/>',
 horn:'<path d="m107 33 22-9-9 18m-14-7 22-10"/>',
 eye:'<circle cx="55" cy="35" r="2.5"/><path d="M104 53q25 8 20 22"/>',
 hair:'<path d="M35 33q6-19 14-7t14-3t14-3t14 2t14 5"/>',
 fish:'<path d="m45 50-17-12 2 22 15-10"/><circle cx="111" cy="39" r="2"/>',
 m:'<path d="M40 80V27l40 38 40-38v53"/>',
 snout:'<circle cx="104" cy="48" r="2"/><path d="m120 61 7 2m-6 4 6 1"/>',
 arm:'<path d="M87 27h42m-7-5 7 5-7 5"/>',
};
const frames={
 spin:['rotate(0deg)','rotate(180deg)','rotate(360deg)'],
 bob:['translateY(0)','translateY(-5px) rotate(-4deg)','translateY(0)'],
 bird:['rotate(0)','rotate(-7deg)','rotate(0)'],
 nod:['scale(1)','scale(1.06)','scale(1)'],
 trunk:['rotate(0)','rotate(6deg)','rotate(0)'],
 turn:['rotate(0)','rotate(-75deg)','rotate(0)'],
 wiggle:['rotate(0)','rotate(-6deg)','rotate(5deg)','rotate(0)'],
 fish:['translateX(0)','translateX(6px) rotate(4deg)','translateX(0)'],
 sniff:['translateX(0)','translateX(4px)','translateX(0)'],
 reach:['translateX(0)','translateX(7px)','translateX(0)'],
};

export class MnemonicPlayer{
 constructor(){this.seen=new Set();this.active=null;this.timer=null;this.animations=[];}
 clear(){clearTimeout(this.timer);this.animations.forEach(a=>a.cancel());this.animations=[];this.node?.remove();this.node=null;this.active=null;}
 reset(){this.clear();this.seen.clear();}
 play(id,data,host){
  if(this.active===id)return;
  this.clear();
  if(this.seen.has(id))return;
  const c=mnemonicCandidates.find(c=>c.enabled&&c.review!=='Remove'&&c.units.includes(id));
  if(!c||!host)return;
  this.seen.add(id);this.active=id;
  const units=c.units.map(id=>data.units.find(u=>u.id===id));if(units.some(u=>!u))return;
  const left=Math.min(...units.map(u=>u.bounds[0])),top=Math.min(...units.map(u=>u.bounds[1]));
  const width=Math.max(...units.map(u=>u.bounds[2]))-left,height=Math.max(...units.map(u=>u.bounds[3]))-top;
  const scale=Math.min(112/width,72/height),x=80-width*scale/2,y=50-height*scale/2;
  const shape=u=>'<path d="'+u.path+'" transform="translate('+x+' '+y+') scale('+scale+') translate('+(-left)+' '+(-top)+')"/>';
  const node=document.createElement('aside');node.className='mnemonic-overlay';node.dataset.mnemonic=c.id;node.setAttribute('aria-live','polite');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;node.dataset.reducedMotion=String(reduced);
  // Only decorative copies are transformed. Relationship copies share one scale/transform.
  node.innerHTML='<span class="mnemonic-tag">Memory sketch · experimental</span><svg viewBox="0 0 160 104" aria-hidden="true"><defs><clipPath id="mnemonic-left"><rect width="80" height="104"/></clipPath><clipPath id="mnemonic-right"><rect x="80" width="80" height="104"/></clipPath></defs>'+(c.motion==='split'?['left','right'].map(side=>'<g class="mnemonic-part"><g clip-path="url(#mnemonic-'+side+')">'+shape(units[0])+'</g></g>').join(''):units.map((u,i)=>'<g class="mnemonic-part" data-unit="'+u.id+'" style="fill:'+['#aacbbd','#e2bf77','#a3bfd3'][i%3]+'">'+shape(u)+'</g>').join(''))+'<g class="mnemonic-decoration">'+(decorations[c.decoration]||'')+'</g></svg><p></p>';
  node.querySelector('p').textContent=c.caption;host.append(node);this.node=node;
  if(!reduced){
   for(const [i,part] of [...node.querySelectorAll('.mnemonic-part')].entries()){
    let transforms=frames[c.motion];
    if(['split','pair','hug'].includes(c.motion))transforms=['translateX(0)','translateX('+(i?5:-5)+'px)','translateX(0)'];
    if(c.motion==='vertical')transforms=['translateY(0)','translateY('+(i?5:-5)+'px)','translateY(0)'];
    if(c.motion==='nest')transforms=i?['scale(.65)','scale(1.15)','scale(1)']:['scale(1)','scale(1.02)','scale(1)'];
    this.animations.push(part.animate((transforms||frames.nod).map(transform=>({transform})),{duration:c.duration-150,easing:'ease-in-out'}));
   }
   const decoration=node.querySelector('.mnemonic-decoration');
   this.animations.push(decoration.animate([{opacity:0},{opacity:1,offset:.25},{opacity:1,offset:.8},{opacity:0}],{duration:c.duration-100}));
  }
  this.timer=setTimeout(()=>this.clear(),c.duration);
 }
}
