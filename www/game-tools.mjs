export const newTimer = (duration=180) => ({duration,remaining:duration,endsAt:null,running:false});
export function secondsLeft(timer, now=Date.now()) {
 return timer.running ? Math.max(0,Math.ceil((timer.endsAt-now)/1000)) : Math.max(0,timer.remaining);
}
export function startTimer(timer,now=Date.now()) {
 const remaining=secondsLeft(timer,now);
 return {...timer,remaining:remaining||timer.duration,endsAt:now+(remaining||timer.duration)*1000,running:true};
}
export const pauseTimer=(timer,now=Date.now())=>({...timer,remaining:secondsLeft(timer,now),endsAt:null,running:false});
export const scoreOf=p=>Number.isSafeInteger(p.score)?p.score:0;
export function rankedPlayers(players) {
 const sorted=[...players].sort((a,b)=>scoreOf(b)-scoreOf(a)||a.order-b.order);
 return sorted.map((p,i)=>({...p,rank:i&&scoreOf(p)===scoreOf(sorted[i-1])?null:i+1})).map((p,i,all)=>({...p,rank:p.rank??all.slice(0,i).reverse().find(v=>v.rank!==null)?.rank??1}));
}
export function updateScore(player,score){if(!Number.isSafeInteger(score)||Math.abs(score)>9999)throw new Error('Invalid score');player.score=score;}
