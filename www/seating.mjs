export function sequentialOrder(names){return names.map((_,i)=>i);}
export function swapSeats(names,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=names.length||to>=names.length)throw Error('INVALID_SEAT');
 const copy=[...names];[copy[from],copy[to]]=[copy[to],copy[from]];return copy;
}
/** Insert one seat at a new position; every intervening player shifts one place. */
export function moveSeat(names,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=names.length||to>=names.length)throw Error('INVALID_SEAT');
 const copy=[...names], [name]=copy.splice(from,1);copy.splice(to,0,name);return copy;
}
