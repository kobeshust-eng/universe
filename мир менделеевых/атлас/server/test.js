'use strict';
const assert=require('node:assert/strict');const Game=require('../dist/game/engine.js');
function crew(n){const s=Game.create();for(let i=0;i<n;i++)assert(Game.addPlayer(s,'p'+i));return s;}
for(let n=1;n<=4;n++){
 const s=crew(n);assert.equal(Game.addPlayer(s,'p0'),false);Game.action(s,'p0',{type:'launch'});assert.equal(s.phase,'lobby');
 if(n>1){Game.action(s,'p1',{type:'planet',planet:'alpha'});assert.equal(s.planet,'earth');}
 Game.action(s,'p0',{type:'planet',planet:'alpha'});s.players.forEach(p=>Game.action(s,p.id,{type:'ready'}));Game.action(s,'p0',{type:'launch'});assert.equal(s.phase,'travel');for(let t=0;t<61;t++)Game.tick(s,.05);assert.equal(s.phase,'play');assert.equal(s.game.items.length,14);
 for(let i=0;i<14;i++){const p=s.players[i%n];p.x=480;p.y=260;Game.tick(s,.05);assert.equal(p.carrying,true);p.x=s.game.items[i].x;p.y=s.game.items[i].y;Game.tick(s,.05);assert.equal(s.game.items[i].done,true);}
 assert.equal(s.phase,'result');assert.equal(s.stars,3);assert.deepEqual(s.visited,['alpha']);Game.action(s,'p0',{type:'home'});assert.equal(s.phase,'lobby');
 s.planet='earth';Game.begin(s);const count=8+4*n;assert.equal(s.game.target,count);for(const item of s.game.items){s.players[0].x=item.x;s.players[0].y=item.y;Game.tick(s,.05);}assert.equal(s.phase,'result');
 s.planet='mars';Game.begin(s);const before=s.game.index;Game.action(s,'p0',{type:'note',color:0});assert.equal(s.game.index,before,'cannot play while sequence showing');
 for(let round=0;round<4;round++){s.elapsed=s.game.showUntil+.1;const seq=[...s.game.sequence];seq.forEach((color,i)=>Game.action(s,'p'+(i%n),{type:'note',color}));}assert.equal(s.phase,'result');
 s.planet='jupiter';Game.begin(s);const target=s.game.target;for(let i=0;i<target;i++){s.elapsed=i*2.4+1.2;Game.action(s,'p'+(i%n),{type:'beat'});const count=s.game.progress;Game.action(s,'p0',{type:'beat'});assert.equal(s.game.progress,count,'one hit per beat');}assert.equal(s.phase,'result');
 s.planet='art';Game.begin(s);for(let i=0;i<24;i++){const id='p'+(i%n);Game.action(s,id,{type:'color',color:s.game.pattern[i]});Game.action(s,id,{type:'paint',cell:i});}assert.equal(s.phase,'result');assert.equal(s.visited.length,5);assert.equal(s.stars,15);
 console.log(`PASS ${n} players: shared travel + all five minigames`);
}
const s=crew(4);assert.equal(Game.addPlayer(s,'p4'),false);Game.removePlayer(s,'p0');assert.equal(s.captain,'p1');assert.equal(Game.action(s,'unknown',{type:'ready'}),false);s.planet='art';Game.begin(s);assert.equal(Game.action(s,'p1',{type:'paint',cell:-1}),false);assert.equal(Game.action(s,'p1',{type:'color',color:17}),false);assert.equal(Game.action(s,'p1',{type:'planet',planet:'mars'}),false);console.log('PASS capacity, captain handoff and invalid actions');
