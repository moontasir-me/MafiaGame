import assert from 'node:assert/strict';
import {createMafiaServer} from '../server.mjs';
import {RoomService} from '../www/room-service.mjs';
let now=100000;
const server=createMafiaServer({rooms:new RoomService({now:()=>now})});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
try{
 const post=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.headers.get('cache-control'),'no-store');return {status:r.status,data:await r.json()};};
 const {data:host}=await post('/api/create',{name:'Host',locale:'en'}),sessions=[host];
 for(let i=0;i<5;i++){const r=await post('/api/join',{room:host.room,invite:host.view.invite,name:'Player '+i});assert.equal(r.status,200);sessions.push(r.data);}
 const call=(s,action)=>post('/api/action',{room:s.room,token:s.token,action}),view=s=>post('/api/state',{room:s.room,token:s.token});
 const assignments=Object.fromEntries(['MAFIA','DOCTOR','POLICE','ASTROLOGER','VILLAGER'].map((role,i)=>['Player '+i,role]));
 assert.equal((await call(host,{type:'start',counts:{MAFIA:1,DOCTOR:1,POLICE:1,ASTROLOGER:1},assignments})).status,200);
 assert.equal((await view(host)).data.me.role,'HOST');
 for(const session of sessions){const r=await view(session);assert.equal(r.status,200);assert.ok(r.data.me.role);assert.ok(!r.data.players?.some(p=>'role'in p||'token'in p));}
 assert.equal((await call(host,{type:'eliminate',id:host.view.me.id,cause:'NIGHT'})).status,400);
 assert.equal((await post('/api/inspect',{room:host.room,token:sessions[1].token,id:sessions[3].view.me.id})).status,400);
 assert.equal((await post('/api/inspect',{room:host.room,token:host.token,id:sessions[3].view.me.id})).data.role,'POLICE');
 await call(host,{type:'universe',locale:'bn'});assert.equal((await view(sessions[1])).data.locale,'bn');
 await call(host,{type:'timer',mode:'reset',minutes:1});await call(host,{type:'timer',mode:'start'});now+=60000;
 assert.equal((await view(sessions[1])).data.canVote,true);
 assert.equal((await call(host,{type:'vote',target:sessions[3].view.me.id})).status,400);
 assert.equal((await call(sessions[1],{type:'vote',target:sessions[3].view.me.id})).status,200);
 assert.equal((await call(sessions[1],{type:'vote',target:sessions[2].view.me.id})).status,400);
 assert.equal((await view(host)).data.votes.confirmed,1);
 await call(host,{type:'end-round',eliminated:[sessions[4].view.me.id,sessions[5].view.me.id]});
 assert.equal((await view(sessions[4])).data.me.isAlive,false);
 await call(host,{type:'finish',winner:'VILLAGER'});await call(sessions[1],{type:'guess',target:sessions[3].view.me.id});
 assert.equal((await view(host)).data.me.score,1);assert.equal((await view(sessions[1])).data.me.score,3);
 const ranks=await post('/api/rankings',{room:host.room,token:sessions[2].token});assert.equal(ranks.data.players.length,6);assert.equal(ranks.data.players.find(p=>p.id===host.view.me.id).history[0].role,'HOST');
 await call(host,{type:'transfer',id:sessions[1].view.me.id});assert.equal((await view(host)).data.isHost,false);assert.equal((await call(host,{type:'rematch'})).status,400);await call(sessions[1],{type:'rematch'});assert.equal((await view(host)).data.me.score,1);
 const bad=await fetch(base+'/api/state',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://another-site.invalid'},body:JSON.stringify(host)});assert.equal(bad.status,403);
 assert.equal((await fetch(base+'/api/state')).status,405);
 for(const file of ['room.html','vendor/qrcode.mjs','characters.mjs','assets/bn/host.png'])assert.equal((await fetch(base+'/'+file)).status,200);
 console.log('LAN integration passed: separate host + 5 players, private roles, voting, two eliminations, finale, persistent history, host transfer, origin/method checks.');
}finally{await new Promise(resolve=>server.close(resolve));}
