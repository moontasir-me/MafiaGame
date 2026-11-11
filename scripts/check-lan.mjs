import assert from 'node:assert/strict';
import {createMafiaServer} from '../server.mjs';
const server=createMafiaServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
try{
 const post=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.headers.get('cache-control'),'no-store');return {status:r.status,data:await r.json()};};
 const {data:host}=await post('/api/create',{name:'Host',locale:'en'}),sessions=[host];
 for(let i=0;i<4;i++){const r=await post('/api/join',{room:host.room,invite:host.view.invite,name:'Player '+i});assert.equal(r.status,200);sessions.push(r.data);}
 assert.equal((await post('/api/action',{...host,action:{type:'start',counts:{MAFIA:1,DOCTOR:1,POLICE:1}}})).status,200);
 for(const session of sessions){const r=await post('/api/state',session);assert.equal(r.status,200);assert.ok(r.data.me.role);assert.ok(!r.data.players?.some(p=>'role'in p||'token'in p));}
 const transfer=await post('/api/action',{...host,action:{type:'transfer',id:sessions[1].view.me.id}});assert.equal(transfer.data.isHost,false);
 assert.equal((await post('/api/action',{...host,action:{type:'round'}})).status,400);
 assert.equal((await post('/api/inspect',{...host,id:sessions[2].view.me.id})).status,400);
 assert.equal((await post('/api/inspect',{...sessions[1],id:sessions[2].view.me.id})).status,200);
 await post('/api/action',{...sessions[1],action:{type:'universe',locale:'bn'}});
 assert.equal((await post('/api/state',host)).data.locale,'bn');
 const next=await post('/api/action',{...sessions[1],action:{type:'timer',mode:'start'}});assert.equal(next.data.timer.running,true);
 const bad=await fetch(base+'/api/state',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://another-site.invalid'},body:JSON.stringify(host)});assert.equal(bad.status,403);
 assert.equal((await fetch(base+'/api/state')).status,405);
 assert.equal((await fetch(base+'/room.html')).status,200);assert.equal((await fetch(base+'/vendor/qrcode.mjs')).status,200);
 console.log('LAN HTTP integration passed: 5 clients, private views, host transfer, universe, private inspection, timer, origin and method checks.');
}finally{await new Promise(resolve=>server.close(resolve));}
