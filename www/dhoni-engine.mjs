import {BOARD,SETS,CARDS} from './dhoni-board.mjs';
const fail = c => {throw Error(c);};
const integer = n => Number.isSafeInteger(n) && n >= 0;
const live = m => m.players.map((p,i)=>p.out?null:i).filter(i=>i!==null);
const log = (m,type,data={}) => {m.log.unshift({type,...data});m.log=m.log.slice(0,40);};
const own = (m,i) => m.assets.map((a,id)=>a?.owner===i?id:null).filter(id=>id!==null);
export const holdings = own;
export function worth(m,i) {return m.players[i].cash+own(m,i).reduce((sum,id)=>{const s=BOARD[id],a=m.assets[id];return sum+(a.mortgaged?Math.floor(s.price/2):s.price)+a.level*(s.build||0);},0)-(m.debt?.who===i?m.debt.amount:0);}
export function ranking(m) {return m.players.map((p,i)=>({i,name:p.name,out:p.out,worth:worth(m,i),eliminated:p.eliminated||0})).sort((a,b)=>Number(a.out)-Number(b.out)||(!a.out?b.worth-a.worth:b.eliminated-a.eliminated));}
function finish(m,reason) {const rows=ranking(m),top=rows[0];m.winner=top.i;m.winners=rows.filter(r=>!r.out&&r.worth===top.worth).map(r=>r.i);m.phase='over';m.endReason=reason;m.offer=null;m.auction=null;log(m,'finished',{who:top.i});}
export function newDhoniGame(names,{now=Date.now(),minutes=45,id=globalThis.crypto?.randomUUID?.()||String(now)}={}) {
 if(!Array.isArray(names)||names.length<2||names.length>6)fail('COUNTS');
 return {id,seq:0,players:names.map(name=>({name:String(name).slice(0,20),cash:1500,pos:0,jailed:false,jailTurns:0,out:false})),assets:BOARD.map(s=>s.price?{owner:null,level:0,mortgaged:false}:null),turn:0,phase:'roll',dice:[1,1],doubles:0,extra:false,deadline:now+90000,endsAt:minutes?now+minutes*60000:0,winner:null,winners:[],log:[],auction:null,debt:null,offer:null,card:null,resume:null};
}
function phase(m,value,now) {m.phase=value;m.deadline=now+90000;}
function next(m,now) {
 m.offer=null;m.card=null;m.resume=null;m.debt=null;
 if(live(m).length<=1){finish(m,'last');return;}
 if(!m.extra||m.players[m.turn].out){do{m.turn=(m.turn+1)%m.players.length;}while(m.players[m.turn].out);m.doubles=0;}
 m.extra=false;phase(m,'roll',now);
}
function jail(m,now) {const p=m.players[m.turn];p.pos=8;p.jailed=true;p.jailTurns=0;m.extra=false;m.doubles=0;log(m,'jail',{who:m.turn});phase(m,'end',now);}
function charge(m,amount,to,reason,now,resume=null) {
 const p=m.players[m.turn];if(amount<=0){phase(m,'end',now);return;}
 if(p.cash<amount){m.debt={who:m.turn,to,amount,reason};m.resume=resume;phase(m,'debt',now);log(m,'debt',{who:m.turn,amount,to});return;}
 p.cash-=amount;if(to!==null)m.players[to].cash+=amount;log(m,reason,{who:m.turn,amount,to});
 if(resume?.type==='move')walk(m,resume.steps,now);else if(resume?.type==='bail')phase(m,'roll',now);else phase(m,'end',now);
}
export function rent(m,id,dice=m.dice.reduce((a,b)=>a+b,0)) {
 const a=m.assets[id],s=BOARD[id];if(!a||a.owner===null||a.mortgaged)return 0;
 if(s.kind==='station')return 25*2**(own(m,a.owner).filter(x=>BOARD[x].kind==='station').length-1);
 if(s.kind==='utility')return dice*(own(m,a.owner).filter(x=>BOARD[x].kind==='utility').length===2?10:4);
 return s.rent*(a.level?[1,5,12,25,40,60][a.level]:SETS[s.group].every(x=>m.assets[x].owner===a.owner&&!m.assets[x].mortgaged)?2:1);
}
function land(m,now,random,depth=0) {
 if(depth>5){phase(m,'end',now);return;}const p=m.players[m.turn],s=BOARD[p.pos],a=m.assets[p.pos];
 if(a){if(a.owner===null){phase(m,'purchase',now);return;}if(a.owner!==m.turn&&!a.mortgaged){charge(m,rent(m,s.id),a.owner,'rent',now);return;}}
 if(s.kind==='tax'){charge(m,s.amount,null,'tax',now);return;}
 if(s.kind==='bonus'){p.cash+=s.amount;log(m,'bonus',{who:m.turn,amount:s.amount});}
 if(s.kind==='gotojail'){jail(m,now);return;}
 if(s.kind==='chance'){
  const card=CARDS[random(CARDS.length)];m.card=CARDS.indexOf(card);log(m,'chance',{who:m.turn,card:m.card});
  if(card.jail){jail(m,now);return;}
  if(card.start){p.pos=0;p.cash+=200;log(m,'salary',{who:m.turn,amount:200});}
  if(card.back){p.pos=(p.pos-card.back+BOARD.length)%BOARD.length;land(m,now,random,depth+1);return;}
  const amount=card.repairs?-own(m,m.turn).reduce((n,id)=>n+m.assets[id].level*25,0):card.cash||0;
  if(amount<0){charge(m,-amount,null,'expense',now);return;}p.cash+=amount;
 }
 phase(m,'end',now);
}
function walk(m,steps,now,random=()=>0) {const p=m.players[m.turn];if(p.pos+steps>=BOARD.length){p.cash+=200;log(m,'salary',{who:m.turn,amount:200});}p.pos=(p.pos+steps)%BOARD.length;land(m,now,random);}
function settleAuction(m,now) {const a=m.auction;if(a.bidder!==null){const p=m.players[a.bidder];if(!p.out&&p.cash>=a.bid){p.cash-=a.bid;m.assets[a.space].owner=a.bidder;log(m,'bought',{who:a.bidder,space:a.space,amount:a.bid});}}m.auction=null;phase(m,'end',now);}
function bankrupt(m,i,now) {
 const p=m.players[i],creditor=m.debt?.who===i?m.debt.to:null;p.out=true;p.eliminated=m.seq+1;
 if(creditor!==null&&!m.players[creditor].out){m.players[creditor].cash+=p.cash;for(const id of own(m,i))m.assets[id].owner=creditor;}
 else for(const id of own(m,i))m.assets[id]={owner:null,level:0,mortgaged:false};p.cash=0;if(m.debt?.to===i)m.debt.to=null;m.offer=null;log(m,'out',{who:i});
 if(m.auction){if(m.auction.bidder===i){m.auction.bid=0;m.auction.bidder=null;}if(!m.auction.passed.includes(i))m.auction.passed.push(i);}
 if(live(m).length<=1){finish(m,'last');return;}
 if(m.turn===i){m.auction=null;m.extra=false;next(m,now);}
}
function validateTrade(m,offer) {
 if(!offer||!integer(offer.to)||offer.to===offer.from||!m.players[offer.to]||m.players[offer.to].out||m.players[offer.from].out)fail('TRADE');
 for(const [ids,owner] of [[offer.give,offer.from],[offer.take,offer.to]]){
  if(!Array.isArray(ids)||ids.length>BOARD.length||new Set(ids).size!==ids.length)fail('TRADE');
  for(const id of ids)if(!Number.isInteger(id)||!m.assets[id]||m.assets[id].owner!==owner||(BOARD[id].kind==='property'&&SETS[BOARD[id].group].some(x=>m.assets[x].level)))fail('TRADE');
 }
 if(!integer(offer.giveCash)||!integer(offer.takeCash)||offer.giveCash>m.players[offer.from].cash||offer.takeCash>m.players[offer.to].cash)fail('FUNDS');
 if(!offer.give.length&&!offer.take.length&&!offer.giveCash&&!offer.takeCash)fail('TRADE');
}
export function dhoniAct(input,me,action,{now=Date.now(),dice=()=>Math.floor(Math.random()*6)+1,random=n=>Math.floor(Math.random()*n)}={}) {
 const m=structuredClone(input),p=m.players[me],op=action.type;if(!p||p.out)fail('PLAYER');if(m.winner!==null)fail('PHASE');
 if(m.endsAt&&now>=m.endsAt){finish(m,'time');m.seq++;return m;}
 if(op==='resign'){bankrupt(m,me,now);m.seq++;return m;}
 if(op==='bid'||op==='pass'){
  const a=m.auction;if(m.phase!=='auction'||!a||now>=a.endsAt)fail('AUCTION');if(a.passed.includes(me))fail('AUCTION');
  if(op==='bid'){if(!integer(action.amount)||action.amount<a.bid+10)fail('BID');if(action.amount>p.cash)fail('FUNDS');a.bid=action.amount;a.bidder=me;a.endsAt=now+15000;log(m,'bid',{who:me,amount:a.bid});}
  else{if(a.bidder===me)fail('AUCTION');a.passed.push(me);}
  if(live(m).every(i=>i===a.bidder||a.passed.includes(i)))settleAuction(m,now);m.seq++;return m;
 }
 if(op==='accept'||op==='reject'||op==='cancel'){
  const o=m.offer;if(!o||action.offer!==o.id)fail('TRADE');if(op==='cancel'?me!==o.from:me!==o.to)fail('TURN');
  if(op==='accept'){validateTrade(m,o);for(const id of o.give)m.assets[id].owner=o.to;for(const id of o.take)m.assets[id].owner=o.from;m.players[o.from].cash+=o.takeCash-o.giveCash;m.players[o.to].cash+=o.giveCash-o.takeCash;log(m,'trade',{who:o.from,to:o.to});}m.offer=null;m.seq++;return m;
 }
 if(m.turn!==me)fail('TURN');
 if(['build','sell','mortgage','redeem'].includes(op)){
  if(!['roll','end','debt'].includes(m.phase))fail('PHASE');const s=BOARD[action.space],a=m.assets[action.space];if(!s||!a||a.owner!==me)fail('OWNERSHIP');
  const set=s.kind==='property'?SETS[s.group]:[s.id];
  if(op==='build'){if(m.phase==='debt'||s.kind!=='property'||a.level>=5||!set.every(id=>m.assets[id].owner===me&&!m.assets[id].mortgaged))fail('SET');if(a.level>Math.min(...set.map(id=>m.assets[id].level)))fail('LEVEL');if(p.cash<s.build)fail('FUNDS');p.cash-=s.build;a.level++;}
  if(op==='sell'){if(!a.level||a.level<Math.max(...set.map(id=>m.assets[id].level)))fail('LEVEL');a.level--;p.cash+=Math.floor(s.build/2);}
  if(op==='mortgage'){if(a.mortgaged||set.some(id=>m.assets[id].level))fail('BUILDINGS');a.mortgaged=true;p.cash+=Math.floor(s.price/2);}
  if(op==='redeem'){if(m.phase==='debt'||!a.mortgaged)fail('PHASE');const cost=Math.ceil(s.price*.55);if(p.cash<cost)fail('FUNDS');p.cash-=cost;a.mortgaged=false;}
  m.offer=null;log(m,op,{who:me,space:s.id});
 }else if(op==='offer'){
  if(!['roll','end'].includes(m.phase))fail('PHASE');const o={id:m.seq+1,from:me,to:action.to,give:action.give,take:action.take,giveCash:action.giveCash,takeCash:action.takeCash};validateTrade(m,o);m.offer=o;
 }else if(op==='roll'){
  if(m.phase!=='roll')fail('PHASE');m.offer=null;m.card=null;const a=dice(),b=dice();if(![a,b].every(n=>Number.isInteger(n)&&n>=1&&n<=6))fail('ACTION');m.dice=[a,b];log(m,'roll',{who:me,dice:[a,b]});
  if(p.jailed){p.jailTurns++;if(a===b){p.jailed=false;p.jailTurns=0;m.extra=false;walk(m,a+b,now,random);}else if(p.jailTurns>=3){p.jailed=false;p.jailTurns=0;charge(m,50,null,'bail',now,{type:'move',steps:a+b});}else phase(m,'end',now);}
  else{m.extra=a===b;m.doubles=m.extra?m.doubles+1:0;if(m.doubles>=3)jail(m,now);else walk(m,a+b,now,random);}
 }else if(op==='bail'){
  if(m.phase!=='roll'||!p.jailed)fail('PHASE');p.jailed=false;p.jailTurns=0;charge(m,50,null,'bail',now,{type:'bail'});
 }else if(op==='buy'){
  if(m.phase!=='purchase')fail('PHASE');const s=BOARD[p.pos],a=m.assets[p.pos];if(!a||a.owner!==null)fail('OWNERSHIP');if(p.cash<s.price)fail('FUNDS');p.cash-=s.price;a.owner=me;log(m,'bought',{who:me,space:s.id,amount:s.price});phase(m,'end',now);
 }else if(op==='auction'){
  if(m.phase!=='purchase')fail('PHASE');m.auction={space:p.pos,bid:0,bidder:null,passed:[],endsAt:now+15000};phase(m,'auction',now);
 }else if(op==='pay'){
  if(m.phase!=='debt')fail('PHASE');const d=m.debt;if(p.cash<d.amount)fail('FUNDS');const resume=m.resume;m.debt=null;m.resume=null;charge(m,d.amount,d.to,d.reason,now,resume);
 }else if(op==='end'){
  if(m.phase!=='end')fail('PHASE');next(m,now);
 }else fail('ACTION');
 m.seq++;return m;
}
export function dhoniAuto(input,{now=Date.now(),dice,random}={}) {
 if(input.winner!==null)return input;
 if(input.endsAt&&now>=input.endsAt){const m=structuredClone(input);finish(m,'time');m.seq++;return m;}
 if(input.auction){if(now<input.auction.endsAt)return input;const m=structuredClone(input);settleAuction(m,now);m.seq++;return m;}
 if(now<input.deadline)return input;
 const me=input.turn,op={roll:'roll',purchase:'auction',end:'end'}[input.phase];
 if(op)return dhoniAct(input,me,{type:op},{now,dice,random});
 if(input.phase==='debt'){
  let m=input;for(let guard=0;guard<200&&m.players[me].cash<m.debt.amount;guard++){
   const ids=own(m,me),sell=ids.find(id=>m.assets[id].level&&m.assets[id].level===Math.max(...SETS[BOARD[id].group].map(x=>m.assets[x].level))),mortgage=ids.find(id=>!m.assets[id].mortgaged&&(BOARD[id].kind!=='property'||SETS[BOARD[id].group].every(x=>!m.assets[x].level)));
   if(sell!==undefined)m=dhoniAct(m,me,{type:'sell',space:sell},{now});else if(mortgage!==undefined)m=dhoniAct(m,me,{type:'mortgage',space:mortgage},{now});else return dhoniAct(m,me,{type:'resign'},{now});
  }return dhoniAct(m,me,{type:'pay'},{now});
 }return input;
}
