
/* Japan Study — Sách. Không thay thế các chức năng ôn tập đã có. */
const booksUI = {
  view: "shelf", level: "N5", category: "vocab", page: 1,
  font: 17, readerMode: "pdf", pdfUrl: null, pdfName: ""
};
const booksLevels = ["N5","N4","N3","N2","N1"];
const booksTypes = [
  {key:"vocab",name:"Từ vựng",icon:"語",desc:"Truyện ghi nhớ, sách từ vựng và ví dụ"},
  {key:"kanji",name:"Kanji",icon:"漢",desc:"Sách chữ Hán, âm đọc và liên tưởng"},
  {key:"grammar",name:"Ngữ pháp",icon:"文",desc:"Sách mẫu câu và cách sử dụng"}
];
const booksChapterTitles = [
  "Cổng sắt bán cả bầu trời","Siêu thị của những chiếc nhãn biết cãi nhau",
  "Rạp chiếu phim nuốt mất màu sắc","Ngày hôm qua chạy trốn",
  "Cuộc thi tài năng của những người không có khả năng",
  "Lớp học phép thuật và cây bút không trả",
  "Trạm kiểm soát của người gác cổng vô hình",
  "Công viên mọc ra từ một tấm bưu thiếp",
  "Ngã tư nơi thời tiết biết suy nghĩ",
  "Bệnh viện chữa những vết thương của trí nhớ",
  "Nhà máy tăng ca tới ngày tận thế","Kho chứa những thứ có và không có",
  "Chuyến tàu chạy xuyên qua bản đồ","Bữa tối của hai mươi mốt vị khách",
  "Tháp đồng hồ ăn mất thứ Hai","Bưu điện gửi thư đến ngày mai",
  "Thám tử của mười hai câu hỏi","Ngôi chợ bán những thứ không ai nhìn thấy",
  "Tiệm quà nơi lòng tốt có hình dạng","Hồ điều ước và đám cưới trên mây",
  "Phòng khám của những lời hứa","Phố mặt nạ và những tên gọi thân thương",
  "Xưởng tranh giữ lại tiếng hát","Đài truyền hình phát toàn tin giả",
  "Xưởng sửa chữa thành phố","Đường đua cuối cùng: không ai bị lãng quên"
];
function booksEsc(value){
  return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}
