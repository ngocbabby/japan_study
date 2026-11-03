
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
    const ready=level==="N5" || level==="N4" || level==="N3" || level==="N2";
    h+='<button type="button" class="books-level" data-books-level="'+level+'"><span class="books-level-head"><strong>'+level+'</strong><span class="count">'+(level==='N5'?'1 sách · 1 bản mẫu':ready?'Có sách':'Chưa có sách')+'</span></span><span>Từ vựng · Kanji · Ngữ pháp <small style="float:right">›</small></span></button>';
  });
  h+='</div>';
  return h;
}
function booksLevel(){
 let h='<section class="books-panel books-intro"><span class="books-pill">TỦ SÁCH '+booksUI.level+'</span><h2 class="books-heading">'+booksUI.level+' · Chọn ngăn sách</h2><p class="books-caption">Đây là khu vực đọc sách, độc lập với phần học Mất gốc và N2 đang sử dụng.</p></section>';
 h+='<section class="books-categories">';
 booksTypes.forEach(function(t){
   let count=(booksUI.level==="N5"||booksUI.level==="N4"||booksUI.level==="N3"||booksUI.level==="N2")&&t.key==="vocab"?'1 cuốn đã thêm':(booksUI.level==="N5"&&t.key==="kanji")?'Bản chương 1 đã có':'Chưa có sách';
   h+='<button type="button" class="books-category" data-books-cat="'+t.key+'"><span class="symbol">'+t.icon+'</span><span><strong>'+booksEsc(t.name)+'</strong><p>'+booksEsc(t.desc)+' · '+count+'</p></span><span class="chev">›</span></button>';
 });
 return h+'</section>';
}
function booksCategory(){
  const typ=booksTypes.find(x=>x.key===booksUI.category);
  let h='<section><p class="section-kicker">'+booksUI.level+' / '+booksEsc(typ.name)+'</p><h2 class="books-heading">Ngăn '+booksEsc(typ.name)+'</h2><p class="books-caption">Các cuốn sách được xếp theo cấp độ và chủ đề.</p></section>';
  if(booksUI.level==="N5" && booksUI.category==="kanji"){
    h+='<article class="books-panel books-book-card">'+
       '<img class="books-cover-art kanji-n5-book-thumb" src="books/n5/kanji/art/cover.webp" width="650" height="1108" loading="lazy" decoding="async" alt="Bìa Mật Điển Lục Giới: Yuna bên ma pháp thư và vương quốc ánh sao">'+
       '<div><h3>Mật Điển Lục Giới — 六界の秘典</h3>'+
       '<p>Sách thần bí tương tác: Yuna đi qua sáu thế giới, mở phong ấn Kanji bằng truyện, giải mã, câu đố và ôn tập cách quãng.</p>'+
       '<div class="books-stat-line"><span>6 thế giới</span><span>25 bài theo PDF</span><span>123 Kanji khác nhau</span><span>Chương 1: 4 chữ đã làm</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="kanji-n5.html" target="_blank" rel="noopener noreferrer">✦ Mở Mật Điển Lục Giới ↗</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Bản mẫu nghệ thuật có thể chơi: chương 1 (大・小・新・古) đã có truyện, cách đọc, vẽ thử và 7 thử thách. Các chương 2–25 vẫn đang được biên soạn, chưa tính đã học.</p></div></article>';
  }else if(booksUI.level==="N5" && booksUI.category==="vocab"){
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
  }else if(booksUI.level==="N2" && booksUI.category==="vocab"){
    h+='<article class="books-panel books-book-card">'+
       '<img class="books-cover-art" style="width:120px;height:180px;max-width:100%;object-fit:contain;border-radius:8px;" src="books/n2/vocab/ngay-mai-bi-rao-ban.webp" width="354" height="531" alt="Bìa Những ngày mai bị rao bán — Tsumugi và khế ước vàng kim giữa thành phố huyền ảo" loading="lazy">'+
       '<div><h3>Những ngày mai bị rao bán</h3>'+
       '<p>明日を売る人々 · Dark fantasy, bí ẩn, tâm lý và đấu trí: Tsumugi lần theo hợp đồng bán tương lai của 48.000 người.</p>'+
       '<div class="books-stat-line"><span>64/64 chương Nhật–Việt có bản thảo</span><span>1.160/1.160 mã từ trong bản thảo</span><span>Đã phân đủ 1.160 mục</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="n2-novel.html">📖 Đọc tiểu thuyết N2</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Đọc truyện tiếng Việt trước, có từ N2 bấm tra nghĩa; bật bản tiếng Nhật khi muốn luyện đọc. Phần ghép tự nhiên toàn bộ 1.160 từ vào câu Việt và hiệu đính Nhật ngữ vẫn chưa hoàn tất.</p></div></article>';
    h+='<article class="books-panel books-book-card">'+
       '<img class="books-cover-art" style="width:120px;height:180px;max-width:100%;object-fit:contain;border-radius:8px" src="books/n2/vocab/hai-dang-bay-vung-bien-cam.webp" width="450" height="675" alt="Bìa Hải đăng của bảy vùng biển cấm, truyện phiêu lưu kỳ ảo N2" loading="lazy" decoding="async">'+
       '<div><h3>Hải đăng của bảy vùng biển cấm</h3>'+
       '<p>七つの禁海の灯台 · Hoa tiêu Selene bị vu oan, buộc phải lên đường cùng hoàng tử Leon để tìm ra bí mật của bảy hải đăng.</p>'+
       '<div class="books-stat-line"><span>Đã viết 64/64 chương</span><span>1.160/1.160 mã N2 trong truyện Việt</span><span>8 phần có nội dung đầy đủ</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="seven-seas-book.html">📖 Đọc tiểu thuyết Hải đăng</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Truyện tiếng Việt là chính, từ Nhật được lồng vào câu và nhấn để tra. Đã có truyện Việt 64 chương và đủ 1.160 mã N2 trong văn bản; vẫn cần hiệu đính tiếng Nhật, nghĩa và ngữ cảnh trước khi gọi là bản học từ cuối.</p></div></article>';
    h+='<article class="books-panel books-book-card">'+
       '<img class="books-cover-art" style="width:120px;height:180px;max-width:100%;object-fit:contain;border-radius:8px" src="books/n2/vocab/zero-cover-cinematic.webp" width="600" height="900" alt="Bìa Bản án số không: chiếc cân công lý, đồng hồ 00:00, mười hai người" loading="lazy" decoding="async">'+
       '<div><h3>Bản án số không</h3>'+
       '<p>ゼロ番の判決 · Nữ luật sư Haru bào chữa cho Kaito, người tự thú giết mười hai người vẫn còn sống. Mỗi chứng cứ mới kéo theo một sự cố thực và mở ra bí mật tầng 0.</p>'+
       '<div class="books-stat-line"><span>Đã viết 64/64 chương</span><span>1.160/1.160 mã N2 trong truyện Việt</span><span>8 phần · Trinh thám pháp lý</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="zero-verdict-book.html">📖 Đọc Bản án số không</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Truyện tiếng Việt có từ Nhật bấm tra và furigana, không chèn thẻ từ rời giữa đoạn. Đủ mã nguồn theo kiểm đếm tự động; vẫn cần đối chiếu nghĩa và cách dùng với PDF gốc.</p></div></article>';
  }else if(booksUI.level==="N3" && booksUI.category==="vocab"){
    h+='<article class="books-panel books-book-card">'+
       '<picture class="books-cover-picture"><source type="image/avif" srcset="books/n3/vocab/khi-mat-troi-khong-con-moc.avif?v=20261103-premium 360w, books/n3/vocab/khi-mat-troi-khong-con-moc-hq.avif?v=20261103-hq 900w" sizes="(max-width:560px) 102px, 120px"><img class="books-cover-art" src="books/n3/vocab/khi-mat-troi-khong-con-moc.webp?v=20261103-fallback" width="360" height="540" alt="Bìa tiểu thuyết Khi mặt trời không còn mọc: nữ kỹ sư Kanna và thành phố AURORA dưới mặt trời nhân tạo" loading="lazy" decoding="async"></picture>'+
       '<div><h3>Khi mặt trời không còn mọc</h3>'+
       '<p>朝が来ない街 · Kanna và bí ẩn thành phố AURORA, sci-fi sinh tồn tâm lý.</p>'+
       '<div class="books-stat-line"><span>40 chương đã viết</span><span>69/879 mục từ đã đối chiếu</span></div>'+
       '<div class="books-row-actions"><a class="books-primary" href="n3-book.html">📖 Đọc tiểu thuyết N3</a></div>'+
       '<p class="books-pdf-hint" style="margin-top:10px">Cốt truyện 40 chương đã hoàn thiện. Mới có 67/879 mục từ xuất hiện; đang đối chiếu thêm từ nguồn scan.</p></div></article>';
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
