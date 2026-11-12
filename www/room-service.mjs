import {assignRoles,assignManualRoles,defaultRoleCounts,validateRoleCounts,validateName,eliminatePlayer,finalizeVictory,beginVillageFinale,canGuessPolice,resolveFinalGuess,teamOf,randomInt} from './engine.mjs';
import {newTimer,startTimer,pauseTimer,secondsLeft,rankedPlayers,updateScore} from './game-tools.mjs';
import {assignCharacterIndexes} from './characters.mjs';
import {cleanProfile} from './profile.mjs';
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
const fail=code=>{throw Error(code);};
export class RoomService{
 constructor({now=Date.now}={}){this.rooms=new Map();this.profiles=new Map();this.now=now;}
 snapshot(){return {version:2,rooms:[...this.rooms],profiles:[...this.profiles]};}
 restore(data){if(data?.version!==2)return;this.rooms=new Map(data.rooms||[]);this.profiles=new Map(data.profiles||[]);for(const r of this.rooms.values())if(r.game)r.game.players=r.members.filter(p=>r.game.playerIds.includes(p.id));}
 prune(){for(const [id,r]of this.rooms)if(this.now()-r.touched>6*60*60*1000)this.rooms.delete(id);}
 member(name,names,rawProfile){
  if(typeof name!=='string'||validateName(name,names,names.length))fail('NAME');
  const supplied=cleanProfile(rawProfile),saved=this.profiles.get(supplied.id),profile={...(saved||supplied),name:name.trim(),photo:supplied.photo};this.profiles.set(profile.id,profile);
  return {id:crypto.randomUUID(),profileId:profile.id,name:profile.name,photo:profile.photo,token:token(),role:null,isAlive:true,score:profile.score,history:[...profile.history],plan:'',order:names.length,characterIndex:0,quoteIndex:randomInt(103)};
 }
 syncProfile(p){this.profiles.set(p.profileId,{id:p.profileId,name:p.name,photo:p.photo,score:p.score,history:[...p.history]});}
 voteOpen(r){return r.phase==='playing'&&(r.votingOpen||(r.timer.running&&secondsLeft(r.timer,this.now())===0));}
 recordResult(r){
  if(r.phase!=='over'||r.game.resultRecorded)return;r.game.resultRecorded=true;
  const date=new Date(this.now()).toISOString();
  for(const p of r.game.players){p.history.unshift({game:r.game.id,role:p.role,characterIndex:p.characterIndex,locale:r.locale,won:teamOf(p.role)===r.game.winner,points:p.winPoints||0,date});p.history=p.history.slice(0,5);this.syncProfile(p);}
  const host=r.members.find(p=>p.id===r.game.hostId);if(host){host.score+=1;host.history.unshift({game:r.game.id,role:'HOST',characterIndex:0,locale:r.locale,won:true,points:1,date});host.history=host.history.slice(0,5);this.syncProfile(host);}
 }
 async handle(path,b={}){
  this.prune();
  if(path==='/api/create'){
   if(this.rooms.size>=64)fail('FULL');const me=this.member(b.name,[],b.profile);me.role='HOST';me.isAlive=false;
   let id;do{id=token().slice(0,6).toUpperCase();}while(this.rooms.has(id));
   const r={id,invite:token(),hostId:me.id,locale:b.locale==='en'?'en':'bn',members:[me],phase:'lobby',edition:0,version:1,timer:newTimer(),round:0,votes:{},votingOpen:false,event:{type:'CREATED',name:me.name},touched:this.now(),config:defaultRoleCounts(5),game:null};
   this.rooms.set(id,r);return {room:id,token:me.token,view:this.view(r,me)};
  }
  const r=this.rooms.get(String(b.room||'').toUpperCase());if(!r)fail('ROOM_GONE');
  if(path==='/api/join'){
   if(b.invite!==r.invite)fail('INVITE');if(r.phase!=='lobby')fail('STARTED');if(r.members.length>=21)fail('FULL');
   if(b.profile?.id&&r.members.some(p=>p.profileId===b.profile.id))fail('ALREADY_JOINED');
   const me=this.member(b.name,r.members.map(p=>p.name),b.profile);r.members.push(me);r.config=defaultRoleCounts(Math.max(5,r.members.length-1));this.touch(r,{type:'JOINED',name:me.name});return {room:r.id,token:me.token,view:this.view(r,me)};
  }
  const me=r.members.find(p=>p.token===b.token);if(!me)fail('AUTH');r.touched=this.now();
  if(path==='/api/state')return this.view(r,me);
  if(path==='/api/rankings')return {players:rankedPlayers(r.members).map(p=>({id:p.id,name:p.name,photo:p.photo,rank:p.rank,score:p.score,isHost:p.id===r.hostId,history:p.history.map(h=>({...h}))}))};
  if(path==='/api/profile'){
   const names=r.members.filter(p=>p.id!==me.id).map(p=>p.name);if(typeof b.name!=='string'||validateName(b.name,names,names.length))fail('NAME');
   me.name=b.name.trim();me.photo=cleanProfile({...b.profile,id:me.profileId}).photo;this.syncProfile(me);this.touch(r,{type:'PROFILE'});return this.view(r,me);
  }
  if(path==='/api/inspect'){
   if(me.id!==r.hostId)fail('HOST_ONLY');if(r.phase==='lobby')fail('PHASE');const p=r.game.players.find(p=>p.id===b.id);if(!p)fail('PLAYER');return {id:p.id,name:p.name,role:p.role,characterIndex:p.characterIndex};
  }
  if(path!=='/api/action')fail('NOT_FOUND');const a=b.action||{},host=()=>{if(me.id!==r.hostId)fail('HOST_ONLY');};
  if(a.type==='vote'){
   if(!this.voteOpen(r))fail('VOTING_CLOSED');if(me.id===r.hostId||!r.game.players.some(p=>p.id===me.id&&p.isAlive))fail('CANNOT_VOTE');if(Object.hasOwn(r.votes,me.id))fail('ALREADY_VOTED');
   if(!r.game.players.some(p=>p.id===a.target&&p.isAlive))fail('INVALID_TARGET');r.votes[me.id]=a.target;this.touch(r,{type:'VOTE'});return this.view(r,me);
  }
  if(a.type==='guess'){
   if(me.id===r.hostId||me.role!=='MAFIA'||r.phase!=='last-chance')fail('GUESS');resolveFinalGuess(r.game,a.target);r.phase='over';this.recordResult(r);this.touch(r,{type:'RESULT'});return this.view(r,me);
  }
  host();
  switch(a.type){
   case 'universe':if(!['bn','en'].includes(a.locale))fail('UNIVERSE');r.locale=a.locale;this.touch(r,{type:'UNIVERSE'});break;
   case 'transfer':{
    if(!['lobby','over'].includes(r.phase))fail('HOST_BETWEEN_GAMES');const p=r.members.find(p=>p.id===a.id);if(!p)fail('PLAYER');const previous=r.members.find(p=>p.id===r.hostId);previous.role=null;previous.isAlive=true;r.hostId=p.id;p.role='HOST';p.isAlive=false;this.touch(r,{type:'HOST',name:p.name});break;
   }
   case 'kick':if(r.phase!=='lobby'||a.id===r.hostId)fail('PHASE');r.members=r.members.filter(p=>p.id!==a.id);this.touch(r,{type:'ROSTER'});break;
   case 'start':{
    if(r.phase!=='lobby')fail('PHASE');const players=r.members.filter(p=>p.id!==r.hostId),names=players.map(p=>p.name),counts=a.counts||defaultRoleCounts(names.length);if(validateRoleCounts(names.length,counts))fail('COUNTS');
    const dealt=assignCharacterIndexes(a.assignments?assignManualRoles(names,counts,a.assignments):assignRoles(names,counts));
    const quotes=Array.from({length:103},(_,i)=>i);for(let i=quotes.length-1;i>0;i--){const j=randomInt(i+1);[quotes[i],quotes[j]]=[quotes[j],quotes[i]];}
    players.forEach((p,i)=>Object.assign(p,dealt[i],{id:p.id,token:p.token,score:p.score,history:p.history,photo:p.photo,profileId:p.profileId,quoteIndex:quotes[i]}));
    r.config=counts;r.game={id:crypto.randomUUID(),hostId:r.hostId,playerIds:players.map(p=>p.id),players,currentRound:1,status:'host',awardsApplied:false,finalGuess:null,resultRecorded:false};r.phase='playing';r.edition++;r.round=1;r.timer=newTimer();r.votes={};r.votingOpen=false;this.touch(r,{type:'DEALT'});break;
   }
   case 'timer':{
    if(r.phase!=='playing')fail('PHASE');if(this.voteOpen(r))r.votingOpen=true;
    if(a.mode==='start'){if(r.votingOpen)fail('VOTING_OPEN');r.timer=startTimer(r.timer,this.now());}
    else if(a.mode==='pause')r.timer=pauseTimer(r.timer,this.now());
    else if(a.mode==='reset'){if(Object.keys(r.votes).length)fail('VOTES_EXIST');const minutes=Number(a.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>30)fail('TIMER');r.timer=newTimer(minutes*60);r.votingOpen=false;}
    else fail('TIMER');this.touch(r,{type:'TIMER'});break;
   }
   case 'round':
   case 'end-round':{
    if(r.phase!=='playing')fail('PHASE');const ids=a.eliminated||[];if(!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length)fail('TWO_MAX');for(const id of ids)if(!r.game.players.some(p=>p.id===id&&p.isAlive))fail('PLAYER');for(const id of ids)eliminatePlayer(r.game,id,'VOTE');r.round++;r.game.currentRound=r.round;r.votes={};r.votingOpen=false;r.timer=newTimer(r.timer.duration);this.touch(r,{type:'ROUND'});break;
   }
   case 'eliminate':if(r.phase!=='playing')fail('PHASE');eliminatePlayer(r.game,a.id,a.cause);this.touch(r,{type:'ROSTER'});break;
   case 'restore':{if(r.phase!=='playing')fail('PHASE');const p=r.game.players.find(p=>p.id===a.id);if(!p)fail('PLAYER');p.isAlive=true;p.diedInRound=null;p.deathCause=null;this.touch(r,{type:'ROSTER'});break;}
   case 'score':{const p=r.members.find(p=>p.id===a.id);if(!p||p.id===r.hostId)fail('PLAYER');updateScore(p,a.score);if(typeof a.plan==='string')p.plan=a.plan.slice(0,500);this.syncProfile(p);this.touch(r,{type:'SCORE'});break;}
   case 'finish':if(r.phase!=='playing')fail('PHASE');if(!['MAFIA','VILLAGER'].includes(a.winner))fail('WINNER');if(a.winner==='VILLAGER'&&canGuessPolice(r.game)){beginVillageFinale(r.game);r.phase='last-chance';}else{finalizeVictory(r.game,a.winner);r.phase='over';this.recordResult(r);}r.timer=pauseTimer(r.timer,this.now());this.touch(r,{type:r.phase==='over'?'RESULT':'FINALE'});break;
   case 'skip-guess':if(r.phase!=='last-chance')fail('PHASE');resolveFinalGuess(r.game,null);r.phase='over';this.recordResult(r);this.touch(r,{type:'RESULT'});break;
   case 'rematch':if(r.phase!=='over')fail('PHASE');r.phase='lobby';r.game=null;r.timer=newTimer();r.votes={};r.votingOpen=false;r.members.forEach(p=>{p.role=p.id===r.hostId?'HOST':null;p.plan='';p.isAlive=p.id!==r.hostId;});this.touch(r,{type:'REMATCH'});break;
   default:fail('ACTION');
  }
  return this.view(r,me);
 }
 touch(r,event){r.version++;r.event=event;r.touched=this.now();}
 view(r,me){
  const isHost=r.hostId===me.id,rank=rankedPlayers(r.members).find(p=>p.id===me.id)?.rank,open=this.voteOpen(r),alive=r.game?.players.filter(p=>p.isAlive)||[];
  const view={room:r.id,locale:r.locale,edition:r.edition,version:r.version,phase:r.phase,round:r.round,serverNow:this.now(),timer:{...r.timer},hostName:r.members.find(p=>p.id===r.hostId)?.name,isHost,count:r.members.length-1,event:{...r.event},winner:r.game?.winner||null,voteOpen:open,canVote:open&&!isHost&&me.isAlive&&!Object.hasOwn(r.votes,me.id),voted:Object.hasOwn(r.votes,me.id),me:{id:me.id,name:me.name,photo:me.photo,role:isHost?'HOST':me.role,characterIndex:me.characterIndex,quoteIndex:me.quoteIndex,rank,score:me.score,history:me.history.map(h=>({...h})),plan:me.plan,isAlive:!isHost&&me.isAlive}};
  if(open&&!isHost)view.candidates=alive.map(p=>({id:p.id,name:p.name}));
  if(isHost){view.invite=r.invite;view.counts={...r.config};view.players=rankedPlayers(r.members.filter(p=>p.id!==r.hostId)).map(p=>({id:p.id,name:p.name,photo:p.photo,rank:rankedPlayers(r.members).find(q=>q.id===p.id).rank,score:p.score,plan:p.plan,isAlive:p.isAlive}));view.votes={confirmed:Object.keys(r.votes).length,eligible:alive.length,counts:Object.fromEntries(alive.map(p=>[p.id,Object.values(r.votes).filter(id=>id===p.id).length]))};}
  if(r.phase==='last-chance'&&me.role==='MAFIA'&&!isHost)view.targets=r.game.players.map(p=>({id:p.id,name:p.name}));return view;
 }
}
