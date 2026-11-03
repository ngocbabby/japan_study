import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const root=process.cwd();
const out=path.join(root,"n3-visual-qa");
fs.mkdirSync(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".avif":"image/avif",".json":"application/json",".webp":"image/webp",".png":"image/png"};
const server=http.createServer((req,res)=>{
  const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const filename=path.resolve(root,"."+p);
  if(!(filename===root||filename.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
  fs.readFile(filename,(err,data)=>{
    if(err){res.writeHead(404);res.end("Not found");return}
    res.writeHead(200,{"content-type":mime[path.extname(filename)]||"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  });
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port+"/n3-book.html";
let browser,errors=[];
try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  for(const viewport of [{width:1440,height:900,label:"desktop"},{width:390,height:844,label:"mobile"}]){
    const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
    page.on("pageerror",e=>errors.push(viewport.label+": "+String(e)));
    await page.goto(url,{waitUntil:"load"});
    await page.locator(".n3cover").waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const pic=await page.locator(".n3cover").evaluate(async img=>{
      await img.decode();
      const a=img.getBoundingClientRect(),parent=img.parentElement.getBoundingClientRect();
      return {src:img.currentSrc,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,rect:{x:a.x,y:a.y,width:a.width,height:a.height},parent:{x:parent.x,y:parent.y,width:parent.width,height:parent.height},overflow:document.documentElement.scrollWidth-window.innerWidth};
    });
    console.log("COVER "+viewport.label+" "+JSON.stringify(pic));
    assert.ok(pic.complete&&pic.naturalWidth>=320&&pic.naturalHeight>=480,"cover image not loaded");
    assert.ok(pic.src.includes("khi-mat-troi-khong-con-moc.avif"),"new illustrated cover was not selected");
    assert.ok(pic.rect.width<=220,"cover too wide");
    assert.ok(pic.rect.height/pic.rect.width>1.45&&pic.rect.height/pic.rect.width<1.55,"cover ratio not 2:3");
    assert.ok(Math.abs(pic.rect.width-pic.parent.width)<2,"cover width mismatch");
    assert.ok(Math.abs(pic.rect.height-pic.parent.height)<2,"cover height mismatch");
    assert.ok(pic.overflow<=1,"horizontal page overflow");
    await page.screenshot({path:path.join(out,"n3-"+viewport.label+"-home.png"),fullPage:true});
    await page.locator('[data-goto="1"]').first().click();
    const info=await page.locator(".n3paper").evaluate(p=>{
      const r=p.getBoundingClientRect(),s=getComputedStyle(p.querySelector("p")),text=p.querySelector("p").innerText;
      return {paperWidth:r.width,font:s.fontFamily,lineHeight:s.lineHeight,firstLine:text.slice(0,130),overflow:document.documentElement.scrollWidth-window.innerWidth};
    });
    console.log("READER "+viewport.label+" "+JSON.stringify(info));
    assert.ok(info.paperWidth<=795,"paper extends beyond readable line length");
    assert.ok(info.font.includes("Noto Serif"),"Vietnamese serif not selected");
    assert.ok(info.overflow<=1,"reader causes horizontal overflow");
    assert.ok((await page.locator(".n3word").count())>0,"Japanese vocabulary markers missing");
    await page.locator(".n3word").first().click();
    assert.ok(await page.locator(".n3definition").isVisible(),"vocab explanation missing");
    await page.screenshot({path:path.join(out,"n3-"+viewport.label+"-chapter1.png"),fullPage:true});
    await page.close();
  }
  assert.deepEqual(errors,[],"Javascript errors during real browser render");
  console.log("PASS: full cover visible, Noto Serif, responsive layout, Japanese definitions and screenshots.");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
