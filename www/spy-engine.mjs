import {randomInt} from './engine.mjs';
import {SPY_WORDS,SPY_COMMON} from './spy-words.mjs';
import {newTimer,pauseTimer} from './game-tools.mjs';
const fail=code=>{throw Error(code);};
export function finishSpy(service,r,winner){
 if(r.game.resultRecorded)return;r.game.winner=winner;r.game.status='over';r.game.resultRecorded=true;r.game.awardsApplied=true;r.phase='over';r.timer=pauseTimer(r.timer,service.now());const date=new Date(service.now()).toISOString();
 for(const p of r.game.players){const won=!p.quit&&p.role===winner;p.winPoints=won?(winner==='SPY'?3:1):0;p.score+=p.winPoints;p.history.unshift({game:r.game.id,role:p.role,characterIndex:0,locale:'bn',won,quit:!!p.quit,points:p.winPoints,date});p.history=p.history.slice(0,5);service.syncProfile(p);}
 const host=r.members.find(p=>p.id===r.hostId);host.score++;host.history.unshift({game:r.game.id,role:'HOST',characterIndex:0,locale:'classic',won:true,points:1,date});host.history=host.history.slice(0,5);service.syncProfile(host);
}
export function spyAction(service,r,me,a){
 const host=()=>{if(me.id!==r.hostId)fail('HOST_ONLY');};
 if(a.type==='universe')fail('SPY_UNIVERSE');
 if(a.type==='start'){
  host();if(r.phase!=='lobby')fail('PHASE');const players=r.members.filter(p=>p.id!==r.hostId);if(players.length<3||players.length>20)fail('COUNTS');let word=a.word?.trim();if(word&&!/^[\u0980-\u09ff]+(?: [\u0980-\u09ff]+){0,2}$/.test(word)||word?.length>40)fail('WORD');const pool=a.pool==='extended'?SPY_WORDS:SPY_COMMON;word||=pool[randomInt(pool.length)];if(word===r.spyWord&&pool.length>1)word=pool[(pool.indexOf(word)+1)%pool.length];const spy=randomInt(players.length);
  players.forEach((p,i)=>Object.assign(p,{role:i===spy?'SPY':'WORD',isAlive:true,quit:false,winPoints:0,characterIndex:0}));r.spyWord=word;r.game={id:crypto.randomUUID(),hostId:r.hostId,playerIds:players.map(p=>p.id),players,currentRound:1,status:'host',awardsApplied:false,resultRecorded:false};r.phase='playing';r.edition++;r.round=1;r.timer=newTimer();r.votes={};r.votingOpen=false;r.lastVoteResult=null;service.touch(r,{type:'DEALT'});return true;
 }
 if(['round','end-round'].includes(a.type)){
  host();if(r.phase!=='playing')fail('PHASE');const ids=a.eliminated||[];if(!Array.isArray(ids)||ids.length>1||new Set(ids).size!==ids.length)fail('ONE_MAX');for(const id of ids)if(!r.game.players.some(p=>p.id===id&&p.isAlive))fail('PLAYER');r.lastVoteResult={round:r.round,eliminated:ids.map(id=>{const p=r.game.players.find(p=>p.id===id);p.isAlive=false;return {id:p.id,name:p.name,side:p.role};})};r.votes={};r.votingOpen=false;r.round++;r.game.currentRound=r.round;r.timer=newTimer(r.timer.duration);
  if(!r.game.players.some(p=>p.role==='SPY'&&p.isAlive))finishSpy(service,r,'WORD');else if(r.game.players.filter(p=>p.isAlive).length<=2)finishSpy(service,r,'SPY');service.touch(r,{type:r.phase==='over'?'RESULT':'ROUND'});return true;
 }
 if(a.type==='finish'){host();if(r.phase!=='playing')fail('PHASE');if(!['WORD','SPY'].includes(a.winner))fail('WINNER');finishSpy(service,r,a.winner);service.touch(r,{type:'RESULT'});return true;}
 if(['eliminate','guess','skip-guess'].includes(a.type))fail('ACTION');return false;
}
