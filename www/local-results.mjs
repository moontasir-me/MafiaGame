import {teamOf} from './engine.mjs';
import {readProfile,saveProfile} from './profile.mjs';
export function recordLocalResult(game,locale,storage=localStorage){
 if(game.status!=='over'||game.localResultRecorded)return false;
 let ledger;try{ledger=JSON.parse(storage.getItem('mafia.local-ledger.v2'))||[];}catch{ledger=[];}
 const date=game.endedAt||new Date().toISOString();
 for(const p of game.players){let row=ledger.find(v=>v.name.toLocaleLowerCase()===p.name.toLocaleLowerCase());if(!row){row={name:p.name,score:0,history:[]};ledger.push(row);}row.score+=p.score;row.history.unshift({game:game.id,role:p.role,characterIndex:p.characterIndex||0,locale,won:teamOf(p.role)===game.winner,points:p.winPoints,date});row.history=row.history.slice(0,5);}
 const profile=readProfile(storage);if(!game.hostProfile||game.hostProfile.id===profile.id){profile.score++;profile.history.unshift({game:game.id,role:'HOST',characterIndex:0,locale,won:true,points:1,date});profile.history=profile.history.slice(0,5);saveProfile(profile,storage);}
 storage.setItem('mafia.local-ledger.v2',JSON.stringify(ledger));game.localResultRecorded=true;return true;
}
