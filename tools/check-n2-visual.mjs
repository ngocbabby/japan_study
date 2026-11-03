import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { chromium } from "playwright";
const root=process.cwd(),dir=path.join(root,"n2-visual-qa");fs.mkdirSync(dir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".webp":"image/webp",".png":"image/png",".avif":"image/avif",".svg":"image/svg+xml"};
const srv=http.createServer((req,res)=>{
 const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 const file=path.resolve(root,"."+p);
 if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404);res.end("Not found");return}
 res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes)});
});
await new Promise(resolve=>srv.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+srv.address().port+"/n2-novel.html";
let browser,errors=[];
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const size of [{w:1440,h:900,label:"desktop"},{w:390,h:844,label:"mobile"}]){
  const page=await browser.newPage({viewport:{width:size.w,height:size.h}});
  page.on("pageerror",e=>errors.push(size.label+": "+e.message));
  await page.goto(url,{waitUntil:"load"});
  await page.locator(".n2-hero").waitFor();
  const cover=await page.locator(".n2-cover img").evaluate(async im=>{await im.decode();const r=im.getBoundingClientRect();return {loaded:im.complete&&im.naturalWidth>100,width:r.width,height:r.height,overflow:document.documentElement.scrollWidth-innerWidth}});
  assert.ok(cover.loaded,"cover failed to load");assert.ok(Math.abs(cover.height/cover.width-1.5)<.05,"cover distorted");assert.ok(cover.overflow<3,"horizontal overflow on home");
  console.log("HOME",size.label,JSON.stringify(cover));
  await page.screenshot({path:path.join(dir,"n2-"+size.label+"-home.png"),fullPage:true});
  await page.locator('.n2-hero [data-chapter="1"]').first().click();
  assert.equal(await page.locator(".n2-page h1").textContent(),"Chữ ký của người chưa từng lớn");
  assert.ok((await page.locator(".n2-scene").count())>=8,"chapter one short");
  assert.ok((await page.locator(".vi-main").count())>=8,"Vietnamese should be the primary reading language");
  assert.equal(await page.locator(".n2-para-vocab").count(),0,"unmatched vocabulary should not interrupt Vietnamese paragraphs");
  assert.equal(await page.locator(".n2-scene .jp").count(),0,"Japanese prose must not appear first by default");
  assert.equal(await page.locator('[data-reading-lang="vi"]').getAttribute("aria-pressed"),"true","Vietnamese button not selected");
  assert.ok((await page.locator(".n2-word").count())>=1,"Vietnamese text has no Japanese linked vocabulary");
  await page.locator(".n2-word").first().click();assert.ok(await page.locator(".n2-dict").isVisible(),"definition missing");
  await page.locator('[data-action="closedict"]').click();
  await page.locator('[data-reading-lang="ja"]').click();
  assert.ok((await page.locator(".n2-scene .jp").count())>=8,"Japanese study mode missing");
  assert.ok((await page.locator(".n2-word").count())>=18,"Japanese mode must retain vocabulary links");
  await page.locator('[data-reading-lang="vi"]').click();
  assert.ok((await page.locator(".vi-main").count())>=8,"returning to Vietnamese mode failed");
  const reader=await page.locator(".n2-page").evaluate(el=>{const box=el.getBoundingClientRect();return {width:box.width,overflow:document.documentElement.scrollWidth-innerWidth}});
  assert.ok(reader.overflow<3,"horizontal overflow in reader");
  await page.screenshot({path:path.join(dir,"n2-"+size.label+"-chapter1.png"),fullPage:true});

  await page.locator(".n2-head [data-mode='home']").click();
  await page.locator('.n2-part-card[data-chapter="33"]').click();
  assert.ok((await page.locator(".vi-main").count())>0,"chapter 33 must show Vietnamese prose");
  assert.equal(await page.locator(".n2-para-vocab").count(),0,"no leftover vocabulary boxes in chapter 33");
  for(const id of [592,593,594,595,596,597,598]){
    assert.ok((await page.locator('.vi-main [data-word="'+id+'"]').count())===1,"word #"+id+" not linked in chapter 33 Vietnamese context");
  }
  assert.equal(await page.locator('.vi-main [data-word="592"] rt').textContent(),"べん","transport convenience reading");
  assert.equal(await page.locator('.vi-main [data-word="593"] rt').textContent(),"びん","flight reading");
  assert.ok((await page.locator("#n2-chapter-vocab").count())===1,"chapter glossary missing");
  await page.screenshot({path:path.join(dir,"n2-"+size.label+"-chapter33.png"),fullPage:true});
  await page.locator(".n2-head [data-mode='index']").click();
  await page.locator("#n2-index-query").fill("1160");
  assert.equal(await page.locator(".n2-vocabitem").count(),1,"index search by number");
  await page.locator(".n2-vocabitem").click();assert.ok(await page.locator(".n2-dict").isVisible(),"index word lookup failed");
  await page.locator('[data-action="closedict"]').click();
  await page.locator(".n2-head [data-mode='home']").click();
  await page.locator('.n2-part-card[data-chapter="57"]').click();
  assert.ok(await page.locator(".n2-page").isVisible(),"Part VIII missing");
  await page.locator(".n2-head [data-mode='home']").click();
  if(size.label==="mobile"){await page.locator('[data-action="menu"]').click();assert.ok(await page.locator("#n2toc").isVisible(),"mobile menu closed")}
  await page.close();
 }
 assert.deepEqual(errors,[],"Javascript errors");
 console.log("PASS: Vietnamese-first N2 novel, optional Japanese mode, desktop/mobile glossary, source lookup and menu");
}finally{if(browser)await browser.close();await new Promise(resolve=>srv.close(resolve))}
