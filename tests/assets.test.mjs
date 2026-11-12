import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {ROLES} from '../www/engine.mjs';
test('every offline asset exists, including both worlds and the QR client',async()=>{
 const handlers={},urls=[];
 const context={self:{addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:()=>{}},caches:{open:async()=>({addAll:async assets=>urls.push(...assets)})}};
 vm.runInNewContext(await readFile(new URL('../www/sw.js',import.meta.url),'utf8'),context);
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 assert.ok(urls.includes('room.html'));assert.ok(urls.includes('vendor/qrcode.mjs'));
 for(const url of urls)await access(new URL('../www/'+(url==='./'?'index.html':url),import.meta.url));
 for(const lang of ['bn','en']){
  const files=await readdir(new URL('../www/assets/'+lang+'/',import.meta.url));
  assert.deepEqual(files.sort(),['cover.png','host.png','mafia-2.png','mafia-3.png',...Object.keys(ROLES).map(r=>r.toLowerCase()+'.png')].sort());
 }
});
