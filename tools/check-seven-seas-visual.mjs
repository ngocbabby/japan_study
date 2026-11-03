import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const root=process.cwd();const dir=path.join(root,'seven-seas-qa');fs.mkdirSync(dir,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const srv=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 const p=path.resolve(root,'.'+pathname);
 if(!(p===root||p.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
 fs.readFile(p,(err,bytes)=>{if(err){res.writeHead(404);res.end('Missing '+pathname);return}
  res.writeHead(200,{'content-type':mime[path.extname(p)]||'application/octet-stream','cache-control':'no-store'});res.end(bytes)})
});
await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+srv.address().port+'/seven-seas-book.html';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const device of [{label:'desktop',width:1440,height:900},{label:'mobile',width:390,height:844}]){
  const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'load'});
  await page.locator('.sea-cover').waitFor();
  const cover=await page.locator('.sea-cover').evaluate(async im=>{await im.decode();const r=im.getBoundingClientRect();return {w:im.naturalWidth,h:im.naturalHeight,rectW:r.width,rectH:r.height,overflow:document.documentElement.scrollWidth-innerWidth}});
  assert.ok(cover.w>=400&&cover.h>=600,'new cover did not load');
  assert.ok(Math.abs(cover.rectH/cover.rectW-1.5)<.04,'cover is distorted');
  assert.ok(cover.overflow<3,'horizontal overflow on home');
  console.log(device.label,'cover',JSON.stringify(cover));
  await page.screenshot({path:path.join(dir,device.label+'-home.png'),fullPage:true});
  await page.locator('.sea-hero [data-chapter="1"]').click();
  assert.equal(await page.locator('.sea-paper h2').textContent(),'Ngọn lửa chết lúc 05:17');
  assert.ok((await page.locator('.sea-paragraphs p').count())>=8);
  assert.ok((await page.locator('.sea-jp').count())>=18);
  assert.equal(await page.locator('.sea-para-vocab').count(),0,'no loose vocabulary chips in paragraphs');
  assert.ok((await page.locator('.sea-paragraphs').innerText()).includes('Selene'));
  await page.locator('.sea-jp').first().click();
  assert.ok(await page.locator('.sea-dictionary').isVisible(),'dictionary missing');
  assert.equal(await page.locator('.sea-dictionary h2').textContent(),'観測');
  await page.locator('.sea-dict-close').click();
  await page.screenshot({path:path.join(dir,device.label+'-chapter1.png'),fullPage:true});
  await page.goto(base+'?qa=chapter8#chapter-8',{waitUntil:'load'});
  assert.equal(await page.locator('.sea-paper h2').textContent(),'Vùng biển không có trên hải đồ');
  assert.ok((await page.locator('.sea-paragraphs p').count())>=8);
  await page.screenshot({path:path.join(dir,device.label+'-chapter8.png'),fullPage:true});
  await page.goto(base+'?qa=chapter64#chapter-64',{waitUntil:'load'});
  assert.equal(await page.locator('.sea-paper h2').textContent(),'Hải đăng của thế hệ mới','last chapter must exist');
  assert.ok((await page.locator('.sea-paragraphs p').count())>=8,'final chapter narrative missing');
  assert.ok((await page.locator('.sea-jp').count())>=19,'final chapter must contain N2 terms');
  assert.ok((await page.locator('.sea-paragraphs').innerText()).includes('Ba năm sau'),'epilogue missing');
  await page.screenshot({path:path.join(dir,device.label+'-chapter64.png'),fullPage:true});
  await page.goto(base+'?qa=vocab#vocab',{waitUntil:'load'});
  assert.equal(await page.locator('.sea-vocab-row').count(),30);
  await page.locator('#sea-search').fill('44');
  assert.equal(await page.locator('.sea-vocab-row').count(),1);
  assert.ok((await page.locator('.sea-vocab-row').innerText()).includes('秘密'));
  await page.locator('#sea-search').fill('1160');
  assert.equal(await page.locator('.sea-vocab-row').count(),1);
  assert.ok((await page.locator('.sea-vocab-row').innerText()).includes('いわゆる'));
  assert.ok(await page.locator('.sea-top').isVisible());
  assert.ok((await page.evaluate('document.documentElement.scrollWidth-innerWidth'))<3,'page horizontal overflow');
  if(device.label==='mobile'){
   await page.locator('[data-action="menu"]').click();
   assert.ok(await page.locator('.sea-sidebar.open').isVisible(),'mobile table of contents missing');
  }
  assert.deepEqual(errors,[],'JavaScript errors');
  console.log(device.label,'PASS — reader, dictionary, source index, no extra vocabulary boxes');
  await page.close();
 }
 console.log('PASS seven seas novel visual and functional QA');
}finally{if(browser)await browser.close();await new Promise(resolve=>srv.close(resolve))}