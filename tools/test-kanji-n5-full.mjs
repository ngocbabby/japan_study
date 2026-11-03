import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync('books/n5/kanji/source-manifest.json','utf8'));
assert.equal(manifest.source.pages,32);
assert.equal(manifest.source.rows,135);
assert.equal(manifest.source.unique_kanji,123);
assert.equal(manifest.chapters.length,25);
assert.equal(new Set(manifest.chapters.flatMap(c=>c.entries.map(e=>e.kanji))).size,123);
assert.ok(manifest.chapters.every(c=>c.story_available&&c.quiz_available));
const w={window:{}};
vm.runInNewContext(fs.readFileSync('kanji-n5-full-data.js','utf8'),w);
const data=w.window.JAPAN_KANJI_N5_FULL;
assert.equal(data.chapters.length,25);
assert.equal(data.lexicon.length,123);
assert.equal(data.chapters.reduce((n,c)=>n+c.keys.length,0),135);
assert.ok(data.lexicon.every(x=>x.examples.length>0));
assert.ok(data.chapters.every(x=>x.paragraphs.length>=3));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const error=[];const output=path.join(root,'kanji-n5-full-qa');fs.mkdirSync(output,{recursive:true});
try{
 for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on('pageerror',e=>error.push(label+' '+String(e)));
  await page.goto('http://127.0.0.1:4173/kanji-n5.html',{waitUntil:'load'});
  await page.locator('.hero').waitFor();
  assert.equal(await page.locator('.realm-card').count(),6);
  assert.equal(await page.locator('.chapter-row').count(),25);
  assert.match(await page.locator('.hero').innerText(),/25\/25/);
  await page.screenshot({path:path.join(output,label+'-home.png'),fullPage:false});
  for(const n of [1,2,4,10,18,25]){
   await page.goto('http://127.0.0.1:4173/kanji-n5.html#ch-'+n+'-story',{waitUntil:'load'});
   assert.equal(await page.locator('.story-spread').count(),1,'Story missing '+n);
   assert.equal(await page.locator('.full-inline-seal').count(),data.chapters[n-1].keys.length,'Missing glyphs '+n);
   assert.equal(await page.locator('.story-inline-kanji').count()>=3,true,'No inline glyphs '+n);
   assert.match(await page.locator('.story-text').innerText(),new RegExp(data.chapters[n-1].title.slice(0,5)));
   if([2,25].includes(n)) await page.screenshot({path:path.join(output,label+'-story-'+n+'.png'),fullPage:false});
   assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,'Overflow at story '+n+' viewport '+label);
  }
  await page.locator('[data-kanji="北"]').first().click();
  assert.equal(await page.locator('.codex-paper').count(),1);
  assert.match(await page.locator('.codex-paper').innerText(),/BẮC/);
  assert.equal(await page.locator('.word-examples .example').count()>=1,true);
  assert.equal(await page.locator('#traceCanvas').count(),1);
  await page.screenshot({path:path.join(output,label+'-codex-25.png'),fullPage:false});
  await page.locator('.codex-paper [data-view="trial"]').click();
  assert.equal(await page.locator('.trial-room .answer').count(),4);
  for(let i=0;i<8;i++){
    await page.locator('.trial-room .answer:not([disabled])').first().click();
    assert.equal(await page.locator('.trial-feedback').count(),1);
    await page.locator('[data-action="next"]').click();
  }
  assert.equal(await page.locator('.success-banner').count(),1);
  await page.screenshot({path:path.join(output,label+'-quiz-25.png'),fullPage:false});
  await page.reload();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('japan-study-n5-kanji-mat-dien-v1')));
  assert.ok(progress.completedLessons['25'],'Lesson progress not saved');
  assert.equal(progress.completedLessons['25'].total,8);
  assert.deepEqual(error,[]);
  await page.close();
  console.log('N5 complete edition QA PASS',label,'chapters=25', 'sourceRows=135', 'distinctGlyphs=123');
 }
}finally{await browser.close()}
assert.deepEqual(error,[]);
console.log('N5 ALL CHECKS PASS');