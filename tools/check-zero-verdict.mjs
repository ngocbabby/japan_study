import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['n2-vocab-1160.js','zero-verdict-plan.js',...Array.from({length:8},(_,i)=>'zero-verdict-part'+(i+1)+'.js'),...Array.from({length:8},(_,i)=>'zero-verdict-expanded-'+(i+1)+'.js')]){
 const content=fs.readFileSync(file,'utf8');vm.runInContext(content,ctx,{filename:file});
}
const src=ctx.window.N2_MIMIKARA_1160,plan=ctx.window.ZERO_VERDICT_PLAN,chapters=ctx.window.ZERO_VERDICT_DRAFTS,editorial=ctx.window.ZERO_VERDICT_EXPANSIONS;
assert.equal(Object.keys(editorial).length,64,'64 chapters must have expansions');
assert.equal(src.length,1160);
assert.equal(plan.chapters.length,64);
assert.equal(chapters.length,64,'no placeholder chapters');
assert.equal(plan.meta.parts.length,8);
assert.equal(plan.meta.world.length,7);
assert.ok(fs.existsSync('books/n2/vocab/ban-an-so-khong.svg'),'cover missing');
const assignments=plan.chapters.flatMap(c=>c.plannedIds);
assert.equal(assignments.length,1160);
assert.equal(new Set(assignments).size,1160,'source ID assigned more than once');
assert.equal(assignments.filter(id=>id>=1&&id<=1160).length,1160);
const sourceIds=new Set(src.map(r=>r[0]));
const all=new Set();let words=0,mentions=0,paragraphs=0;const chapterStats=[];
for(const [i,ch] of chapters.entries()){
 assert.equal(ch.number,i+1,'chapter order');
 assert.equal(ch.title??plan.chapters[i].title,plan.chapters[i].title,'chapter title');
 assert.equal(plan.chapters[i].status,'draft','chapter plan must indicate drafted');
 assert.ok(ch.paragraphs.length>=8,'chapter '+(i+1)+' must have full paragraphs');
 const inserts=editorial[ch.number];assert.equal(inserts.length,4,'expected four meaningful added scenes per chapter '+ch.number);
 assert.deepEqual(Array.from(inserts.map(x=>x.after)),[0,2,4,6]);
 for(const item of inserts){assert.equal(item.paragraphs.length,1);assert.ok(item.paragraphs[0].length>500,'expansion too thin '+ch.number);assert.ok(!/[⟦⟧]/.test(item.paragraphs[0]),'original N2 markers must remain in untouched manuscript');}
 const full=ch.paragraphs.flatMap((p,j)=>[p,...(inserts.find(e=>e.after===j)?.paragraphs||[])]);
 const wc=full.join(' ').split(/\s+/).filter(Boolean).length;
 assert.ok(wc>=1100,'not enough complete novel prose in chapter '+(i+1)+' got '+wc);
 words+=wc;paragraphs+=full.length;chapterStats.push({chapter:ch.number,words:wc,paragraphs:full.length});
 const local=new Set();
 for(const p of ch.paragraphs){
  assert.ok(p.length>=100,'too short paragraph in chapter '+(i+1));
  const consumed=p.replace(/⟦(\d+)\|([^⟧]+)⟧/g,(_match,id,phrase)=>{
   const n=Number(id);
   assert.ok(sourceIds.has(n),'unknown N2 term '+n);
   assert.ok(phrase.trim().length>=2,'empty Vietnamese term phrase #'+n);
   local.add(n);all.add(n);mentions++;
   return phrase;
  });
  assert.ok(!consumed.includes('⟦')&&!consumed.includes('⟧'),'malformed marker chapter '+(i+1));
 }
 const missing=plan.chapters[i].plannedIds.filter(id=>!local.has(id));
 assert.equal(missing.length,0,'chapter '+(i+1)+' missing source terms '+missing.join(','));
 const extra=[...local].filter(id=>!plan.chapters[i].plannedIds.includes(id));
 assert.equal(extra.length,0,'chapter '+(i+1)+' has terms from another chapter '+extra.join(','));
}
assert.equal(all.size,1160,'all 1160 N2 IDs must appear in Vietnamese story text');
assert.ok(words>79000,'expanded novel still too short');
assert.equal(paragraphs,64*12,'reader must present twelve actual paragraphs per chapter');
assert.ok(chapters[63].paragraphs.join(' ').includes('Hai năm sau'),'missing epilogue');
console.log(JSON.stringify({result:'PASS',chapters:64,parts:8,linkedN2Unique:all.size,linkedMentions:mentions,paragraphs,approxVietnameseWords:words,chapterStats,finalChapter:plan.chapters[63].title,manualPDFReview:'NOT COMPLETE'},null,2));
