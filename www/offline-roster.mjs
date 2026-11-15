/* Shared seat limits for offline tables. Human accounts and bots remain distinct. */
export function mixedCounts(humans=1,bots=1,max=4,minBots=1){
 const h=Math.max(1,Math.min(max-minBots,Math.trunc(Number(humans))||1));
 const b=Math.max(h===1?1:minBots,Math.min(max-h,Math.trunc(Number(bots))||0));
 return {humans:h,bots:b};
}
export function mixedRoster(names,{bots=1,max=4,level='medium',botNames=[],botsFirst=false}={}){
 const clean=names.map(n=>String(n).trim().replace(/\s+/g,' '));
 if(!Number.isInteger(bots)||bots<0||clean.length<1||clean.length+bots<2||clean.length+bots>max)throw Error('COUNTS');
 if(clean.some(n=>!n||n.length>20)||new Set(clean.map(n=>n.toLocaleLowerCase())).size!==clean.length)throw Error('NAME');
 const used=new Set(clean.map(n=>n.toLocaleLowerCase())),people=clean.map(name=>({name}));
 const computers=Array.from({length:bots},(_,i)=>{const base=botNames[i]||`কম্পিউটার ${i+1}`;let name=base,k=2;while(used.has(name.toLocaleLowerCase()))name=base+' '+k++;used.add(name.toLocaleLowerCase());return {name,cpu:level};});
 return botsFirst?[...computers,...people]:[...people,...computers];
}
export function mixedControls({humans,bots,max=4,minBots=1,english=false,prefix=''}={}){
 const counts=mixedCounts(humans,bots,max,minBots),fmt=n=>english?String(n):n.toLocaleString('bn-BD');
 const group=(label,action,from,to,value)=>`<fieldset class="mixed-seat-group"><legend>${label}</legend><div class="mixed-seat-options">${Array.from({length:to-from+1},(_,i)=>i+from).map(n=>`<button type="button" data-action="${prefix+action}" data-id="${n}" aria-pressed="${value===n}" class="${value===n?'is-on':''}">${fmt(n)}</button>`).join('')}</div></fieldset>`;
 return `<div class="mixed-counts">${group(english?'People':'খেলোয়াড়','humans',1,max-minBots,counts.humans)}${group(english?'Computers':'কম্পিউটার','cpus',counts.humans===1?1:minBots,max-counts.humans,counts.bots)}</div><p class="mixed-seat-note">${english?`${counts.humans} people + ${counts.bots} computers · ${max} seats maximum`:`${fmt(counts.humans)} জন খেলোয়াড় + ${fmt(counts.bots)} কম্পিউটার · সর্বোচ্চ ${fmt(max)} জন`}</p>`;
}
