import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base=process.cwd();
const win={window:{}};vm.createContext(win);
for(const path of ['n2-vocab-1160.js','seven-seas-plan.js','seven-seas-part1.js'])vm.runInContext(fs.readFileSync(base+'/'+path,'utf8'),win,{filename:path});
const source=win.window.N2_MIMIKARA_1160,plan=win.window.SEVEN_SEAS_PLAN,chapters=win.window.SEVEN_SEAS_DRAFTS;
assert.equal(source.length,1160);
assert.equal(plan.chapters.length,64);
assert.equal(chapters.length,8);
assert.equal(plan.meta.world.length,7);
const assignments=plan.chapters.flatMap(c=>c.plannedIds);
assert.equal(assignments.length,1160);
assert.equal(new Set(assignments).size,1160,'each source term assigned once');
assert.deepEqual([...assignments].sort((a,b)=>a-b),Array.from({length:1160},(_,i)=>i+1),'all source terms have planned chapters');
const known=new Map(source.map(w=>[w[0],w]));
let mentions=0,allTokens=[];
for(let i=0;i<chapters.length;i++){
 const c=chapters[i];assert.equal(c.number,i+1);
 assert.ok(c.paragraphs.length>=8,'chapter needs at least 8 real paragraphs');
 assert.ok(c.paragraphs.join(' ').split(/\s+/).length>=550,'chapter needs full prose, not outline');
 const actual=[];
 for(const p of c.paragraphs){
  assert.ok(p.length>=140,'paragraph too short');
  for(const match of p.matchAll(/⟦(\d+)\|([^⟧]+)⟧/g)){
    const id=Number(match[1]);assert.ok(known.has(id),'unknown source id '+id);
    assert.ok(match[2].length>1,'empty Vietnamese phrase');
    actual.push(id);mentions++;allTokens.push(id)
  }
  assert.ok(!p.replace(/⟦\d+\|[^⟧]+⟧/g,'').includes('⟦'),'unclosed vocab marker');
 }
 assert.ok(new Set(actual).size>=11,'chapter too sparse in N2 vocabulary');
 assert.equal(plan.chapters[c.number-1].status,'draft');
}
assert.equal(new Set(allTokens).size,97);
assert.equal(mentions,99);
assert.equal(plan.chapters.slice(8).filter(c=>c.status==='planned').length,56);
console.log(JSON.stringify({result:'PASS',source:source.length,planned:assignments.length,bookChapters:64,draftedChapters:chapters.length,uniqueInStory:new Set(allTokens).size,mentions,avgWords:Math.round(chapters.reduce((a,c)=>a+c.paragraphs.join(' ').split(/\s+/).length,0)/8)},null,2));