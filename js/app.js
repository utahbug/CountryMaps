import {MnemonicPlayer} from '../lib/mnemonics.mjs';
import {learningFilters,filteredUnits} from '../lib/practice-subsets.mjs';
import {unitPresentation,unitSvgAttributes,unitLegend} from '../lib/unit-presentation.mjs';
import {terminology,mapDefinitions} from '../lib/map-configs.mjs?v=planned-areas';
import {draggedBounds,dragPreviewGeometry,acceptsInsetDrop,acceptsGeometryDrop,acceptsIslandDrop} from '../lib/drop-validation.mjs?v=puzzle-cleanup';
import {practiceSet,fittedRegion,countryRegion,countryRegionId,groupedCountries} from '../lib/regions.mjs';
import {loadMap,registry,modes,titles,findCountries,insetTransform,pieceDisplayViewBox,usesPieceScaleFrame,escapeHTML as esc} from '../lib/maps.js';
import {ExplorerEngine,RevealEngine,PuzzleEngine} from '../lib/engines/activities.mjs';
import {DragController} from '../lib/engines/drag-controller.mjs';
import {placeRevealLabels} from '../lib/reveal-labels.mjs';
import {placeCountryLabel} from '../lib/label-placement.mjs';
import {PanController,clampPan} from '../lib/engines/pan-controller.mjs';

