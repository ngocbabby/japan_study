/* Japan Study · Complete Kaiwa reader — content decrypted on device, never transmitted. */
(function () {
'use strict';
const $ = (s) => document.querySelector(s);
const root = $('#appMain');
const E = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'ngoc_iv_local_unlock_v2';
const STATS = 'ngoc_interview_training_v1';
const CHAPTER = 'ngoc_iv_last_chapter_v2';
const V = window.JAPAN_INTERVIEW_PRIVATE;
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const state = {data:null,chapter:'c0',tab:'book',query:'',hideAnswers:false,hideKana:false,rate:0.87,playing:false,playToken:0,recording:null,stream:null,recordUrl:null,recordBlob:null,game:null,feedback:'',justUnlocked:false,focusedQuestion:null};
function decode64(input) {
 const text=String(input||'').trim().replace(/-/g,'+').replace(/_/g,'/').replace(/[^A-Za-z0-9+/]/g,'');
 const out=[];let buffer=0,bits=0;
 for(const c of text){const v=alphabet.indexOf(c);if(v<0)continue;buffer=(buffer<<6)|v;bits+=6;if(bits>=8){bits-=8;out.push((buffer>>>bits)&255)}}
 return new Uint8Array(out);
}
function bytesToText(bytes){return new TextDecoder().decode(bytes)}
function unlock(secret){
 try {
   const key=decode64(secret), nonce=decode64(V.nonce);
   if(key.length!==32||nonce.length!==24)throw Error('Định dạng khóa không hợp lệ.');
   if(!window.nacl||typeof window.nacl.secretbox?.open!=='function')throw Error('Không tải được thư viện mã hóa. Hãy tải lại trang.');
   const bytes=window.nacl.secretbox.open(decode64(V.ciphertext),nonce,key);
   if(!bytes)throw Error('Khóa không đúng. Hãy sao chép chính xác khóa được gửi trong chat.');
   const data=JSON.parse(bytesToText(bytes));
   if(data.chapters?.length!==25||data.bank?.cards?.length!==56)throw Error('Dữ liệu tài liệu không đầy đủ.');
   state.data=data;
   window.JAPAN_INTERVIEW_BANK=data.bank;
   if(typeof window.mountInterviewTrainer==='function')window.mountInterviewTrainer();
   state.feedback='';
   const remembered=$('#ib-remember');
   if(!remembered||remembered.checked)try{localStorage.setItem(KEY,secret.trim())}catch{}
   else try{localStorage.removeItem(KEY)}catch{}
   try{const previous=localStorage.getItem(CHAPTER);if(data.chapters.some(c=>c.id===previous))state.chapter=previous;}catch{}
   state.justUnlocked=true;
   render();
   return true;
 }catch(err){state.feedback=err.message||'Không thể mở khóa tài liệu.';render();return false}
}
function pageShell(inner) {
 root.innerHTML='<div class="ib-app">'+inner+'</div>';
 document.querySelectorAll('[data-ib-tab]').forEach(b=>b.classList.toggle('active',b.dataset.ibTab===state.tab));
 document.querySelector('#pageTitle').textContent='Luyện phỏng vấn';
}
function allChapters(){return state.data?.chapters||V?.publicOutline||[]}
function chapter(){return state.data?.chapters.find(c=>c.id===state.chapter)}
function saved(){try{return JSON.parse(localStorage.getItem(STATS)||'{}')}catch{return {}}}
function progress(id){return saved()[id]||{step:0,due:'',tries:0,correct:0}}
function iso(d){const a=new Date(d.getTime()-d.getTimezoneOffset()*60000);return a.toISOString().slice(0,10)}
function today(){return iso(new Date())}
function grade(id,result){
 const db=saved(),prev=progress(id);
 const n=result==='again'?0:Math.min(7,Math.max(1,(prev.step||0)+(result==='easy'?2:1)));
 const intervals=[0,1,3,7,14,30,60,90],day=new Date();day.setDate(day.getDate()+intervals[n]);
 db[id]={step:n,due:iso(day),tries:(prev.tries||0)+1,correct:(prev.correct||0)+(result==='again'?0:1)};
 try{localStorage.setItem(STATS,JSON.stringify(db))}catch{}
}
function qidFor(c){const n=Number(c.id.slice(1));return n===0?'intro':n===22?'intro-short':n===23?'s1':null}
function studyStats(){
 const db=saved(),B=state.data?.bank;
 if(!B)return {total:0,seen:0,due:0,mastered:0};
 const ids=['intro',...B.cards.map(x=>x.id),...B.sensei.map(x=>x.id)];
 return {total:ids.length,seen:ids.filter(id=>db[id]?.tries).length,due:ids.filter(id=>!db[id]?.due||db[id].due<=today()).length,mastered:ids.filter(id=>(db[id]?.step||0)>=4).length};
}
function control(label,action,val,cls=''){return '<button type="button" class="ib-control '+cls+'" data-action="'+E(action)+'"'+(val!==undefined?' data-value="'+E(val)+'"':'')+'>'+label+'</button>'}
function lockPage(){
 const outline=allChapters();
 pageShell('<section class="ib-lock"><div class="ib-lock-icon">🔐</div><p class="ib-eyebrow">GIÁO TRÌNH CÁ NHÂN · PRIVATE</p><h2>Đọc đầy đủ 25 phần tài liệu Kaiwa</h2><p>Tài liệu nguyên văn và phần tô màu của sensei đã được mã hóa. Nhập khóa được gửi trong ChatGPT để mở tài liệu trên thiết bị này. Không có tài khoản và không mất phí.</p>'+
 '<label class="ib-field" for="ib-key">Khóa mở tài liệu</label><div class="ib-unlock-form"><input id="ib-key" type="password" autocomplete="off" spellcheck="false" placeholder="Dán khóa được gửi trong ChatGPT">'+control('Mở khóa','unlock',null,'primary')+'</div>'+
 '<label class="ib-check"><input type="checkbox" id="ib-remember" checked> Nhớ khóa trên trình duyệt này để lần sau không cần nhập lại</label>'+
 (state.feedback?'<p class="ib-error" role="alert">'+E(state.feedback)+'</p>':'')+
 '<div class="ib-lock-notes">🔒 Dữ liệu giải mã trong trình duyệt · 🎤 Ghi âm lưu ở thiết bị · 📄 Không đăng thêm thông tin cá nhân dạng đọc được lên GitHub</div>'+
 '<details class="ib-outline"><summary>Xem trước mục lục 25 phần</summary>'+outline.map(c=>'<div>'+E(c.title)+'</div>').join('')+'</details></section>');
}
function stopSpeech(message){window.KaiwaAudio?.stop(message)}
function onlyJapanese(text){
 const t=String(text||'').trim();
 if(/^（/.test(t)||/^→/.test(t)||/^(?:※|GHI CHÚ|BẢN |Tôi |Bạn |Vì |Chú ý|Trả lời|Nếu |Câu hỏi \d+)/i.test(t))return '';
 let clean=t.replace(/^Câu \d+\.\s*/,'').replace(/^Q[：:]\s*/,'').replace(/^A(?:[：:]|\s*[–-][^：]*：)\s*/,'').trim();
 if(/^\d+\.\s*/.test(clean))clean=clean.replace(/^\d+\.\s*/,'');
 if(/^【/.test(clean)||/[\u00c0-\u1ef9]/.test(clean))return '';
 if(/[\u3040-\u30ff\u3400-\u9fff]/u.test(clean))return clean;
 return '';
}
function spokenJapanese(c,plan,i){
 const t=c.items[i]?.t||'';
 if(!t||plan.hidden.has(i))return '';
 if(c.id==='c0'){
  const a=c.items.findIndex(x=>x.t.startsWith('【日本語'));
  const b=c.items.findIndex(x=>x.t.startsWith('【ひらがな'));
  if(i<=a||i>=b)return '';
 }
 if(/^（/.test(t)||/^(?:【|CÂU \d+\.|GHI NHỚ|GHI CHÚ|BẢN |LƯU Ý|Trả lời|※)/.test(t))return '';
 let str=t;
 const inside=plan.inline.get(i);
 if(inside)str=str.slice(0,inside.start);
 else if(str.includes('\n→'))str=str.slice(0,str.indexOf('\n→'));
 str=str.replace(/^Câu \d+\.\s*/,'').replace(/^Q[：:]\s*/,'').replace(/^A(?:[：:]|\s*[–-][^：]*：)\s*/,'').trim();
 if(c.id==='c21')str=str.replace(/^\d+\.\s*/,'').split('→')[0].trim();
 if(/^Nếu .+[:：]/.test(str))str=str.slice(str.search(/[:：]/)+1).trim();
 if(/[\u00c0-\u1ef9]/u.test(str))return '';
 if(!/[\u3040-\u30ff\u3400-\u9fff]/u.test(str))return '';
 // Skip stand-alone phonetic text even where it wasn't enclosed in parentheses.
 if(c.id==='c24'&&!/[\p{Script=Han}]/u.test(str))return '';
 return str;
}
function chapterReadingLines(c){
 const plan=window.KaiwaRuby?.plan(c)||{hidden:new Set(),readings:new Map(),inline:new Map()};
 return c.items.map((row,i)=>({text:spokenJapanese(c,plan,i),row:i})).filter(x=>x.text);
}
function playChapter(){
 if(state.recording){flash('Hãy dừng ghi âm trước khi bật bài đọc.');return;}
 const c=chapter(),lines=chapterReadingLines(c);
 window.KaiwaAudio?.start(c.id,lines,state.rate);
}
function speakLine(text){
 window.KaiwaAudio?.speakOnce(onlyJapanese(text)||String(text||''),state.rate);
}
function updatePlayButton(){window.KaiwaAudio?.paint(root)}
function flash(msg){const el=$('#ib-feedback');if(el){el.textContent=msg;el.hidden=false}else alert(msg)}
function getStatus(id){const p=progress(id);if(!p.tries)return 'Chưa học';if(p.step>=4)return 'Đã nhớ tốt';if(p.due<=today())return 'Đến hạn ôn';return 'Đang học'}
function topicQuestionCount(chapterId){
 const n=Number(chapterId.slice(1)),B=state.data.bank;
 if(n>=1&&n<=20)return B.cards.filter(x=>x.sectionId==='topic'+n).length;
 if(n===0)return 13;if(n===23)return 8;if(n===21)return 12;return 0;
}
function sidebar(context='desktop'){
 const list=allChapters();
 return '<aside class="ib-sidebar"><div class="ib-side-title"><strong>📚 25 PHẦN TÀI LIỆU</strong><small>Hiển thị đúng thứ tự file gốc</small></div><label class="ib-search"><span>⌕</span><input id="ib-search-'+E(context)+'" data-role="ib-search" type="search" placeholder="Tìm chương, câu, từ khóa..." value="'+E(state.query)+'"></label>'+
 '<div class="ib-toc-list">'+list.map(c=>'<button class="ib-chapter-link '+(c.id===state.chapter?'active':'')+'" data-action="chapter" data-value="'+E(c.id)+'" data-search="'+E((c.title+' '+(c.items||[]).map(x=>x.t).join(' ')).toLowerCase())+'"><span class="ib-numeric">'+E(c.id.slice(1).padStart(2,'0'))+'</span><span>'+E(c.title.replace(/^\d+\.\s*/,''))+'</span><span class="ib-toc-count">'+(c.items?.length||c.count||0)+'</span></button>').join('')+'</div></aside>';
}
function rateBar(id){
 const s=getStatus(id),isDue=s==='Đến hạn ôn';
 return '<div class="ib-rate-bar"><span class="ib-status '+(isDue?'is-due':'')+'">'+E(s)+'</span>'+
 control('↻ Chưa nhớ','grade',id+':again')+control('✓ Nhớ được','grade',id+':good')+control('★ Rất dễ','grade',id+':easy')+'</div>';
}
function paragraphView(p,i,c,hide,phase,readingPlan){
 const t=p.t;let status=phase;
 if(/^Câu \d+\./.test(t)||/^CÂU \d+\./.test(t)||/^Q[：:]/.test(t))status='question';
 if(/^Trả lời\b/.test(t)||/^A[:：]/.test(t)||/^A\s*[–-].*：/.test(t)||/^【日本語/.test(t))status='answer';
 if(/^【NGHĨA/.test(t))status='meaning';
 const reading=readingPlan.readings.get(i)||readingPlan.inline.get(i)?.reading||'';
 const isQuestion=/^Câu \d+\./.test(t)||/^Q[：:]/.test(t);
 const j=onlyJapanese(t),kind=isQuestion?'question':reading?'answer':j?'answer':status==='meaning'?'meaning':'note';
 const embedded=readingPlan.inline.get(i)||null;
 let start=0,end=embedded?embedded.start:t.length;
 const head=t.match(/^Câu \d+\.\s*|^Q[：:]\s*|^A(?:[：:]|\s*[–-][^：]*：)\s*|^(?:Nếu làm ca đêm được|Nếu ưu tiên ca ngày nhưng có thể trao đổi):\s*|^\d+\.\s*/);
 if(head)start=head[0].length;
 if(start>end)start=0;
 const ruby=window.KaiwaRuby;
 const markup=ruby
  ?ruby.decorate(p,start,end,reading,!!state.showFurigana,embedded)
  :E(t);
 const level=p.k==='HEADING_2'?'h3':p.k==='HEADING_3'?'h4':'div';
 const questionNumber=t.match(/^Câu (\d+)\./)||c.id==='c23'&&t.match(/^CÂU (\d+)\./);
 const anchor=questionNumber?' id="ib-anchor-'+(c.id==='c23'?'s':'q')+questionNumber[1]+'"':'';
 return {html:'<div data-read-row="'+i+'" class="ib-paragraph '+(level!=='div'?'heading ':'')+'kind-'+kind+'"'+anchor+'>'+
 '<'+level+' lang="'+(j||reading?'ja':'vi')+'" class="ib-copy '+(hide&&kind==='answer'?'is-blurred':'')+'">'+markup+'</'+level+'></div>',phase:status,questionNumber:questionNumber?questionNumber[1]:null};
}
function bookContent(){
 const c=chapter(),idx=Number(c.id.slice(1)),stats=studyStats(),prev=idx>0?'c'+(idx-1):null,next=idx<24?'c'+(idx+1):null;
 let body='<header class="ib-chapter-head"><p class="ib-eyebrow">CHƯƠNG '+String(idx).padStart(2,'0')+' / 24 · TÀI LIỆU GỐC</p><h2>'+E(c.title.replace(/^\d+\.\s*/,''))+'</h2><p>Hiển thị đầy đủ nội dung của chương theo đúng thứ tự Google Docs. Chạm 🔊 để nghe từng câu.</p>'+
 '<div class="ib-chapter-meta"><span>'+c.items.length+' đoạn nội dung</span><span>'+topicQuestionCount(c.id)+' bài/câu luyện</span></div></header>';
 body+='<div class="ib-toolbar">'+control(state.hideAnswers?'👁 Hiện đáp án':'🙈 Che đáp án','hide-answers',null,state.hideAnswers?'selected':'')+
 control(state.hideKana?'あ Hiện Hiragana':'あ Ẩn Hiragana','hide-kana',null,state.hideKana?'selected':'')+
 control(state.playing?'■ Dừng nghe':'▶ Nghe toàn chương','play-all')+
 '<label class="ib-rate-select">Tốc độ <select id="ib-rate"><option value="0.75" '+(state.rate===0.75?'selected':'')+'>0,75×</option><option value="0.87" '+(state.rate===0.87?'selected':'')+'>0,87×</option><option value="1" '+(state.rate===1?'selected':'')+'>1×</option><option value="1.15" '+(state.rate===1.15?'selected':'')+'>1,15×</option></select></label></div>';
 body+='<div class="ib-practice-shortcuts">'+control('🎙️ Ghi âm chương','record-toggle',null,state.recording?'danger':'')+
 control('🎮 Game trong chương','game-open')+control('📝 Luyện trả lời','practice-tab')+'</div>';
 body+='<div id="ib-record-panel" class="ib-record-panel">'+recordPanel()+'</div>';
 if(idx===0){
  const pairs=state.data.bank.intro.lines;
  body+='<details class="ib-paired"><summary>📗 Luyện 13 câu: tiếng Nhật + Hiragana cùng dòng (mở để xem)</summary><div class="ib-pair-list">'+
  pairs.map((line,i)=>'<div class="ib-pair-row"><span class="ib-pair-number">'+String(i+1).padStart(2,'0')+'</span><div><strong lang="ja">'+E(line.jp)+'</strong><p>'+E(line.kana)+'</p></div>'+control('🔊','intro-speak',i)+'</div>').join('')+
  '</div></details>';
 }
 if(state.game?.id===c.id)body+=gameView(c);
 let phase='note',current=null;
 body+='<section class="ib-lesson" aria-label="Toàn văn chương">';
 for(let i=0;i<c.items.length;i++){
   const p=c.items[i],t=p.t;
   const q=t.match(/^Câu (\d+)\./)||idx===23&&t.match(/^CÂU (\d+)\./);
   if(q&&current&&((idx>=1&&idx<=20)||idx===23)){body+=rateBar(current);current=null;}
   if(q&&((idx>=1&&idx<=20)||idx===23))current=(idx===23?'s':'q')+q[1];
   const r=paragraphView(p,i,c,state.hideAnswers,phase);
   phase=r.phase;
   const isKana=/^（[\u3040-\u30ff]/.test(t)||phase==='kana'&&p.k!=='HEADING_3';
   body+=state.hideKana&&isKana?'<div class="ib-kana-hidden">あ Hiragana đang ẩn · bấm hiện trên thanh công cụ</div>':r.html;
 }
 if(current&&((idx>=1&&idx<=20)||idx===23))body+=rateBar(current);
 if(idx===0||idx===22)body+=rateBar(idx===0?'intro':'intro-short');
 body+='</section>';
 body+='<div class="ib-chapter-bottom">'+(prev?control('← Chương trước','chapter',prev):'<span></span>')+(next?control('Chương tiếp →','chapter',next,'primary'):'<span>Đã đến chương cuối ✓</span>')+'</div>';
 body+='<div class="ib-source">Bản nguồn: Google Docs “kaiwa phỏng vấn”, không tự sửa lời sensei. Các chỗ đánh dấu màu được giữ trong bản đọc. '+control('🔒 Khóa tài liệu','lock')+'</div>';
 return body;
}
function recordPanel(){
 const hint=state.recording?'🔴 Đang ghi âm… Bấm Dừng để lưu trên máy.':'Micro chỉ dùng để ghi âm trong trình duyệt. Mỗi chương lưu bản thu gần nhất trên thiết bị này.';
 return '<div class="ib-record-summary"><strong>🎤 Ghi âm luyện nói</strong><p>'+hint+'</p></div>'+
 '<div class="ib-record-actions">'+control(state.recording?'⏹ Dừng ghi âm':'🎙 Bắt đầu ghi','record-toggle',null,state.recording?'danger':'primary')+
 (state.recordBlob?control('⬇ Tải bản ghi','download-record'):'')+
 '<span class="ib-record-meta" id="ib-record-meta"></span></div>'+
 (state.recordUrl?'<audio id="ib-record-playback" controls src="'+E(state.recordUrl)+'"></audio>':'<div id="ib-record-playback-placeholder" class="ib-muted">Chưa có bản ghi cho chương này.</div>');
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function gameQuestions(c){
 const number=Number(c.id.slice(1)),B=state.data.bank;
 if(number>=1&&number<=20)return B.cards.filter(x=>x.sectionId==='topic'+number&&x.responses?.length);
 if(number===23)return B.sensei.filter(x=>x.responses?.length);
 if(number===21)return B.priority.map(n=>B.cards.find(x=>x.number===n)).filter(Boolean);
 if(number===0)return [{id:'intro',question:'自己紹介をお願いします。',meaning:'Hãy tự giới thiệu',responses:[{jp:B.intro.lines[0].jp,vi:B.intro.meaning}]}];
 if(number===22)return [{id:'intro-short',question:'自己紹介をお願いします。',meaning:'Hãy tự giới thiệu ngắn gọn',responses:[{jp:c.items.find(p=>onlyJapanese(p.t))?.t||'',vi:''}]}];
 return [];
}
function gameStart(kind){
 const c=chapter(),pool=gameQuestions(c);
 if(!pool.length)return flash('Không có câu trắc nghiệm tương ứng với chương này.');
 state.game={id:c.id,kind,questionPool:shuffle(pool).slice(0,Math.min(8,pool.length)),index:0,score:0,selected:null,pieces:[],picked:[],checked:false};
 prepGame();
 render(true);
}
function piecesFor(text){
 const clean=Array.from(String(text||'')).filter(Boolean),size=Math.max(3,Math.min(8,Math.ceil(clean.length/5)));let out=[];
 for(let i=0;i<clean.length;i+=size)out.push({id:i/size,text:clean.slice(i,i+size).join('')});
 return out;
}
function prepGame(){
 const g=state.game;if(!g)return;g.selected=null;g.picked=[];g.checked=false;
 const entry=g.questionPool[g.index];if(!entry)return;
 const jp=entry.responses?.[0]?.jp||'';
 g.pieces=shuffle(piecesFor(jp));
 if(g.kind==='listen'){
   const B=state.data.bank,extra=shuffle(B.cards.filter(x=>x.id!==entry.id&&x.meaning).map(x=>x.meaning)).slice(0,3);
   g.options=shuffle([entry.meaning||entry.label||'',...extra]);g.options=Array.from(new Set(g.options));
 }
}
function gameView(c){
 const g=state.game,entry=g?.questionPool?.[g.index];if(!entry)return '<div class="ib-game"><h3>🎉 Xong lượt!</h3><strong>'+E(g?.score)+' điểm</strong>'+control('Chơi lại','game-restart')+control('Đóng game','game-close')+'</div>';
 const answer=entry.responses?.[0]?.jp||'';
 let content='<section class="ib-game" id="ib-game"><div class="ib-game-title"><div><p class="ib-eyebrow">GAME TRONG CHƯƠNG · '+(g.index+1)+' / '+g.questionPool.length+'</p><h3>'+(g.kind==='order'?'🧩 Ghép câu theo thứ tự':'🎧 Nghe và chọn nghĩa')+'</h3></div>'+control('✕ Đóng','game-close')+'</div>';
 content+='<div class="ib-game-modes">'+control('🧩 Ghép câu','game-order',null,g.kind==='order'?'selected':'')+control('🎧 Nghe chọn nghĩa','game-listen',null,g.kind==='listen'?'selected':'')+'</div><p class="ib-game-question">'+E(entry.question)+'</p>';
 if(g.kind==='order'){
   const picked=g.picked.map(id=>g.pieces.find(z=>z.id===id)).filter(Boolean);
   content+='<div class="ib-picked">'+(picked.length?picked.map(z=>control(E(z.text),'piece-undo',z.id,'piece')).join(''):'Chọn các mảnh bên dưới để ghép thành đáp án...')+'</div><div class="ib-shuffled">'+g.pieces.filter(z=>!g.picked.includes(z.id)).map(z=>control(E(z.text),'piece-pick',z.id,'piece')).join('')+'</div>'+
   '<div class="ib-action-row">'+control('↻ Xếp lại','game-reset')+control('✓ Kiểm tra','game-check',null,'primary')+'</div>';
 }else{
   content+=control('🔊 Nghe câu hỏi tiếng Nhật','game-speak',null,'primary');
   content+='<div class="ib-choices">'+g.options.map((opt,i)=>control(E(opt),'game-answer',i,(g.selected===i?'selected':''))).join('')+'</div>';
 }
 if(g.checked||g.kind==='listen'&&g.selected!==null)content+='<div class="ib-game-result"><p>'+E(g.passed?'✅ Chính xác!':'🔁 Chưa đúng, xem đáp án từ file:')+'</p><strong lang="ja">'+E(answer)+'</strong>'+control('Câu tiếp →','game-next',null,'primary')+'</div>';
 content+='</section>';return content;
}
function chapterRead(){
 const c=chapter();
 if(!c)return lockPage();
 const numbers=studyStats();
 const html='<div class="ib-topline"><div><p class="ib-eyebrow">KAIWA ・ SỔ TAY TƯƠNG TÁC</p><h2>Đọc nguyên văn, học thuộc thông minh</h2><p>Giáo trình 25 phần từ Google Docs. Học từng chương, không cắt nhỏ nội dung.</p></div>'+
 '<div class="ib-summary"><b>'+numbers.seen+'/'+numbers.total+'</b><small>bài đã luyện</small></div></div>'+
 '<div class="ib-daily"><strong>🎯 Lộ trình một buổi 20–25 phút</strong><span>5 phút ôn · 10 phút đọc chương · 7 phút tự nói/ghi âm · 3 phút game</span>'+control('Xem các câu đến hạn','tab-review')+'</div>'+
 '<details class="ib-mobile-toc"><summary>📚 Đổi chương · '+E(c.title)+'</summary>'+sidebar('mobile')+'</details>'+
 '<div class="ib-layout">'+sidebar('desktop')+'<article class="ib-main">'+bookContent()+'</article></div>';
 pageShell(html);
 filterOutline(state.query);
 loadRecording(c.id);
}
function reviewView(){
 const B=state.data.bank,db=saved(),ids=[{id:'intro',question:'自己紹介をお願いします。',meaning:'Tự giới thiệu',chapter:'c0'},...B.cards.map(x=>({id:x.id,question:x.question,meaning:x.meaning,chapter:'c'+Number(x.sectionId.replace('topic',''))})),...B.sensei.map(x=>({id:x.id,question:x.question,meaning:x.label,chapter:'c23'}))];
 const due=ids.filter(x=>!db[x.id]?.due||db[x.id].due<=today());
 const html='<section class="ib-review"><p class="ib-eyebrow">ÔN CÁCH QUÃNG · ACTIVE RECALL</p><h2>Ôn hôm nay: '+due.length+' bài</h2><p>Đọc câu hỏi, tự nói trước khi xem đáp án. Câu chưa nhớ cần học lại, câu đã thuộc sẽ được giãn thời gian ôn.</p>'+
 '<div class="ib-review-grid">'+due.map(x=>'<div class="ib-review-item"><div><strong lang="ja">'+E(x.question)+'</strong><small>'+E(x.meaning)+'</small></div>'+control('Mở chương →','open-question',x.chapter+':'+x.id)+'</div>').join('')+'</div></section>';
 pageShell(html);
}
function render(preserve=false){
 const y=preserve?window.scrollY:0;
 if(!state.data)lockPage();
 else if(state.tab==='review')reviewView();
 else if(state.tab==='practice'){
   if(typeof window.renderInterviewTrainer==='function')window.renderInterviewTrainer();
   else pageShell('<section class="ib-lock"><h2>Bộ luyện đang khởi động</h2>'+control('Quay lại sổ tay','tab-book')+'</section>');
 }else chapterRead();
 if(preserve)window.scrollTo(0,y);else window.scrollTo({top:0,behavior:'auto'});
}
function filterOutline(query){
 const q=String(query||'').trim().toLowerCase();document.querySelectorAll('.ib-chapter-link').forEach(b=>{b.hidden=!!q&&!b.dataset.search.includes(q)});
}
function navigate(id,anchor){
 if(!state.data.chapters.some(x=>x.id===id))return;
 stopSpeech();state.chapter=id;state.game=null;state.hideAnswers=false;state.hideKana=false;state.recordBlob=null;state.recordUrl=null;state.tab='book';
 try{localStorage.setItem(CHAPTER,id)}catch{}
 render();if(anchor)setTimeout(()=>document.getElementById('ib-anchor-'+anchor)?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function setTab(tab){
 stopSpeech();state.tab=tab;state.game=null;state.hideAnswers=false;state.hideKana=false;
 render();
 document.querySelectorAll('[data-ib-tab]').forEach(el=>el.classList.toggle('active',el.dataset.ibTab===tab));
}
async function audioDB(){
 if(!window.indexedDB)return null;
 return new Promise(resolve=>{
  try{const req=indexedDB.open('japan_kaiwa_recordings',1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('latest'))req.result.createObjectStore('latest')};
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);
  }catch{resolve(null)}
 });
}
async function loadRecording(id){
 state.recordUrl&&URL.revokeObjectURL(state.recordUrl);state.recordUrl=null;state.recordBlob=null;
 const db=await audioDB();if(!db)return;
 try{
   const result=await new Promise(resolve=>{const t=db.transaction('latest','readonly').objectStore('latest').get(id);t.onsuccess=()=>resolve(t.result);t.onerror=()=>resolve(null)});
   if(id!==state.chapter||state.tab!=='book')return;
   if(result?.blob){state.recordBlob=result.blob;state.recordUrl=URL.createObjectURL(result.blob);const el=$('#ib-record-panel');if(el)el.innerHTML=recordPanel();}
 }catch{}finally{db.close();}
}
async function saveRecording(id,blob){
 const db=await audioDB();if(!db)return false;
 try{return await new Promise(resolve=>{const tx=db.transaction('latest','readwrite');tx.objectStore('latest').put({blob,created:new Date().toISOString()},id);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)})}catch{return false}finally{db.close()}
}
async function toggleRecord(){
 if(state.recording){state.recording.stop();return}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){flash('Ghi âm cần HTTPS, cấp quyền micro và trình duyệt hỗ trợ MediaRecorder.');return}
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true}),parts=[],rec=new MediaRecorder(stream),forChapter=state.chapter;
  state.recording=rec;state.stream=stream;rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
  rec.onstop=async()=>{
   stream.getTracks().forEach(x=>x.stop());state.recording=null;state.stream=null;
   const blob=new Blob(parts,{type:rec.mimeType||'audio/webm'});if(blob.size<100)return flash('Bản ghi quá ngắn hoặc trống.');
   const result=await saveRecording(forChapter,blob);
   if(state.chapter===forChapter&&state.tab==='book'){
     state.recordUrl&&URL.revokeObjectURL(state.recordUrl);state.recordBlob=blob;state.recordUrl=URL.createObjectURL(blob);
     const panel=$('#ib-record-panel');if(panel)panel.innerHTML=recordPanel();
     flash(result?'✅ Đã lưu bản ghi trên trình duyệt này.':'✅ Ghi âm xong. Bấm Tải bản ghi để giữ lại; trình duyệt chưa hỗ trợ lưu lâu dài.');
   }
  };
  rec.start();const panel=$('#ib-record-panel');if(panel)panel.innerHTML=recordPanel();
 }catch(err){flash('Không thể sử dụng micro: '+(err?.message||String(err)))}
}
function downloadRecording(){
 if(!state.recordBlob)return;const a=document.createElement('a');const url=URL.createObjectURL(state.recordBlob);
 a.href=url;a.download='kaiwa_'+state.chapter+'_'+today()+(state.recordBlob.type.includes('mp4')?'.m4a':'.webm');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function onClick(ev){
 const node=ev.target.closest('[data-action]');if(!node)return;
 const a=node.dataset.action,v=node.dataset.value||'';
 if(!state.data){
   if(a==='unlock')unlock($('#ib-key')?.value||'');
   return;
 }
 if(a==='chapter'){navigate(v);return}
 if(a==='lock'){if(state.recording)state.recording.stop();stopSpeech();try{localStorage.removeItem(KEY)}catch{}state.data=null;window.JAPAN_INTERVIEW_BANK=null;state.feedback='Đã khóa tài liệu trên thiết bị này.';render();return}
 if(a==='hide-answers'){state.hideAnswers=!state.hideAnswers;render(true);return}
 if(a==='hide-kana'){state.hideKana=!state.hideKana;render(true);return}
 if(a==='play-all'){if(state.playing)stopSpeech();else playChapter();updatePlayButton();return}
 if(a==='speak'){stopSpeech();speakLine(chapter().items[Number(v)]?.t||'');return}
 if(a==='intro-speak'){stopSpeech();speakLine(state.data.bank.intro.lines[Number(v)]?.jp||'');return}
 if(a==='record-toggle'){toggleRecord();return}
 if(a==='download-record'){downloadRecording();return}
 if(a==='practice-tab'){setTab('practice');return}
 if(a==='tab-review'){setTab('review');return}
 if(a==='tab-book'){setTab('book');return}
 if(a==='open-question'){const [c,q]=v.split(':');navigate(c,q);return}
 if(a==='grade'){const ix=v.lastIndexOf(':'),id=v.slice(0,ix),result=v.slice(ix+1);grade(id,result);render(true);return}
 if(a==='game-open'){gameStart('order');return}
 if(a==='game-restart'){gameStart(state.game?.kind||'order');return}
 if(a==='game-close'){state.game=null;render(true);return}
 if(a==='game-order'){gameStart('order');return}
 if(a==='game-listen'){gameStart('listen');return}
 if(a==='game-reset'){state.game.picked=[];state.game.checked=false;render(true);return}
 if(a==='piece-pick'){const id=Number(v);if(!state.game.picked.includes(id))state.game.picked.push(id);render(true);return}
 if(a==='piece-undo'){state.game.picked=state.game.picked.filter(i=>i!==Number(v));render(true);return}
 if(a==='game-check'){const g=state.game,entry=g.questionPool[g.index];g.passed=g.picked.length===g.pieces.length&&g.picked.every((id,index)=>id===index);g.checked=true;if(g.passed)g.score+=10;render(true);return}
 if(a==='game-speak'){stopSpeech();speakLine(state.game.questionPool[state.game.index].question);return}
 if(a==='game-answer'){const g=state.game,entry=g.questionPool[g.index],value=Number(v);if(g.selected!==null)return;g.selected=value;g.passed=g.options[value]===(entry.meaning||entry.label||'');if(g.passed)g.score+=10;render(true);return}
 if(a==='game-next'){state.game.index++;prepGame();render(true);return}
}
root.addEventListener('click',onClick);
root.addEventListener('input',e=>{if(e.target?.dataset?.role==='ib-search'){state.query=e.target.value;filterOutline(state.query)}});
root.addEventListener('change',e=>{if(e.target?.id==='ib-rate')state.rate=Number(e.target.value)});
root.addEventListener('keydown',e=>{if(e.target?.id==='ib-key'&&e.key==='Enter'){e.preventDefault();unlock(e.target.value)}});
document.querySelectorAll('[data-ib-tab]').forEach(el=>el.addEventListener('click',()=>{
 if(!state.data){$('#ib-key')?.focus();return}
 setTab(el.dataset.ibTab);
}));
window.addEventListener('beforeunload',()=>{stopSpeech();state.stream?.getTracks().forEach(t=>t.stop())});
const remembered=(()=>{try{return localStorage.getItem(KEY)}catch{return null}})();
if(remembered)unlock(remembered);else render();
})();