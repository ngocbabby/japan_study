(()=>{"use strict";
const data=window.JAPAN_STUDY_N3_NOVEL,root=document.getElementById("n3-root");
const key="japanstudy-n3-reading-progress",state={mode:"home",chapter:1,font:18,open:false};
try{const s=JSON.parse(localStorage.getItem(key)||"{}");if(s.chapter>0)state.chapter=s.chapter;if(s.font>13&&s.font<30)state.font=s.font}catch{}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const all=data?.chapters||[],parts=data?.parts||[],vocab=new Map((data?.vocab||[]).map(x=>[x.id,x]));
const remember=()=>{try{localStorage.setItem(key,JSON.stringify({chapter:state.chapter,font:state.font}))}catch{}};
const top=()=>window.scrollTo({top:0,behavior:"smooth"});
function open(ch){if(!all.some(x=>x.number===ch))return;state.chapter=ch;state.mode="chapter";remember();render();top()}
function nav(){
let n=0,out='<h2>MỤC LỤC · 40 CHƯƠNG</h2>';
for(const part of parts){out+='<div class="n3part">PHẦN '+part.number+' · '+esc(part.title)+'</div>';
for(const title of part.chapters){n++;const ok=all.some(c=>c.number===n);out+='<button class="n3chapter" data-goto="'+n+'" '+(ok?'':'disabled')+(state.mode==="chapter"&&state.chapter===n?' aria-current="page"':'')+'><strong>'+String(n).padStart(2,"0")+'</strong>'+esc(title)+(ok?'':' · Đang biên soạn')+'</button>'}}
return out;}
function cover(){return '<img class="n3cover" src="books/n3/vocab/cover.svg" alt="Bìa tiểu thuyết N3 — thành phố AURORA và mặt trời nhân tạo" width="707" height="1024">'}
function home(){
const n=all.length;
let h='<section class="n3hero">'+cover()+'<div><span class="n3eyebrow">TIỂU THUYẾT TỪ VỰNG JLPT N3</span><h2>KHI MẶT TRỜI KHÔNG CÒN MỌC</h2><p>朝が来ない街 · Thành phố không có bình minh</p><p>06:00 không đến. Kanna phát hiện hệ thống mặt trời nhân tạo AURORA đã bị tắt, trong khi mọi bản tin đều nói thành phố vẫn an toàn. Vì sao dữ liệu bị khóa? Ai là người đã được sinh ra lần thứ hai?</p><p>Sci-fi · Sinh tồn · Tâm lý · Bí ẩn</p><div class="n3buttons"><button class="n3btn" data-goto="1">Đọc chương 1</button><button class="n3btn secondary" data-goto="'+Math.min(state.chapter,n)+'">Đọc tiếp chương '+Math.min(state.chapter,n)+'</button></div></div></section>';
h+='<section class="n3panel"><h2>Cuộc hành trình qua 5 phần</h2><p>'+n+' chương nội dung đã đăng · 40 chương trong cốt truyện gốc · '+(data?.vocab?.length||0)+' mục từ đối chiếu trực tiếp. Đây là truyện sáng tác có chú giải từ Nhật, không phải văn bản lấy từ PDF.</p><div class="n3toc">';
let k=0;for(const p of parts){for(const title of p.chapters){k++;const ready=all.some(c=>c.number===k);h+='<button data-goto="'+k+'" '+(ready?'':'disabled')+'><span>'+String(k).padStart(2,"0")+'</span>'+esc(title)+'</button>'}}h+='</div></section>';
h+='<section class="n3panel"><h2>Từ vựng Mimikara N3</h2><p>Tài liệu gốc là PDF ảnh 27 trang. Chỉ những mục đã đối chiếu chữ, cách đọc và nghĩa mới được hiển thị là xác minh. Nhấn vào từ tiếng Nhật trong truyện để xem nghĩa và nghe giọng Nhật trên thiết bị.</p><button class="n3btn secondary" data-mode="words">Mở danh sách đã kiểm tra</button></section>';return h}
function token(t){return esc(t).replace(/⟦(\d+)⟧/g,(match,id)=>{const w=vocab.get(Number(id));return w?'<button class="n3word" data-word="'+id+'"><ruby>'+esc(w.jp)+'<rt>'+esc(w.kana)+'</rt></ruby></button>':esc(match)})}
function chapter(){
const c=all.find(x=>x.number===state.chapter);if(!c)return home();
const prev=all.some(x=>x.number===c.number-1),next=all.some(x=>x.number===c.number+1);
return '<div class="n3toolbar"><span>PHẦN '+Math.ceil(c.number/8)+' · CHƯƠNG '+c.number+' / 40</span><div><button data-font="-1">A−</button> <button data-font="1">A+</button> <button data-mode="home">Mục lục</button></div></div>'+
'<article class="n3paper" id="n3-paper" style="--n3-font:'+state.font+'px"><div class="kicker">AURORA · CHƯƠNG '+String(c.number).padStart(2,"0")+'</div><h2>'+esc(c.title)+'</h2><div class="sub">'+esc(c.tagline)+'</div>'+(c.paragraphs||[]).map(p=>'<p>'+token(p)+'</p>').join('')+'</article><div id="n3meaning"></div>'+
'<div class="n3pager"><button data-goto="'+(c.number-1)+'" '+(prev?'':'disabled')+'>← Chương trước</button><button data-goto="'+(c.number+1)+'" '+(next?'':'disabled')+'>'+(next?'Chương sau →':'Hết bản thảo hiện có')+'</button></div>'+
'<section class="n3panel"><h2>Từ đã xuất hiện trong chương</h2><div class="n3words">'+(c.vocabIds||[]).map(id=>{const w=vocab.get(id);return w?'<button data-word="'+id+'"><b>'+esc(w.jp)+'（'+esc(w.kana)+'）</b><small>'+esc(w.meaning)+'</small></button>':''}).join('')+'</div></section>'}
function wordList(){let h='<section class="n3panel"><h2>Mimikara N3 — phần đã đối chiếu</h2><p>Dữ liệu gốc đánh số 1–880, nhưng các trang ảnh có nhiều từ bị OCR nhận nhầm. Chỉ những từ đã đối chiếu từ PDF được đưa vào đây.</p><button class="n3btn secondary" data-mode="home">← Về sách</button><div class="n3words" style="margin-top:15px">';h+=(data.vocab||[]).map(w=>'<button data-word="'+w.id+'"><b>#'+w.id+' '+esc(w.jp)+'（'+esc(w.kana)+'）</b><small>'+esc(w.meaning)+'</small></button>').join('');return h+'</div></section><div id="n3meaning"></div>'}
function render(){
root.innerHTML='<header class="n3top"><a href="./index.html">← Japan Study</a><div><h1>KHI MẶT TRỜI KHÔNG CÒN MỌC</h1><small>朝が来ない街 · Tiểu thuyết N3</small></div><button class="n3mobile" id="n3menu">☰ Chương</button></header>'+
'<div class="n3frame"><aside class="n3nav'+(state.open?' open':'')+'" id="n3nav">'+nav()+'</aside><main class="n3main">'+(state.mode==="home"?home():state.mode==="words"?wordList():chapter())+'</main></div>';
root.querySelector("#n3menu").onclick=()=>{state.open=!state.open;root.querySelector("#n3nav").classList.toggle("open",state.open)};
root.querySelectorAll("[data-goto]:not([disabled])").forEach(x=>x.onclick=()=>{state.open=false;open(Number(x.dataset.goto))});
root.querySelectorAll("[data-mode]").forEach(x=>x.onclick=()=>{state.mode=x.dataset.mode;state.open=false;render();top()});
root.querySelectorAll("[data-font]").forEach(x=>x.onclick=()=>{state.font=Math.max(14,Math.min(27,state.font+Number(x.dataset.font)));remember();root.querySelector("#n3-paper")?.style.setProperty("--n3-font",state.font+"px")});
root.querySelectorAll("[data-word]").forEach(x=>x.onclick=()=>showWord(Number(x.dataset.word)));
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