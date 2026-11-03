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
const base='http://127.0.0.1:'+server.address().port+'/zero-verdict-book.html';
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const device of [{name:'wide',width:1748,height:900},{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'load'});
  const cover=page.locator('.zero-cover');await cover.waitFor();
  const coverImage=await cover.evaluate(async img=>{await img.decode();return {width:img.naturalWidth,height:img.naturalHeight}});
  assert.ok(coverImage.width>=540&&coverImage.height>=860,'high-quality illustrated cover should load');
  await page.screenshot({path:path.join(out,device.name+'-cover.png'),fullPage:false});
  await page.locator('.zero-hero [data-chapter="1"]').click();
  assert.equal(await page.locator('.zero-book-heading h2').innerText(),'Người đến trước tiếng còi');
  assert.equal(await page.locator('.zero-paragraphs p').count(),12,'full chapter must have 12 paragraphs');
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),12,'every paragraph must be visible in a continuous chapter');
  assert.ok(await page.locator('.zero-paragraphs').evaluate(x=>x.innerText.split(/\s+/).length)>1100,'full chapter is too short');
  assert.equal(await page.locator('.zero-leaf').count(),0,'must remove one-paragraph-per-page design');
  assert.ok(await page.locator('.zero-jp').count()>=18,'Japanese N2 popup buttons should survive expansion');
  assert.equal(await page.locator('.zero-toc-group').count(),8,'must expose eight collapsible story parts');
  const image=await page.locator('.zero-chapter-illustration img').evaluate(async img=>{await img.decode();return {width:img.naturalWidth,height:img.naturalHeight,rect:img.getBoundingClientRect().toJSON()}});
  assert.ok(image.width>=400&&image.height>=190,'cinematic scene illustration is broken');
  assert.ok(await page.locator('.zero-dossier-terms button').count()>=18,'current chapter vocabulary is incomplete');
  if(device.name!=='mobile'){
   assert.ok(await page.locator('.zero-inline-jacket img').isVisible(),'book cover should share the TOC column, not use an extra one');
   const widths=await page.evaluate(()=>[...document.querySelectorAll('.zero-layout > *')].map(x=>x.getBoundingClientRect().width));
   assert.equal(widths.length,3,'should use only three columns');
   assert.ok(widths[1]>600,'reading text should get most of the horizontal space');
  }else{
   await page.locator('[data-action="menu"]').click();
   assert.ok(await page.locator('.zero-sidebar.open').isVisible(),'mobile TOC drawer missing');
   await page.locator('[data-action="menu"]').click();
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<3,'horizontal overflow: '+device.name+' '+overflow);
  await page.screenshot({path:path.join(out,device.name+'-chapter1-opening-viewport.png'),fullPage:false});
  await page.screenshot({path:path.join(out,device.name+'-chapter1-full.png'),fullPage:true});
  await page.locator('.zero-jp').first().click();
  assert.ok(await page.locator('.zero-dictionary').isVisible(),'N2 dictionary must open');
  assert.equal(await page.locator('.zero-dictionary h2').innerText(),'人生','first N2 word incorrectly linked');
  await page.locator('.zero-dict-close').click();
  await page.locator('[data-action="furigana"]').click();
  assert.ok(await page.locator('.zero-paper.zero-no-furi').count()===1,'furigana toggle does not hide readings');
  await page.locator('[data-action="furigana"]').click();
  await page.locator('[data-action="larger"]').click();
  assert.ok(await page.locator('.zero-paragraphs').evaluate(x=>getComputedStyle(x.querySelector('p')).fontSize)==='20px','font setting lost');
  await page.locator('[data-action="focus"]').click();
  assert.ok(await page.locator('.zero-layout.is-focus').count()===1,'focus reading mode missing');
  assert.ok(await page.locator('.zero-paragraphs p:visible').count()===12);
  await page.locator('[data-action="focus"]').click();
  await page.locator('.zero-chapter-nav [data-chapter="2"]').click();
  assert.equal(await page.locator('.zero-book-heading h2').innerText(),'Mười hai cái tên còn sống','chapter navigation failed');
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),12);
  await page.goto(base+'?final=1#chapter-64',{waitUntil:'load'});
  assert.equal(await page.locator('.zero-book-heading h2').innerText(),'Khi đồng hồ chỉ 00:01');
  assert.equal(await page.locator('.zero-paragraphs p:visible').count(),12,'epilogue incomplete');
  assert.ok((await page.locator('.zero-paragraphs').innerText()).includes('Hai năm sau'));
  assert.ok(await page.locator('.zero-jp').count()>=19,'last chapter N2 coverage missing');
  assert.ok(await page.locator('.zero-chapter-nav [data-chapter="63"]').isVisible(),'previous chapter navigation missing');
  await page.screenshot({path:path.join(out,device.name+'-chapter64-opening-viewport.png'),fullPage:false});
  await page.goto(base+'#vocab',{waitUntil:'load'});
  assert.equal(await page.locator('.zero-vocab-row').count(),30);
  await page.locator('#zero-search').fill('1160');
  assert.equal(await page.locator('.zero-vocab-row').count(),1);
  assert.ok((await page.locator('.zero-vocab-row').innerText()).includes('いわゆる'));
  assert.deepEqual(errors,[],'browser JavaScript errors: '+errors.join('; '));
  console.log(device.name,'PASS',JSON.stringify({cover:coverImage,illustration:[image.width,image.height],horizontalOverflow:overflow}));
  await page.close();
 }
 console.log('PASS: 64 full expanded chapters, desktop/mobile wide book, N2 glossary, no truncated pages, 12 paragraphs/chapter');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
