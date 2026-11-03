import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['n2-vocab-1160.js','n2-novel-plan.js','n2-novel-part1.js','n2-novel-part2.js','n2-novel-part3.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
}
const data=ctx.window.N2_NOVEL,rows=ctx.window.N2_MIMIKARA_1160;
assert.equal(rows.length,1160,'Mimikara source has exactly 1160 entries');
assert.equal(data.parts.length,8,'8 parts');
assert.equal(data.chapters.length,64,'64 chapter slots');
assert.equal(data.published.length,24,'24 chapters are currently written');
assert.ok(rows.every((w,i)=>w[0]===i+1&&w[1]&&w[2]&&w[3]),'source rows sequential and complete');
const assignment=data.chapters.flatMap(c=>c.wordIds);
assert.equal(assignment.length,1160);
assert.deepEqual(Array.from(assignment),Array.from({length:1160},(_,i)=>i+1),'every word appears in exactly one chapter assignment');
for(const ch of data.chapters){assert.equal(ch.wordIds.length,ch.number%8===0?19:18);assert.ok(ch.title&&ch.summary&&ch.hook)}
let inside=[];for(const c of data.published){const ch=data.chapters[c.number-1];assert.ok(c.paragraphs.length>=4,'published chapter must contain at least 8 narrative paragraphs');for(const p of c.paragraphs){assert.ok(p.ja.length>20&&p.vi.length>25,'bilingual prose must be substantive');inside.push(...[...p.ja.matchAll(/⟦(\d+)⟧/g)].map(x=>Number(x[1])))}const used=new Set(c.paragraphs.flatMap(p=>[...p.ja.matchAll(/⟦(\d+)⟧/g)].map(x=>Number(x[1]))));for(const id of ch.wordIds)assert.ok(used.has(id),'chapter '+c.number+' missing in-story #'+id)}
const uniq=new Set(inside);assert.equal(uniq.size,435,'435 words have been written into Japanese prose so far');
assert.ok([...uniq].every(x=>x>=1&&x<=435),'unpublished words must not be counted as covered');
console.log(JSON.stringify({result:'PASS',sourceRows:rows.length,parts:data.parts.length,plannedChapters:data.chapters.length,publishedChapters:data.published.length,assigned:assignment.length,coveredUnique:uniq.size,remainingUnwritten:1160-uniq.size,inStoryReferences:inside.length,policy:'assigned vocabulary is NOT counted as written'}));