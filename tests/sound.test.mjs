import {test} from 'node:test';
import assert from 'node:assert/strict';
import {teaPourSamples} from '../www/sound.mjs';
test('tea pouring has an audible continuous stream for the animation duration with soft edges',()=>{
 let seed=42;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const rate=24000,samples=teaPourSamples(rate,random);assert.equal(samples.length,49200);
 const rms=data=>Math.sqrt(data.reduce((sum,x)=>sum+x*x,0)/data.length);
 assert.ok(rms(samples)>.07);assert.ok(Math.max(...samples)<1);assert.ok(Math.min(...samples)>-1);
 assert.ok(rms(samples.slice(0,240))<rms(samples.slice(2400,4800)));assert.ok(rms(samples.slice(-240))<rms(samples.slice(2400,4800)));
});