function booksBook(){
  return window.JAPAN_STUDY_N5_BOOK || {pages:[],chapters:[],totalPages:0};
}
function booksSetView(view){
  booksUI.view=view;
  renderBooks();
  window.scrollTo({top:0,behavior:"smooth"});
}
function booksGoBack(){
  if(state.page!=="books")return false;
  if(booksUI.view==="reader"){booksSetView("category");return true;}
  if(booksUI.view==="category"){booksSetView("level");return true;}
  if(booksUI.view==="level"){booksSetView("shelf");return true;}
  return false; // app.js handles returning to Home
}
function booksCrumbs(){
  let c='<nav class="books-breadcrumb" aria-label="Đường dẫn tủ sách">';
  c+='<button type="button" data-books-view="shelf">🏠 Home / Sách</button>';
  if(booksUI.view!=="shelf")c+=' › <button type="button" data-books-level="'+booksUI.level+'">'+booksUI.level+'</button>';
  if(["category","reader"].includes(booksUI.view)) c+=' › <button type="button" data-books-cat="'+booksUI.category+'">'+booksTypes.find(x=>x.key===booksUI.category).name+'</button>';
  if(booksUI.view==="reader")c+=' › <span class="current">Thành phố không được quên</span>';
  c+='</nav>';
  return c;
}
function booksCitySvg(){
  return '<svg class="illustration" viewBox="0 0 240 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+
  '<defs><linearGradient id="books-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dea2"/><stop offset="1" stop-color="#946a38"/></linearGradient></defs>'+
  '<g fill="url(#books-gold)" stroke="#f8d791" stroke-width=".7">'+
  '<path d="M0 155 L0 112 10 112 10 89 17 89 17 77 20 77 20 90 27 90 27 118 36 118 36 100 43 100 43 68 47 68 47 52 51 68 55 68 55 97 63 97 63 82 67 82 67 69 70 69 70 83 78 83 78 110 86 110 86 75 94 75 94 56 99 56 99 39 103 56 108 56 108 89 114 89 114 59 119 59 119 28 123 59 128 59 128 89 134 89 134 56 138 56 138 39 142 56 147 56 147 75 154 75 154 110 163 110 163 82 169 82 169 70 173 70 173 86 182 86 182 100 190 100 190 66 194 66 194 51 198 65 202 65 202 94 210 94 210 120 221 120 221 89 226 89 226 78 229 89 236 89 236 130 240 130 240 170 0 170Z"/>'+
  '<path d="M85 170 V101 Q85 82 102 70 Q120 56 138 70 Q154 83 154 101 V170Z" fill="#b48a50"/>'+
  '<path d="M110 170 V127 Q110 113 120 109 Q130 113 130 127 V170Z" fill="#102838"/>'+
  '</g><g fill="#fff0b8" opacity=".8"><circle cx="120" cy="80" r="5"/><circle cx="97" cy="92" r="2"/><circle cx="140" cy="92" r="2"/></g></svg>';
}
function booksCover(){
  return '<img class="books-cover-art" src="books/n5/vocab/cover.jpg" width="1024" height="1536" alt="Bìa gốc Thành phố không được quên - thành phố huyền ảo ánh vàng dưới trời sao" loading="lazy" decoding="async">';
}
function booksShelf(){
  let h='<section class="books-panel books-intro"><span class="books-pill">THƯ VIỆN NHẬT NGỮ</span><h2 class="books-heading">📚 Sách của tui</h2><p class="books-caption">Một tủ sách cho mọi cấp JLPT. Chọn cấp độ để mở Từ vựng, Kanji hoặc Ngữ pháp.</p></section>';
  h+='<section><h2 class="books-heading">Chọn trình độ</h2><p class="books-caption">N5 → N1 · Mỗi cấp có đủ ba ngăn sách.</p></section><div class="books-grid">';
  booksLevels.forEach(function(level){
    const ready=level==="N5" || level==="N4";
    h+='<button type="button" class="books-level" data-books-level="'+level+'"><span class="books-level-head"><strong>'+level+'</strong><span class="count">'+(ready?'1 cuốn sách':'Chưa có sách')+'</span></span><span>Từ vựng · Kanji · Ngữ pháp <small style="float:right">›</small></span></button>';
  });
  h+='</div>';
  return h;
}
function booksLevel(){
 let h='<section class="books-panel books-intro"><span class="books-pill">TỦ SÁCH '+booksUI.level+'</span><h2 class="books-heading">'+booksUI.level+' · Chọn ngăn sách</h2><p class="books-caption">Đây là khu vực đọc sách, độc lập với phần học Mất gốc và N2 đang sử dụng.</p></section>';
 h+='<section class="books-categories">';
 booksTypes.forEach(function(t){
   let count=(booksUI.level==="N5"||booksUI.level==="N4")&&t.key==="vocab"?'1 cuốn đã thêm':'Chưa có sách';
   h+='<button type="button" class="books-category" data-books-cat="'+t.key+'"><span class="symbol">'+t.icon+'</span><span><strong>'+booksEsc(t.name)+'</strong><p>'+booksEsc(t.desc)+' · '+count+'</p></span><span class="chev">›</span></button>';
 });
 return h+'</section>';
}
function booksCategory(){
  const typ=booksTypes.find(x=>x.key===booksUI.category);
  let h='<section><p class="section-kicker">'+booksUI.level+' / '+booksEsc(typ.name)+'</p><h2 class="books-heading">Ngăn '+booksEsc(typ.name)+'</h2><p class="books-caption">Các cuốn sách được xếp theo cấp độ và chủ đề.</p></section>';
  if(booksUI.level==="N5" && booksUI.category==="vocab"){
    h+='<article class="books-panel books-book-card">'+booksCover()+
       '<div><h3>Thành phố không được quên</h3>'+
       '<p>Cuộc phiêu lưu kỳ ảo của An và Mực, lồng ghép toàn bộ từ vựng N5 theo 26 chương.</p>'+
       '<div class="books-stat-line"><span>94 trang</span><span>26 chương</span><span>545 mục từ</span></div>'+
       '<div class="books-row-actions"><button class="books-primary" data-books-read type="button">📖 Đọc sách</button>'+
       '<a class="books-secondary" href="books/n5/vocab/thanh-pho-khong-duoc-quen-n5.pdf" target="_blank" rel="noopener noreferrer">Mở PDF ↗</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Đọc trực tiếp bản PDF gốc có bìa, giữ nguyên phông chữ và dàn trang. Không cần chọn tệp từ thiết bị.</p>'+
       '</div></article>';
  }else if(booksUI.level==="N4" && booksUI.category==="vocab"){
    h+='<article class="books-panel books-book-card">'+
       '<div class="n4-book-thumb n4-book-thumb-photo"><img src="books/n4/vocab/ho-so-ga-cuoi-n4-cover-hq.avif" width="600" height="900" loading="lazy" alt="Bìa minh họa Hồ Sơ Ga Cuối — cô gái cầm hồ sơ tại sân ga đêm mưa"></div>'+
       '<div><h3>Hồ sơ ga cuối</h3>'+
       '<p>Tiểu thuyết trinh thám hiện đại tại Nhật: Mai cùng Haru điều tra vụ mất tích của Yuna và một nhà ga bị xóa khỏi bản đồ.</p>'+
       '<div class="books-stat-line"><span>7 phần</span><span>34 chương</span><span>623 mục từ N4</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="n4-book.html" target="_blank" rel="noopener noreferrer">📖 Đọc truyện N4 ↗</a>'+
       '<a class="books-secondary" href="books/n4/vocab/ho-so-ga-cuoi-n4.pdf" target="_blank" rel="noopener noreferrer">Mở PDF N4 ↗</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Đọc truyện trực tiếp trên website hoặc mở bản PDF khổ sách. Giữ nguyên 623 mục và 34 ngày từ tệp N4.</p>'+
       '</div></article>';
  }else{
    h+='<div class="books-panel books-empty"><div class="symbol">📖</div><strong>Ngăn này đang trống</strong><p>Đã tạo sẵn '+booksUI.level+' / '+booksEsc(typ.name)+'. Khi có tài liệu, sách sẽ xuất hiện tại đây.</p></div>';
  }
  return h;
}
function booksSetPage(page){
  const b=booksBook();
  booksUI.page=Math.max(1,Math.min(b.totalPages||94,Math.round(Number(page)||1)));
  try{localStorage.setItem("japanStudyBookN5LastPage",String(booksUI.page));}catch(e){}
  if(state.page==="books"&&booksUI.view==="reader")renderBooks();
  window.scrollTo({top:0,behavior:"smooth"});
}
function booksChapterForPage(n){
 const chapters=booksBook().chapters||[];
 return chapters.filter(c=>c.page<=n).slice(-1)[0]||null;
}
function booksFormatPage(raw,page){
 if(!raw.trim()) return '<p>Trang sách này được trình bày bằng hình ảnh trong bản PDF gốc.</p>';
 let body=raw.replace(/\r/g,"").replace(/\n\s*$/,"").replace(/\n\s*\d+\s*$/,"").trim();
 let ps=body.split(/\n[ \t]*\n+/).map(p=>p.trim()).filter(Boolean);
 let chapter=booksChapterForPage(page);
 return ps.map(function(block,idx){
   let lines=block.split(/\n/).map(l=>l.trim()).filter(Boolean);
   const text=lines.join(" ").replace(/\s+/g," ").trim();
   if(!text)return "";
   const chapMeta=/CHƯƠNG\s+\d+.*PHÙ HIỆU/i.test(text);
   const partMeta=/^TẬ\s*P\s+[IVX]+\s*•/i.test(text)||/^TẬP\s+[IVX]+/i.test(text)&&text.length<150;
   if(chapMeta) return '<p class="book-kicker">'+booksEsc(text)+'</p>';
   if(partMeta)return '<p class="book-part-heading">'+booksEsc(text)+'</p>';
   if(chapter&&page===chapter.page&&idx<3&&text.startsWith(chapter.title.slice(0,15)))
     return '<h2 class="book-chapter-heading">'+booksEsc(text)+'</h2>';
   if(/^MỤC LỤC/i.test(text)||/^LỜI MỞ$/i.test(text)||/^Atlas 26 tuyến ký ức/i.test(text))
     return '<h2 class="book-chapter-heading">'+booksEsc(text)+'</h2>';
   let escaped=booksEsc(text);
   escaped=escaped.replace(/([\u3400-\u9FFF][\u3400-\u9FFF\u3040-\u30FF々ー]*)（([\u3040-\u30FFー]+)）/g,'<span class="book-jp">$1（$2）</span>');
   return '<p>'+escaped+'</p>';
 }).join("");
}
function booksReader(){
  const url="books/n5/vocab/thanh-pho-khong-duoc-quen-n5.pdf";
  return '<section class="books-reader-shell">'+
    '<div class="books-reader-tools">'+
      '<span class="books-reader-meta">📖 Thành phố không được quên · N5 · 94 trang</span>'+
      '<div class="books-reader-commands">'+
        '<a class="books-primary" href="'+url+'" target="_blank" rel="noopener noreferrer">Mở toàn màn hình ↗</a>'+
        '<a class="books-secondary" href="'+url+'" download="Thanh-pho-khong-duoc-quen-N5.pdf">Tải PDF ↓</a>'+
      '</div>'+
    '</div>'+
    '<div class="books-panel books-reader-pdf-panel">'+
      '<iframe class="books-pdf-frame books-reader-pdf" src="'+url+'#view=FitH" title="Thành phố không được quên - toàn bộ 94 trang PDF có bìa gốc" loading="lazy"></iframe>'+
    '</div>'+
    '<p class="books-pdf-hint">Nếu điện thoại không hiển thị trang trong khung, bấm <a href="'+url+'" target="_blank" rel="noopener noreferrer">Mở toàn màn hình</a> để đọc bằng trình PDF trên máy.</p>'+
  '</section>';
}
function renderBooks(){
  if(typeof main==="undefined")return;
  const typ=booksTypes.find(t=>t.key===booksUI.category);
  const names={shelf:"Tủ sách",level:"Sách "+booksUI.level,category:booksUI.level+" · "+typ.name,reader:"Đọc sách N5"};
  title.textContent=names[booksUI.view]||"Sách";
  setNav("");
  let body=booksCrumbs();
  if(booksUI.view==="shelf")body+=booksShelf();
  if(booksUI.view==="level")body+=booksLevel();
  if(booksUI.view==="category")body+=booksCategory();
  if(booksUI.view==="reader")body+=booksReader();
  main.innerHTML='<div class="books-page">'+body+'</div>';
  main.querySelectorAll("[data-books-view]").forEach(btn=>btn.onclick=function(){booksSetView(btn.dataset.booksView)});
  main.querySelectorAll("[data-books-level]").forEach(btn=>btn.onclick=function(){booksUI.level=btn.dataset.booksLevel;booksSetView("level")});
  main.querySelectorAll("[data-books-cat]").forEach(btn=>btn.onclick=function(){booksUI.category=btn.dataset.booksCat;booksSetView("category")});
  const read=main.querySelector("[data-books-read]");
  if(read)read.onclick=function(){booksUI.readerMode="pdf";booksSetView("reader")};
}
function booksDb(){
 return new Promise(function(resolve,reject){
   if(!window.indexedDB){reject(new Error("IndexedDB không hỗ trợ"));return}
   let req=indexedDB.open("japan-study-personal-books",1);
   req.onupgradeneeded=function(){if(!req.result.objectStoreNames.contains("files"))req.result.createObjectStore("files")};
   req.onsuccess=function(){resolve(req.result)};
   req.onerror=function(){reject(req.error)};
 });
}
function booksStorePdf(file){
 return booksDb().then(function(db){return new Promise(function(resolve,reject){
    const tx=db.transaction("files","readwrite");
    tx.objectStore("files").put(file,"n5-story-pdf");
    tx.oncomplete=function(){db.close();resolve(true)};
    tx.onerror=function(){db.close();reject(tx.error)};
 })});
}
function booksRestorePdf(){
 if(booksUI.pdfUrl)return Promise.resolve(true);
 return booksDb().then(function(db){return new Promise(function(resolve,reject){
    const tx=db.transaction("files","readonly"),r=tx.objectStore("files").get("n5-story-pdf");
    r.onsuccess=function(){db.close();resolve(r.result||null)};
    r.onerror=function(){db.close();reject(r.error)};
 })}).then(function(file){
   if(!file)return false;
   if(booksUI.pdfUrl)URL.revokeObjectURL(booksUI.pdfUrl);
   booksUI.pdfUrl=URL.createObjectURL(file);
   booksUI.pdfName=file.name||"Sách N5";
   if(state.page==="books"&&booksUI.view==="reader"&&booksUI.readerMode==="pdf")renderBooks();
   return true;
 }).catch(function(){return false});
}
function booksHandlePdf(file){
 if(!file)return;
 if(file.type!=="application/pdf" && !/\.pdf$/i.test(file.name||"")){
   alert("Vui lòng chọn file PDF.");return;
 }
 if(booksUI.pdfUrl)URL.revokeObjectURL(booksUI.pdfUrl);
 booksUI.pdfUrl=URL.createObjectURL(file);booksUI.pdfName=file.name||"Sách N5";
 booksUI.readerMode="pdf";booksUI.view="reader";renderBooks();
 booksStorePdf(file).catch(function(){/* Reading still works this session */});
}
document.addEventListener("keydown",function(e){
 if(state.page!=="books"||booksUI.view!=="reader"||booksUI.readerMode!=="text")return;
 if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName||""))return;
 if(e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==="ArrowRight"){e.preventDefault();booksSetPage(booksUI.page+1)}
 if(e.key==="ArrowLeft"){e.preventDefault();booksSetPage(booksUI.page-1)}
});
