import {test} from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {assetUrl} from '../www/asset-urls.mjs';
import {saveMatch,readHistory,overallRanking} from '../www/history.mjs';
import {rankTable} from '../www/ui-kit.mjs';
test('saved rankings keep names and points while upgrading removed illustration URLs',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 saveMatch({id:'before-cleanup',game:'mafia',date:'2026-11-15T00:00:00Z',players:[{name:'তানিম',points:7,recent:[{won:true,img:'assets/bn/mafia.png',label:'Mafia'}]},{name:'Mitu',points:2,recent:[{won:false,img:'assets/classic/characters.svg#doctor',label:'Doctor'}]}]},storage);
 const matches=readHistory(storage);assert.equal(matches[0].players[0].name,'তানিম');assert.equal(matches[0].players[0].points,7);assert.equal(matches[0].players[0].recent[0].img,'assets/bn/mafia.webp');assert.equal(matches[0].players[1].recent[0].img,'assets/classic/doctor.webp');assert.equal(overallRanking(matches)[0].points,7);
 const html=rankTable([{name:'A',score:1,history:[{img:'assets/fib/spiral.svg',won:true,label:'Maths'}]}],{caption:'Ranking',rank:'Rank',player:'Player',points:'Points'});assert.ok(html.includes('assets/fib/cover-tile.webp'));assert.ok(!html.includes('spiral.svg'));
});
test('every known legacy art family resolves to a real production image',async()=>{
 const old=['assets/en/cover.png','assets/bn/host.png','assets/classic/cover.png','assets/classic/characters.svg#betrayer','assets/spy/agent.svg','assets/spy/detective.svg','assets/kalidas/kalidas.svg','assets/shitolpati/cover.svg'];
 for(const game of ['mafia','spy','kalidas','pen','fib','shotoronji','chor','ludo','carrom','dots','tinguti','rush'])old.push(`assets/${game}/cover.svg`);
 for(const path of old)await access(new URL('../www/'+assetUrl(path),import.meta.url));
 for(const path of ['data:image/png;base64,photo','https://example.com/profile.png','assets/pen/pinpoint.svg'])assert.equal(assetUrl(path),path);
});
