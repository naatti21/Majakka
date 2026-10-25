/* MAJAKKA sound and tactile feedback — user-controlled, quiet by default.
   Musical events share one D-minor pentatonic palette rather than mixing arbitrary node tracks. */
(function(root){
 'use strict';
 let audio=null,lastAt=0,haptics=true;
 try{haptics=localStorage.getItem('majakka-haptics-v1')!=='off';}catch{}
 const notes=[146.83,174.61,196,220,261.63,293.66,349.23,392,440,523.25];
 const patterns={
  collect:[{n:4,t:0,d:.17},{n:7,t:.10,d:.27}],
  attune:[{n:0,t:0,d:.3},{n:3,t:.17,d:.4}],
  weave:[{n:2,t:0,d:.27},{n:4,t:.19,d:.26},{n:7,t:.40,d:.42}],
  pulse:[{n:0,t:0,d:.49}],
  field:[{n:0,t:0,d:.75},{n:2,t:.24,d:.65},{n:4,t:.46,d:.66},{n:7,t:.67,d:.98}],
  clear:[{n:3,t:0,d:.3},{n:5,t:.18,d:.31},{n:7,t:.38,d:.65}],
  decode:[{n:4,t:0,d:.20}],
  error:[{n:0,t:0,d:.17}],
  interference:[{n:1,t:0,d:.17},{n:0,t:.18,d:.18}],
 };
 const buzz={collect:[18],attune:[25,35,30],weave:[18,42,26,40,35],field:[35,65,45,65,85],clear:[20,30,50],decode:[12],error:[55],pulse:[25],interference:[30,40,30]};
 function soundOn(){return typeof state!=='undefined'&&state.sound===true;}
 function play(type){
  const now=Date.now();if(now-lastAt<110)return;lastAt=now;
  if(haptics&&navigator.vibrate&&buzz[type])try{navigator.vibrate(buzz[type]);}catch{}
  if(!soundOn()||!patterns[type])return;
  try{
   audio??=new(window.AudioContext||window.webkitAudioContext)();
   if(audio.state==='suspended')void audio.resume();
   const t=audio.currentTime+.01;
   const motif=patterns[type].slice(0,4);
   for(const {n,t:delay,d} of motif){
    const osc=audio.createOscillator(),vol=audio.createGain();
    osc.type=type==='interference'?'triangle':'sine';
    osc.frequency.value=notes[n]||220;
    const time=t+delay;
    vol.gain.setValueAtTime(.0001,time);
    vol.gain.exponentialRampToValueAtTime(type==='field'?.07:.038,time+.04);
    vol.gain.exponentialRampToValueAtTime(.0001,time+d);
    osc.connect(vol);vol.connect(audio.destination);osc.start(time);osc.stop(time+d+.05);
   }
  }catch(e){console.warn('Majakka sound unavailable',e);}
 }
 function setHaptics(on){
  haptics=Boolean(on);try{localStorage.setItem('majakka-haptics-v1',haptics?'on':'off');}catch{}
  return haptics;
 }
 root.MajakkaFeedback={play,haptics:()=>haptics,setHaptics};
})(typeof globalThis!=='undefined'?globalThis:this);
