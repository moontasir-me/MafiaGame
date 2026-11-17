import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindTeaHost} from '../www/tea-host.mjs';
function setup({reduced=false}={}){
 const button={setAttribute(key,value){this[key]=value;},disabled:false},question={},hint={},root={dataset:{},querySelector:q=>q==='#tea-mama'?button:q==='.tea-question'?question:hint};
 const sounds=[],jobs=new Map();let id=0;
 const dispose=bindTeaHost(root,{sound:kind=>sounds.push(kind),schedule:fn=>{jobs.set(++id,fn);return id;},cancel:id=>jobs.delete(id),reducedMotion:()=>reduced});
 return{root,button,question,hint,sounds,jobs,dispose};
}
test('Tong mama greets, pours once per tap, serves, then can make another cup',()=>{
 const ui=setup();assert.equal(ui.root.dataset.tea,'idle');assert.equal(ui.question.textContent,'চা খাইবেন নি মামা?');
 ui.button.onclick();assert.equal(ui.root.dataset.tea,'pouring');assert.equal(ui.button.disabled,true);assert.equal(ui.button['aria-busy'],'true');assert.deepEqual(ui.sounds,['tea-pour']);
 ui.button.onclick();assert.equal(ui.jobs.size,1);ui.jobs.get(1)();assert.equal(ui.root.dataset.tea,'served');assert.equal(ui.button.disabled,false);assert.match(ui.question.textContent,/গরম চা/);assert.deepEqual(ui.sounds,['tea-pour','tea']);
 ui.button.onclick();assert.equal(ui.root.dataset.tea,'pouring');assert.equal(ui.jobs.size,2);ui.dispose();assert.equal(ui.button.onclick,null);ui.jobs.get(1)();assert.equal(ui.root.dataset.tea,'pouring');
});
test('reduced-motion visitors receive tea immediately, without a pour timer',()=>{
 const ui=setup({reduced:true});ui.button.onclick();assert.equal(ui.root.dataset.tea,'served');assert.equal(ui.jobs.size,0);assert.equal(ui.button.disabled,false);assert.deepEqual(ui.sounds,['tea']);
});
test('tea dialogue follows the saved language preference',()=>{
 const old=globalThis.localStorage;globalThis.localStorage={getItem:()=> 'en'};
 try{const ui=setup();assert.equal(ui.question.textContent,'Fancy a cup of tea, mama?');ui.button.onclick();ui.jobs.get(1)();assert.equal(ui.question.textContent,'Here you go, mama—fresh tea!');assert.equal(ui.button['aria-label'],'Get another cup of tea from mama');}
 finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old;}
});
test('tea notes reflect morning, afternoon and late-night tong chatter',()=>{const lines=[];for(const hour of [8,14,18,22,2]){const question={},hint={},button={setAttribute(){}};const root={dataset:{},querySelector:q=>q==='#tea-mama'?button:q==='.tea-question'?question:hint};const dispose=bindTeaHost(root,{now:()=>new Date(2026,10,18,hour),reducedMotion:()=>true});button.onclick();lines.push(hint.textContent);dispose();}assert.equal(new Set(lines).size,5);assert.match(lines[0],/সকালের/);assert.match(lines[1],/রোদ্দুরে/);assert.match(lines[4],/রাত জাগেন/);});
