import {BOARD,SETS} from './dhoni-board.mjs';
import {newDhoniGame,dhoniAct,holdings} from './dhoni-engine.mjs';
import {mixedRoster} from './offline-roster.mjs';
export const LOCAL_KEY='dhoni.local.v1';
export function createLocal(names,{bots=0,minutes=45,botNames=[],now=Date.now()}={}){
 const players=mixedRoster(names,{bots,max:6,botNames});
 const match=newDhoniGame(players.map(p=>p.name),{now,minutes});
 match.players.forEach((p,i)=>p.cpu=!!players[i].cpu);
 return {v:1,local:true,host:true,owner:0,minutes,members:players.map(p=>p.name),me:0,match,now,pausedAt:null};
}
export function localActor(m,preferred){
 if(m.offer&&!m.players[m.offer.to].cpu)return m.offer.to;
 if(m.auction){const humans=m.players.map((p,i)=>({p,i})).filter(({p,i})=>!p.cpu&&!p.out&&!m.auction.passed.includes(i)&&m.auction.bidder!==i).map(x=>x.i);if(humans.includes(preferred))return preferred;if(humans.length)return humans[0];}
 return m.turn;
}
export function localAction(room,actor,action,options={}){
 if(room.pausedAt!==null)throw Error('PAUSED');
 if(room.match.players[actor]?.cpu&&!options.computer)throw Error('PLAYER');
 const match=dhoniAct(room.match,actor,action,options);
 return {...room,match,me:localActor(match,match.phase==='auction'?(options.computer?room.me:(actor+1)%match.players.length):undefined),now:options.now??Date.now()};
}
export function pauseLocal(room,now=Date.now()){return room.pausedAt!==null?room:{...room,pausedAt:now};}
export function resumeLocal(room,now=Date.now()){
 if(room.pausedAt===null)return room;const delay=Math.max(0,now-room.pausedAt),match=structuredClone(room.match);
 match.deadline+=delay;if(match.endsAt)match.endsAt+=delay;if(match.auction)match.auction.endsAt+=delay;
 return {...room,match,pausedAt:null,now};
}
export function persistLocal(room,storage,now=Date.now()){
 try{storage.setItem(LOCAL_KEY,JSON.stringify({...room,savedAt:now}));return true;}catch{return false;}
}
export function restoreLocal(storage,now=Date.now()){
 try{const r=JSON.parse(storage.getItem(LOCAL_KEY));if(r?.v!==1||!r.local||!Array.isArray(r.match?.players)||r.match.players.length<2||r.match.players.length>6||!Array.isArray(r.match.assets)||r.match.assets.length!==BOARD.length||!Number.isFinite(r.savedAt))return null;
 // Returning to a saved game is explicit: time never runs while the app is closed.
 return {...r,pausedAt:r.pausedAt??r.savedAt,now};
 }catch{return null;}
}
const value=(m,ids)=>ids.reduce((sum,id)=>sum+(m.assets[id].mortgaged?BOARD[id].price/2:BOARD[id].price),0);
export function computerChoice(m){
 if(m.winner!==null)return null;
 if(m.offer&&m.players[m.offer.to].cpu){const o=m.offer;return {actor:o.to,action:{type:value(m,o.give)+o.giveCash>=value(m,o.take)+o.takeCash?'accept':'reject',offer:o.id}};}
 if(m.auction){const a=m.auction,actor=m.players.findIndex((p,i)=>p.cpu&&!p.out&&!a.passed.includes(i)&&i!==a.bidder);if(actor<0)return null;const p=m.players[actor],s=BOARD[a.space],set=s.kind==='property'?SETS[s.group]:[],complete=set.some(id=>m.assets[id].owner===actor),cap=Math.min(p.cash-120,Math.floor(s.price*(complete?1.3:.95)));return {actor,action:a.bid+10<=cap?{type:'bid',amount:Math.min(cap,a.bid+Math.max(10,Math.floor(s.price/10)))}:{type:'pass'}};}
 const actor=m.turn,p=m.players[actor];if(!p.cpu)return null;
 if(m.phase==='roll')return {actor,action:{type:'roll'}};
 if(m.phase==='purchase'){const s=BOARD[p.pos],complete=s.kind==='property'&&SETS[s.group].some(id=>m.assets[id].owner===actor);return {actor,action:{type:p.cash>=s.price+(complete?0:120)?'buy':'auction'}};}
 const ids=holdings(m,actor);
 if(m.phase==='debt'){
  if(p.cash>=m.debt.amount)return {actor,action:{type:'pay'}};
  const sell=ids.find(id=>m.assets[id].level&&m.assets[id].level===Math.max(...SETS[BOARD[id].group].map(x=>m.assets[x].level)));
  if(sell!==undefined)return {actor,action:{type:'sell',space:sell}};
  const mortgage=ids.find(id=>!m.assets[id].mortgaged&&(BOARD[id].kind!=='property'||SETS[BOARD[id].group].every(x=>!m.assets[x].level)));
  return {actor,action:mortgage!==undefined?{type:'mortgage',space:mortgage}:{type:'resign'}};
 }
 if(m.phase==='end'){
  const redeem=ids.find(id=>m.assets[id].mortgaged&&p.cash>=Math.ceil(BOARD[id].price*.55)+300);
  if(redeem!==undefined)return {actor,action:{type:'redeem',space:redeem}};
  const build=ids.find(id=>{const s=BOARD[id],a=m.assets[id];return s.kind==='property'&&a.level<5&&p.cash>=s.build+250&&SETS[s.group].every(x=>m.assets[x].owner===actor&&!m.assets[x].mortgaged&&m.assets[x].level>=a.level);});
  return {actor,action:build!==undefined?{type:'build',space:build}:{type:'end'}};
 }return null;
}
