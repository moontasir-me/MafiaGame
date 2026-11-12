import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validPin,cleanPin} from '../www/pin.mjs';
test('host PIN accepts exactly four digits including leading zeroes',()=>{for(const pin of ['0000','0123','9876'])assert.equal(validPin(pin),true);for(const pin of ['123','12345','abcd','12a4',' 1234','১২৩৪'])assert.equal(validPin(pin),false);assert.equal(cleanPin('০১২৩'),'0123');assert.equal(cleanPin('12a34-5'),'1234');});
