import {assignRoles,assignManualRoles,defaultRoleCounts,validateRoleCounts,validateName,eliminatePlayer,finalizeVictory,beginVillageFinale,canGuessPolice,resolveFinalGuess} from './engine.mjs';
import {newTimer,startTimer,pauseTimer,rankedPlayers,updateScore} from './game-tools.mjs';
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
const fail=code=>{throw Error(code);};
// This authority runs on Node for previews, or inside the original Android host.
// Never send the room object to clients: view() is the sole privacy boundary.
export class RoomService{
 constructor({now=Date.now}={}){this.rooms=new Map();this.now=now;}
 prune(){for(const [id,r]of this.rooms)if(this.now()-r.touched>6*60*60*1000)this.rooms.delete(id);}
 member(name,names){if(typeof name!=='string'||validateName(name,names))fail('NAME');return {id:crypto.randomUUID(),name:name.trim(),token:token(),role:null,isAlive:true,score:0,plan:'',order:names.length};}
 async handle(path,b={}){
  this.prune();
  if(path==='/api/create'){
   if(this.rooms.size>=64)fail('FULL');
   const me=this.member(b.name,[]);let id;do{id=token().slice(0,6).toUpperCase();}while(this.rooms.has(id));
   const r={id,invite:token(),hostId:me.id,locale:b.locale==='en'?'en':'bn',members:[me],phase:'lobby',edition:0,version:1,timer:newTimer(),round:0,event:{type:'CREATED',name:me.name},touched:this.now(),config:defaultRoleCounts(5),game:null};
   this.rooms.set(id,r);return {room:id,token:me.token,view:this.view(r,me)};
  }
  const r=this.rooms.get(String(b.room||'').toUpperCase());if(!r)fail('ROOM_GONE');
  if(path==='/api/join'){
   if(b.invite!==r.invite)fail('INVITE');if(r.phase!=='lobby')fail('STARTED');if(r.members.length>=20)fail('FULL');
   const me=this.member(b.name,r.members.map(p=>p.name));r.members.push(me);r.config=defaultRoleCounts(Math.max(5,r.members.length));this.touch(r,{type:'JOINED',name:me.name});return {room:r.id,token:me.token,view:this.view(r,me)};
  }
  const me=r.members.find(p=>p.token===b.token);if(!me)fail('AUTH');r.touched=this.now();
  if(path==='/api/inspect'){
   if(me.id!==r.hostId)fail('HOST_ONLY');if(r.phase==='lobby')fail('PHASE');
   const p=r.members.find(p=>p.id===b.id);if(!p)fail('PLAYER');
   return {id:p.id,name:p.name,role:p.role};
  }
  if(path==='/api/state')return this.view(r,me);
  if(path!=='/api/action')fail('NOT_FOUND');
  const a=b.action||{},host=()=>{if(me.id!==r.hostId)fail('HOST_ONLY');};
  if(a.type==='guess'){
   if(me.role!=='MAFIA'||r.phase!=='last-chance')fail('GUESS');resolveFinalGuess(r.game,a.target);r.phase='over';this.touch(r,{type:'RESULT'});return this.view(r,me);
  }
  host();
  switch(a.type){
   case 'universe':if(!['bn','en'].includes(a.locale))fail('UNIVERSE');r.locale=a.locale;this.touch(r,{type:'UNIVERSE'});break;
   case 'transfer':{const p=r.members.find(p=>p.id===a.id);if(!p)fail('PLAYER');r.hostId=p.id;this.touch(r,{type:'HOST',name:p.name});break;}
   case 'kick':{if(r.phase!=='lobby'||a.id===r.hostId)fail('PHASE');r.members=r.members.filter(p=>p.id!==a.id);this.touch(r,{type:'ROSTER'});break;}
   case 'start':{
    if(r.phase!=='lobby')fail('PHASE');const names=r.members.map(p=>p.name),counts=a.counts||defaultRoleCounts(names.length);
    if(validateRoleCounts(names.length,counts))fail('COUNTS');
    const dealt=a.assignments?assignManualRoles(names,counts,a.assignments):assignRoles(names,counts);
    r.members.forEach((p,i)=>Object.assign(p,dealt[i],{id:p.id,token:p.token}));r.config=counts;
    r.game={players:r.members,currentRound:1,status:'host',awardsApplied:false,finalGuess:null};r.phase='playing';r.edition=(r.edition||0)+1;r.round=1;r.timer=newTimer();this.touch(r,{type:'DEALT'});break;
   }
   case 'timer':{
    if(r.phase!=='playing')fail('PHASE');
    if(a.mode==='start')r.timer=startTimer(r.timer,this.now());
    else if(a.mode==='pause')r.timer=pauseTimer(r.timer,this.now());
    else if(a.mode==='reset'){const minutes=Number(a.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>30)fail('TIMER');r.timer=newTimer(minutes*60);}
    else fail('TIMER');this.touch(r,{type:'TIMER'});break;
   }
   case 'round':if(r.phase!=='playing')fail('PHASE');r.round++;r.game.currentRound=r.round;this.touch(r,{type:'ROUND'});break;
   case 'eliminate':if(r.phase!=='playing')fail('PHASE');eliminatePlayer(r.game,a.id,a.cause);this.touch(r,{type:'ROSTER'});break;
   case 'restore':{if(r.phase!=='playing')fail('PHASE');const p=r.members.find(p=>p.id===a.id);if(!p)fail('PLAYER');p.isAlive=true;p.diedInRound=null;p.deathCause=null;this.touch(r,{type:'ROSTER'});break;}
   case 'score':{const p=r.members.find(p=>p.id===a.id);if(!p)fail('PLAYER');updateScore(p,a.score);if(typeof a.plan==='string')p.plan=a.plan.slice(0,500);this.touch(r,{type:'SCORE'});break;}
   case 'finish':if(r.phase!=='playing')fail('PHASE');if(!['MAFIA','VILLAGER'].includes(a.winner))fail('WINNER');if(a.winner==='VILLAGER'&&canGuessPolice(r.game)){beginVillageFinale(r.game);r.phase='last-chance';}else{finalizeVictory(r.game,a.winner);r.phase='over';}r.timer=pauseTimer(r.timer,this.now());this.touch(r,{type:r.phase==='over'?'RESULT':'FINALE'});break;
   case 'skip-guess':if(r.phase!=='last-chance')fail('PHASE');resolveFinalGuess(r.game,null);r.phase='over';this.touch(r,{type:'RESULT'});break;
   case 'rematch':if(r.phase!=='over')fail('PHASE');r.phase='lobby';r.game=null;r.timer=newTimer();r.members.forEach(p=>Object.assign(p,{role:null,score:0,plan:'',isAlive:true}));this.touch(r,{type:'REMATCH'});break;
   default:fail('ACTION');
  }
  return this.view(r,me);
 }
 touch(r,event){r.version++;r.event=event;r.touched=this.now();}
 view(r,me){
  const isHost=r.hostId===me.id,rank=rankedPlayers(r.members).find(p=>p.id===me.id)?.rank;
  const view={room:r.id,locale:r.locale,edition:r.edition||0,version:r.version,phase:r.phase,round:r.round,serverNow:this.now(),timer:{...r.timer},hostName:r.members.find(p=>p.id===r.hostId)?.name,isHost,count:r.members.length,event:{...r.event},winner:r.game?.winner||null,me:{id:me.id,name:me.name,role:me.role,rank,score:me.score,plan:me.plan,isAlive:me.isAlive}};
  if(isHost){view.invite=r.invite;view.counts={...r.config};view.players=rankedPlayers(r.members).map(p=>({id:p.id,name:p.name,rank:p.rank,score:p.score,plan:p.plan,isAlive:p.isAlive}));}
  if(r.phase==='last-chance'&&me.role==='MAFIA')view.targets=r.members.map(p=>({id:p.id,name:p.name}));
  return view;
 }
}
