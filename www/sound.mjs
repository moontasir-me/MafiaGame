let context,ready=false;
export const soundEnabled=()=>localStorage.getItem('mafia.sound')!=='off';
export function toggleSound(){localStorage.setItem('mafia.sound',soundEnabled()?'off':'on');if(soundEnabled())sound('notice');}
const patterns={notice:[520,660],vote:[440],out:[330,220],timer:[880,660,880],win:[523,659,784],hit:[196,147],coin:[988,1319],wrong:[294,233],tea:[1319,1976]};
export function sound(kind='notice'){if(!ready||!soundEnabled()||document.hidden)return;try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume();const start=context.currentTime;if(kind==='tea-pour'){
 const length=Math.floor(context.sampleRate*1.8),buffer=context.createBuffer(1,length,context.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(.6+.4*Math.sin(i/context.sampleRate*25));
 const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1150;filter.Q.value=.7;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.045,start+.18);gain.gain.setValueAtTime(.045,start+1.5);gain.gain.linearRampToValueAtTime(0,start+1.8);source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(start);source.stop(start+1.8);return;
 }for(const [i,f]of (patterns[kind]||patterns.notice).entries()){const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,start+i*.12);g.gain.linearRampToValueAtTime(.055,start+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,start+i*.12+.12);o.connect(g);g.connect(context.destination);o.start(start+i*.12);o.stop(start+i*.12+.14);}}catch{}}
if(typeof window!=='undefined')window.addEventListener('pointerdown',()=>{ready=true;try{context??=new (window.AudioContext||window.webkitAudioContext)();context.resume();}catch{}},{once:true,capture:true});
