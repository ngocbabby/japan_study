import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={window:{}};vm.createContext(ctx);
const names=['n2-vocab-1160.js','seven-seas-plan.js',...Array.from({length:8},(_,i)=>'seven-seas-part'+(i+1)+'.js')];
for(const name of names){const text=fs.readFileSync(name,'utf8');new Function(text);vm.runInContext(text,ctx,{filename:name})}
const source=ctx.window.N2_MIMIKARA_1160,plan=ctx.window.SEVEN_SEAS_PLAN,chapters=ctx.window.SEVEN_SEAS_DRAFTS;
assert.equal(source.length,1160,'N2 dictionary must have 1160 numbered entries');
assert.equal(plan.chapters.length,64,'64 planned chapters');
assert.equal(chapters.length,64,'64 chapters require actual Vietnamese narrative');
assert.equal(plan.meta.world.length,7,'seven stable sea laws');
const assigned=plan.chapters.flatMap(c=>c.plannedIds);
assert.equal(assigned.length,1160,'source assignments');
assert.equal(new Set(assigned).size,1160,'one canonical planned placement per source term');
assert.deepEqual([...assigned].sort((a,b)=>a-b),Array.from({length:1160},(_,i)=>i+1),'source gaps');
const known=new Map(source.map(row=>[row[0],row]));
const all=new Map();let mentions=0,words=0;
for(const [i,c] of chapters.entries()){
 assert.equal(c.number,i+1,'chapters must be in 1..64 narrative order');
 assert.equal(c.title,plan.chapters[i].title,'chapter headings must match the approved 64-chapter plan');
 assert.equal(plan.chapters[i].status,'draft','all chapters have actual published draft');
 assert.ok(c.paragraphs.length>=8,'not enough literary paragraphs chapter '+c.number);
 const chapterWords=c.paragraphs.join(' ').split(/\s+/).filter(Boolean).length;words+=chapterWords;
 assert.ok(chapterWords>=550,'draft chapter '+c.number+' too short to count as full-length reading');
 const used=new Set();
 for(const p of c.paragraphs){
  assert.ok(p.length>=110,'overly short prose paragraph in chapter '+c.number);
  let stripped=p.replace(/⟦(\d+)\|([^⟧]+)⟧/g,(m,id,display)=>{
   const n=Number(id);assert.ok(known.has(n),'unrecognized vocabulary id '+id);
   assert.ok(display.trim().length>=2,'blank translation for #'+id);
   const word=known.get(n);assert.ok(word[1]&&word[2]&&word[3],'incomplete source row '+id);
   all.set(n,(all.get(n)||0)+1);used.add(n);mentions++;
   return display;
  });
  assert.ok(!stripped.includes('⟦')&&!stripped.includes('⟧'),'broken vocabulary markup at chapter '+c.number);
  assert.ok(/[.!?。？！]|[”]$/.test(stripped.slice(-8)),'paragraph ends abruptly at chapter '+c.number);
 }
 const need=plan.chapters[i].plannedIds.filter(id=>!used.has(id));
 assert.equal(need.length,0,'missing chapter assigned vocab in chapter '+c.number+': '+need.join(','));
 assert.ok(used.size>=18,'insufficient new N2 words in chapter '+c.number);
}
assert.equal(all.size,1160,'all 1160 source IDs must appear in Vietnamese prose');
assert.ok(mentions>=1160,'every vocabulary item must actually be linked');
assert.ok(words>=41000,'full novel must have substantial prose length');
assert.ok(chapters[63].paragraphs.join(' ').includes('Ba năm sau'),'chapter 64 must include actual epilogue');
console.log(JSON.stringify({result:'PASS',sourceEntries:source.length,chapterCount:chapters.length,chapterPlan:plan.chapters.length,uniqueTermsInVietnameseNarrative:all.size,linkedTermMentions:mentions,VietnameseApproxWords:words,parts:8,lastChapter:chapters[63].title,manualPDFProofreading:'NOT VERIFIED — requires separate review'},null,2));
