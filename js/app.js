import {loadMap,modes,titles,findCountries,insetTransform,pieceViewBox,escapeHTML as esc} from '../lib/maps.js';
import {ExplorerEngine,RevealEngine,PuzzleEngine} from '../lib/engines/activities.mjs';
import {DragController} from '../lib/engines/drag-controller.mjs';
import {placeCountryLabel} from '../lib/label-placement.mjs';
import {PanController,clampPan} from '../lib/engines/pan-controller.mjs';

const root=document.querySelector('#main');
const fit={x:0,y:0,w:800,h:730};
const q=(selector,scope=root)=>scope.querySelector(selector);
let app=null;
let navigationVersion=0;

class CountryMaps {
  constructor(data) {
    this.data=data;
    const ids=data.countries.map(c=>c.id);
    this.engines={explorer:new ExplorerEngine(ids),reveal:new RevealEngine(ids),puzzle:new PuzzleEngine(ids)};
    this.byId=new Map([...data.countries,...data.context].map(c=>[c.id,c]));
    this.mode='home';this.selected=null;this.armed=null;this.currentId=ids[0];
    this.view={...fit};this.suppressClick=false;this.query='';this.message='';
    this.pan=new PanController(view=>{if(this.phoneReveal)return;this.view=view;this.svg.setAttribute('viewBox',[view.x,view.y,view.w,view.h].join(' '));this.positionLabel();},id=>this.select(this.byId.get(id)),{width:data.width,height:data.height});
    this.drag=new DragController(state=>this.paintDrag(state),(c,x,y,stationary)=>this.drop(c,x,y,stationary));
  }
  get phoneReveal(){return this.mode==='reveal'&&window.matchMedia('(max-width: 650px)').matches;}
  get preview(){return this.mode==='puzzle'&&this.engines.puzzle.preview;}
  get isPuzzle(){return this.mode==='puzzle'&&!this.preview;}
  get revealed(){return this.mode==='reveal'?this.engines.reveal.revealed:this.preview?new Set(this.data.countries.map(c=>c.id)):this.engines.puzzle.placed;}
  href(mode){return '?map='+this.data.id+(mode==='home'?'':'&mode='+mode);}
  enter(mode) {
    this.pan.cancel();this.drag.cancel();this.toolLifecycle?.abort();
    this.mode=mode;this.armed=null;this.selected=null;this.query='';this.view={...fit};
    this.engines.puzzle.preview=false;
    this.message=mode==='explorer'?'Choose a country on the map or in the list.':mode==='reveal'?'Tap a country to reveal its name.':'Drag a piece onto its matching shape.';
    document.title='CountryMaps · '+this.data.name+(titles[mode]?' · '+titles[mode]:'');
    document.querySelector('#data-note').textContent=this.data.countries.length+'-country educational map'+(this.data.context.length?' · Context: '+this.data.context.map(c=>c.name).join(', '):'')+'.';
    if(mode==='home')this.renderLanding();else this.renderActivity();
    this.registerTool();
  }
  renderLanding() {
    const descriptions=['Find a country and get to know its shape.','Uncover the map, one country at a time.','Put each country in its place.'];
    root.innerHTML='<p class="eyebrow">COUNTRIES OF THE WORLD</p><div class="landing-layout"><div><h1>'+esc(this.data.name)+'</h1><p class="landing-intro">'+this.data.countries.length+' countries. Three ways to learn the map.</p><div class="activity-cards">'+modes.map((mode,i)=>'<a href="'+this.href(mode)+'"><span class="activity-number">0'+(i+1)+'</span><h2>'+titles[mode]+'</h2><p>'+descriptions[i]+'</p><strong>Open '+titles[mode]+' →</strong></a>').join('')+'</div></div><svg class="landing-map" viewBox="0 0 800 730" role="img" aria-label="Map of '+esc(this.data.name)+'">'+this.data.context.map(c=>'<path d="'+c.path+'" fill="#e4e0d8"/>').join('')+this.data.countries.map(c=>'<path d="'+c.path+'" fill="'+c.color+'" stroke="#fffdf8" stroke-width="1"/>').join('')+'</svg></div>';
  }
  renderActivity() {
    const name=esc(this.data.name);
    root.innerHTML='<div class="activity-heading"><div><a class="back-link" href="'+this.href('home')+'">← '+name+'</a><h1>'+name+' <span>/ '+titles[this.mode]+'</span></h1></div><nav class="mode-links" aria-label="'+name+' activities">'+modes.map(m=>'<a href="'+this.href(m)+'"'+(m===this.mode?' aria-current="page"':'')+'>'+titles[m]+'</a>').join('')+'</nav></div>'+
    '<div class="toolbar"><p id="instructions"></p><div class="toolbar-actions">'+(this.mode==='reveal'?'<button data-action="reveal-all">Reveal All</button>':'')+(this.mode==='puzzle'?'<button data-action="preview">Reveal</button>':'')+'<button data-action="reset">Reset</button></div></div>'+
    '<div class="workspace"><section class="map-panel" aria-label="'+name+' map"><div class="map-readout"><strong></strong><span></span></div><div class="map-viewport"><div class="selected-country-overlay" hidden aria-hidden="true"></div><svg id="africa-map" class="map-canvas" viewBox="0 0 800 730" role="group" aria-label="Interactive '+name+' country map">'+
    '<defs><pattern id="territory-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e6e2d7"/><path d="M0 8L8 0" stroke="#aaa391" stroke-width="1"/></pattern></defs>'+
    this.data.countries.map((c,i)=>'<g><path data-country="'+c.id+'" data-name="'+esc(c.name)+'" data-anchor-x="'+((c.anchor[0]-c.bounds[0])/(c.bounds[2]-c.bounds[0]))+'" data-anchor-y="'+((c.anchor[1]-c.bounds[1])/(c.bounds[3]-c.bounds[1]))+'" class="country" d="'+c.path+'" role="button" tabindex="0" aria-pressed="false"><title></title></path><text hidden data-number="'+c.id+'" class="country-number" x="'+c.anchor[0]+'" y="'+c.anchor[1]+'">'+(i+1)+'</text></g>').join('')+
    this.data.context.map(c=>'<g class="territory-geometry"><path data-territory="'+c.id+'" d="'+c.path+'" class="context-region" role="button" tabindex="0" aria-label="'+esc(c.name+' — '+c.classification)+'" aria-pressed="false"><title>'+esc(c.name+' — '+c.classification)+'</title></path><text data-territory-label="'+c.id+'" class="territory-map-label" text-anchor="middle" x="'+c.anchor[0]+'" y="'+(c.anchor[1]-8)+'">'+esc(c.name)+'</text></g>').join('')+'<circle hidden class="location-marker"/><g id="inset-layer"></g></svg></div><div class="map-tools" aria-label="Map view controls">'+
    '<button data-action="zoom-in" aria-label="Zoom in">+</button><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="fit">Fit map</button><button data-action="left" aria-label="Pan left">←</button><button data-action="up" aria-label="Pan up">↑</button><button data-action="down" aria-label="Pan down">↓</button><button data-action="right" aria-label="Pan right">→</button></div><div class="map-caption"></div><p class="territory-legend"><span aria-hidden="true"></span>Hatched areas: territories / disputed areas, outside the 54-country score. Somaliland is identified separately; its geometry belongs to the Somalia puzzle piece.</p></section><aside class="side-panel"></aside></div>'+
    '<p role="status" aria-live="polite" class="status" data-active-pointer=""></p><div class="completion" hidden><h2>'+name+', complete.</h2><p>All '+this.data.countries.length+' countries are in place.</p><button data-action="reset">Play again</button></div>';
    this.svg=q('#africa-map');
    this.renderSide();this.paint();
  }
  renderSide() {
    if(this.isPuzzle){
      q('.side-panel').innerHTML='<div class="panel-title"><h2>Country pieces</h2><span></span></div><progress max="'+this.data.countries.length+'" value="0" aria-label="Countries placed"></progress><p class="piece-help">Drag a piece, or tap it and then tap its map location. Use the arrows to browse.</p><div class="active-piece"><strong></strong><button data-action="arm">Select piece</button></div><div class="tray-scroll" aria-label="Browse country pieces"><button data-action="previous-pieces" aria-controls="piece-tray">↑ Previous pieces</button><button data-action="more-pieces" aria-controls="piece-tray">↓ More pieces</button></div><div id="piece-tray" class="piece-tray" aria-label="Unplaced countries">'+
      this.data.countries.map(c=>'<button data-piece="'+c.id+'" class="piece" aria-label="Piece: '+esc(c.name)+'" aria-pressed="false"><svg aria-hidden="true" viewBox="'+pieceViewBox(c)+'"><path d="'+c.path+'" fill="'+c.color+'"/></svg><span>'+esc(c.name)+'</span></button>').join('')+'</div>';
    }else{
      q('.side-panel').innerHTML='<h2>'+(this.mode==='explorer'?'Find a country':'Country names')+'</h2><label for="country-search">Search countries</label><input id="country-search" type="search" placeholder="Country name…" autocomplete="off"><div class="country-list"></div><section class="territory-section" aria-label="Territories and disputed areas"><h3>Territories &amp; disputed areas</h3><p>Hatched areas are geographic context, separate from the 54-country score.</p><div class="territory-list"></div></section>';
      q('#country-search').value=this.query;this.renderList();
    }
  }
  renderList(){
    const matches=findCountries(this.data,this.query),revealed=this.revealed;
    q('.country-list').innerHTML=matches.length?matches.map(c=>{
      const i=this.data.countries.indexOf(c),known=this.mode==='explorer'||revealed.has(c.id);
      return '<button data-list-country="'+c.id+'" class="'+(this.selected===c.id?'active':'')+'" aria-label="'+esc(this.mode==='reveal'?(known?'Hide '+c.name:'Reveal country '+(i+1)):c.name)+'"><span class="list-number">'+(i+1)+'</span><span class="list-name">'+esc(known?c.name:'Country '+(i+1))+'</span>'+(this.mode!=='explorer'?'<span class="reveal-state">'+(known?'Hide':'Reveal')+'</span>':'')+'</button>';
    }).join(''):'<p>No countries found.</p>';
    q('.territory-list').innerHTML=findCountries({countries:this.data.context},this.query).map(c=>'<button data-list-country="'+c.id+'" class="territory-choice" aria-pressed="'+(this.selected===c.id)+'"><strong>'+esc(c.name)+'</strong><span>'+esc(c.classification)+'</span></button>').join('')||'<p>No matching territories.</p>';
  }
  paint(){
    if(this.mode==='home')return;
    if(this.phoneReveal)this.view={...fit};
    const revealed=this.revealed,current=this.byId.get(this.currentId),chosen=this.byId.get(this.selected);
    const inset=this.isPuzzle&&current?.inset?current:null;
    const identified=chosen&&(this.mode!=='reveal'||chosen.classification||revealed.has(chosen.id));
    q('.workspace').classList.toggle('puzzle-workspace',this.isPuzzle);
    q('.workspace').classList.toggle('phone-reveal',this.phoneReveal);
    q('#instructions').textContent=this.phoneReveal?'Tap a country to reveal or hide its name. Africa stays fitted while you study.':this.mode==='explorer'?'Select a country in the full map. Select it again to switch between focus and the continent.':this.mode==='reveal'?'Tap a country to reveal or hide its name. Repeated taps also switch focus and continent views.':this.preview?'The answer map. Your placed pieces are saved.':'Drag a piece to its shape, or select it and tap a location.';
    q('.map-readout strong').textContent=(identified?chosen.name:null)||inset?.name||this.data.name;
    q('.map-readout span').textContent=this.mode==='explorer'?this.data.countries.length+' countries':revealed.size+' / '+this.data.countries.length+(this.mode==='reveal'||this.preview?' revealed':' placed');
    q('.map-tools').hidden=this.isPuzzle||this.phoneReveal;
    this.svg.classList.toggle('puzzle-map',this.isPuzzle);
    this.svg.classList.toggle('explorer-map',this.mode==='explorer');
    this.svg.classList.toggle('navigable-map',this.mode==='explorer'||this.mode==='reveal');
    const overlay=q('.selected-country-overlay');
    overlay.textContent=identified?(chosen.classification?chosen.name+' — '+chosen.classification:chosen.name):'';
    overlay.hidden=!identified||!(this.mode==='explorer'||this.mode==='reveal');
    this.svg.setAttribute('viewBox',[this.view.x,this.view.y,this.view.w,this.view.h].join(' '));
    for(const [i,c] of this.data.countries.entries()){
      const path=q('[data-country="'+c.id+'"],[data-territory="'+c.id+'"]'),shown=this.mode==='explorer'?this.selected===c.id:revealed.has(c.id);
      path.classList.toggle('shown',shown);path.classList.toggle('selected',this.selected===c.id);path.classList.toggle('puzzle-country',this.isPuzzle);
      path.style.fill=shown?c.color:'';
      path.setAttribute('aria-pressed',String(shown));
      path.setAttribute('aria-label',this.isPuzzle&&!shown?'Unplaced location '+(i+1):this.mode==='reveal'&&!shown?'Reveal country '+(i+1):c.name);
      path.querySelector('title').textContent=this.mode==='explorer'||shown?c.name:'Country '+(i+1);
      q('[data-number="'+c.id+'"]').toggleAttribute('hidden',!shown||this.mode==='explorer');
      if(this.isPuzzle){
        const piece=q('[data-piece="'+c.id+'"]'),placed=this.engines.puzzle.placed.has(c.id);
        piece.disabled=placed;piece.classList.toggle('current-piece',this.currentId===c.id);
        piece.setAttribute('aria-pressed',String(this.armed===c.id));piece.querySelector('span').textContent=(placed?'✓ ':'')+c.name;
      }else{
        const row=q('[data-list-country="'+c.id+'"]');
        if(row){row.classList.toggle('active',this.selected===c.id);const state=row.querySelector('.reveal-state');if(state){const known=revealed.has(c.id);state.textContent=known?'Hide':'Reveal';row.querySelector('.list-name').textContent=known?c.name:'Country '+(i+1);row.setAttribute('aria-label',known?'Hide '+c.name:'Reveal country '+(i+1));}}
      }
    }
    const marker=q('.location-marker');
    marker.toggleAttribute('hidden',!chosen||this.isPuzzle);
    if(chosen){marker.setAttribute('cx',chosen.anchor[0]);marker.setAttribute('cy',chosen.anchor[1]);marker.setAttribute('r',Math.max(2,this.view.w/140));}
    for(const territory of this.data.context){
      const shape=q('[data-territory="'+territory.id+'"]'),selected=this.selected===territory.id;
      shape.classList.toggle('selected',selected);shape.setAttribute('aria-pressed',String(selected));
      shape.style.pointerEvents=this.mode==='puzzle'?'none':'';
      shape.parentElement.classList.toggle('puzzle-context-hidden',this.mode==='puzzle'&&territory.puzzleGroup==='SOM');
      shape.setAttribute('tabindex',this.mode==='puzzle'?'-1':'0');
      const row=q('[data-list-country="'+territory.id+'"]');if(row){row.classList.toggle('active',selected);row.setAttribute('aria-pressed',String(selected));}
    }
    this.paintInset(inset);
    q('.map-caption').textContent=this.phoneReveal?'Tap to reveal / hide. Use Explorer for zooming and closer inspection.':this.isPuzzle?(inset?'Drop inside the enlarged inset box. The ring marks its real location.':'Pieces snap when dropped inside their matching country.'):this.mode==='explorer'?'Drag to pan · Repeat a selection to toggle focus / full map.':'Tap to reveal / hide · Drag to pan · Fit map restores the continent.';
    if(this.isPuzzle){
      q('.panel-title span').textContent=this.engines.puzzle.placed.size+' / '+this.data.countries.length;
      q('progress').value=this.engines.puzzle.placed.size;
      q('.active-piece strong').textContent=current.name;
      q('[data-action="arm"]').disabled=this.engines.puzzle.placed.has(current.id);
    }
    const previewButton=q('[data-action="preview"]');if(previewButton)previewButton.textContent=this.preview?'Return to Puzzle':'Reveal';
    for(const action of ['zoom-out','left','right','up','down'])q('[data-action="'+action+'"]').disabled=this.view.w===800&&(action==='zoom-out'||!(this.mode==='explorer'||this.mode==='reveal'));
    q('.completion').hidden=!(this.isPuzzle&&this.engines.puzzle.placed.size===this.data.countries.length);
    q('.status').textContent=this.message;
    this.positionLabel();
  }
  positionLabel(){
    if(this.svg&&this.mode!=='home'){
      const b=this.svg.getBoundingClientRect(),unit=Math.min(b.width/this.view.w,b.height/this.view.h);
      for(const label of this.svg.querySelectorAll('.territory-map-label'))label.style.fontSize=(11/Math.max(unit,.01))+'px';
    }
    if(!this.selected||!(this.mode==='explorer'||this.mode==='reveal'))return;
    const label=q('.selected-country-overlay');
    if(!label||label.hidden)return;
    const frame=q('.map-viewport').getBoundingClientRect();
    if(!frame.width||!frame.height)return;
    const rect=element=>{const b=element.getBoundingClientRect();return {x:b.left-frame.left,y:b.top-frame.top,w:b.width,h:b.height};};
    const c=this.byId.get(this.selected),path=q('[data-country="'+c.id+'"],[data-territory="'+c.id+'"]'),matrix=this.svg.getScreenCTM();
    if(!matrix)return;
    const point=new DOMPoint(...c.anchor).matrixTransform(matrix);
    const position=placeCountryLabel({viewport:{w:frame.width,h:frame.height},label:{w:label.offsetWidth,h:label.offsetHeight},country:rect(path),anchor:{x:point.x-frame.left,y:point.y-frame.top},neighbors:[...this.svg.querySelectorAll('path[data-country],.context-region')].filter(p=>p!==path).map(rect)});
    label.style.left=position.x+'px';label.style.top=position.y+'px';
  }
  paintInset(c){
    const layer=q('#inset-layer');if(layer.dataset.country===(c?.id||''))return;
    layer.dataset.country=c?.id||'';
    if(!c){layer.innerHTML='';return;}
    const t=insetTransform(c);
    layer.innerHTML='<g class="inset"><rect x="595" y="24" width="170" height="175" rx="8" data-inset-hit="'+c.id+'" role="button" tabindex="0" aria-label="Enlarged drop zone for '+esc(c.name)+'"/><text x="680" y="59" text-anchor="middle">Inset</text><path data-inset-target="'+c.id+'" d="'+c.path+'" transform="translate('+t.x+' '+t.y+') scale('+t.scale+')" class="country inset-country" style="pointer-events:none"/><text x="680" y="185" text-anchor="middle">Drop here</text><circle class="inset-locator" cx="'+c.anchor[0]+'" cy="'+c.anchor[1]+'" r="8"/></g>';
  }
  paintDrag(state){
    if(!state){document.querySelector('.drag-preview')?.remove();q('.status')?.setAttribute('data-active-pointer','');return;}
    if(this.currentId!==state.country.id){this.currentId=state.country.id;this.paint();}
    const c=state.country,box=this.svg.getBoundingClientRect(),unit=Math.min(box.width/this.view.w,box.height/this.view.h),scale=unit*(c.inset?insetTransform(c).scale:1);
    const [x0,y0,x1,y1]=c.bounds;
    let ghost=document.querySelector('.drag-preview');
    if(!ghost){ghost=document.createElementNS('http://www.w3.org/2000/svg','svg');ghost.classList.add('drag-preview');ghost.setAttribute('aria-hidden','true');ghost.innerHTML='<path d="'+c.path+'" fill="'+c.color+'" stroke="#285d52" stroke-width="'+1.5/scale+'"/>';document.body.append(ghost);}
    ghost.style.left=state.x-(c.anchor[0]-x0)*scale-4+'px';
    ghost.style.top=state.y-(c.anchor[1]-y0)*scale-4+'px';
    ghost.style.width=(x1-x0)*scale+8+'px';ghost.style.height=(y1-y0)*scale+8+'px';
    ghost.setAttribute('viewBox',[x0-4/scale,y0-4/scale,x1-x0+8/scale,y1-y0+8/scale].join(' '));
    q('.status').setAttribute('data-active-pointer',state.pointerId);
  }
  select(c){
    if(this.drag.active||this.pan.active)return;
    const focusSelection=!this.phoneReveal&&this.selected===c.id&&this.view.w===fit.w;
    if(this.isPuzzle){
      if(this.armed){this.place(this.byId.get(this.armed),this.armed===c.id);return;}
      this.selected=c.id;this.message=this.engines.puzzle.placed.has(c.id)?c.name+' is placed.':'Choose a piece from the tray first.';
    }else{
      if(this.mode==='reveal'&&!c.classification)this.engines.reveal.toggle(c.id);
      if(this.mode==='explorer'&&!c.classification)this.engines.explorer.select(c.id);
      this.selected=c.id;this.message=c.classification?c.name+' — '+c.classification+'. '+c.description:c.name;
      if(this.mode==='reveal'&&!c.classification&&!this.engines.reveal.revealed.has(c.id))this.message='Country name hidden. Select it again to reveal.';
      if(focusSelection)this.focus(c);else this.view={...fit};
    }
    this.paint();
  }
  focus(c){
    if(this.phoneReveal){this.view={...fit};return;}
    const [x0,y0,x1,y1]=c.bounds,factor=Math.min(12,Math.max(1,Math.min(600/(x1-x0),500/(y1-y0)))),w=800/factor,h=730/factor;
    this.view={x:Math.max(0,Math.min(800-w,(x0+x1-w)/2)),y:Math.max(0,Math.min(730-h,(y0+y1-h)/2)),w,h};
  }
  arm(c){
    if(this.drag.active||this.engines.puzzle.placed.has(c.id))return;
    this.currentId=c.id;this.armed=c.id;
    this.message=c.name+' selected. Tap its shape on the map'+(c.inset?' or enlarged inset':'')+', or focus a location and press Enter.';
    this.paint();
  }
  drop(c,x,y,stationary){
    if(!this.isPuzzle)return;
    if(stationary){this.arm(c);return;}
    const target=q(c.inset?'[data-inset-hit="'+c.id+'"]':'[data-country="'+c.id+'"]');
    let correct=false;
    if(target){
      const matrix=target.getScreenCTM();
      if(matrix)correct=target.isPointInFill(new DOMPoint(x,y).matrixTransform(matrix.inverse()));
      const box=this.svg.getBoundingClientRect();
      correct=correct&&x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom;
      if(correct&&!c.inset){const under=document.elementFromPoint(x,y)?.closest('[data-country]');if(under)correct=under.dataset.country===c.id;}
    }
    this.place(c,correct);
  }
  place(c,correct){
    this.armed=null;
    if(this.engines.puzzle.place(c.id,correct)){
      this.selected=c.id;
      this.message=this.engines.puzzle.placed.size===this.data.countries.length?'Complete! All '+this.data.countries.length+' countries are placed.':c.name+' placed.';
      const next=this.data.countries.find(n=>!this.engines.puzzle.placed.has(n.id));if(next)this.currentId=next.id;
    }else this.message='Not quite. '+c.name+' returned to the tray.';
    this.paint();
  }
  reset(){
    this.pan.cancel();this.drag.cancel();this.suppressClick=false;this.armed=null;this.selected=null;this.query='';this.view={...fit};
    this.engines[this.mode].reset();this.currentId=this.data.countries[0].id;
    this.message='Reset. Ready to begin again.';
    this.renderSide();this.paint();
  }
  action(action){
    this.pan.cancel();
    if(this.phoneReveal&&['zoom-in','zoom-out','fit','left','right','up','down'].includes(action)){this.view={...fit};this.paint();return;}
    if(action==='reset'){this.reset();return;}
    if(action==='preview'){
      this.drag.cancel();this.armed=null;this.selected=null;this.query='';this.view={...fit};
      this.engines.puzzle.preview=!this.engines.puzzle.preview;
      this.message=this.preview?'Answer map. Your puzzle progress is saved.':'Back to your puzzle.';
      this.renderSide();this.paint();return;
    }
    if(action==='reveal-all'){this.engines.reveal.revealAll();this.message='All '+this.data.countries.length+' countries revealed.';this.paint();return;}
    if(action==='arm'){this.arm(this.byId.get(this.currentId));return;}
    if(action==='previous-pieces'||action==='more-pieces'){
      this.drag.cancel();const tray=q('#piece-tray');tray.scrollBy({top:(action==='more-pieces'?1:-1)*(tray.clientHeight-20),behavior:'instant'});return;
    }
    this.drag.cancel();
    if(action==='fit')this.view={...fit};
    if(action==='zoom-in'||action==='zoom-out'){
      const factor=action==='zoom-in'?.6:1/.6,v=this.view,w=Math.min(800,Math.max(800/12,v.w*factor)),h=w*730/800;
      this.view={x:Math.max(0,Math.min(800-w,v.x+(v.w-w)/2)),y:Math.max(0,Math.min(730-h,v.y+(v.h-h)/2)),w,h};
    }
    const shifts={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
    if(shifts[action]){const [dx,dy]=shifts[action],v=this.view;
      if(this.mode==='explorer'||this.mode==='reveal')this.view=clampPan({...v,x:v.x+dx*v.w*.25,y:v.y+dy*v.h*.25},this.data.width,this.data.height);
      else {v.x=Math.max(0,Math.min(800-v.w,v.x+dx*v.w*.25));v.y=Math.max(0,Math.min(730-v.h,v.y+dy*v.h*.25));}}
    this.paint();
  }
  registerTool(){
    if(this.mode==='home'||!document.modelContext?.registerTool)return;
    this.toolLifecycle=new AbortController();
    try{Promise.resolve(document.modelContext.registerTool({name:'select_map_country',description:'Select a configured country in Explorer or reveal it in Reveal. Does not solve puzzle pieces.',inputSchema:{type:'object',properties:{countryId:{type:'string'}},required:['countryId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
      const c=this.byId.get(input?.countryId);
      if(!c||this.mode==='puzzle'||this.mode==='home'||this.drag.active||this.pan.active)throw Error('Choose a valid country in Explorer or Reveal.');
      this.select(c);return {countryId:c.id,name:c.name};
    }},{signal:this.toolLifecycle.signal})).catch(()=>{});}catch{}
  }
}

async function navigate(){
  const version=++navigationVersion,params=new URLSearchParams(location.search),id=params.get('map')||'africa',mode=modes.includes(params.get('mode'))?params.get('mode'):'home';
  app?.pan.cancel();app?.drag.cancel();
  try{
    const data=await loadMap(id);if(version!==navigationVersion)return;
    if(app?.data.id!==id){app?.toolLifecycle?.abort();app=new CountryMaps(data);}
    app.enter(mode);
  }catch(error){
    if(version!==navigationVersion)return;
    app?.toolLifecycle?.abort();app=null;
    root.innerHTML='<h1>Map not available</h1><p>'+esc(error.message)+'</p><a href="?map=africa">Return to Africa</a>';
  }
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="?map="]');
  if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();history.pushState({},'',link.getAttribute('href'));window.scrollTo(0,0);navigate();return;}
  if(!app||app.mode==='home')return;
  const piece=event.target.closest('[data-piece]');
  if(piece&&!piece.disabled){
    if(app.suppressClick&&event.detail!==0){app.suppressClick=false;return;}
    app.suppressClick=false;app.arm(app.byId.get(piece.dataset.piece));return;
  }
  const action=event.target.closest('[data-action]');if(action){app.action(action.dataset.action);return;}
  const row=event.target.closest('[data-list-country]');if(row){app.select(app.byId.get(row.dataset.listCountry));return;}
  const inset=event.target.closest('[data-inset-hit]');if(inset){if(app.armed===inset.dataset.insetHit)app.place(app.byId.get(app.armed),true);return;}
  // Pointer taps are completed by PanController because capture retargets click.
  // Keyboard/assistive activation (detail 0, no physical pointer) stays available.
  if((app.mode==='explorer'||app.mode==='reveal')&&event.target.closest('.navigable-map')&&(event.detail>0||(typeof event.pointerId==='number'&&event.pointerId>=0)))return;
  const path=event.target.closest('[data-country],[data-territory]');if(path)app.select(app.byId.get(path.dataset.country||path.dataset.territory));
});
root.addEventListener('input',event=>{
  if(event.target.id==='country-search'){app.query=event.target.value;app.renderList();}
});
root.addEventListener('pointerdown',event=>{
  if((app?.mode==='explorer'||app?.mode==='reveal')&&event.target.closest('.navigable-map')){
    const matrix=app.svg.getScreenCTM();
    if(app.pan.begin(event,app.svg,app.view,matrix?.inverse(),(event.target.closest('[data-country],[data-territory]')?.dataset.country||event.target.closest('[data-territory]')?.dataset.territory)))event.preventDefault();
    return;
  }
  const source=event.target.closest('[data-piece]');
  if(!app?.isPuzzle||!source||source.disabled)return;
  const c=app.byId.get(source.dataset.piece);
  if(app.drag.begin(event,c,source)){
    event.preventDefault();app.suppressClick=true;app.currentId=c.id;app.armed=null;
    app.message='Place '+c.name+(c.inset?' in the enlarged inset.':'.');app.paint();
  }
});
document.addEventListener('pointermove',event=>{if(app?.pan.move(event)||app?.drag.move(event))event.preventDefault();},{passive:false});
document.addEventListener('pointerup',event=>{if(!app?.pan.finish(event))app?.drag.finish(event);});
for(const type of ['pointercancel','lostpointercapture'])document.addEventListener(type,event=>{app?.pan.lost(event);app?.drag.lost(event);});
document.addEventListener('keydown',event=>{
  if(!app)return;
  if(event.key==='Escape'){
    app.pan.cancel();app.drag.cancel();app.armed=null;app.message='Selection cancelled.';app.paint();return;
  }
  const target=event.target.closest('[data-country],[data-territory],[data-inset-hit]');
  if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
function abandon(){app?.pan.cancel();if(app?.drag.active){app.drag.cancel();app.message='Drag cancelled. Try again.';app.paint();}}
for(const type of ['blur','resize'])window.addEventListener(type,abandon);
window.addEventListener('resize',()=>{if(app?.mode==='reveal')app.paint();else app?.positionLabel();});
window.addEventListener('scroll',abandon,true);
document.addEventListener('visibilitychange',abandon);
window.addEventListener('popstate',navigate);
window.addEventListener('pagehide',()=>{app?.pan.cancel();app?.drag.cancel();});
navigate();
