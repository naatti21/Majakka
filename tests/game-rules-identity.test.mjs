import test from 'node:test';
import assert from 'node:assert/strict';
import { linkId, fieldId } from '../game-rules/identity.mjs';
test('unordered canonical links and distinct namespace',()=>{
 assert.equal(linkId('node:b','node:a'),'link:v1:["node:a","node:b"]');
 assert.equal(linkId('node:a','node:b'),linkId('node:b','node:a'));
 assert.notEqual(linkId('a,b','c'),linkId('a','b,c'));
 assert.notEqual(linkId('A','a'),linkId('a','b'));
});
test('all six field permutations yield exact canonical ID',()=>{
 for(const ids of [['a','b','c'],['a','c','b'],['b','a','c'],['b','c','a'],['c','a','b'],['c','b','a']]) assert.equal(fieldId(...ids),'field:v1:["a","b","c"]');
});
test('invalid or duplicate identities cannot alias valid nodes',()=>{
 for(const id of ['',null,undefined,1,{},' a','a ','a\n','\ud800']) assert.throws(()=>linkId(id,'valid'));
 assert.throws(()=>linkId('a','a'));assert.throws(()=>fieldId('a','b','a'));
});
test('Unicode, escaping and locale-independent byte contract; no normalization aliases',()=>{
 assert.equal(linkId('ä','z'),'link:v1:["z","ä"]');
 assert.notEqual(linkId('é','z'),linkId('e\u0301','z'));
 assert.equal(linkId('a"','b\\'),'link:v1:["a\\\"","b\\\\"]');
 assert.equal(linkId('🌟','a'),linkId('a','🌟'));
});
