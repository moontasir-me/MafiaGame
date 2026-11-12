import {createHash} from 'node:crypto';
import {RoomService} from '../www/room-service.mjs';
const fail=code=>{throw Error(code);};
const READ=new Set(['/api/state','/api/rankings','/api/inspect']);
const PATHS=new Set([...READ,'/api/create','/api/join','/api/action','/api/profile']);
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function packRoom(service,id){const r=service.rooms.get(id);return {version:2,rooms:[[id,{...r,game:r.game?{...r.game,players:undefined}:null}]],profiles:[]};}
export class OnlineRooms{
 constructor(store,{now=Date.now}={}){this.store=store;this.now=now;}
 restore(payload){const s=new RoomService({now:this.now});s.restore(payload);for(const r of s.rooms.values()){r.touched=this.now();for(const m of r.members)s.syncProfile(m);}return s;}
 async handle(path,body={}){
  if(!PATHS.has(path))fail('NOT_FOUND');
  if(path==='/api/create'){for(let attempt=0;attempt<8;attempt++){const service=new RoomService({now:this.now}),result=await service.handle(path,body);if(await this.store.create(result.room,packRoom(service,result.room)))return result;}fail('BUSY');}
  const id=String(body.room||'').toUpperCase();if(!/^[A-F0-9]{6}$/.test(id))fail('ROOM_GONE');
  if(path!=='/api/join'&&!/^[a-f0-9]{48}$/.test(body.token||''))fail('AUTH');
  const requestId=/^[a-f0-9-]{36}$/i.test(body.requestId||'')?body.requestId:null;
  const receipt=requestId?digest([path,body.token||body.invite,requestId].join('|')):null;
  for(let attempt=0;attempt<32;attempt++){
   const record=await this.store.load(id);if(!record)fail('ROOM_GONE');const service=this.restore(record.payload),r=service.rooms.get(id);if(path!=='/api/join'&&!r.members.some(m=>m.token===body.token))fail('AUTH');
   if(receipt&&r.onlineReceipts?.some(x=>x.key===receipt)){
    const saved=r.onlineReceipts.find(x=>x.key===receipt),member=r.members.find(m=>m.id===saved.memberId);
    if(path==='/api/join'){if(body.invite!==r.invite||!member)fail('INVITE');await this.store.touch(id);return {room:id,token:member.token,view:service.view(r,member)};}
    if(!member||member.token!==body.token)fail('AUTH');await this.store.touch(id);return service.view(r,member);
   }
   const a=body.action;
   if(path==='/api/action'&&a){if(a.expectedEdition!==undefined&&a.expectedEdition!==r.edition)fail('STALE');if(['round','end-round'].includes(a.type)&&a.expectedRound!==undefined&&a.expectedRound!==r.round)fail('STALE');}
   const result=await service.handle(path,body);
   if(READ.has(path)){await this.store.touch(id);return result;}
   if(receipt&&!result.left){const member=path==='/api/join'?r.members.find(m=>m.token===result.token):r.members.find(m=>m.token===body.token);r.onlineReceipts=[...(r.onlineReceipts||[]),{key:receipt,memberId:member.id}].slice(-64);}
   if(await this.store.save(id,record.revision,packRoom(service,id)))return result;
   await new Promise(resolve=>setTimeout(resolve,Math.random()*Math.min(120,10*(attempt+1))));
  }
  fail('BUSY');
 }
}
