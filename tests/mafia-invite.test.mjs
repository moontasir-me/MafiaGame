import test from 'node:test';
import assert from 'node:assert/strict';
import {mafiaInvite,invitedRoom} from '../www/mafia-invite.mjs';
import {RoomService} from '../www/room-service.mjs';
import qrcode from '../www/vendor/qrcode.mjs';
test('room invitation encodes the room and invite without exposing host credentials',async()=>{const rooms=new RoomService(),host=await rooms.handle('/api/create',{name:'Host',locale:'classic'}),link=mafiaInvite('https://example.test',host.room,'classic',host.view.invite),url=new URL(link);assert.equal(url.pathname,'/room.html');assert.equal(invitedRoom(url.search),host.room);assert.equal(url.searchParams.get('lang'),'classic');assert.ok(!link.includes(host.token));const guest=await rooms.handle('/api/join',{room:invitedRoom(url.search),invite:new URLSearchParams(url.hash.slice(1)).get('invite'),name:'Friend'});assert.equal(guest.view.isHost,false);assert.equal(guest.view.me.name,'Friend');assert.equal(guest.view.locale,'classic');const qr=qrcode(0,'M');qr.addData(link);qr.make();assert.ok(qr.getModuleCount()>20);assert.match(qr.createSvgTag({cellSize:4,margin:16,scalable:true}),/<svg/);});
test('room links normalize codes and reject invalid destinations',()=>{assert.equal(invitedRoom('?room=abcdef'),'ABCDEF');assert.equal(invitedRoom('?room=oops'),null);assert.throws(()=>mafiaInvite('https://example.test','bad'));});
