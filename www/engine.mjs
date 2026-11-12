export const ROLES = {
 MAFIA: {name:'মাফিয়া',enName:'Mafia',icon:'mask',color:'red',team:'MAFIA',description:'চায়ে চুমুক, মনে ষড়যন্ত্র! রাতে কাউকে বেছে নাও। হেরে গেলেও শেষবার পুলিশ ধরতে পারলে জয় তোমাদের।',enDescription:'Sip your cha. Plot your next move. Pick a target at night. Even after losing, one correct final police guess steals the win.'},
 DOCTOR: {name:'ডাক্তার',enName:'Doctor',icon:'heart',color:'green',team:'VILLAGER',description:'টংয়ের ডাক্তার ভাই! প্রতি রাতে একজনকে বাঁচাও, হোস্টকে বলো কাকে বাঁচাচ্ছ। গ্রাম জিতলে তোমার ২ পয়েন্ট।',enDescription:'The tong’s doctor bhai! Save one person each night through the host. A village victory earns you 2 points.'},
 POLICE: {name:'পুলিশ',enName:'Police',icon:'shield',color:'blue',team:'VILLAGER',description:'চা খেতে খেতেই তদন্ত! রাতে হোস্টের কাছে সন্দেহভাজনের পরিচয় জেনে নাও। পরিচয় লুকাও—মাফিয়ার শেষ আন্দাজে ধরা পড়লে সর্বনাশ!',enDescription:'Investigate over a cup of cha. Ask the host about a suspect at night. Stay hidden: the Mafia’s final police guess can turn the game! Village win: 2 points.'},
 VILLAGER: {name:'গ্রামবাসী',enName:'Villager',icon:'person',color:'gray',team:'VILLAGER',description:'পকেট হালকা, বুদ্ধি ভারী! গামছা কাঁধে চা খাও আর কথার ফাঁকে মাফিয়া খুঁজে বের করো। গ্রাম জিতলে তোমার ১ পয়েন্ট।',enDescription:'A humble villager with a sharp mind. Sip your cha, listen to the gossip and vote out the Mafia. Village win: 1 point.'},
 BETRAYER: {name:'বিশ্বাসঘাতক',enName:'Betrayer',icon:'mask',color:'purple',team:'MAFIA',optional:true,description:'মুখে বন্ধু, মনে মাফিয়া! তুমি মাফিয়া দলের গোপন সঙ্গী। ভোটে ওদের সাহায্য করো। সব আসল মাফিয়া বাদ গেলে তোমার একার হাতে রাতের আক্রমণ নেই।',enDescription:'A friend on the outside, a Mafia ally inside. Help them in the vote. You count with the Mafia at parity, but cannot keep night attacks going after all actual Mafia are out.'},
 ASTROLOGER: {name:'বিজ্ঞানী',enName:'Biggani',icon:'spark',color:'gold',team:'VILLAGER',optional:true,description:'হাত দেখে বলি—আজ চায়ে চিনি কম! মাফিয়ার রাতের আক্রমণ তোমাকে মারতে পারে না। তবে সবার ভোটে তুমি বাদ পড়তে পারো।',enDescription:'The Gonok has seen it in the stars: tonight’s tea needs more sugar! Mafia night attacks cannot kill you. A village vote can still send you out.'},
 BODYGUARD: {name:'বডিগার্ড',enName:'Bodyguard',icon:'shield',color:'olive',team:'VILLAGER',optional:true,description:'টংয়ের পাহারাদার বড় ভাই! প্রতি রাতে একজনকে পাহারা দাও। কাকে রক্ষা করছ হোস্টকে বলো—হোস্ট মুখে রাতের ঘটনা চালাবে।',enDescription:'The tong’s protective big brother. Guard one person each night through the host. The host resolves protection in person. Village win: 1 point.'}
};
export const CONFIGURABLE_ROLES=['MAFIA','DOCTOR','POLICE','BETRAYER','ASTROLOGER','BODYGUARD'];
export const maxMafia=n=>Math.floor((n-1)/2);
export const defaultRoleCounts=n=>({MAFIA:Math.max(1,Math.floor(n/4)),DOCTOR:1,POLICE:1,BETRAYER:0,ASTROLOGER:0,BODYGUARD:0});
export const teamOf=role=>ROLES[role==='CITIZEN'?'VILLAGER':role]?.team??'VILLAGER';
export function roleCounts(n,config){
 const counts=Object.fromEntries(CONFIGURABLE_ROLES.map(r=>[r,config[r]??0]));
 counts.VILLAGER=n-Object.values(counts).reduce((a,b)=>a+b,0);
 return counts;
}
export function validateRoleCounts(n,config){
 if(!Number.isInteger(n)||n<5||n>20)return 'PLAYER_COUNT';
 const c=roleCounts(n,config);
 if(CONFIGURABLE_ROLES.some(r=>!Number.isInteger(c[r])||c[r]<0||c[r]>n))return 'ROLE_COUNT';
 if(c.MAFIA<1)return 'NO_MAFIA';
 if(c.VILLAGER<0)return 'TOO_MANY_ROLES';
 if(c.MAFIA+c.BETRAYER>=n-(c.MAFIA+c.BETRAYER))return 'MAFIA_MAJORITY';
 return null;
}
export function validateName(name,names,except=-1){
 const n=name.trim();if(!n)return 'নাম লিখতে হবে';
 if(Array.from(n).length>20)return 'নাম ২০ অক্ষরের মধ্যে হতে হবে';
 if(names.some((v,i)=>i!==except&&v.toLocaleLowerCase()===n.toLocaleLowerCase()))return 'এই নাম আগেই আছে';
 if(names.length>=20&&except<0)return 'সর্বোচ্চ ২০ জন খেলতে পারবে';return '';
}
export function randomInt(max){const a=new Uint32Array(1),limit=4294967296-(4294967296%max);do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%max;}
export function assignRoles(names,configuration){
 const config=typeof configuration==='number'?{...defaultRoleCounts(names.length),MAFIA:configuration}:configuration;
 const error=validateRoleCounts(names.length,config);if(error)throw Error(error);
 const counts=roleCounts(names.length,config),roles=Object.entries(counts).flatMap(([r,n])=>Array(n).fill(r));
 for(let i=roles.length-1;i>0;i--){const j=randomInt(i+1);[roles[i],roles[j]]=[roles[j],roles[i]];}
 return names.map((name,i)=>({id:crypto.randomUUID(),name,order:i,role:roles[i],isAlive:true,diedInRound:null,deathCause:null,score:0,winPoints:0,plan:''}));
}
export function suggestedWinner(players){
 const alive=players.filter(p=>p.isAlive),actualMafia=alive.filter(p=>p.role==='MAFIA').length;
 const mafiaTeam=alive.filter(p=>teamOf(p.role)==='MAFIA').length;
 return actualMafia===0?'VILLAGER':mafiaTeam>=alive.length-mafiaTeam?'MAFIA':null;
}
export function eliminatePlayer(game,id,cause){
 if(!['NIGHT','VOTE'].includes(cause))throw Error('INVALID_CAUSE');
 const p=game.players.find(p=>p.id===id);if(!p||!p.isAlive||game.status!=='host')throw Error('INVALID_ELIMINATION');
 if(p.role==='ASTROLOGER'&&cause==='NIGHT')throw Error('JOTISHI_IMMUNE');
 p.isAlive=false;p.diedInRound=game.currentRound;p.deathCause=cause;
}
export function canGuessPolice(game){return game.players.some(p=>p.role==='MAFIA')&&game.players.some(p=>p.role==='POLICE')&&!game.finalGuess;}
export function victoryPoints(player,winner){
 if(teamOf(player.role)!==winner)return 0;
 if(winner==='MAFIA')return player.role==='BETRAYER'?2:3;
 return ['DOCTOR','POLICE'].includes(player.role)?2:1;
}
export function finalizeVictory(game,winner,now=new Date().toISOString()){
 if(!['MAFIA','VILLAGER'].includes(winner))throw Error('INVALID_WINNER');
 if(game.awardsApplied){if(game.winner!==winner)throw Error('ALREADY_FINALIZED');return false;}
 // Calculate all awards before mutating; manual points remain intact.
 const awards=game.players.map(p=>p.quit?0:victoryPoints(p,winner));
 game.players.forEach((p,i)=>{p.winPoints=awards[i];p.score=(Number.isSafeInteger(p.score)?p.score:0)+awards[i];});
 game.awardsApplied=true;game.winner=winner;game.pendingVictory=null;game.status='over';game.endedAt=now;return true;
}
export function beginVillageFinale(game){
 if(game.awardsApplied||game.status==='over')throw Error('ALREADY_FINALIZED');
 game.pendingVictory='VILLAGER';game.status='last-chance';
}
export function resolveFinalGuess(game,targetId){
 if(game.status!=='last-chance'||game.pendingVictory!=='VILLAGER'||game.finalGuess||game.awardsApplied)throw Error('GUESS_NOT_AVAILABLE');
 const target=targetId===null?null:game.players.find(p=>p.id===targetId);
 if(targetId!==null&&!target)throw Error('INVALID_TARGET');
 const correct=target?.role==='POLICE';
 game.finalGuess={targetId:target?.id??null,correct:!!correct,skipped:targetId===null};
 finalizeVictory(game,correct?'MAFIA':'VILLAGER');
 return game.winner;
}
export function migrateGame(game){
 if(!game)return game;
 game.players??=[];
 game.players.forEach(p=>{if(p.role==='CITIZEN')p.role='VILLAGER';p.winPoints??=0;p.score??=0;p.plan??='';p.deathCause??=null;});
 if(game.winner==='CITIZEN')game.winner='VILLAGER';
 if(game.lastSuggestion==='CITIZEN')game.lastSuggestion='VILLAGER';
 if(!game.roleCounts){game.roleCounts=game.players.length?Object.fromEntries(CONFIGURABLE_ROLES.map(r=>[r,game.players.filter(p=>p.role===r).length])):{...defaultRoleCounts(game.names.length),MAFIA:game.mafiaCount||1};}
 // Preserve legacy results and manually entered scores without retroactive awards.
 if(game.status==='over')game.awardsApplied=true;
 return game;
}
export async function passwordHash(password,salt){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt),iterations:120000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');
}

export function validateManualAssignments(names,config,assignments={}){
 const configError=validateRoleCounts(names.length,config);if(configError)return configError;
 if(names.some(name=>!Object.hasOwn(ROLES,assignments[name])))return 'MISSING_ASSIGNMENTS';
 const expected=roleCounts(names.length,config);
 if(Object.entries(expected).some(([r,n])=>names.filter(name=>assignments[name]===r).length!==n))return 'ASSIGNMENT_COUNTS';
 return null;
}
export function assignManualRoles(names,config,assignments){
 const error=validateManualAssignments(names,config,assignments);if(error)throw Error(error);
 return names.map((name,i)=>({id:crypto.randomUUID(),name,order:i,role:assignments[name],isAlive:true,diedInRound:null,deathCause:null,score:0,winPoints:0,plan:''}));
}
