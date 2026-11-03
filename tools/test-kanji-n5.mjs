
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import vm from "node:vm";
const root=process.cwd(),output=path.join(root,"kanji-n5-visual-qa");
fs.mkdirSync(output,{recursive:true});
const manifest=JSON.parse(fs.readFileSync("books/n5/kanji/source-manifest.json","utf8"));
assert.equal(manifest.source.pages,32);
assert.equal(manifest.source.unique_kanji,123);
assert.equal(manifest.source.rows,135);
assert.equal(manifest.chapters.length,25);
assert.equal(new Set(manifest.chapters.flatMap(c=>c.entries.map(e=>e.kanji))).size,123);
const context={window:{}};
vm.runInNewContext(fs.readFileSync("kanji-n5-data.js","utf8"),context);
assert.equal(context.window.JAPAN_KANJI_N5.characters.length,4);
assert.equal(context.window.JAPAN_KANJI_N5.chapters.length,25);
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const logs=[];
// Regression: the new book must be findable via Home / Sách / N5 / Kanji.
const shelf=await browser.newPage({viewport:{width:1280,height:850}});
shelf.on("pageerror",e=>logs.push("library: "+String(e)));
await shelf.goto("http://127.0.0.1:4173/index.html",{waitUntil:"load",timeout:45000});
await shelf.locator('[data-open="books"]').first().click();
await shelf.locator('[data-books-level="N5"]').first().click();
await shelf.locator('[data-books-cat="kanji"]').first().click();
const card=shelf.locator(".books-book-card");
assert.equal(await card.count(),1,"N5 Kanji book is missing from Sách");
assert.equal(await card.locator('a[href="kanji-n5.html"]').count(),1,"Wrong demo link in bookshelf");
await shelf.screenshot({path:path.join(output,"library-n5-kanji.png"),fullPage:true});
await shelf.close();
try {
 for(const [label,width,height] of [["desktop",1440,900],["mobile",390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on("pageerror",e=>logs.push(label+": "+String(e)));
  await page.goto("http://127.0.0.1:4173/kanji-n5.html",{waitUntil:"load",timeout:45000});
  await page.locator(".hero-cover img").evaluate(img=>img.decode());
  assert.equal(await page.locator(".realm-card").count(),6);
  assert.equal(await page.locator(".chapter-row").count(),25);
  const img=await page.locator(".hero-cover img").evaluate(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight}));
  assert.ok(img.naturalWidth>500&&img.naturalHeight>800,"Missing original cover art");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"Home horizontal overflow "+label+": "+overflow);
  await page.screenshot({path:path.join(output,label+"-home.png"),fullPage:true});
  await page.locator('.hero button[data-view="story"]').click();
  assert.equal(await page.locator(".story-spread").count(),1);
  assert.ok((await page.locator(".story-inline-kanji").count())>=4,"Story should link Kanji");
  await page.screenshot({path:path.join(output,label+"-story.png"),fullPage:true});
  await page.locator('button[data-kanji="古"]').first().click();
  assert.ok((await page.locator(".codex-info h2").innerText()).includes("CỔ"));
  assert.equal(await page.locator(".word-examples .example").count(),1);
  assert.ok(await page.locator("#traceCanvas").isVisible());
  await page.screenshot({path:path.join(output,label+"-codex.png"),fullPage:true});
  await page.locator(".codex-nav [data-view='trial']").click();
  const responses=["古","新","大","ちいさい","コ","古","lớn"];
  for(let i=0;i<responses.length;i++){
    await page.locator("[data-answer]").filter({hasText:responses[i]}).first().click();
    assert.ok(await page.locator(".trial-feedback").isVisible());
    await page.locator("[data-action='next-question']").click();
  }
  assert.ok((await page.locator(".success-banner h3").innerText()).includes("7/7"));
  assert.ok((await page.locator(".success-banner").innerText()).includes("4/123"));
  await page.screenshot({path:path.join(output,label+"-trial-success.png"),fullPage:true});
  await page.reload();
  assert.ok((await page.locator("#orbCount").innerText()).includes("4/123"));
  if(label==="desktop"){await page.locator('.side-panel [data-view="worlds"]').click();}
  else {await page.locator('.mobile-nav [data-view="worlds"]').click();}
  assert.equal(await page.locator(".realm-card").count(),6);
  await page.screenshot({path:path.join(output,label+"-worlds.png"),fullPage:true});
  if(label==="desktop"){await page.locator('.side-panel [data-view="review"]').click();}
  else {await page.evaluate(()=>document.querySelector('.side-panel [data-view="review"]').click());}
  assert.equal(await page.locator(".review-grid").count(),1);
  await page.screenshot({path:path.join(output,label+"-review.png"),fullPage:true});
  const end=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(end.scroll<=end.width+2,"Review horizontal overflow "+label);
  console.log("KANJI QA "+label+" OK",JSON.stringify({cover:img,overflow,review:end,kanji:4,quizQuestions:7}));
  await page.close();
 }
 assert.deepEqual(logs,[],"JS console error");
 console.log("KANJI N5 PASS: 123 unique / 25 source lessons; 6 worlds; 4 lesson characters; quiz 7/7; progress persisted; 2 responsive viewports.");
} finally {await browser.close()}
