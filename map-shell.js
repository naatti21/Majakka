/* Contextual panels; game logic remains in app.js. */
(() => {
 'use strict';
 const el=id=>document.getElementById(id),panels=['node','field','journal'];
 let current='';
 const nav=document.createElement('nav');nav.className='map-bottom-nav';nav.setAttribute('aria-label','Game views');
 nav.innerHTML='<button type="button" data-panel="world" class="active" aria-pressed="true"><span aria-hidden="true">◎</span>World</button><button type="button" data-panel="field" aria-pressed="false"><span aria-hidden="true">△</span>District</button><button type="button" data-panel="journal" aria-pressed="false"><span aria-hidden="true">◫</span>Memory</button>';
 document.body.append(nav);
 function show(name){current=name||'';panels.forEach(x=>document.body.classList.toggle(x+'-open',current===x));nav.querySelectorAll('[data-panel]').forEach(b=>{const on=b.dataset.panel===(current||'world');b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});if(current&&el('map-intro'))el('map-intro').hidden=true;}
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-panel]');if(b)show(b.dataset.panel==='world'||current===b.dataset.panel?'':b.dataset.panel);});
 [['signal','node'],['journal','journal'],['field-card','field']].forEach(([id,name])=>{const sheet=el(id)||document.querySelector('.'+id);if(!sheet)return;const button=document.createElement('button');button.type='button';button.className='sheet-close';button.setAttribute('aria-label','Close '+name);button.textContent='×';button.addEventListener('click',()=>show(''));sheet.prepend(button);});
 const actions=document.querySelector('.signal-actions'),walk=el('demo-walk');if(actions&&walk)actions.append(walk);
 const rest=el('quiet-collect');if(rest){rest.textContent='✧ Rest & gather';document.body.append(rest);}
 const charge=document.createElement('div');charge.id='hud-lumen';charge.setAttribute('role','status');document.body.append(charge);
 const pips=el('lumen-pips');function update(){const match=(pips?.getAttribute('aria-label')||'').match(/\d+/g);charge.textContent=match?.length>=2?'✧ '+match[0]+' / '+match[1]:'✧ Lumen';}
 if(pips){new MutationObserver(update).observe(pips,{attributes:true,attributeFilter:['aria-label'],childList:true});update();}
 el('world-markers')?.addEventListener('click',e=>{if(e.target.closest('.node-marker'))show('node');});
 const tip=document.createElement('div');tip.id='map-intro';tip.innerHTML='<button type="button" aria-label="Dismiss tip">×</button><strong>ONE CONNECTED WORLD</strong>Tap Discover landmarks to find fixed sites. GPS is optional.';tip.querySelector('button').addEventListener('click',()=>tip.hidden=true);document.body.append(tip);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')show('');});
 window.addEventListener('resize',()=>{try{if(typeof map!=='undefined'&&map)map.resize();if(typeof drawWorld==='function')drawWorld();}catch(e){console.warn('Map resize',e);}});
})();
