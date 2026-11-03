import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const root=process.cwd(),out=path.join(root,'zero-verdict-qa');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 const target=path.resolve(root,'.'+pathname);
 if(!(target===root||target.startsWith(root+path.sep))){res.writeHead(403);res.end();return}
 fs.readFile(target,(err,b)=>{if(err){res.writeHead(404);res.end('Missing '+pathname);return}
  res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});res.end(b)})
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/zero-verdict-book.html';let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const device of [{name:'wide',width:1748,height:900},{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:'load'});
  await page.locator('.zero-cover').waitFor();
  const cover=await page.locator('.zero-cover').evaluate(async img=>{await img.decode();const r=img.getBoundingClientRect();return {w:img.naturalWidth,h:img.naturalHeight,rectW:r.width,rectH:r.height,overflow:document.documentElement.scrollWidth-innerWidth}});
  assert.ok(cover.w>=540&&cover.h>=864,'high-DPI illustrated real cover missing');
  assert.ok(Math.abs(cover.rectH/cover.rectW-cover.h/cover.w)<.05,'cover distorted');
  assert.ok(cover.overflow<3,'home scroll overflow');
  assert.ok((await page.locator('.zero-hero').innerText()).includes('Bản án số không'));
  await page.screenshot({path:path.join(out,device.name+'-cover.png'),fullPage:true});
  await page.locator('.zero-hero [data-chapter="1"]').click();
  assert.equal(await page.locator('.zero-paper h2').innerText(),'Người đến trước tiếng còi');
  assert.ok((await page.locator('.zero-paragraphs p').count())>=8);
  assert.ok((await page.locator('.zero-jp').count())>=18,'inline N2 not present');
  assert.equal(await page.locator('.zero-para-vocab').count(),0,'stray vocab chips found');
  assert.equal(await page.locator('.zero-leaf').count(),4,'each chapter should have four illustrated leaves');
  assert.equal(await page.locator('.zero-leaf.is-current').count(),1,'only one leaf should be active by default');
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),2,'exactly two paragraphs on current leaf');
  assert.ok((await page.locator('.zero-leaf-art.hero').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('zero-gallery-1.webp'),'chapter painting not loaded');
  assert.ok(await page.locator('.zero-dossier-terms button').first().isVisible() || device.name==='mobile','casefile sidebar is missing');
  if(device.name!=='mobile'){assert.ok(await page.locator('.zero-jacket-image img').isVisible(),'full-size jacket column missing on desktop');const j=await page.locator('.zero-jacket-image img').evaluate(async img=>{await img.decode();return [img.naturalWidth,img.naturalHeight]});assert.ok(j[0]>=540&&j[1]>=864,'sidebar art failed to load')}

  assert.ok(await page.locator('.zero-pinned-evidence').count()===1,'opening evidence photograph missing');
  const painted=await page.locator('.zero-leaf-art.hero').evaluate(el=>({url:getComputedStyle(el).backgroundImage,height:el.getBoundingClientRect().height}));
  assert.ok(painted.url.includes('zero-gallery-1.webp')&&painted.height>110,'part I painting absent');
  for(const p of [2,3,4,5,6,7,8]){
    const response=await page.request.get(new URL('books/n2/vocab/zero-gallery-'+p+'.webp',url).href);
    assert.equal(response.status(),200,'missing illustrated gallery image '+p);
    const bytes=await response.body();
    assert.ok(bytes.length>20000,'low-quality illustrated part '+p);
  }
  await page.screenshot({path:path.join(out,device.name+'-chapter1-opening-viewport.png'),fullPage:false});
  await page.locator('.zero-jp').first().click();
  assert.ok(await page.locator('.zero-dictionary').isVisible(),'Japanese glossary modal missing');
  assert.equal(await page.locator('.zero-dictionary h2').innerText(),'人生');
  await page.locator('.zero-dict-close').click();
  await page.locator('[data-action="nextLeaf"]').click();
  assert.equal(await page.locator('.zero-leaf.is-current').getAttribute('data-leaf-index'),'1','page turning did not advance');
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),2);
  await page.locator('[data-action="flow"]').click();
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),8,'continuous-reading toggle failed');
  await page.locator('[data-action="flow"]').click();
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),2,'page mode did not restore');
  assert.ok((await page.evaluate('document.documentElement.scrollWidth-innerWidth'))<3,'chapter has horizontal overflow');

  await page.screenshot({path:path.join(out,device.name+'-chapter1.png'),fullPage:true});
  await page.screenshot({path:path.join(out,device.name+'-chapter1-viewport.png'),fullPage:false});
  await page.goto(url+'?qa=final#chapter-64',{waitUntil:'load'});
  assert.equal(await page.locator('.zero-paper h2').innerText(),'Khi đồng hồ chỉ 00:01');
  assert.ok((await page.locator('.zero-paragraphs p').count())>=8);
  assert.ok((await page.locator('.zero-jp').count())>=19,'ending vocabulary coverage');
  assert.ok((await page.locator('.zero-paragraphs').first().innerText()).includes('Hai năm sau'),'full epilogue missing');
  await page.locator('[data-leaf="3"]').click();
  assert.equal(await page.locator('.zero-leaf.is-current').getAttribute('data-leaf-index'),'3');
  assert.ok(await page.locator('[data-action="nextLeaf"]').isDisabled(),'last page should be the true end');

  await page.screenshot({path:path.join(out,device.name+'-chapter64.png'),fullPage:true});
  await page.goto(url+'?qa=index#vocab',{waitUntil:'load'});
  assert.equal(await page.locator('.zero-vocab-row').count(),30);
  await page.locator('#zero-search').fill('1160');
  assert.equal(await page.locator('.zero-vocab-row').count(),1);
  assert.ok((await page.locator('.zero-vocab-row').innerText()).includes('いわゆる'));
  assert.ok((await page.evaluate('document.documentElement.scrollWidth-innerWidth'))<3,'horizontal overflow');
  if(device.name==='mobile'){
   await page.locator('[data-action="menu"]').click();
   assert.ok(await page.locator('.zero-sidebar.open').isVisible(),'mobile chapter menu did not open');
  }
  assert.deepEqual(errors,[],'JavaScript page errors');
  console.log(device.name,'PASS',JSON.stringify(cover));
  await page.close();
 }
 console.log('PASS: Zero Verdict N2 deluxe 64-chapter illustrated four-page reader, mobile and desktop, with live dictionary');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
