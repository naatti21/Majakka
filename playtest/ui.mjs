// PR-07 mobile controller. Calls the real Gate 2 expedition reducer.
import {loadDemoState,resetDemoState,saveDemoState,getDemoView,applyDemoAction} from './session.mjs';
let state=loadDemoState(),feedback=null,lastRoute=null;
const byId=id=>document.getElementById(id);
const ui=byId('game'),message=byId('feedback'),lumen=byId('lumen-count'),step=byId('step-count'),
 progress=byId('progress-fill');
const label={
 NotStarted:'1 / 5',ChoosingRole:'2 / 5',ReadyToMeasure:'3 / 5',
 Investigating:'3 / 5',Solved:'4 / 5',Completed:'5 / 5'
};
const levels={NotStarted:0,ChoosingRole:20,ReadyToMeasure:40,Investigating:60,Solved:80,Completed:100};
const meanings={
 EXPEDITION_ALREADY_STARTED:'This investigation is already under way.',
 CASE_ALREADY_SOLVED:'The finding is already saved in your journal.',
 MISSING_COMMITTED_THREAD:'This route has not been constructed.',
 MISSING_COMMITTED_FIELD:'The three threads must first form a field.',
 ROLE_LOCKED_AFTER_MEASUREMENT:'The research tool is locked after the first observation.',
 CHOOSE_ROLE_FIRST:'Choose how to investigate before measuring a route.',
 ROUTE_ALREADY_MEASURED:'You have already recorded this route. Compare your observations.',
 NEEDS_COMPARISON:'The evidence is not yet sufficient. Try measuring the other route.',
 MEASURE_FIRST:'Measure at least one route before choosing a conclusion.',
 INSUFFICIENT_LUMEN:'Not enough Lumen for another reading. You can still inspect existing evidence.',
 OPERATION_ID_CONFLICT:'The operation ID was already used for another action.',
 CASE_NOT_SOLVED:'Interpret the evidence before finishing the case.'
};
function el(tag,cls,txt){
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(txt!==undefined)x.textContent=txt;
 return x;
}
function add(parent,...children){for(const child of children)parent.appendChild(child);return parent;}
function p(text,cls=''){return el('p',cls,text);}
function section(eyebrow,title,description){
 const wrap=el('section','panel');
 add(wrap,el('div','eyebrow',eyebrow),el('h2','',title),p(description));
 return wrap;
}
function button(title,detail,action,primary=false,badge=''){
 const b=el('button','action'+(primary?' primary':''));
 b.type='button';
 add(b,el('span','primary-name',title));
 if(badge)add(b,el('span','cost',badge));
 if(detail)add(b,el('span','details',detail));
 b.addEventListener('click',action);
 return b;
}
function run(type,args={}){
 try{
  const {state:updated,result}=applyDemoAction(state,{type,...args});
  if(result.ok){
   state=updated;
   const saved=saveDemoState(state);
   if(type==='MEASURE')lastRoute=args.route;
   feedback={kind:'ok',title:'Action recorded',
    text:type==='INTERPRET'?'Your explanation matches the evidence.':
    type==='FINISH'?'Your discovery is saved in this local playtest.':
    type==='MEASURE'?'Observation recorded. Compare the evidence below.':
    type==='SELECT_ROLE'?'Your field tool is selected.':result.why||'Done.'};
   if(!saved)feedback={kind:'warning',title:'Playtest session',text:'The browser blocked local storage. Your work remains available until the page is closed.'};
  }else{
   feedback={kind:'warning',title:result.code==='CONTRADICTED'?'The evidence disagrees':'Not yet',
    text:result.explanation||meanings[result.code]||('The game refused this action: '+result.code)};
  }
 }catch(error){
  feedback={kind:'warning',title:'Test error',
   text:'The action failed. You can reset the playtest without affecting the live game.'};
  console.error(error);
 }
 render();
}
function actionList(section,...buttons){
 const holder=el('div','actions');
 for(const b of buttons)holder.appendChild(b);
 section.appendChild(holder);
}
function setupMap(view){
 const routes=view.measurements||[];
 const latest=lastRoute||routes.at(-1)?.route||null;
 for(const [id,route] of [['thread-ab','via_b'],['thread-bc','via_b'],['thread-ac','direct']]){
  const x=byId(id);if(!x)continue;
  x.classList.toggle('picked',latest===route);
  x.classList.toggle('dim',Boolean(latest)&&latest!==route);
 }
 byId('map-label').textContent=view.status==='Completed'?'DISCOVERY SAVED':
  view.status==='Solved'?'PATTERN IDENTIFIED':'ARCHIVED SIGNAL';
}
function renderMessage(){
 message.replaceChildren();
 if(!feedback)return;
 const box=el('div','callout'+(feedback.kind!=='ok'?' error':''));
 box.setAttribute('role',feedback.kind==='ok'?'status':'alert');
 add(box,el('strong','',feedback.title),el('span','',feedback.text));
 message.appendChild(box);
}
function roleCards(view){
 const s=section('Make a decision','Choose how to investigate',
  'Each tool changes what you can observe. None changes the shared network for other players.');
 const descriptions={
 Lens:'Separate overlapping pulses. One detour measurement may reveal their common source.',
 Shelter:'Capture a clean reference. Compare the direct route with the detour.',
 Beacon:'Find where the delay begins. You will need another route to confirm the cause.'
 };
 for(const name of ['Lens','Shelter','Beacon']){
  const card=button(name,descriptions[name],()=>run('SELECT_ROLE',{role:name}));
  card.setAttribute('aria-label',name+'. '+descriptions[name]);
  s.appendChild(card);
 }
 return s;
}
function observationCards(view){
 if(!view.measurements.length)return null;
 const s=section('Evidence','What the field revealed',
  'These readings are saved in your current investigation. Neither a wrong answer nor an interruption deletes them.');
 for(const [i,obs] of view.measurements.entries()){
  const card=el('div','journal');
  const route=obs.route==='direct'?'A → C · direct route':'A → B → C · detour';
  add(card,el('div','eyebrow','READING '+(i+1)+' · '+route),
   el('div','',obs.visible.join(' · ')),
   p('Signal quality: '+Math.round(obs.quality*100)+'%','quiet'));
  s.appendChild(card);
 }
 return s;
}
function routeCards(view){
 if(view.status==='Solved'||view.status==='Completed')return null;
 const s=section('Investigate the network','Which path will you examine?',
  'A direct signal and one passing through B should not necessarily arrive in the same way.');
 const used=new Set(view.measurements.map(x=>x.route));
 const direct=button('A → C · Direct',
  used.has('direct')?'Already recorded': 'Record a clean baseline along the short route.',
  ()=>run('MEASURE',{route:'direct'}),false,used.has('direct')?'DONE':'READ');
 const detour=button('A → B → C · Detour',
  used.has('via_b')?'Already recorded':'Compare the additional signal path through relay B.',
  ()=>run('MEASURE',{route:'via_b'}),false,used.has('via_b')?'DONE':'READ');
 direct.disabled=used.has('direct');detour.disabled=used.has('via_b');
 actionList(s,direct,detour);
 s.appendChild(p('The first measurement in this test is free. A second distinct reading uses 1 Lumen.','quiet'));
 return s;
}
function hypothesisCards(view){
 if(view.status==='Solved'||view.status==='Completed')return null;
 const s=section('Interpret','What causes the missing beat?',
  'Your explanation must be supported by the route readings. A wrong hypothesis costs no Lumen.');
 actionList(s,...view.hypotheses.map(h=>button(h.label,
  'Check this interpretation against your observations.',
  ()=>run('INTERPRET',{hypothesis:h.id}))));
 return s;
}
function render(){
 const view=getDemoView(state);
 lumen.textContent=String(view.lumen);
 step.textContent=label[view.status]||'1 / 5';
 progress.style.width=(levels[view.status]??0)+'%';
 setupMap(view);renderMessage();
 ui.replaceChildren();
 if(view.status==='NotStarted'){
  const s=section('First playable experiment','A signal arrives twice',
   'Three fixed test nodes form one field. Something changes the rhythm when the signal travels through B. Your task is to explain why.');
  const tip=el('div','callout');
  add(tip,el('strong','','Why do this?'),el('span','',
   'Solve the anomaly to save a discovery and unlock a new observation method. No GPS or timed return is required.'));
  add(s,tip,button('Begin investigation','A short, self-contained research case.',()=>run('START'),true));
  ui.appendChild(s);
 }else if(view.status==='Completed'){
  const s=section('Mission complete','You found the missing beat',
   'The field shows a route-dependent echo rather than a second hidden transmitter.');
  const a=state.players['demo:player'].findings?.['the-missing-beat'];
  const box=el('div','journal');
  add(box,el('div','eyebrow','PERMANENT PLAYTEST JOURNAL'),
   el('div','unlock','Echo Differentiation unlocked'),
   p('Solved with: '+(a?.method||'research')+'.','quiet'),
   p('Next question: Does this echo repeat beyond your home region?',''));
  add(s,box,p('This record is saved locally on this device, not in the shared Majakka world.','quiet'));
  ui.appendChild(s);
 }else if(view.status==='Solved'){
  const s=section('Interpretation supported','The pattern makes sense',
   'You used real observations from the selected path to identify a route-dependent echo.');
  const exp=state.expeditions[JSON.stringify(['demo:player','the-missing-beat'])];
  add(s,el('div','callout',exp?.conclusion||'Your evidence supports the route-echo hypothesis.'));
  add(s,button('Save discovery to journal','Unlock a new method and end this research case.',()=>run('FINISH'),true));
  ui.appendChild(s);
  const observed=observationCards(view);if(observed)ui.appendChild(observed);
 }else{
  if(!view.role)ui.appendChild(roleCards(view));
  else{
   const intro=section('Chosen field tool',view.role,
    'The tool changes which clues you can observe. Your reading route determines what else you learn.');
   if(view.measurements.length===0){
    add(intro,button('Choose a different tool','You can reconsider before the first reading.',
     ()=>run('SELECT_ROLE',{role:view.role==='Lens'?'Shelter':'Lens'})));
   }
   ui.appendChild(intro);
   const obs=observationCards(view);if(obs)ui.appendChild(obs);
   ui.appendChild(routeCards(view));
   if(view.measurements.length)ui.appendChild(hypothesisCards(view));
  }
 }
 byId('storage-status').textContent='Private local playtest • No GPS';
}
byId('reset').addEventListener('click',()=>{
 if(!confirm('Reset The Missing Beat on this device? Only the local test session will be erased.'))return;
 state=resetDemoState();feedback={kind:'ok',title:'Scenario reset',text:'Ready to test another solution path.'};
 lastRoute=null;render();
});
render();
