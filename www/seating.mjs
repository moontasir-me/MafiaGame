export function counterclockwiseOrder(names,startName=names[0]){
 const n=names.length;if(!n)return [];
 const start=Math.max(0,names.indexOf(startName));
 return Array.from({length:n},(_,i)=>(start-i+n)%n);
}
export function swapSeats(names,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=names.length||to>=names.length)throw Error('INVALID_SEAT');
 const copy=[...names];[copy[from],copy[to]]=[copy[to],copy[from]];return copy;
}
export function lastMafiaName(game){
 const order=game.revealOrder??game.players.map((_,i)=>i);
 return [...order].reverse().map(i=>game.players[i]).find(p=>p?.role==='MAFIA')?.name??game.names[0];
}
/** Insert one seat at a new position; every intervening player shifts one place. */
export function moveSeat(names,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=names.length||to>=names.length)throw Error('INVALID_SEAT');
 const copy=[...names], [name]=copy.splice(from,1);copy.splice(to,0,name);return copy;
}
