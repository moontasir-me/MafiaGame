let context,ready=false;
export const soundEnabled=()=>localStorage.getItem('mafia.sound')!=='off';
export function toggleSound(){localStorage.setItem('mafia.sound',soundEnabled()?'off':'on');if(soundEnabled())sound('notice');}
const patterns={notice:[520,660],vote:[440],out:[330,220],timer:[880,660,880],win:[523,659,784]};
export function sound(kind='notice'){if(!ready||!soundEnabled()||document.hidden)return;try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume();const start=context.currentTime;for(const [i,f]of (patterns[kind]||patterns.notice).entries()){const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,start+i*.12);g.gain.linearRampToValueAtTime(.055,start+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,start+i*.12+.12);o.connect(g);g.connect(context.destination);o.start(start+i*.12);o.stop(start+i*.12+.14);}}catch{}}
if(typeof window!=='undefined')window.addEventListener('pointerdown',()=>{ready=true;try{context??=new (window.AudioContext||window.webkitAudioContext)();context.resume();}catch{}},{once:true,capture:true});
