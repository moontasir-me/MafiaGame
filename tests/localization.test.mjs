import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getLanguage,saveLanguage,LANGUAGE_KEY,pageLanguage,t,number} from '../www/locale.mjs';
import {translateText} from '../www/localization.mjs';
import {newSpySession,addSpyPlayer,dealSpy,spyIdentity,resetSpy,nextSpyReveal,endSpyDiscussion,voteSpy,nextCaughtSpyCase} from '../www/spy-local.mjs';
import {SPY_EN_COMMON,SPY_EN_WORDS} from '../www/spy-words-en.mjs';
import {RIDDLES_EN} from '../www/riddles-en.mjs';
import {byLevel} from '../www/riddle-levels.mjs';
import {BANKS} from '../www/fib-questions.mjs';
import {CHARACTERS} from '../www/characters.mjs';
import {UNIVERSES} from '../www/universe.mjs';

test('app language persists independently of a Mafia universe; Colour Rush stays English',()=>{
 const values=new Map([['mafia.universe','polashi']]);const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.equal(getLanguage(storage),'bn');saveLanguage('en',storage);assert.equal(getLanguage(storage),'en');assert.equal(values.get('mafia.universe'),'polashi');assert.throws(()=>saveLanguage('fr',storage));
 globalThis.localStorage=storage;globalThis.location={pathname:'/rush.html'};saveLanguage('bn',storage);assert.equal(pageLanguage(),'en');assert.equal(t('বাংলা','English'),'English');assert.equal(number(12),'12');assert.equal(translateText('স্ক্যান করে যোগ দিন'),'Scan to join');location.pathname='/spy.html';assert.equal(pageLanguage(),'bn');
 assert.equal(getLanguage({getItem(){throw Error('blocked');}}),'bn');delete globalThis.location;delete globalThis.localStorage;
});
test('Spy deals English words in English and Bangla words in Bangla, retaining scores across language changes',()=>{
 const s=newSpySession();for(const name of ['Tanim','জামাল','Mitu','Rana'])addSpyPlayer(s,name);s.players[0].score=9;
 dealSpy(s,{language:'en',random:()=>0});assert.ok(SPY_EN_COMMON.includes(s.word));assert.ok(!/[\u0980-\u09ff]/.test(s.word));assert.equal(spyIdentity(s,s.spyId).word,null);
 while(s.phase==='reveal')nextSpyReveal(s,1000);endSpyDiscussion(s,2000);voteSpy(s,s.spyId,2000);const starter=s.spyId,word=s.word;
 nextCaughtSpyCase(s,{language:'en',random:()=>0});assert.equal(s.order[0],starter);assert.notEqual(s.word,word);assert.equal(s.language,'en');
 resetSpy(s);dealSpy(s,{language:'bn',random:()=>0});assert.ok(/[\u0980-\u09ff]/.test(s.word));assert.equal(s.players[0].name,'Tanim');assert.equal(s.players[1].name,'জামাল');assert.ok(s.players[0].score>=9);
});
test('English content decks have unique familiar words and playable riddles at every level',()=>{
 assert.ok(SPY_EN_COMMON.length>=500);assert.ok(SPY_EN_WORDS.length>=1500);assert.ok(SPY_EN_WORDS.length>SPY_EN_COMMON.length);assert.equal(new Set(SPY_EN_COMMON).size,SPY_EN_COMMON.length);assert.ok(SPY_EN_COMMON.every(w=>/^[a-z-]+$/.test(w)));
 assert.ok(RIDDLES_EN.length>=90);assert.equal(new Set(RIDDLES_EN.map(([q])=>q)).size,RIDDLES_EN.length);for(const list of Object.values(byLevel(RIDDLES_EN)))assert.ok(list.length>=10);
 for(const [q,a]of RIDDLES_EN){assert.ok(q&&a);assert.ok(!/[\u0980-\u09ff]/.test(q+a));}
});
test('translations cover home, counts, dynamic results and all generated maths banks',()=>{
 assert.equal(translateText('১–৪ জন','en'),'1–4 players');assert.equal(translateText('খেলার আসর','en'),'Choose your game');assert.equal(translateText('Tanim জিতলেন!','en'),'Tanim wins!');assert.equal(translateText('৩য়','en'),'3rd');assert.equal(translateText('২ম','en'),'2nd');assert.equal(translateText('Tanim 12','en'),'Tanim 12');
 let seed=4;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(const bank of BANKS)for(const generate of bank)for(let i=0;i<30;i++){const q=generate(random);for(const text of [q.q,q.why,...q.wrong])assert.ok(!/[\u0980-\u09ff]/.test(translateText(text,'en')),text);}
});
test('Mafia character histories and world copy can be read in either UI language',()=>{
 for(const entry of Object.values(CHARACTERS.bn))for(const c of(Array.isArray(entry)?entry:[entry]))for(const key of ['name','era','history'])assert.ok(!/[\u0980-\u09ff]/.test(translateText(c[key],'en')),c[key]);
 for(const world of Object.values(UNIVERSES))for(const text of [world.story,world.subtitle,world.castTitle]){const en=translateText(text,'en');assert.ok(!/[\u0980-\u09ff]/.test(en),text);}
 assert.ok(/[\u0980-\u09ff]/.test(translateText(CHARACTERS.en.HOST.history,'bn')));
});
test('localizing a screen preserves player names and private words while translating controls and input hints',async()=>{
 const {localizeTree}=await import('../www/localization.mjs');
 const oldDocument=globalThis.document,oldFilter=globalThis.NodeFilter;
 const parent=protectedName=>({closest:selector=>protectedName&&selector.includes(protectedName)?{}:null});
 const name={nodeType:3,nodeValue:'জামাল',parentElement:parent('.rank-name')};
 const word={nodeType:3,nodeValue:'প্রজা',parentElement:parent('[data-no-translate]')};
 const control={nodeType:3,nodeValue:'নতুন খেলা',parentElement:parent(null)};
 const attrs={placeholder:'আপনার নাম',value:'জামাল ১২'};
 const input={nodeType:1,closest:selector=>selector.includes('input')?{}:null,matches:()=>true,querySelectorAll:()=>[],getAttribute:key=>attrs[key],setAttribute:(key,value)=>attrs[key]=value};
 const root={nodeType:1,closest:()=>null,querySelectorAll:()=>[input],getAttribute:()=>null,nodes:[name,word,control]};
 globalThis.NodeFilter={SHOW_TEXT:4};globalThis.document={createTreeWalker:root=>{let i=0;return {currentNode:null,nextNode(){this.currentNode=root.nodes?.[i++];return !!this.currentNode;}};}};
 try{localizeTree(root,'en');assert.equal(name.nodeValue,'জামাল');assert.equal(word.nodeValue,'প্রজা');assert.equal(control.nodeValue,'New game');assert.equal(attrs.placeholder,'Your name');assert.equal(attrs.value,'জামাল ১২');}
 finally{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;if(oldFilter===undefined)delete globalThis.NodeFilter;else globalThis.NodeFilter=oldFilter;}
});
