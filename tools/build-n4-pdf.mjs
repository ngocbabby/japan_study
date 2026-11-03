import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdirSync, statSync } from "node:fs";

const input = resolve("n4-book.html");
const output = resolve("books/n4/vocab/ho-so-ga-cuoi-n4.pdf");
mkdirSync(resolve("books/n4/vocab"), { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({ viewport: {width: 1060, height: 1250}, deviceScaleFactor:1 });
  page.on("pageerror",err=>{console.error("Page error:",err);process.exitCode=1;});
  await page.goto(pathToFileURL(input).href, {waitUntil:"domcontentloaded", timeout:60000});
  await page.waitForFunction(()=>window.N4_BOOK_READY===true, { timeout:30000 });
  const status=await page.evaluate(()=>({
    chapterCount:document.querySelectorAll(".chapter").length,
    wordCount:document.querySelectorAll(".word").length,
    title:document.title
  }));
  console.log("Novel validation",status);
  if(status.wordCount!==623||status.chapterCount!==34)throw Error("Missing vocabulary or chapters");
  await page.emulateMedia({media:"print"});
  await page.pdf({
    path:output,
    printBackground:true,
    preferCSSPageSize:true,
    format:"A5",
    displayHeaderFooter:false,
    margin:{top:0,bottom:0,left:0,right:0},
    timeout:120000
  });
  if(statSync(output).size<40000)throw Error("PDF output looks too small");
  console.log("Generated",output,"bytes",statSync(output).size);
}finally{await browser.close();}
