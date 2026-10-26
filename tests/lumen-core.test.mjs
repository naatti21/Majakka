import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../lumen-core.js';
const C=globalThis.MajakkaLumenCore,p={lat:61.4984,lng:23.7623};
test('stable personal Lumen field and different distribution for other players',()=>{
 const a=C.cells(p,'abcdef0123456789'),b=C.cells(p,'abcdef0123456789');
 assert.deepEqual(a,b);
 assert.notDeepEqual(a.slice(0,12),C.cells(p,'fedcba9876543210').slice(0,12));
 const shifted={lat:p.lat+.001,lng:p.lng+.001},both=new Set(C.cells(shifted,'abcdef0123456789').map(q=>q.id));
 assert.ok(a.some(q=>both.has(q.id)));
 assert.ok(a.some(q=>q.size==='dust'));
 assert.ok(a.some(q=>q.size==='heart'));
});
test('accuracy, walk eligibility, claim uniqueness and speed/jump limits',()=>{
 const point={...p,...C.merc(p),id:'x'};
 assert.equal(C.pickups([point],null,p,{firstFix:true,accuracy:15}).length,1);
 assert.equal(C.pickups([point],null,p,{firstFix:true,accuracy:80}).length,0);
 assert.equal(C.pickups([point],null,p,{accuracy:15}).length,0);
 assert.equal(C.pickups([point],p,p,{accepted:true,accuracy:15,claimed:new Set(['x'])}).length,0);
 assert.equal(C.pickups([point],p,{lat:p.lat+.01,lng:p.lng},{accepted:true,accuracy:15}).length,0);
});
test('collect along valid walking segments only within 30 metres',()=>{
 const a={lat:p.lat-.0004,lng:p.lng},b={lat:p.lat+.0004,lng:p.lng},point={...p,...C.merc(p),id:'near'},far={lat:p.lat,lng:p.lng+.003};
 assert.deepEqual(C.pickups([point],a,b,{accepted:true,accuracy:8}).map(x=>x.id),['near']);
 assert.equal(C.pickups([{...point,x:C.merc(far).x}],a,b,{accepted:true,accuracy:8}).length,0);
});