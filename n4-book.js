
/* HỒ SƠ GA CUỐI - nguyên tác trinh thám nối 623 mục nguồn N4.
   Đối chiếu đủ số mục trong PDF TMY N4 người dùng cung cấp. */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const E=window.JAPAN_STUDY_N4_VOCAB?.entries||[];
const STORY=window.JAPAN_STUDY_N4_STORY;
if(!STORY||E.length!==623||STORY.chapters.length!==34){
 document.querySelector("#n4Main").innerHTML='<div class="loading">Không thể mở đủ 623 từ / 34 chương. Hãy tải lại trang.</div>';return;
}
const arctitles=[
"PHẦN I · MƯA Ở SÂN GA",
"PHẦN II · NHỮNG CON ĐƯỜNG BỊ XÓA",
"PHẦN III · TÊN NGƯỜI TRONG HỒ SƠ",
"PHẦN IV · NHÂN CHỨNG VÀ HỒ SƠ GIẢ",
"PHẦN V · ĐIỀU KHÔNG THỂ QUÊN",
"PHẦN VI · BẪY Ở GA CUỐI",
"PHẦN VII · TRỞ VỀ VỚI SỰ THẬT"
];
const arctag=[
["Từng mảnh vé cũ","Một cuộc mất tích mở ra từ câu nói bí ẩn lúc 23:17."],
["Bản đồ chắp vá","Bảy mảnh bản đồ không chỉ dẫn về một địa điểm."],
["Người và những ký ức","Một cái tên biến mất có thể kéo theo cả gia đình."],
["Nét mực che sự thật","Khi hồ sơ biết nói dối, nhân chứng trở thành điều quan trọng nhất."],
["Ngày hôm qua được kể lại","Một ký ức đúng sẽ tìm ra lối đi mới."],
["Con tàu cuối cùng","Bằng chứng xuất hiện, nhưng ai mới là người cần được cứu?"],
["Bảy trang cuối","Không một cái tên nào phải biến mất thêm lần nữa."]
];
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function parse(e){
 const raw=e.raw.trim();
 const a=raw.indexOf("（"),b=raw.indexOf("）",a+1);
 if(a>=0&&b>a){return {jp:raw.slice(0,a).replace(/\s+/g,""),reading:raw.slice(a+1,b),mean:raw.slice(b+1).trim().replace(/^~\s*/,"~ ")||"Xem bản gốc"};}
 const m=raw.match(/^(.*?)(?:\s+)([A-Za-zÀ-ỹĐđ].*)$/u);
 return {jp:(m?m[1]:raw).replace(/\s+/g,""),reading:(m?m[1]:raw).replace(/\s+/g,""),mean:m?m[2]:"Xem bản gốc"};
}
function term(e){
 const p=parse(e);
 return '<span class="word" data-word-id="'+e.id+'" title="Mục '+e.id+' · trang PDF gốc '+e.page+'">'+
  '<span class="jp" lang="ja">'+esc(p.jp)+'</span><span class="reading" lang="ja">（'+esc(p.reading)+'）</span>'+
  '<span class="meaning"> — '+esc(p.mean)+'</span><sup class="vocab-index">#'+e.id+'</sup></span>';
}
const actions=[
"Vệt bút đỏ bên lề nhắc đến {w}. Mai đặt ngón tay lên trang giấy: đây có thể là chi tiết người viết cố giữ lại.",
"Trong sổ của Yuna xuất hiện {w}. Haru nghiêng đèn để đọc cho rõ, rồi đánh dấu một dấu hỏi bên cạnh.",
"Một mẩu giấy kẹp ở mép hồ sơ chỉ còn {w}. Mai thấy nét chữ viết vội như thể người ghi đang chạy trốn.",
"Giữa hai dòng tường trình, cụm {w} được gạch chân. Chi tiết ấy bỗng khiến lời khai trước đó trở nên đáng ngờ.",
"Khi đối chiếu thời gian, Mai gặp từ {w}. Cô vẽ thêm một đường nối trong sơ đồ chứng cứ.",
"Ở mặt sau tấm ảnh, Yuna đã ghi {w}. Chữ viết quen thuộc làm Mai bất giác nhớ tiếng cười của chị.",
"Một nhân chứng dùng {w} để miêu tả điều đã xảy ra. Haru hỏi lại thật chậm vì không muốn bỏ sót một âm.",
"Dòng chữ {w} hiện trên nhãn hồ sơ. Mai tự hỏi vì sao một từ bình thường lại được che bằng băng dính đen.",
"Mai đọc đoạn chú giải chứa {w}, rồi ngước nhìn ra đường ray. Có người vẫn cố giấu một sự việc rất cụ thể.",
"Bên dưới hình vẽ, có người viết {w}. Haru chép nguyên cả tiếng Nhật lẫn nghĩa vào trang sổ mới.",
"Trong biên bản phỏng vấn, {w} là từ duy nhất được khoanh tròn. Mai nhẩm lại nó như một mật khẩu.",
"Tờ bản đồ mở ra một ô chú thích: {w}. Cô đặt nó cạnh chiếc vé cũ để thử ghép lại hành trình.",
"Trong cuốn sổ da, một trang chỉ ghi {w}. Từ ấy không đưa ra đáp án nhưng thay đổi hướng suy luận.",
"Bằng mực tím, ai đó đã sửa dòng cũ thành {w}. Mai nhận thấy dấu sửa được thêm sau ngày xảy ra sự cố.",
"Yuna từng đánh một dấu sao cạnh {w}. Haru thì thầm rằng chị ấy chắc hẳn đã biết điểm này rất quan trọng.",
"Ở đáy phong bì, dòng chữ cuối có {w}. Mai giữ chiếc phong bì bằng hai tay như sợ bằng chứng sẽ tan mất.",
"Mai nhìn hàng chữ {w} dưới ánh sáng cửa sổ. Lần này, cô không bỏ qua ý nghĩa nhỏ nhất.",
"Haru gọi tên {w} khi giải thích sơ đồ cho Mai. Những từ đơn giản đang dần ghép thành bản đồ thật.",
"Một bản sao khác của hồ sơ có thêm {w}. Ai đó đã thay trang nhưng quên xóa dấu bút chì ở góc.",
"Tiếng chuông tàu vang lên lúc Mai đọc {w}. Cô đánh dấu thời gian ấy bên cạnh dòng ghi chú.",
"Tại hiện trường, người gác cổng đã nhắc đến {w}; kỳ lạ là lời khai chính thức lại bỏ hẳn đoạn này.",
"Mai lấy bút ghi {w}, rồi đóng tập giấy. Cô cần kiểm tra thêm nhân chứng thay vì vội tin điều mình thấy.",
"Haru khoanh dòng chứa {w}. Vệt chì đậm lên, như một con đường nhỏ giữa mê cung giấy tờ.",
"Ở một mép tài liệu bị cháy, họ vẫn đọc được {w}. Chừng ấy đủ để biết bản gốc từng chứa điều gì.",
"Chiếc máy ghi âm có phụ đề {w}. Mai bỗng nhớ giọng Yuna đã dừng lại đúng ở từ ấy.",
"Một tin nhắn nặc danh chỉ nhắc {w}. Haru cho rằng người gửi muốn họ chú ý tới một chi tiết đã quá quen.",
"Mai dừng lại trước tấm biển {w}. Lúc này, ngay cả một từ thông thường cũng có thể chỉ ra đường đi.",
"Giữa trang ghi chép là ký hiệu {w}. Mai so nó với ảnh chụp trong điện thoại, rồi khẽ lắc đầu.",
"Mảnh giấy cũ có gạch dưới {w}. Yuna sẽ không làm điều đó nếu cô ấy không tin nó cần thiết.",
"Nhật ký điều tra ghi {w}. Đến đây, từng lời kể trái ngược bắt đầu có cùng một điểm giao."
];
const connective=[
"Mai trải tất cả tờ giấy lên bàn. Có những lời chứng không thể hiểu nếu tách riêng khỏi bối cảnh.",
"Cô giữ im lặng để Haru đối chiếu những con số, những cái tên và các khoảng trống trong bản báo cáo.",
"Họ đi tiếp qua những mảnh ký ức, cố phân biệt điều mắt thấy với điều người khác muốn họ tin.",
"Gió lạnh luồn qua khe cửa. Trong khoảnh khắc ấy, Mai nhớ rằng một chi tiết nhỏ từng cứu sống cả một người.",
"Có lúc các dấu hiệu dường như vô nghĩa. Nhưng càng lật trang, Mai càng tin Yuna đã sắp sẵn một con đường.",
"Haru đặt chiếc bút xuống. “Nếu những từ này đều ở đúng chỗ,” anh nói, “còn thiếu thứ gì trong bản gốc?”"
];
function stationSvg(){
 let cols=[];
 for(let i=0;i<27;i++){let x=12+i*25,h=45+(i*23%100);cols.push('<rect x="'+x+'" y="'+(340-h)+'" width="'+(14+(i%3)*3)+'" height="'+h+'" fill="'+(i%2===0?'#8c673f':'#634933')+'" opacity=".65"/>');}
 return '<svg class="cover-station" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 410" aria-hidden="true">'+
 '<defs><linearGradient id="n4sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#08131d"/><stop offset="1" stop-color="#294658"/></linearGradient><linearGradient id="n4train" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#39505b"/><stop offset="1" stop-color="#101d26"/></linearGradient></defs>'+
 '<rect width="700" height="410" fill="url(#n4sky)"/><circle cx="390" cy="110" r="60" fill="#d9a363" opacity=".72"/><circle cx="390" cy="110" r="50" fill="#f4d19d" opacity=".65"/>'+
 '<g>'+cols.join("")+'</g><path d="M0 305L700 288V326L0 341Z" fill="#a17848"/><path d="M0 315L700 297" stroke="#f2c584" stroke-width="4"/>'+
 '<path d="M0 365Q170 330 350 348T700 337" fill="none" stroke="#deae68" stroke-width="3"/>'+
 '<path d="M0 383Q170 348 350 366T700 355" fill="none" stroke="#9e825e" stroke-width="3"/>'+
 '<g transform="translate(305,206)"><rect x="0" y="0" width="365" height="118" rx="24" fill="url(#n4train)" stroke="#b7a078" stroke-width="2"/>'+
 '<rect x="18" y="20" width="100" height="61" rx="7" fill="#f2c77c"/><rect x="131" y="20" width="91" height="61" rx="6" fill="#9d754e"/>'+
 '<rect x="236" y="20" width="91" height="61" rx="6" fill="#9d754e"/>'+
 '<circle cx="58" cy="107" r="10" fill="#edce91"/><circle cx="310" cy="107" r="10" fill="#edce91"/>'+
 '</g><g transform="translate(80,150)"><path d="M100 0Q17 20 0 91H205Q191 20 100 0Z" fill="#191f28" stroke="#e2bc80" stroke-width="3"/>'+
 '<path d="M101 92V177" stroke="#d9b074" stroke-width="4"/><path d="M101 177q0 15 15 9" fill="none" stroke="#d9b074" stroke-width="4"/>'+
 '<circle cx="114" cy="102" r="17" fill="#1c2029"/><path d="M98 125Q55 155 65 201H158Q170 153 131 126" fill="#171c25"/></g>'+
 '<g fill="#e6b976" opacity=".8"><circle cx="61" cy="48" r="2"/><circle cx="168" cy="89" r="2"/><circle cx="220" cy="55" r="1.6"/><circle cx="530" cy="58" r="1.7"/></g>'+
 '<rect x="7" y="7" width="686" height="396" fill="none" stroke="#b99259" stroke-width="2"/></svg>';
}
function cover(){
 return '<section class="cover-page"><div class="cover-ornament">TIỂU THUYẾT TRINH THÁM GHI NHỚ · JLPT N4</div>'+
 '<div class="cover-hero"><h1>HỒ SƠ<br>GA CUỐI</h1><div class="cover-paper">MỘT VỤ ÁN QUA 623 TỪ VỰNG N4</div>'+stationSvg()+
 '<div class="cover-sub">“Đừng tin giờ đến ghi trên bảng.”</div></div>'+
 '<div class="cover-footer">7 PHẦN · 34 CHƯƠNG · 623 MỤC TỪ · MỘT SỰ THẬT BỊ XÓA</div></section>';
}
function intro(){
 return '<section class="book-intro"><div class="book-kicker">LỜI MỞ HỒ SƠ</div><h2>Một tiếng còi lúc 23:17</h2>'+
 '<p>Những chuyến tàu cuối thường mang theo người về nhà. Chuyến tàu này mang đi một người — và để lại một câu hỏi.</p>'+
 '<p>Mai nhận được cuộc gọi cuối cùng từ chị gái Yuna, người làm việc với những hồ sơ cũ của tuyến đường sắt miền Kansai. Đúng 23 giờ 17, Yuna chỉ kịp nói: “Đừng tin giờ đến ghi trên bảng.” Rồi cuộc gọi tắt.</p>'+
 '<p>Ba ngày sau, một chiếc vali không chủ xuất hiện tại nhà ga số 0, một sân ga không hề tồn tại trên sơ đồ hiện tại. Mai cùng phóng viên Haru lần theo 34 tập hồ sơ để tìm người chị mất tích, và phát hiện một sự cố đã bị che giấu nhiều năm.</p>'+
 '<p>Mọi từ tiếng Nhật trong truyện là dấu vết có thật từ <strong>danh mục 623 mục của tài liệu N4 bà cung cấp</strong>. Mỗi từ mang mặt chữ, cách đọc và nghĩa tiếng Việt ngay trong cảnh truyện. Các chi tiết trinh thám, nhân vật và tình tiết là sáng tác mới.</p>'+
 '<p>Đây không phải cuốn từ điển hay bộ thẻ luyện tập: hãy đọc theo mạch chuyện, nhớ vật chứng gắn với từ, rồi tự lần lại hành trình của Mai như một người điều tra.</p>'+
 '</section>';
}
function sceneText(entries,sceneIndex,ch){
 const split=Math.ceil(entries.length/3), group=entries.slice(sceneIndex*split,(sceneIndex+1)*split);
 if(!group.length)return "";
 let body='';
 for(let i=0;i<group.length;i++){
   const word=term(group[i]);
   const tpl=actions[(group[i].id*7+sceneIndex*13)%actions.length];
   body+=(i===0?'':' ')+tpl.replace('{w}',word);
 }
 return '<p class="scene-clue">'+esc(connective[(ch.chapter+sceneIndex)%connective.length])+' '+body+'</p>';
}
function chapterHtml(ch){
 const es=E.filter(e=>e.day===ch.day);
 let tags='<div class="chapter-kicker">HỒ SƠ '+String(ch.chapter).padStart(2,'0')+' / TUẦN '+ch.week+' · NGÀY '+ch.day+' / MỤC '+es[0].id+'–'+es.at(-1).id+'</div>';
 let body='<section class="chapter" id="chapter-'+ch.chapter+'">'+tags+'<h2>'+esc(ch.title)+'</h2>'+
 '<p class="lead">'+esc(ch.opening)+'</p>';
 for(let i=0;i<3;i++)body+='<p class="scene-intro">'+esc(ch.scenes[i])+'</p>'+sceneText(es,i,ch);
 body+='<p class="closing">'+esc(ch.ending)+'</p>'+
 '<div class="chapter-map"><b>Dấu niêm phong:</b> '+es.length+' mục từ trong hồ sơ gốc, đánh số '+es[0].id+'–'+es.at(-1).id+'. Các chú giải được đối chiếu với bản PDF N4 đã cung cấp.</div>'+
 '<div class="page-ending">◆ ◆ ◆ &nbsp; HẾT HỒ SƠ '+String(ch.chapter).padStart(2,'0')+' &nbsp; ◆ ◆ ◆</div></section>';
 return body;
}
function tableOfContents(){
 let s='<section class="toc-page" id="table-of-contents"><div class="book-kicker">MỤC LỤC 34 HỒ SƠ</div><h2>Bảy chặng truy tìm sự thật</h2>';
 for(let week=1;week<=7;week++){
  s+='<h3 class="toc-part">'+arctitles[week-1]+'</h3>';
  for(const ch of STORY.chapters.filter(c=>c.week===week))
   s+='<a class="toc-link" href="#chapter-'+ch.chapter+'"><span class="toc-num">'+String(ch.chapter).padStart(2,'0')+'</span><span>'+esc(ch.title)+'</span></a>';
 }
 return s+'</section>';
}
function epilogue(){
 return '<section class="epilogue" id="end"><div class="book-kicker">HẬU TRUYỆN</div><h2>Không một cái tên nào bị bỏ lại</h2>'+
 '<p>Đêm ga số 0 được ghi lại bằng hàng trăm trang hồ sơ. Những trang giấy ấy tưởng chỉ chứa các từ đơn giản: đường đi, người thân, lời giải thích, sự chờ đợi, một việc đã mất hay một điều được tìm thấy. Nhưng khi chúng đứng đúng vị trí, cả câu chuyện không còn bị bóp méo.</p>'+
 '<p>Yuna nắm tay Mai nhìn tấm bảng mới bên đường ray. “Em còn nhớ lời chị nói lúc 23 giờ 17 không?” Mai gật đầu. Giờ đến ghi trên bảng đã bị sửa. Có những con số người ta có thể thay đổi, nhưng ký ức được đối chiếu bằng sự thật thì không.</p>'+
 '<p>Mai đóng tập hồ sơ cuối. Đối với chị, 623 từ tiếng Nhật không còn là những dòng trong một tài liệu. Chúng có mùi mưa, có ánh đèn, tiếng bánh tàu và những người đang đợi được gọi đúng tên.</p>'+
 '<p><em>Hết truyện. Chuyến tàu tiếp theo sẽ bắt đầu ở một trình độ khác.</em></p></section>'+
 '<section class="reference"><h2>Ghi chú về tài liệu nguồn</h2><p>Danh sách 623 mục từ được chuyển từ tệp PDF “TỔNG HỢP TỪ VỰNG JLPT N4” do người học cung cấp. Giữ nguyên số thứ tự 001–623, cấu trúc 7 tuần / 34 ngày. Chỉ lấy mục từ, âm đọc và nghĩa để tạo câu chuyện mới; không sao chép những đoạn ví dụ dài trong tài liệu gốc. Các chi tiết vụ án hoàn toàn hư cấu.</p>'+
 '<p>Mỗi mục từ có mã # và số trang trong PDF gốc để tiện đối chiếu nếu gặp cách dùng hoặc cách đọc cần kiểm tra.</p></section>';
}
function render(){
 let markup=cover()+intro()+tableOfContents();let currentWeek=0;
 for(const ch of STORY.chapters){
   if(ch.week!==currentWeek){
    currentWeek=ch.week;
    const sub=arctag[currentWeek-1];
    markup+='<section class="part-divider"><small>PHẦN '+String(currentWeek).padStart(2,"0")+'</small>'+
    '<h2>'+esc(arctitles[currentWeek-1].split(" · ")[1])+'</h2><p>'+esc(sub[1])+'</p></section>';
   }
   markup+=chapterHtml(ch);
 }
 markup+=epilogue();
 $("#n4Main").innerHTML=markup;
 $("#n4Main").dataset.entryCount=String(document.querySelectorAll(".word").length);
 const toc=$("#n4TocList");toc.innerHTML=STORY.chapters.map(ch=>'<a class="toc-link" href="#chapter-'+ch.chapter+'"><span class="toc-num">'+ch.chapter+'</span>'+esc(ch.title)+'</a>').join("");
 toc.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{$("#n4Toc").hidden=true}));
 const count=document.querySelectorAll(".word").length;
 if(count!==623){console.error("Vocabulary coverage",count);$("#n4Main").dataset.error="word-count-"+count;return;}
 window.N4_BOOK_READY=true;
}
render();
$("#tocBtn").onclick=()=>{$("#n4Toc").hidden=false};
$("#closeToc").onclick=()=>{$("#n4Toc").hidden=true};
$("#fontDown").onclick=()=>{let v=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--font-size"))||17;document.documentElement.style.setProperty("--font-size",Math.max(14,v-1)+"px")};
$("#fontUp").onclick=()=>{let v=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--font-size"))||17;document.documentElement.style.setProperty("--font-size",Math.min(25,v+1)+"px")};
$("#printBtn").onclick=()=>window.print();
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#n4Toc").hidden=true});
})();
