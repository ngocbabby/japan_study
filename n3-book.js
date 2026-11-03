(()=>{"use strict";
const data=window.JAPAN_STUDY_N3_NOVEL,root=document.getElementById("n3-root");
const key="japanstudy-n3-reading-progress",state={mode:"home",chapter:1,font:18,open:false};
try{const s=JSON.parse(localStorage.getItem(key)||"{}");if(s.chapter>0)state.chapter=s.chapter;if(s.font>13&&s.font<30)state.font=s.font}catch{}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const all=data?.chapters||[],parts=data?.parts||[],vocab=new Map((data?.vocab||[]).map(x=>[x.id,x]));
const sourceRanges=[[1,34],[35,69],[70,104],[105,140],[141,175],[176,211],[212,247],[248,281],[282,317],[318,352],[353,387],[388,423],[424,456],[457,492],[493,525],[526,557],[558,589],[590,623],[624,656],[657,691],[692,725],[726,758],[759,792],[793,824],[825,858],[859,880]];
const sourcePage=(id)=>2+sourceRanges.findIndex(([a,b])=>id>=a&&id<=b);
const usedIds=new Set(all.flatMap(c=>(c.paragraphs||[]).flatMap(t=>[...t.matchAll(/⟦(\d+)⟧/g)].map(m=>Number(m[1])))));
const sourceIds=Array.from({length:880},(_,i)=>i+1).filter(id=>id!==818);
const sourceCount=sourceIds.length,validatedCount=vocab.size,coveredCount=[...usedIds].filter(id=>vocab.has(id)).length;

const remember=()=>{try{localStorage.setItem(key,JSON.stringify({chapter:state.chapter,font:state.font}))}catch{}};
const top=()=>window.scrollTo({top:0,behavior:"smooth"});
function open(ch){if(!all.some(x=>x.number===ch))return;state.chapter=ch;state.mode="chapter";remember();render();top()}
function nav(){
let n=0,out='<h2>MỤC LỤC · 40 CHƯƠNG</h2>';
for(const part of parts){out+='<div class="n3part">PHẦN '+part.number+' · '+esc(part.title)+'</div>';
for(const title of part.chapters){n++;const ok=all.some(c=>c.number===n);out+='<button class="n3chapter" data-goto="'+n+'" '+(ok?'':'disabled')+(state.mode==="chapter"&&state.chapter===n?' aria-current="page"':'')+'><strong>'+String(n).padStart(2,"0")+'</strong>'+esc(title)+(ok?'':' · Đang biên soạn')+'</button>'}}
return out;}
function cover(){return '<picture class="n3cover-frame"><source type="image/avif" srcset="books/n3/vocab/khi-mat-troi-khong-con-moc.avif?v=20261103-premium"><img class="n3cover" src="books/n3/vocab/cover.svg" alt="Bìa Khi mặt trời không còn mọc: Kanna đứng trước thành phố AURORA, mặt trời rạn nứt và những đường nét vàng kim" width="360" height="540" loading="eager" decoding="async"></picture>'}
function home(){
const n=all.length;
let h='<section class="n3hero">'+cover()+'<div><span class="n3eyebrow">TIỂU THUYẾT TỪ VỰNG JLPT N3</span><h2>KHI MẶT TRỜI KHÔNG CÒN MỌC</h2><p>朝が来ない街 · Thành phố không có bình minh</p><p>06:00 không đến. Kanna phát hiện hệ thống mặt trời nhân tạo AURORA đã bị tắt, trong khi mọi bản tin đều nói thành phố vẫn an toàn. Vì sao dữ liệu bị khóa? Ai là người đã được sinh ra lần thứ hai?</p><p>Sci-fi · Sinh tồn · Tâm lý · Bí ẩn</p><div class="n3buttons"><button class="n3btn" data-goto="1">Đọc từ chương 1</button>'+(state.chapter>1?'<button class="n3btn secondary" data-goto="'+Math.min(state.chapter,n)+'">Đọc tiếp chương '+Math.min(state.chapter,n)+'</button>':'')+'</div></div></section>';
h+='<section class="n3panel"><h2>Cuộc hành trình qua 5 phần</h2><p>'+n+' chương nội dung đã đăng · 40 chương trong cốt truyện gốc · '+(data?.vocab?.length||0)+' mục từ đối chiếu trực tiếp. Đây là truyện sáng tác có chú giải từ Nhật, không phải văn bản lấy từ PDF.</p><div class="n3toc">';
let k=0;for(const p of parts){for(const title of p.chapters){k++;const ready=all.some(c=>c.number===k);h+='<button data-goto="'+k+'" '+(ready?'':'disabled')+'><span>'+String(k).padStart(2,"0")+'</span>'+esc(title)+'</button>'}}h+='</div></section>';
h+='<section class="n3panel"><h2>Đối chiếu từ vựng N3 — chưa đạt chuẩn 100%</h2><p>Truyện có <strong>'+coveredCount+' / '+sourceCount+' mục Mimikara N3</strong> được gắn vào nội dung. Đã xác minh '+validatedCount+' mục; còn '+(sourceCount-validatedCount)+' mục chưa được xác minh từ PDF. Đọc hết 40 chương hiện KHÔNG có nghĩa là đã học hết N3.</p><div class="n3buttons"><button class="n3btn secondary" data-mode="coverage">Xem kiểm kê 879 mục nguồn</button><button class="n3btn secondary" data-mode="words">Xem '+validatedCount+' từ đã xác minh</button></div></section>';return h}
function token(t){return esc(t).replace(/⟦(\d+)⟧/g,(match,id)=>{const w=vocab.get(Number(id));return w?'<button class="n3word" data-word="'+id+'"><ruby>'+esc(w.jp)+'<rt>'+esc(w.kana)+'</rt></ruby></button>':esc(match)})}
function chapter(){
const c=all.find(x=>x.number===state.chapter);if(!c)return home();
const prev=all.some(x=>x.number===c.number-1),next=all.some(x=>x.number===c.number+1);
return '<div class="n3-reading-status" role="note"><strong>Bản truyện đang biên tập từ vựng N3.</strong> Đã viết 40 chương nhưng mới có '+coveredCount+'/'+sourceCount+' mục từ nguồn xuất hiện. Bấm vào từ Nhật để xem cách đọc và nghĩa.</div>'+'<div class="n3toolbar"><span>PHẦN '+Math.ceil(c.number/8)+' · CHƯƠNG '+c.number+' / 40</span><div><button data-font="-1">A−</button> <button data-font="1">A+</button> <button data-mode="home">Mục lục</button></div></div>'+
'<article class="n3paper" id="n3-paper" style="--n3-font:'+state.font+'px"><div class="kicker">AURORA · CHƯƠNG '+String(c.number).padStart(2,"0")+'</div><h2>'+esc(c.title)+'</h2><div class="sub">'+esc(c.tagline)+'</div>'+(c.paragraphs||[]).map(p=>'<p>'+token(p)+'</p>').join('')+'</article><div id="n3meaning"></div>'+
'<div class="n3pager"><button data-goto="'+(c.number-1)+'" '+(prev?'':'disabled')+'>← Chương trước</button><button data-goto="'+(c.number+1)+'" '+(next?'':'disabled')+'>'+(next?'Chương sau →':'Hết bản thảo hiện có')+'</button></div>'+
'<section class="n3panel"><h2>Từ đã xuất hiện trong chương</h2><div class="n3words">'+(c.vocabIds||[]).map(id=>{const w=vocab.get(id);return w?'<button data-word="'+id+'"><b>'+esc(w.jp)+'（'+esc(w.kana)+'）</b><small>'+esc(w.meaning)+'</small></button>':''}).join('')+'</div></section>'}
function wordList(){let h='<section class="n3panel"><h2>Mimikara N3 — phần đã đối chiếu</h2><p>Dữ liệu gốc đánh số 1–880, nhưng các trang ảnh có nhiều từ bị OCR nhận nhầm. Chỉ những từ đã đối chiếu từ PDF được đưa vào đây.</p><button class="n3btn secondary" data-mode="home">← Về sách</button><div class="n3words" style="margin-top:15px">';h+=(data.vocab||[]).map(w=>'<button data-word="'+w.id+'"><b>#'+w.id+' '+esc(w.jp)+'（'+esc(w.kana)+'）</b><small>'+esc(w.meaning)+'</small></button>').join('');return h+'</div></section><div id="n3meaning"></div>'}
function coverage(){
let h='<section class="n3panel"><h2>Kiểm kê 879 mục trong nguồn Mimikara N3</h2><p>Đây là danh mục theo <strong>thứ tự và trang của PDF gốc</strong>. PDF đánh số đến 880 nhưng bỏ số 818, nên thực tế có 879 hàng. Đây KHÔNG phải danh sách từ đã học xong. Mục có chữ Nhật chỉ hiện khi đã được xác minh. Những mục chưa kiểm tra được đánh dấu rõ ràng để tránh học sai.</p><div class="n3buttons"><button data-mode="home" class="n3btn secondary">← Trở lại sách</button><button data-mode="words" class="n3btn secondary">69 từ đã kiểm tra</button></div><div class="n3audit-stats"><div><b>'+coveredCount+'/'+sourceCount+'</b><small>Đã xuất hiện trong truyện</small></div><div><b>'+validatedCount+'/'+sourceCount+'</b><small>Đã đối chiếu nguồn</small></div><div><b>'+(sourceCount-validatedCount)+'</b><small>Chưa xác minh</small></div></div><label class="n3audit-label">Tìm số mục trong PDF (1–880, không có #818) <input id="n3audit-query" type="number" min="1" max="880" placeholder="VD: 70"></label><div id="n3audit-rows" class="n3audit-rows"></div><div class="n3buttons"><button class="n3btn secondary" id="n3audit-prev">← Trang trước</button><span id="n3audit-count"></span><button class="n3btn secondary" id="n3audit-next">Trang sau →</button></div></section>';
return h;
}
function bindCoverage(){
let page=0;const perPage=30,total=sourceCount;
const rows=root.querySelector("#n3audit-rows"),count=root.querySelector("#n3audit-count"),inp=root.querySelector("#n3audit-query"),prev=root.querySelector("#n3audit-prev"),next=root.querySelector("#n3audit-next");
if(!rows)return;
function paint(){
const current=Number(inp.value),ids=Number.isInteger(current)&&current>=1&&current<=880?[current]:sourceIds.slice(page*perPage,(page+1)*perPage);
rows.innerHTML=ids.map(id=>{let w=vocab.get(id),used=usedIds.has(id);
return '<div class="n3audit-row"><b>#'+id+'</b><span>'+ (id===818?'PDF gốc KHÔNG có mục #818':w?esc(w.jp)+'（'+esc(w.kana)+'） — '+esc(w.meaning):'Chưa đối chiếu chữ Nhật / cách đọc / nghĩa')+'</span><small>PDF trang '+sourcePage(id)+' · '+(id===818?'SỐ BỊ BỎ QUA TRONG NGUỒN':w?(used?'Đã đối chiếu và có trong truyện':'Đã đối chiếu, chưa có trong truyện'):'CHƯA XÁC MINH')+'</small></div>'}).join("");
count.textContent=current?'Mục #'+current:'Trang '+(page+1)+' / '+Math.ceil(total/perPage);
prev.disabled=!!current||page===0;next.disabled=!!current||page>=Math.ceil(total/perPage)-1;
}
inp.oninput=paint;prev.onclick=()=>{page=Math.max(0,page-1);paint()};next.onclick=()=>{page=Math.min(Math.ceil(total/perPage)-1,page+1);paint()};paint();
}
function render(){
root.innerHTML='<header class="n3top"><a href="./index.html">← Japan Study</a><div><h1>KHI MẶT TRỜI KHÔNG CÒN MỌC</h1><small>朝が来ない街 · Tiểu thuyết N3</small></div><button class="n3mobile" id="n3menu">☰ Chương</button></header>'+
'<div class="n3frame"><aside class="n3nav'+(state.open?' open':'')+'" id="n3nav">'+nav()+'</aside><main class="n3main">'+(state.mode==="home"?home():state.mode==="words"?wordList():state.mode==="coverage"?coverage():chapter())+'</main></div>';
root.querySelector("#n3menu").onclick=()=>{state.open=!state.open;root.querySelector("#n3nav").classList.toggle("open",state.open)};
root.querySelectorAll("[data-goto]:not([disabled])").forEach(x=>x.onclick=()=>{state.open=false;open(Number(x.dataset.goto))});
root.querySelectorAll("[data-mode]").forEach(x=>x.onclick=()=>{state.mode=x.dataset.mode;state.open=false;render();top()});
root.querySelectorAll("[data-font]").forEach(x=>x.onclick=()=>{state.font=Math.max(14,Math.min(27,state.font+Number(x.dataset.font)));remember();root.querySelector("#n3-paper")?.style.setProperty("--n3-font",state.font+"px")});
root.querySelectorAll("[data-word]").forEach(x=>x.onclick=()=>showWord(Number(x.dataset.word)));
if(state.mode==="coverage")bindCoverage();
}
function showWord(n){const w=vocab.get(n),e=root.querySelector("#n3meaning");if(!e||!w)return;
e.innerHTML='<div class="n3definition"><div><strong>'+esc(w.jp)+'（'+esc(w.kana)+'）</strong><small>'+esc(w.meaning)+' · Mục #'+n+' Mimikara</small></div><div><button id="n3say">🔊</button> <button id="n3close">✕</button></div></div>';
e.querySelector("#n3close").onclick=()=>e.innerHTML="";
e.querySelector("#n3say").onclick=()=>{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();let a=new SpeechSynthesisUtterance(w.kana);a.lang="ja-JP";a.rate=.84;window.speechSynthesis.speak(a)};
}
document.addEventListener("keydown",e=>{if(state.mode!=="chapter"||e.altKey||e.ctrlKey||e.metaKey)return;if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName||""))return;if(e.key==="ArrowRight")open(state.chapter+1);if(e.key==="ArrowLeft")open(state.chapter-1)});
if(!data){root.innerHTML='<p style="padding:30px">Không tải được dữ liệu sách N3. Hãy thử làm mới trang.</p>';return}
if(location.hash.startsWith("#chapter-")){let ch=Number(location.hash.slice(9));if(all.some(x=>x.number===ch)){state.chapter=ch;state.mode="chapter"}}
render();
})();