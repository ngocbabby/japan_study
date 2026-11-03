import {chromium} from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const dir="artbook-v2-screens";
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try {
 for(const [label,width,height] of [["desktop",1440,900],["mobile",390,844]]) {
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:4173/kanji-n5-artbook-v2.html",{waitUntil:"load"});
   await page.locator("#sceneImage").evaluate(img=>img.decode());
   assert.equal(await page.locator(".realm-pill").count(),6);
   assert.equal(await page.locator("#chapterTitle").innerText(),"Cánh cửa của bốn chữ ấn");
   assert.equal(await page.locator(".seal").count(),4);
   const sizes=await page.evaluate(()=>({vw:window.innerWidth,sw:document.documentElement.scrollWidth}));
   assert.ok(sizes.sw<=sizes.vw+2,"page overflow "+JSON.stringify(sizes));
   await page.screenshot({path:dir+"/"+label+"-chapter1.png",fullPage:true});
   await page.locator(".seal").last().click();
   assert.ok(await page.locator("#glyphModal").isVisible());
   assert.equal(await page.locator("#glyphBig").innerText(),"古");
   await page.locator("#glyphModal .modal-close").click();
   await page.locator("#nextChapter").click();
   assert.equal(await page.locator("#chapterTitle").innerText(),"Ngọn tháp cao và chiếc chuông im lặng");
   await page.screenshot({path:dir+"/"+label+"-chapter2.png",fullPage:true});
   await page.locator("#startChallenge").click();
   assert.ok(await page.locator("#quizModal").isVisible());
   assert.ok((await page.locator("#quizOptions button").count())>=3);
   await page.locator("#quizOptions button").first().click();
   assert.ok(await page.locator("#quizNext").isVisible());
   await page.locator("#quizModal .modal-close").click();
   await page.locator("#chapterMenu").click();
   assert.equal(await page.locator("#chaptersList button").count(),25);
   await page.locator('#chaptersList [data-chapter="25"]').click();
   assert.equal(await page.locator("#pageNumber").innerText(),"25 / 25");
   assert.deepEqual(errors,[]);
   console.log("PASS "+label+" "+JSON.stringify(sizes));
   await page.close();
 }
} finally {await browser.close();}
