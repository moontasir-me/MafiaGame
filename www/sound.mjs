let context,ready=false;
const voices=new Set();
export const soundEnabled=()=>localStorage.getItem('mafia.sound')!=='off';
export function unlockSound(){
 ready=true;
 if(!soundEnabled())return;
 try{context??=new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}
}
export function toggleSound(){
 localStorage.setItem('mafia.sound',soundEnabled()?'off':'on');
 if(soundEnabled())sound('notice');else for(const voice of voices){try{voice.stop();}catch{}}
}
const patterns={notice:[520,660],vote:[440],out:[330,220],timer:[880,660,880],win:[523,659,784],hit:[196,147],coin:[988,1319],wrong:[294,233],tea:[1319,1976]};
const POUR_SECONDS=2.05;
// A continuous stream with short resonant water droplets; no downloaded audio file.
export function teaPourSamples(sampleRate,random=Math.random){
 const data=new Float32Array(Math.round(sampleRate*POUR_SECONDS));let low=0;
 for(let i=0;i<data.length;i++){
  const time=i/sampleRate,white=random()*2-1;low=.96*low+.04*white;
  data[i]=(.26*white+.65*low)*(.78+.22*Math.sin(time*19));
 }
 for(let time=.06;time<POUR_SECONDS-.14;time+=.045+random()*.065){
  const first=Math.floor(time*sampleRate),duration=.045+random()*.025,frequency=950+random()*1450;
  for(let j=0;j<duration*sampleRate&&first+j<data.length;j++){
   const t=j/sampleRate;data[first+j]+=.48*Math.exp(-t*70)*Math.sin(2*Math.PI*(frequency*t+2200*t*t));
  }
 }
 for(let i=0;i<data.length;i++){
  const time=i/sampleRate,envelope=Math.min(1,time/.09,(POUR_SECONDS-time)/.17);
  data[i]=Math.max(-.9,Math.min(.9,data[i]))*Math.max(0,envelope);
 }
 return data;
}
function track(voice){voices.add(voice);voice.onended=()=>voices.delete(voice);return voice;}
export function sound(kind='notice'){
 if(!ready||!soundEnabled()||document.hidden)return;
 try{
  context??=new(window.AudioContext||window.webkitAudioContext)();
  if(context.state==='suspended')context.resume().catch(()=>{});
  const start=context.currentTime;
  if(kind==='tea-pour'){
   const samples=teaPourSamples(context.sampleRate),buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.getChannelData(0).set(samples);
   const source=track(context.createBufferSource()),filter=context.createBiquadFilter(),gain=context.createGain();
   source.buffer=buffer;filter.type='lowpass';filter.frequency.value=4800;gain.gain.value=.42;
   source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(start);source.stop(start+POUR_SECONDS);return;
  }
  for(const [i,f]of(patterns[kind]||patterns.notice).entries()){
   const o=track(context.createOscillator()),g=context.createGain();o.type='sine';o.frequency.value=f;
   g.gain.setValueAtTime(0,start+i*.12);g.gain.linearRampToValueAtTime(.055,start+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,start+i*.12+.12);
   o.connect(g);g.connect(context.destination);o.start(start+i*.12);o.stop(start+i*.12+.14);
  }
 }catch{}
}
if(typeof window!=='undefined')for(const event of ['pointerdown','keydown'])window.addEventListener(event,unlockSound,{once:true,capture:true});