// Resolve from the shared module, never from the current nested route.
const projectRoot=new URL('../',import.meta.url);
document.querySelector('base').href=projectRoot.href;
const mapEntry=id=>id==='africa'?new URL('africa/',projectRoot).pathname:projectRoot.pathname+'?map='+encodeURIComponent(id);
const root=document.querySelector('#main');
const q=(selector,scope=root)=>scope.querySelector(selector);
let app=null;
let navigationVersion=0;
const controlIcons={
  filter:'<path d="M3 5h18M6 12h12M9 19h6"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/>',
  explorer:'<circle cx="10" cy="10" r="5.5"/><path d="m14.5 14.5 5 5"/>',
  reveal:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  reference:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>',
  puzzle:'<path d="M4 4h6a2.3 2.3 0 1 0 4 0h6v6a2.3 2.3 0 1 0 0 4v6h-6a2.3 2.3 0 1 0-4 0H4v-6a2.3 2.3 0 1 0 0-4Z"/>',
  reset:'<path d="M5 8a8 8 0 1 1-1 7"/><path d="M5 3v5h5"/>',
  panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  clue:'<path d="M9 18h6M10 21h4"/><path d="M8.2 14.5A6 6 0 1 1 15.8 14.5c-1 .8-1.4 1.5-1.4 2.5h-4.8c0-1-.4-1.7-1.4-2.5Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>',
  activate:'<path d="m5 12 4 4L19 6"/>',
  previous:'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  next:'<path d="M12 4v16m-6-6 6 6 6-6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon=name=>'<svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+controlIcons[name]+'</svg>';
const compactButton=(action,label,iconName,extra='')=>'<button type="button" class="icon-control"'+(action?' data-action="'+action+'"':'')+' aria-label="'+label+'" title="'+label+'" data-tooltip="'+label+'" '+extra+'>'+icon(iconName)+'<span class="sr-only">'+label+'</span></button>';

class CountryMaps {
  constructor(data) {
    this.config=data.config;this.terms=terminology(this.config);this.regions=this.config.regions||{all:{name:'All '+data.name,ids:null,context:null}};this.fullData=data;this.data=data;this.region='all';this.fitView={x:0,y:0,w:data.width,h:data.height};this.clue={country:null,level:0};this.clueTimer=null;this.dropSamples=new Map();
    const ids=data.units.map(c=>c.id);
    this.engines={explorer:new ExplorerEngine(ids),reveal:new RevealEngine(ids),puzzle:new PuzzleEngine(ids)};
    this.byId=new Map([...data.units,...data.context].map(c=>[c.id,c]));
    this.mnemonics=new MnemonicPlayer();this.pieceFilter='az';this.listOrder='az';this.openRegion=null;this.mode='home';this.selected=null;this.armed=null;this.currentId=ids[0];this.panelHidden=false;
    this.view={...this.fitView};this.suppressClick=false;this.query='';this.message='';
    this.pan=new PanController(view=>{if(this.phoneReveal)return;this.view=view;this.svg.setAttribute('viewBox',[view.x,view.y,view.w,view.h].join(' '));this.positionLabel();},id=>this.select(this.byId.get(id)),{width:data.width,height:data.height});
    this.drag=new DragController(state=>this.paintDrag(state),(c,x,y,stationary)=>this.drop(c,x,y,stationary));
  }
  isIsland(c){return this.config.practiceSubsets?.islands?.ids.includes(c?.id)||false;}
  get puzzleUnits(){return filteredUnits(this.data.units,learningFilters(this.config)[this.pieceFilter]);}
  get phoneReveal(){return this.mode==='reveal'&&this.config.activities.reveal.phoneNavigation===false&&window.matchMedia('(max-width: 650px)').matches;}
  get preview(){return this.mode==='puzzle'&&this.engines.puzzle.preview;}
  get isPuzzle(){return this.mode==='puzzle'&&!this.preview;}
  get revealed(){return this.mode==='reveal'?this.engines.reveal.revealed:this.preview?new Set(this.data.units.map(c=>c.id)):this.engines.puzzle.placed;}
  href(mode){if(mode==='home'&&this.data.id==='africa')return mapEntry('africa');return '?map='+this.data.id+(mode==='home'?'':'&mode='+mode)+(['explorer','reveal'].includes(mode)&&this.region!=='all'?'&region='+this.region:'');}
  enter(mode,region='all') {
    if(this.config.mapOnly){mode='explorer';region='all';}
    this.mnemonics.reset();this.clearClue();this.pan.cancel();this.drag.cancel();this.toolLifecycle?.abort();
    const nextRegion=['explorer','reveal'].includes(mode)&&Object.hasOwn(this.regions,region)?region:'all';
    const subset=nextRegion==='all'?this.fullData:practiceSet(this.fullData,nextRegion);
    this.data=mode==='explorer'?this.fullData:subset;this.fitView=fittedRegion(subset,nextRegion);
    this.byId=new Map([...this.data.units,...this.data.context].map(c=>[c.id,c]));
    if(nextRegion!==this.region){
      this.engines.explorer=new ExplorerEngine(this.fullData.units.map(c=>c.id));
    }
    const revealIds=subset.units.map(c=>c.id);
    if(revealIds.length!==this.engines.reveal.ids.size||revealIds.some(id=>!this.engines.reveal.ids.has(id)))this.engines.reveal=new RevealEngine(revealIds);
    this.region=nextRegion;this.openRegion=nextRegion==='all'?null:nextRegion;this.currentId=this.data.units[0].id;
    this.mode=mode;if(mode==='puzzle'&&!this.puzzleUnits.some(c=>c.id===this.currentId))this.currentId=this.puzzleUnits[0].id;this.armed=null;this.selected=null;this.query='';this.view={...this.fitView};this.panelHidden=false;
    this.engines.puzzle.preview=false;
    this.message=mode==='explorer'?'Choose a '+this.terms.singular+' on the map or in the list.':mode==='reveal'?'Tap a '+this.terms.singular+' to reveal its name.':'Drag a piece onto its matching shape.';
    document.title='CountryMaps · '+this.data.name+(this.config.mapOnly?' · Map view':titles[mode]?' · '+titles[mode]:'');
    document.querySelector('#data-note').textContent=this.data.units.length+' '+this.terms.plural+' · educational map'+(this.data.context.length?' · Context: '+this.data.context.map(c=>c.name).join(', '):'')+'.';
    if(mode==='home')this.renderLanding();else this.renderActivity();
    this.registerTool();
  }
  renderLanding() {
    const descriptions=['Find a '+this.terms.singular+' and get to know its shape.','Uncover the map, one '+this.terms.singular+' at a time.','Put each '+this.terms.singular+' in its place.'];
    root.innerHTML='<p class="eyebrow">'+esc(this.config.eyebrow||'LEARN THE MAP')+'</p><div class="landing-layout"><div><h1>'+esc(this.data.name)+'</h1><p class="landing-intro">'+this.data.units.length+' '+this.terms.plural+'. Three ways to learn the map.</p><div class="activity-cards">'+modes.map((mode,i)=>'<a href="'+this.href(mode)+'"><span class="activity-number">0'+(i+1)+'</span><h2>'+titles[mode]+'</h2><p>'+descriptions[i]+'</p><strong>Open '+titles[mode]+' →</strong></a>').join('')+'</div></div><svg class="landing-map" viewBox="0 0 '+this.fullData.width+' '+this.fullData.height+'" role="img" aria-label="Map of '+esc(this.data.name)+'">'+this.data.context.map(c=>'<path d="'+c.path+'" fill="#e4e0d8"/>').join('')+this.data.units.map(c=>'<path d="'+c.path+'" '+unitSvgAttributes(this.config,c,{stroke:'#fffdf8','stroke-width':1})+'/>').join('')+'</svg></div>';
  }
  renderActivity() {
    const name=esc(this.data.name);
    const puzzlePage=this.mode==='puzzle';
    const modeLinks=(this.config.mapOnly?['explorer']:modes).map(m=>!this.config.mapOnly?'<a class="icon-control" href="'+this.href(m)+'" aria-label="Go to '+titles[m]+' mode" title="Go to '+titles[m]+' mode" data-tooltip="Go to '+titles[m]+' mode"'+(m===this.mode?' aria-current="page"':'')+'>'+icon(m)+'<span class="sr-only">'+titles[m]+'</span></a>':'<a href="'+this.href(m)+'"'+(m===this.mode?' aria-current="page"':'')+'>'+(this.config.mapOnly?'Map view':titles[m])+'</a>').join('');
    const activityToolbar=(puzzlePage?compactButton('preview','Reveal puzzle reference/answer map','reference'):this.mode==='reveal'?compactButton('reveal-all','Reveal All','reveal'):'')+compactButton('reset','Reset '+titles[this.mode],'reset')+compactButton('toggle-panel','Hide country pieces','panel','aria-controls="activity-side-panel" aria-expanded="true"')+'<button type="button" class="icon-control" popovertarget="puzzle-instructions" aria-label="'+titles[this.mode]+' instructions" title="'+titles[this.mode]+' instructions" data-tooltip="Instructions">'+icon('info')+'<span class="sr-only">'+titles[this.mode]+' instructions</span></button>';
    const clueRow=puzzlePage?'<div class="puzzle-clue" hidden><p id="clue-text" role="status" aria-live="polite" aria-atomic="true" hidden></p>'+compactButton('clue','Clue','clue','aria-describedby="clue-text"')+'<span class="map-progress"></span></div>':'<span class="map-progress"></span>';
    const activityTitle=this.config.mapOnly?'<a class="back-link" href="'+this.href('home')+'" hidden>← '+name+'</a><h1>'+name+' <span>/ Map view</span></h1>':'<h1><a class="back-link activity-home-link" href="'+this.href('home')+'" aria-label="Back to '+esc(this.fullData.name)+' landing page"><span aria-hidden="true">← </span>'+esc(this.fullData.name)+'</a> <span>/ '+titles[this.mode]+'</span></h1>';
    root.innerHTML='<div class="puzzle-top-shell">'+'<div class="activity-heading compact-heading'+(puzzlePage?' puzzle-heading':'')+'"><div>'+activityTitle+'</div><nav class="mode-links" aria-label="'+name+' activities">'+modeLinks+'</nav></div>'+
    '<div class="activity-commandbar puzzle-commandbar"><div class="toolbar">'+'<div class="toolbar-actions">'+activityToolbar+'</div></div>'+
    ('<div id="puzzle-instructions" class="instructions-popover" popover role="dialog" aria-labelledby="puzzle-instructions-title"><div><strong id="puzzle-instructions-title">How to play</strong>'+compactButton('', 'Close instructions','close','popovertarget="puzzle-instructions" popovertargetaction="hide"')+'</div><p id="instructions"></p></div>')+
    (['explorer','reveal'].includes(this.mode)?'<div class="region-control"><label for="practice-region">'+(this.mode==='explorer'?'Map area':'Practice region')+'</label><select id="practice-region" aria-describedby="region-help">'+Object.entries(this.regions).map(([id,r])=>'<option value="'+id+'"'+(id===this.region?' selected':'')+'>'+r.name+'</option>').join('')+'</select><p id="region-help">'+this.data.units.length+(this.mode==='explorer'?' '+this.terms.plural+' searchable in every map area.':' '+this.terms.plural+' · Changing regions starts a fresh practice set.')+'</p></div>':'')+'</div>'+'</div>'+
    '<div class="workspace"><section class="map-panel" aria-label="'+name+' map"><div class="map-readout'+(puzzlePage?' puzzle-readout':'')+'"><strong></strong>'+clueRow+'</div>'+(this.config.mapOnly?unitLegend(this.config):'')+'<div class="map-viewport"><div class="reveal-label-layer" aria-hidden="true"></div><svg class="selected-label-leader" aria-hidden="true"></svg><div class="selected-country-overlay" hidden aria-hidden="true"></div><aside class="special-status-card" hidden aria-live="polite"></aside><svg id="africa-map" class="map-canvas" viewBox="0 0 '+this.fullData.width+' '+this.fullData.height+'" role="group" aria-label="Interactive '+name+' '+this.terms.singular+' map">'+
    '<defs><pattern id="territory-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e6e2d7"/><path d="M0 8L8 0" stroke="#aaa391" stroke-width="1"/></pattern></defs>'+
    this.data.units.map((c,i)=>'<g><path data-country="'+c.id+'" data-name="'+esc(c.name)+'" data-anchor-x="'+((c.anchor[0]-c.bounds[0])/(c.bounds[2]-c.bounds[0]))+'" data-anchor-y="'+((c.anchor[1]-c.bounds[1])/(c.bounds[3]-c.bounds[1]))+'" class="country" d="'+c.path+'" role="button" tabindex="0" aria-pressed="false"><title></title></path><text hidden data-number="'+c.id+'" class="country-number" x="'+c.anchor[0]+'" y="'+c.anchor[1]+'">'+(i+1)+'</text></g>').join('')+
    this.data.context.map(c=>'<g class="territory-geometry"><path data-territory="'+c.id+'" d="'+c.path+'" class="context-region" role="button" tabindex="0" aria-label="'+esc(c.name+' — '+c.classification)+'" aria-pressed="false"><title>'+esc(c.name+' — '+c.classification)+'</title></path>'+(this.data.id==='africa'?'':'<text data-territory-label="'+c.id+'" class="territory-map-label" text-anchor="middle" x="'+c.anchor[0]+'" y="'+(c.anchor[1]-8)+'">'+esc(c.name+(this.config.mapOnly&&c.parentSovereignState?' — '+c.parentSovereignState.name:''))+'</text>')+'</g>').join('')+'<circle hidden class="location-marker"/><g id="inset-layer"></g></svg></div><div class="map-tools" aria-label="Map view controls">'+
    '<button data-action="zoom-in" aria-label="Zoom in">+</button><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="fit">Fit map</button><button data-action="left" aria-label="Pan left">←</button><button data-action="up" aria-label="Pan up">↑</button><button data-action="down" aria-label="Pan down">↓</button><button data-action="right" aria-label="Pan right">→</button></div><div class="map-caption"></div>'+(this.config.mapOnly?'':unitLegend(this.config))+'<p class="territory-legend"><span aria-hidden="true"></span>Special-status area — tap for details. Outside the '+this.fullData.units.length+'-'+this.terms.singular+' score.</p></section><aside id="activity-side-panel" class="side-panel"></aside></div>'+
    '<p role="status" aria-live="polite" class="status" data-active-pointer=""></p><div class="completion" hidden><h2>'+name+', complete.</h2><p>All '+this.data.units.length+' '+this.terms.plural+' are in place.</p><button data-action="reset">Play again</button></div>';
    this.svg=q('#africa-map');
    this.renderSide();this.paint();
  }
  renderSide() {
    if(this.isPuzzle){
      const trayUnits=this.puzzleUnits;
      q('.side-panel').innerHTML='<div class="panel-title"><h2>'+this.terms.title+' pieces</h2><button class="icon-control" type="button" popovertarget="piece-filter-menu" aria-label="Filter or sort pieces" title="Filter or sort pieces">'+icon('filter')+'</button></div><p class="subset-progress" aria-live="polite"></p><div id="piece-filter-menu" class="filter-popover" popover aria-label="Piece filters"><div role="group" aria-label="Choose pieces">'+Object.entries(learningFilters(this.config)).map(([id,f])=>'<button type="button" data-piece-filter="'+id+'" aria-pressed="'+(this.pieceFilter===id)+'">'+esc(f.name)+'</button>').join('')+'</div></div><progress hidden max="'+this.data.units.length+'" value="0" aria-label="'+this.terms.pluralTitle+' placed"></progress><div id="piece-tray" class="piece-tray" aria-label="Unplaced '+this.terms.plural+'">'+
      trayUnits.concat(this.data.units.filter(c=>!trayUnits.includes(c))).map(c=>'<button data-piece="'+c.id+'" class="piece'+(usesPieceScaleFrame(c)?' small-scale-piece':'')+'" aria-label="Piece: '+esc(c.name)+'" aria-pressed="false"><svg aria-hidden="true" viewBox="'+pieceDisplayViewBox(c)+'"><path d="'+c.path+'" '+unitSvgAttributes(this.config,c)+'/></svg><span>'+esc(c.name)+'</span>'+'</button>').join('')+'</div>';
    }else{
      q('.side-panel').innerHTML='<h2>'+(this.mode==='explorer'?'Find a '+this.terms.singular+'':''+this.terms.title+' names')+'</h2>'+(this.mode==='explorer'?'<div class="list-order" role="group" aria-label="'+this.terms.title+' list organization"><button data-list-order="az">A–Z</button><button data-list-order="region"'+(this.config.regions?'':' hidden disabled')+'>By region</button></div><p class="list-help" hidden>Select a heading to fit its region. Use + / − to expand or collapse the list.</p>':'')+'<label for="country-search"'+(this.mode==='reveal'?' class="sr-only"':'')+'>Search '+this.terms.plural+'</label><input id="country-search" type="search" placeholder="'+this.terms.title+' name…" autocomplete="off"><div class="country-list"></div><section class="territory-section" aria-label="Territories and disputed areas"><h3>Territories &amp; disputed areas</h3><p>Hatched areas are geographic context, separate from the '+this.fullData.units.length+'-'+this.terms.singular+' score.</p><div class="territory-list"></div></section>';
      q('#country-search').value=this.query;this.renderList();
    }
  }
  orderPuzzleTray(){
    const tray=q('#piece-tray');
    if(!this.isPuzzle||!tray)return;
    const cards=[...tray.querySelectorAll('[data-piece]')];
    const placed=this.engines.puzzle.placed;
    const units=this.puzzleUnits;
    const ids=new Set(units.map(c=>c.id));
    const order=[...units.filter(c=>!placed.has(c.id)),...units.filter(c=>placed.has(c.id)),...this.data.units.filter(c=>!ids.has(c.id))];
    if(order.every((c,i)=>cards[i]?.dataset.piece===c.id))return;
    // Retain the first visible unplaced card's screen position where possible.
    // Reuse nodes so selection, pointer handlers and completion styling survive.
    const box=tray.getBoundingClientRect(),top=tray.scrollTop;
    const anchor=cards.find(el=>!el.hidden&&!placed.has(el.dataset.piece)&&el.getBoundingClientRect().bottom>box.top&&el.getBoundingClientRect().top<box.bottom);
    const anchorTop=anchor?.getBoundingClientRect().top;
    const focused=tray.contains(document.activeElement)?document.activeElement:null;
    const nodes=new Map(cards.map(el=>[el.dataset.piece,el]));
    for(const c of order)tray.append(nodes.get(c.id));
    if(focused&&!focused.disabled)focused.focus({preventScroll:true});
    tray.scrollTop=anchor?tray.scrollTop+anchor.getBoundingClientRect().top-anchorTop:top;
  }
  renderList(){
    const matches=findCountries(this.data,this.query),revealed=this.revealed;
    const rowHTML=c=>{
      const i=this.data.units.indexOf(c),known=this.mode==='explorer'||revealed.has(c.id);
      return '<button'+(this.mode!=='explorer'?' aria-pressed="'+known+'"':'')+' data-list-country="'+c.id+'" class="'+(this.selected===c.id?'active':'')+'" aria-label="'+esc(this.mode==='reveal'?(known?'Hide '+c.name:'Reveal '+this.terms.singular+' '+(i+1)):c.name)+'"><span class="list-number">'+(i+1)+'</span><span class="list-name">'+esc(known?c.name+(this.config.mapOnly&&unitPresentation(this.config,c).label?' — '+unitPresentation(this.config,c).label:''):''+this.terms.title+' '+(i+1))+'</span>'+'</button>';
    };
    if(this.mode==='explorer')q('.list-help').hidden=this.listOrder!=='region';
    if(this.mode==='explorer')for(const button of root.querySelectorAll('[data-list-order]'))button.setAttribute('aria-pressed',String(button.dataset.listOrder===this.listOrder));
    q('.country-list').innerHTML=!matches.length?'<p>No '+this.terms.plural+' found.</p>':this.mode==='explorer'&&this.listOrder==='region'&&this.config.regions?groupedCountries(matches,this.regions).filter(group=>group.countries.length).map(group=>{
      const open=!!this.query.trim()||this.openRegion===group.id;
      return '<section class="country-region"><div class="region-heading"><h3><button data-focus-region="'+group.id+'" aria-pressed="'+(this.region===group.id)+'" aria-label="Fit '+group.name+'">'+group.name+' <span>'+group.countries.length+'</span></button></h3><button data-toggle-region="'+group.id+'"'+(this.query.trim()?' disabled':'')+' aria-label="'+(open?'Collapse ':'Expand ')+group.name+'" aria-expanded="'+open+'" aria-controls="countries-'+group.id+'">'+(open?'−':'+')+'</button></div><div id="countries-'+group.id+'"'+(open?'':' hidden')+'>'+group.countries.map(rowHTML).join('')+'</div></section>';
    }).join(''):matches.map(rowHTML).join('');
    q('.territory-list').innerHTML=findCountries({units:this.data.context},this.query).map(c=>'<button data-list-country="'+c.id+'" class="territory-choice" aria-pressed="'+(this.selected===c.id)+'"><strong>'+esc(c.name)+'</strong><span>'+esc(c.classification)+'</span></button>').join('')||'<p>No matching territories.</p>';
  }
  focusRegion(id){
    if(this.mode!=='explorer'||!Object.hasOwn(this.regions,id))return;
    this.pan.cancel();this.region=id;this.fitView=fittedRegion(practiceSet(this.fullData,id),id);this.view={...this.fitView};
    this.openRegion=id==='all'?null:id;
    if(id!=='all'&&this.selected&&!this.regions[id].ids.includes(this.selected)){this.selected=null;this.engines.explorer.reset();}
    const url=new URL(location.href);if(id==='all')url.searchParams.delete('region');else url.searchParams.set('region',id);
    history.replaceState({},'',url);
    q('#practice-region').value=id;
    for(const link of root.querySelectorAll('.mode-links a')){const mode=new URL(link.href).searchParams.get('mode');link.setAttribute('href',this.href(mode));}
    this.message=id==='all'?''+this.regions.all.name+' fitted.':this.regions[id].name+' fitted. '+this.terms.title+' selections keep this view; use '+this.regions.all.name+' to return.';
    this.renderList();this.paint();
  }
  paint(){
    if(this.mode==='home')return;
    if(this.phoneReveal)this.view={...this.fitView};
    const trayIds=this.isPuzzle?new Set(this.puzzleUnits.map(c=>c.id)):null;
    const revealed=this.revealed,current=this.byId.get(this.currentId),chosen=this.byId.get(this.selected);
    const inset=this.isPuzzle&&current?.inset&&!this.isIsland(current)?current:null;
    const identified=chosen&&(this.mode!=='reveal'||chosen.classification||revealed.has(chosen.id));
    q('.workspace').classList.toggle('puzzle-workspace',this.isPuzzle);
    q('.workspace').classList.toggle('phone-reveal',this.phoneReveal);
    q('.workspace').classList.toggle('regional-explorer',this.mode==='explorer'&&this.region!=='all');
    q('.workspace').classList.toggle('reveal-workspace',this.mode==='reveal');
    q('.workspace').classList.toggle('panel-collapsed',this.panelHidden);
    q('.side-panel').hidden=this.panelHidden;
    const panelToggle=q('[data-action="toggle-panel"]');
    const panelLabel=this.panelHidden?'Show '+(this.isPuzzle?'country pieces':'list'):'Hide '+(this.isPuzzle?'country pieces':'list');
    if(panelToggle.classList.contains('icon-control')){panelToggle.setAttribute('aria-label',panelLabel);panelToggle.setAttribute('title',panelLabel);panelToggle.dataset.tooltip=panelLabel;panelToggle.querySelector('.sr-only').textContent=panelLabel;}else panelToggle.textContent=panelLabel;
    panelToggle.setAttribute('aria-expanded',String(!this.panelHidden));
    q('#instructions').textContent=this.phoneReveal?'Tap a '+this.terms.singular+' to reveal or hide its name. '+this.data.name+' stays fitted while you study.':this.mode==='explorer'?(this.region==='all'?'Select a '+this.terms.singular+' in the full map. Repeat the selection to toggle '+this.terms.singular+' focus.':'Select '+this.terms.plural+' while the regional view stays in place. Use '+this.regions.all.name+' to restore the full map.'):this.mode==='reveal'?'Tap a '+this.terms.singular+' to reveal or hide its name. Your map view stays in place.':this.preview?'The answer map. Your placed pieces are saved.':'Drag a piece to its shape, or select it and tap a location.';
    q('.map-readout strong').textContent=(identified?chosen.name+(unitPresentation(this.config,chosen).label?' — '+unitPresentation(this.config,chosen).label:''):null)||(this.isPuzzle?current.name:null)||(this.mode==='explorer'&&this.region!=='all'?this.regions[this.region].name:this.data.name);
    q('.map-progress').textContent=this.mode==='explorer'?this.data.units.length+' '+this.terms.plural+(this.config.mapOnly&&this.data.context.length?' + '+this.data.context.length+' territorial unit':''):revealed.size+' / '+this.data.units.length+(this.mode==='reveal'||this.preview?' revealed':' placed');
    q('.map-tools').hidden=this.isPuzzle||this.phoneReveal;
    q('.territory-legend').hidden=!this.data.context.length;
    const territorySection=q('.territory-section');if(territorySection)territorySection.hidden=!this.data.context.length;
    this.svg.classList.toggle('puzzle-map',this.isPuzzle);
    this.svg.classList.toggle('explorer-map',this.mode==='explorer');
    q('[data-action="fit"]').textContent=this.mode==='explorer'?''+this.regions.all.name+' / Fit map':'Fit map';
    this.svg.classList.toggle('navigable-map',this.mode==='explorer'||this.mode==='reveal');
    const specialContext=this.data.id==='africa'&&!!chosen?.classification;
    const overlay=q('.selected-country-overlay');
    overlay.textContent=identified&&!specialContext?(chosen.classification?chosen.name+' — '+chosen.classification:chosen.name):'';
    overlay.hidden=!identified||this.mode!=='explorer'||specialContext;
    const special=q('.special-status-card');
    special.innerHTML=specialContext?'<strong>'+esc(chosen.name)+'</strong><span>'+esc(chosen.classification)+'</span><p>'+esc(chosen.description||'Special-status geographic area; outside the scored country set.')+'</p>':'';
    special.hidden=!specialContext||this.mode==='puzzle';
    const labels=q('.reveal-label-layer');
    labels.innerHTML=this.mode==='reveal'?this.data.units.filter(c=>revealed.has(c.id)).map(c=>'<div class="reveal-country-label" data-reveal-country="'+c.id+'">'+esc(c.name)+'</div>').join(''):'';
    this.svg.setAttribute('viewBox',[this.view.x,this.view.y,this.view.w,this.view.h].join(' '));
    for(const [i,c] of this.data.units.entries()){
      const path=q('[data-country="'+c.id+'"],[data-territory="'+c.id+'"]'),shown=this.mode==='explorer'?this.selected===c.id:revealed.has(c.id);
      path.classList.toggle('outside-region',this.mode==='explorer'&&this.region!=='all'&&!this.regions[this.region].ids.includes(c.id));
      path.classList.toggle('shown',shown);path.classList.toggle('selected',this.selected===c.id);path.classList.toggle('puzzle-country',this.isPuzzle);
      const presentation=unitPresentation(this.config,c);
      path.style.fill=(shown||presentation.label||this.config.mapOnly)?presentation.fill:'';
      if(presentation.label){path.style.strokeDasharray=presentation.dash;path.style.vectorEffect='non-scaling-stroke';path.style.strokeWidth='1.5px';}
      path.setAttribute('aria-pressed',String(shown));
      path.setAttribute('aria-label',this.isPuzzle&&!shown?'Unplaced location '+(i+1):this.mode==='reveal'&&!shown?'Reveal '+this.terms.singular+' '+(i+1):c.name);
      path.querySelector('title').textContent=this.mode==='explorer'||shown?c.name:''+this.terms.title+' '+(i+1);
      q('[data-number="'+c.id+'"]').toggleAttribute('hidden',this.mode==='puzzle'||!shown||this.mode==='explorer');
      if(this.isPuzzle){
        const piece=q('[data-piece="'+c.id+'"]'),placed=this.engines.puzzle.placed.has(c.id);
        piece.hidden=!trayIds.has(c.id);piece.disabled=placed;piece.classList.toggle('current-piece',this.currentId===c.id);
        piece.setAttribute('aria-pressed',String(this.armed===c.id));piece.querySelector('span').textContent=(placed?'✓ ':'')+c.name+(presentation.label?' — '+presentation.label:'');
      }else{
        const row=q('[data-list-country="'+c.id+'"]');
        if(row){row.classList.toggle('active',this.selected===c.id);if(this.mode!=='explorer'){const known=revealed.has(c.id);row.setAttribute('aria-pressed',String(known));row.querySelector('.list-name').textContent=known?c.name:''+this.terms.title+' '+(i+1);row.setAttribute('aria-label',known?'Hide '+c.name:'Reveal '+this.terms.singular+' '+(i+1));}}
      }
    }
    const marker=q('.location-marker');
    marker.toggleAttribute('hidden',!chosen||this.isPuzzle);
    if(chosen){marker.setAttribute('cx',chosen.anchor[0]);marker.setAttribute('cy',chosen.anchor[1]);marker.setAttribute('r',Math.max(2,this.view.w/140));}
    for(const territory of this.data.context){
      const shape=q('[data-territory="'+territory.id+'"]'),selected=this.selected===territory.id;
      shape.classList.toggle('selected',selected);shape.setAttribute('aria-pressed',String(selected));
      shape.style.pointerEvents=this.mode==='puzzle'?'none':'';
      shape.parentElement.classList.toggle('puzzle-context-hidden',this.mode==='puzzle'&&this.engines.puzzle.ids.has(territory.puzzleGroup));
      shape.setAttribute('tabindex',this.mode==='puzzle'?'-1':'0');
      const row=q('[data-list-country="'+territory.id+'"]');if(row){row.classList.toggle('active',selected);row.setAttribute('aria-pressed',String(selected));}
    }
    this.paintInset(inset);
    if(this.isPuzzle&&this.isIsland(current)){const scale=this.svg.getScreenCTM()?.a||1;q('#inset-layer').innerHTML='<circle data-island-hit="'+current.id+'" cx="'+current.anchor[0]+'" cy="'+current.anchor[1]+'" r="'+26/scale+'" fill="transparent" aria-hidden="true"/>';q('#inset-layer').dataset.country='island-'+current.id;}
    this.paintClue();
    q('.map-caption').textContent=this.phoneReveal?'Tap to reveal / hide. Use Explorer for zooming and closer inspection.':this.isPuzzle?(this.isIsland(current)?'Drop or tap near the island’s ocean location.':inset?'Drop inside the enlarged helper inset. The ring marks its real location.':'Pieces snap when dropped inside their matching '+this.terms.singular+'.'):this.mode==='explorer'?(this.region==='all'?'Drag to pan · Repeat a selection to toggle focus / full map.':this.regions[this.region].name+' · '+this.terms.title+' selections keep your zoom and pan.'):'Tap to reveal / hide · Drag to pan · Fit map restores the practice area.';
    if(this.isPuzzle){
      this.orderPuzzleTray();
      const subset=this.puzzleUnits,subsetPlaced=subset.filter(c=>this.engines.puzzle.placed.has(c.id)).length;
      q('.subset-progress').textContent=learningFilters(this.config)[this.pieceFilter].name+(this.pieceFilter==='az'?'':' · '+subsetPlaced+' / '+subset.length)+(this.pieceFilter==='az'?'':' in subset');
      q('progress').value=this.engines.puzzle.placed.size;
      q('.subset-progress').hidden=this.pieceFilter==='az';
      const filterButton=q('[popovertarget="piece-filter-menu"]');
      const filterLabel='Filter or sort pieces: '+learningFilters(this.config)[this.pieceFilter].name;
      filterButton.setAttribute('aria-label',filterLabel);filterButton.title=filterLabel;
    }
    const previewButton=q('[data-action="preview"]');if(previewButton){const label=this.preview?'Return to Puzzle':'Reveal puzzle reference/answer map';if(previewButton.classList.contains('icon-control')){previewButton.setAttribute('aria-label',label);previewButton.setAttribute('title',label);previewButton.dataset.tooltip=label;previewButton.querySelector('.sr-only').textContent=label;}else previewButton.textContent=label;}
    for(const action of ['zoom-out','left','right','up','down'])q('[data-action="'+action+'"]').disabled=this.view.w===this.fitView.w&&(action==='zoom-out'||!(this.mode==='explorer'||this.mode==='reveal'));
    q('.completion').hidden=!(this.isPuzzle&&this.engines.puzzle.placed.size===this.data.units.length);
    if(this.config.mapOnly){q('.back-link').hidden=true;q('.region-control').hidden=true;q('.list-order').hidden=true;const legend=q('.territory-legend');if(this.data.context.length)legend.innerHTML='French Guiana — France · Overseas department/region, separate from the 12 sovereign countries.';const section=q('.territory-section');if(section){section.querySelector('h3').textContent='Territorial unit';section.querySelector('p').textContent='Identified separately from sovereign countries.';}}
    q('.status').textContent=this.message;
    this.positionLabel();
  }
  positionRevealLabels(){
    const layer=q('.reveal-label-layer'),labels=[...layer.querySelectorAll('.reveal-country-label')];
    if(!labels.length)return;
    const frame=layer.getBoundingClientRect(),matrix=this.svg.getScreenCTM();
    if(!matrix||!frame.width)return;
    const viewport={w:frame.width,h:frame.height};
    layer.classList.toggle('dense',labels.length>18);
    const measure=()=>labels.map(label=>{
      const c=this.byId.get(label.dataset.revealCountry),b=q('[data-country="'+c.id+'"]').getBoundingClientRect();
      const a=new DOMPoint(...c.anchor).matrixTransform(matrix),size=label.getBoundingClientRect();
      const country={x:b.left-frame.left,y:b.top-frame.top,w:b.width,h:b.height};
      const neighbors=[...this.svg.querySelectorAll('path[data-country],.context-region')].filter(p=>p!==q('[data-country="'+c.id+'"]')).map(p=>{const n=p.getBoundingClientRect();return {x:n.left-frame.left,y:n.top-frame.top,w:n.width,h:n.height};});
      return {id:c.id,w:size.width,h:size.height,anchor:{x:a.x-frame.left,y:a.y-frame.top},country,neighbors,fitsInside:country.w>=size.width*1.45&&country.h>=size.height*1.35};
    });
    for(const label of labels){label.style.width='';label.style.maxWidth='';}
    let items=measure(),positions=placeRevealLabels(viewport,items);
    // Dense maps use measured columns if adjacent placements cannot all fit.
    if(!positions){
      layer.classList.add('dense');
      for(let columns=3;columns<=6&&!positions;columns++){
        const width=(viewport.w-16-(columns-1)*3)/columns;
        for(const label of labels){label.style.width=width+'px';label.style.maxWidth=width+'px';}
        items=measure();const heights=Array(columns).fill(8),candidate={};
        for(const item of [...items].sort((a,b)=>b.h-a.h)){
          const col=heights.indexOf(Math.min(...heights));
          candidate[item.id]={x:8+col*(width+3),y:heights[col],strategy:'lane'};heights[col]+=item.h+3;
        }
        if(Math.max(...heights)-3<=viewport.h-8)positions=candidate;
      }
    }
    layer.querySelector('.reveal-connectors')?.remove();
    const connectors=document.createElementNS('http://www.w3.org/2000/svg','svg');
    connectors.classList.add('reveal-connectors');connectors.setAttribute('viewBox','0 0 '+viewport.w+' '+viewport.h);
    layer.prepend(connectors);
    for(const item of items){
      const label=labels.find(el=>el.dataset.revealCountry===item.id);
      const point=positions?.[item.id]||placeCountryLabel({viewport,label:item,country:item.country,anchor:item.anchor,neighbors:item.neighbors,fitsInside:item.fitsInside});
      label.style.left=Math.max(8,Math.min(viewport.w-item.w-8,point.x))+'px';
      label.style.top=Math.max(8,Math.min(viewport.h-item.h-8,point.y))+'px';
      label.dataset.strategy=point.strategy||'adjacent';
      const x=parseFloat(label.style.left),y=parseFloat(label.style.top),fallbackEnd={x:Math.max(x,Math.min(x+item.w,item.anchor.x)),y:Math.max(y,Math.min(y+item.h,item.anchor.y))};
      const leader=point.leader||(point.strategy!=='inside'?{start:item.anchor,end:fallbackEnd}:null);
      if(leader){
        const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
        const {start,end}=leader,elbow=point.strategy==='lane'?{x:end.x,y:start.y}:null;
        line.setAttribute('points',[start,elbow,end].filter(Boolean).map(p=>p.x+','+p.y).join(' '));connectors.append(line);
      }
    }
  }
  positionLabel(){
    if(this.mode==='reveal')this.positionRevealLabels();
    const leader=q('.selected-label-leader');if(leader)leader.innerHTML='';
    if(!this.selected||!(this.mode==='explorer'||this.mode==='reveal'))return;
    const label=q('.selected-country-overlay');
    if(!label||label.hidden)return;
    const frame=q('.map-viewport').getBoundingClientRect();
    if(!frame.width||!frame.height)return;
    const rect=element=>{const b=element.getBoundingClientRect();return {x:b.left-frame.left,y:b.top-frame.top,w:b.width,h:b.height};};
    const c=this.byId.get(this.selected),path=q('[data-country="'+c.id+'"],[data-territory="'+c.id+'"]'),matrix=this.svg.getScreenCTM();
    if(!matrix)return;
    const point=new DOMPoint(...c.anchor).matrixTransform(matrix);
    const country=rect(path),labelSize={w:label.offsetWidth,h:label.offsetHeight},anchor={x:point.x-frame.left,y:point.y-frame.top};
    const position=placeCountryLabel({viewport:{w:frame.width,h:frame.height},label:labelSize,country,anchor,neighbors:[...this.svg.querySelectorAll('path[data-country],.context-region')].filter(p=>p!==path).map(rect),fitsInside:country.w>=labelSize.w*1.45&&country.h>=labelSize.h*1.35});
    label.style.left=position.x+'px';label.style.top=position.y+'px';
    label.dataset.strategy=position.strategy;
    if(position.leader&&leader){leader.setAttribute('viewBox','0 0 '+frame.width+' '+frame.height);leader.innerHTML='<polyline points="'+[position.leader.start,position.strategy==='lane'?{x:position.leader.end.x,y:position.leader.start.y}:null,position.leader.end].filter(Boolean).map(p=>p.x+','+p.y).join(' ')+'"/>';}
  }
  clearClue(){
    clearTimeout(this.clueTimer);this.clueTimer=null;
    this.clue={country:null,level:0};
    for(const target of root.querySelectorAll('.clue-target'))target.classList.remove('clue-target');
  }
  paintClue(){
    const bar=q('.puzzle-clue');if(!bar)return;
    const placed=this.engines.puzzle.placed.has(this.currentId);
    if(!this.isPuzzle||placed||this.clue.country!==this.currentId)this.clearClue();
    bar.hidden=!this.isPuzzle||this.config.activities.puzzle.clues===false;
    if(!this.isPuzzle)return;
    this.clue.country=this.currentId;
    const c=this.byId.get(this.currentId),region=countryRegion(c.id,this.regions);
    const clueButton=q('[data-action="clue"]'),clueLabel=this.clue.level?'Clue: highlight destination for '+c.name:'Clue: show region for '+c.name;
    clueButton.disabled=placed;clueButton.setAttribute('aria-label',clueLabel);clueButton.setAttribute('title',clueLabel);clueButton.dataset.tooltip=clueLabel;clueButton.querySelector('.sr-only').textContent=clueLabel;
    const clueText=q('#clue-text');
    clueText.textContent=placed?(this.engines.puzzle.placed.size===this.data.units.length?'Complete':'Choose another piece'):this.clue.level?(this.clue.level===1?(region?.name||this.fullData.name):this.clueTimer?'Location highlighted':'Show location again'):'';
    clueText.hidden=!clueText.textContent;
    bar.dataset.level=String(this.clue.level);
  }
  requestClue(){
    if(this.config.activities.puzzle.clues===false||!this.isPuzzle||this.drag.active||this.engines.puzzle.placed.has(this.currentId))return;
    this.paintClue();
    if(!this.clue.level){this.clue.level=1;this.paintClue();return;}
    clearTimeout(this.clueTimer);this.clue.level=2;
    const id=this.currentId;
    const targets=[...root.querySelectorAll('[data-country="'+id+'"],[data-inset-target="'+id+'"],[data-inset-hit="'+id+'"]')];
    for(const target of targets)target.classList.remove('clue-target');
    // Restart the pulse when a learner requests the destination again.
    void this.svg.getBoundingClientRect();
    for(const target of targets)target.classList.add('clue-target');
    this.clueTimer=setTimeout(()=>{
      for(const target of targets)target.classList.remove('clue-target');
      this.clueTimer=null;this.paintClue();
    },2800);
    this.paintClue();
  }
  paintInset(c){
    const layer=q('#inset-layer');if(layer.dataset.country===(c?.id||''))return;
    layer.dataset.country=c?.id||'';
    if(!c){layer.innerHTML='';return;}
    const t=insetTransform(c);
    layer.innerHTML='<g class="inset"><rect x="595" y="24" width="170" height="175" rx="8" data-inset-hit="'+c.id+'" role="button" tabindex="0" aria-label="Enlarged helper drop zone for '+esc(c.name)+'"/><text x="680" y="52" text-anchor="middle">Enlarged helper</text><path data-inset-target="'+c.id+'" d="'+c.path+'" transform="translate('+t.x+' '+t.y+') scale('+t.scale+')" class="country inset-country" style="pointer-events:none" '+(this.config.visualClassification?unitSvgAttributes(this.config,c):'')+'/><text x="680" y="185" text-anchor="middle">Drop here</text><circle class="inset-locator" cx="'+c.anchor[0]+'" cy="'+c.anchor[1]+'" r="8"/></g>';
  }
  paintDrag(state){
    if(!state){document.querySelector('.drag-preview')?.remove();q('.status')?.setAttribute('data-active-pointer','');return;}
    if(this.currentId!==state.country.id){this.currentId=state.country.id;this.paint();}
    const c=state.country,box=this.svg.getBoundingClientRect(),unit=Math.min(box.width/this.view.w,box.height/this.view.h),preview=dragPreviewGeometry(c,state.x,state.y,unit);
    let ghost=document.querySelector('.drag-preview');
    if(!ghost){ghost=document.createElementNS('http://www.w3.org/2000/svg','svg');ghost.classList.add('drag-preview');ghost.setAttribute('aria-hidden','true');ghost.innerHTML='<path d="'+c.path+'" '+unitSvgAttributes(this.config,c,{stroke:'#285d52','stroke-width':1.5/unit})+'/>';document.body.append(ghost);}
    ghost.dataset.visualScale='map';
    ghost.style.left=preview.frame.x+'px';ghost.style.top=preview.frame.y+'px';
    ghost.style.width=preview.frame.w+'px';ghost.style.height=preview.frame.h+'px';
    ghost.setAttribute('viewBox',preview.viewBox.join(' '));
    q('.status').setAttribute('data-active-pointer',state.pointerId);
  }
  select(c){
    if(!c||this.drag.active||this.pan.active)return;
    const regionalStudy=this.mode==='explorer'&&this.region!=='all';
    if(regionalStudy&&!c.classification&&countryRegionId(c.id,this.regions)!==this.region)this.focusRegion(countryRegionId(c.id,this.regions));
    const focusSelection=!this.phoneReveal&&this.selected===c.id&&this.view.w===this.fitView.w;
    if(this.isPuzzle){
      if(this.armed){this.place(this.byId.get(this.armed),this.armed===c.id);return;}
      this.selected=c.id;this.message=this.engines.puzzle.placed.has(c.id)?c.name+' is placed.':'Choose a piece from the tray first.';
    }else{
      if(this.mode==='reveal'&&!c.classification)this.engines.reveal.toggle(c.id);
      if(this.mode==='explorer'&&!c.classification)this.engines.explorer.select(c.id);
      this.selected=c.id;this.message=c.classification?c.name+' — '+c.classification+(c.description?'. '+c.description:''):c.name;
      if(this.mode==='reveal'&&!c.classification&&!this.engines.reveal.revealed.has(c.id))this.message=''+this.terms.title+' name hidden. Select it again to reveal.';
      if(this.mode!=='reveal'&&!regionalStudy){if(focusSelection&&this.config.activities.explorer.repeatSelection==='toggle-focus')this.focus(c);else this.view={...this.fitView};}
    }
    this.paint();
  }
  focus(c){
    if(this.mode==='reveal')return;
    const [x0,y0,x1,y1]=c.bounds,factor=Math.min(12,Math.max(1,Math.min(600/(x1-x0),500/(y1-y0)))),w=this.fullData.width/factor,h=this.fullData.height/factor;
    this.view={x:Math.max(0,Math.min(this.fullData.width-w,(x0+x1-w)/2)),y:Math.max(0,Math.min(this.fullData.height-h,(y0+y1-h)/2)),w,h};
  }
  arm(c){
    if(this.drag.active||this.engines.puzzle.placed.has(c.id))return;
    this.currentId=c.id;this.armed=c.id;
    this.mnemonics.play(c.id,this.fullData,q('.map-viewport'));
    this.message=c.name+' selected. Tap its shape on the map'+(this.isIsland(c)?' or nearby ocean':c.inset?' or enlarged inset':'')+', or focus a location and press Enter.';
    this.paint();
  }
  drop(c,x,y,stationary){
    if(!this.isPuzzle)return;
    if(stationary){this.arm(c);return;}
    const svgBox=this.svg.getBoundingClientRect(),matrix=this.svg.getScreenCTM();
    if(!matrix){this.place(c,false);return;}
    const viewport={x:svgBox.left,y:svgBox.top,w:svgBox.width,h:svgBox.height};
    const unit=Math.min(svgBox.width/this.view.w,svgBox.height/this.view.h);
    const inverse=matrix.inverse();
    const shape=country=>{
      const element=q('[data-country="'+country.id+'"]'),b=element.getBoundingClientRect();
      const anchor=new DOMPoint(...country.anchor).matrixTransform(matrix);
      return {bounds:{x:b.left,y:b.top,w:b.width,h:b.height},center:{x:anchor.x,y:anchor.y},contains:point=>element.isPointInFill(new DOMPoint(point.x,point.y).matrixTransform(inverse))};
    };
    const neighbors=this.data.units.filter(n=>n.id!==c.id).map(shape);
    const path=q('[data-country="'+c.id+'"]');
    let samples=this.dropSamples.get(c.id);
    if(!samples){
      samples=[];const [x0,y0,x1,y1]=c.bounds;
      // Uniform filled-area samples avoid a centroid-only test and ignore oceans/holes.
      for(let row=0;row<40;row++)for(let col=0;col<40;col++){
        const point=new DOMPoint(x0+(col+.5)*(x1-x0)/40,y0+(row+.5)*(y1-y0)/40);
        if(path.isPointInFill(point))samples.push({x:point.x,y:point.y});
      }
      this.dropSamples.set(c.id,samples);
    }
    const target=shape(c);
    target.small=Math.min(target.bounds.w,target.bounds.h)<24||samples.length/1600<.22;
    if(samples.length){const center=samples.reduce((sum,p)=>({x:sum.x+p.x/samples.length,y:sum.y+p.y/samples.length}),{x:0,y:0});const point=new DOMPoint(center.x,center.y).matrixTransform(matrix);target.center={x:point.x,y:point.y};}
    const piece=draggedBounds(c,x,y,unit);
    const points=samples.map(p=>({x:x+(p.x-c.anchor[0])*unit,y:y+(p.y-c.anchor[1])*unit}));
    let correct=acceptsGeometryDrop({points,piece,target,neighbors,viewport});
    // Insets are an optional enlarged helper. The real map destination remains
    // valid and is always evaluated at the same scale as the visible drag shape.
    if(!correct&&this.isIsland(c)){const a=new DOMPoint(...c.anchor).matrixTransform(matrix);correct=acceptsIslandDrop({x,y},a,viewport,neighbors);}
    if(!correct&&c.inset&&!this.isIsland(c)){
      const inset=q('[data-inset-hit="'+c.id+'"]');
      if(inset){
        const b=inset.getBoundingClientRect(),helperPiece=draggedBounds(c,x,y,unit*insetTransform(c).scale);
        correct=acceptsInsetDrop(helperPiece,{x:b.left,y:b.top,w:b.width,h:b.height},viewport,neighbors);
      }
    }
    this.place(c,correct);
  }
  place(c,correct){
    this.mnemonics.clear();this.armed=null;
    if(this.engines.puzzle.place(c.id,correct)){
      this.selected=c.id;
      this.message=this.engines.puzzle.placed.size===this.data.units.length?'Complete! All '+this.data.units.length+' '+this.terms.plural+' are placed.':c.name+' placed.';
      const next=this.puzzleUnits.find(n=>!this.engines.puzzle.placed.has(n.id));if(next)this.currentId=next.id;
    }else this.message='Not quite. '+c.name+' returned to the tray.';
    this.paint();
  }
  reset(){
    this.mnemonics.reset();this.clearClue();this.pan.cancel();this.drag.cancel();this.suppressClick=false;this.armed=null;this.selected=null;this.query='';this.view={...this.fitView};
    this.engines[this.mode].reset();this.currentId=(this.mode==='puzzle'?this.puzzleUnits:this.data.units)[0].id;
    this.message='Reset. Ready to begin again.';
    this.renderSide();this.paint();
  }
  setPieceFilter(id){
    if(!this.isPuzzle||!Object.hasOwn(learningFilters(this.config),id))return;
    this.mnemonics.clear();this.drag.cancel();this.clearClue();this.armed=null;this.suppressClick=false;this.pieceFilter=id;
    if(!this.puzzleUnits.some(c=>c.id===this.currentId))this.currentId=(this.puzzleUnits.find(c=>!this.engines.puzzle.placed.has(c.id))||this.puzzleUnits[0]).id;
    this.renderSide();this.paint();q('[popovertarget="piece-filter-menu"]').focus({preventScroll:true});
  }
  action(action){
    this.pan.cancel();
    if(action==='toggle-panel'){this.panelHidden=!this.panelHidden;this.paint();return;}
    if(this.phoneReveal&&['zoom-in','zoom-out','fit','left','right','up','down'].includes(action)){this.view={...this.fitView};this.paint();return;}
    if(action==='reset'){this.reset();return;}
    if(action==='clue'){this.requestClue();return;}
    if(action==='preview'){this.mnemonics.clear();
      this.drag.cancel();this.armed=null;this.selected=null;this.query='';this.view={...this.fitView};
      this.engines.puzzle.preview=!this.engines.puzzle.preview;
      this.message=this.preview?'Answer map. Your puzzle progress is saved.':'Back to your puzzle.';
      this.renderSide();this.paint();return;
    }
    if(action==='reveal-all'){this.engines.reveal.revealAll();this.message='All '+this.data.units.length+' '+this.terms.plural+' revealed.';this.paint();return;}
    if(action==='arm'){this.arm(this.byId.get(this.currentId));return;}
    if(action==='previous-pieces'||action==='more-pieces'){
      this.drag.cancel();const tray=q('#piece-tray');tray.scrollBy({top:(action==='more-pieces'?1:-1)*(tray.clientHeight-20),behavior:'instant'});return;
    }
    this.drag.cancel();
    if(action==='fit'&&this.mode==='explorer'){this.focusRegion('all');return;}
    if(action==='fit')this.view={...this.fitView};
    if(action==='zoom-in'||action==='zoom-out'){
      const factor=action==='zoom-in'?.6:1/.6,v=this.view,w=Math.min(this.fitView.w,Math.max(this.fullData.width/12,v.w*factor)),h=w*this.fitView.h/this.fitView.w;
      this.view={x:Math.max(0,Math.min(this.fullData.width-w,v.x+(v.w-w)/2)),y:Math.max(0,Math.min(this.fullData.height-h,v.y+(v.h-h)/2)),w,h};
    }
    const shifts={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
    if(shifts[action]){const [dx,dy]=shifts[action],v=this.view;
      if(this.mode==='explorer'||this.mode==='reveal')this.view=clampPan({...v,x:v.x+dx*v.w*.25,y:v.y+dy*v.h*.25},this.data.width,this.data.height);
      else {v.x=Math.max(0,Math.min(this.fullData.width-v.w,v.x+dx*v.w*.25));v.y=Math.max(0,Math.min(this.fullData.height-v.h,v.y+dy*v.h*.25));}}
    this.paint();
  }
  registerTool(){
    if(this.mode==='home'||!document.modelContext?.registerTool)return;
    this.toolLifecycle=new AbortController();
    try{Promise.resolve(document.modelContext.registerTool({name:'select_map_country',description:'Select a configured '+this.terms.singular+' in Explorer or reveal it in Reveal. Does not solve puzzle pieces.',inputSchema:{type:'object',properties:{countryId:{type:'string'}},required:['countryId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
      const c=this.byId.get(input?.countryId);
      if(!c||this.mode==='puzzle'||this.mode==='home'||this.drag.active||this.pan.active)throw Error('Choose a valid '+this.terms.singular+' in Explorer or Reveal.');
      this.select(c);return {countryId:c.id,name:c.name};
    }},{signal:this.toolLifecycle.signal})).catch(()=>{});}catch{}
  }
}

function renderHome(){
 app?.mnemonics.clear();app?.clearClue();app?.toolLifecycle?.abort();app=null;
 document.title='CountryMaps · All Maps';
 document.querySelector('#data-note').textContent='';
 const cards=[...Object.keys(registry),...Object.keys(mapDefinitions).filter(id=>!registry[id]&&mapDefinitions[id].showOnHome).sort((a,b)=>a==='united-states'?-1:b==='united-states'?1:0)].map(id=>{
  const config=mapDefinitions[id];
  if(!registry[id])return '<article class="map-card map-card-planned" aria-label="'+esc(config.name)+' — Planned"><div class="map-card-preview planned-preview">'+(config.preview?'<img src="./'+esc(config.preview)+'" alt="" width="800" height="730" decoding="async">':'<strong>'+config.manifest.expectedCount+'</strong><span>'+esc(config.terminology.plural)+'</span>')+'</div><div class="map-card-copy"><h2>'+esc(config.name)+'</h2><span class="map-card-activities">Planned · Not available yet</span></div></article>';
  return '<a class="map-card" href="'+mapEntry(id)+'" data-map-entry="'+id+'"><div class="map-card-preview"><img src="./assets/maps/'+id+'.svg" alt="" width="800" height="730" decoding="async"></div><div class="map-card-copy"><h2>'+esc(config.name)+'</h2><span class="map-card-activities">'+(config.mapOnly?'Map only for now':'Explorer / Reveal / Puzzle')+'</span></div><span class="map-card-arrow" aria-hidden="true">→</span></a>';
 }).join('');
 root.innerHTML='<section class="maps-home" aria-labelledby="maps-title"><p class="eyebrow">COUNTRYMAPS</p><h1 id="maps-title">Choose a map</h1><p class="hub-intro">Explore places. Learn their shapes and locations.</p><nav class="map-cards" aria-label="Choose a map">'+cards+'</nav></section>';
}
// Registry-driven navigation includes only available maps, with project-relative URLs.
document.querySelector('.map-navigation').innerHTML='<a href="./" data-home>All Maps</a>'+Object.keys(registry).map(id=>'<a data-map-entry="'+id+'" href="'+mapEntry(id)+'">'+esc(registry[id].name)+'</a>').join('');

async function navigate(){
  const version=++navigationVersion,params=new URLSearchParams(location.search),id=params.get('map')||(location.pathname===new URL('africa/',projectRoot).pathname||location.pathname===new URL('africa/index.html',projectRoot).pathname?'africa':null),mode=modes.includes(params.get('mode'))?params.get('mode'):'home';
  app?.mnemonics.clear();app?.pan.cancel();app?.drag.cancel();
  if(!id){renderHome();return;}
  try{
    const data=await loadMap(id);if(version!==navigationVersion)return;
    if(app?.data.id!==id){app?.toolLifecycle?.abort();app=new CountryMaps(data);}
    app.enter(mode,params.get('region')||'all');
  }catch(error){
    if(version!==navigationVersion)return;
    app?.toolLifecycle?.abort();app=null;
    root.innerHTML='<h1>Map not available</h1><p>'+esc(error.message)+'</p><a href="./" data-home>All Maps</a>';
  }
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="?map="],a[data-home],a[data-map-entry],a.back-link');
  if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();history.pushState({},'',link.href);window.scrollTo(0,0);navigate();return;}
  if(!app||app.mode==='home')return;
  const piece=event.target.closest('[data-piece]');
  if(piece&&!piece.disabled){
    if(app.suppressClick&&event.detail!==0){app.suppressClick=false;return;}
    app.suppressClick=false;app.arm(app.byId.get(piece.dataset.piece));return;
  }
  const pieceFilter=event.target.closest('[data-piece-filter]');if(pieceFilter){app.setPieceFilter(pieceFilter.dataset.pieceFilter);return;}
  const order=event.target.closest('[data-list-order]');if(order){app.listOrder=order.dataset.listOrder;app.renderList();return;}
  const regionFocus=event.target.closest('[data-focus-region]');if(regionFocus){const id=regionFocus.dataset.focusRegion;app.focusRegion(id);q('[data-focus-region="'+id+'"]')?.focus({preventScroll:true});return;}
  const regionToggle=event.target.closest('[data-toggle-region]');if(regionToggle){const id=regionToggle.dataset.toggleRegion;app.openRegion=app.openRegion===id?null:id;app.renderList();q('[data-toggle-region="'+id+'"]')?.focus({preventScroll:true});return;}
  const action=event.target.closest('[data-action]');if(action){app.action(action.dataset.action);return;}
  const row=event.target.closest('[data-list-country]');if(row){app.select(app.byId.get(row.dataset.listCountry));return;}
  const island=event.target.closest('[data-island-hit]');if(island){if(app.armed===island.dataset.islandHit)app.drop(app.byId.get(app.armed),event.clientX,event.clientY,false);return;}
  const inset=event.target.closest('[data-inset-hit]');if(inset){if(app.armed===inset.dataset.insetHit)app.place(app.byId.get(app.armed),true);return;}
  // Pointer taps are completed by PanController because capture retargets click.
  // Keyboard/assistive activation (detail 0, no physical pointer) stays available.
  if((app.mode==='explorer'||app.mode==='reveal')&&event.target.closest('.navigable-map')&&(event.detail>0||(typeof event.pointerId==='number'&&event.pointerId>=0)))return;
  const path=event.target.closest('[data-country],[data-territory]');if(path)app.select(app.byId.get(path.dataset.country||path.dataset.territory));
});
root.addEventListener('change',event=>{
  if(event.target.id==='practice-region'){
    if(app.mode==='explorer'){app.focusRegion(event.target.value);return;}
    const url=new URL(location.href);url.searchParams.set('region',event.target.value);
    if(event.target.value==='all')url.searchParams.delete('region');
    history.pushState({},'',url);navigate().then(()=>q('#practice-region')?.focus({preventScroll:true}));
  }
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
    app.mnemonics.play(c.id,app.fullData,q('.map-viewport'));
    app.message='Place '+c.name+(app.isIsland(c)?' at its ocean location.':c.inset?' in the enlarged inset.':'.');app.paint();
  }
});
document.addEventListener('pointermove',event=>{if(app?.pan.move(event)||app?.drag.move(event))event.preventDefault();},{passive:false});
document.addEventListener('pointerup',event=>{if(!app?.pan.finish(event))app?.drag.finish(event);});
for(const type of ['pointercancel','lostpointercapture'])document.addEventListener(type,event=>{if(app?.drag.active?.pointerId===event.pointerId)app.mnemonics.clear();app?.pan.lost(event);app?.drag.lost(event);});
document.addEventListener('keydown',event=>{
  if(!app)return;
  if(event.key==='Escape'){
    app.mnemonics.clear();app.pan.cancel();app.drag.cancel();app.armed=null;app.message='Selection cancelled.';app.paint();return;
  }
  const target=event.target.closest('[data-country],[data-territory],[data-inset-hit]');
  if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
function abandon(){app?.mnemonics.clear();app?.pan.cancel();if(app?.drag.active){app.drag.cancel();app.message='Drag cancelled. Try again.';app.paint();}}
for(const type of ['blur','resize'])window.addEventListener(type,abandon);
window.addEventListener('resize',()=>{if(app?.mode==='reveal')app.paint();else app?.positionLabel();});
window.addEventListener('scroll',abandon,true);
document.addEventListener('visibilitychange',abandon);
window.addEventListener('popstate',navigate);
window.addEventListener('pagehide',()=>{app?.mnemonics.clear();app?.clearClue();app?.paintClue();app?.pan.cancel();app?.drag.cancel();});
navigate();
