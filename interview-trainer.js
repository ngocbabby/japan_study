/* Interview trainer: offline-first, no paid API. */
(function(){
'use strict';
window.mountInterviewTrainer=function(){
const KEY='ngoc_interview_training_v1', B=window.JAPAN_INTERVIEW_BANK;
if(!B)return;
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
const ui={mode:'home',pool:'priority',index:0,reveal:false,kana:false,meaning:false,choice:null,order:[],game:0,gameChoice:null,rec:null,stream:null,chunks:[],audio:null,recUrl:null,listen:false,voiceRate:0.82,session:0,started:0};
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const items=[{id:'intro',type:'intro',question:'自己紹介をお願いします。',questionKana:'じこしょうかいを おねがいします。',meaning:'Hãy giới thiệu bản thân',responses:[{jp:B.intro.lines.map(x=>x.jp).join(' '),kana:B.intro.lines.map(x=>x.kana).join(' '),vi:B.intro.meaning}]}].concat(B.cards.map(x=>({...x,type:'qa'})),B.sensei.map(x=>({...x,type:'sensei',meaning:x.label})));
const byId=id=>items.find(x=>x.id===id);
const today=()=>new Date().toLocaleDateString('en-CA');
const stats=id=>saved[id]||{step:0,due:'',tries:0,correct:0};
const due=x=>!stats(x.id).due||stats(x.id).due<=today();
const countLearned=()=>items.filter(x=>stats(x.id).tries).length;
const unique=a=>[...new Set(a)];
const priority=()=>unique(['intro',...B.priority.map(n=>'q'+n),...B.sensei.map(s=>s.id)]);
function pool(){
 let arr=ui.pool==='all'?items.slice():ui.pool==='sensei'?items.filter(x=>x.type==='sensei'):ui.pool==='due'?items.filter(due):ui.pool==='intro'?items.filter(x=>x.type==='intro'):priority().map(byId).filter(Boolean);
 return arr.length?arr:items.slice(0,8);
}
function byOrder(){return (ui.order||[]).map(byId).filter(Boolean);}
function active(){return byOrder()[ui.index]||pool()[0]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}}
function rateCard(id,result){
 const old=stats(id),step=result==='easy'?Math.min(7,old.step+1):result==='good'?Math.min(6,Math.max(1,old.step+1)):0;
 const days=[0,1,3,7,14,30,60,90][step]||0,date=new Date();date.setDate(date.getDate()+days);
 saved[id]={...old,step,due:date.toLocaleDateString('en-CA'),tries:old.tries+1,correct:old.correct+(result!=='again'?1:0)};
 persist();
}
function btn(label,action,cls=''){return '<button type="button" class="iv-btn '+cls+'" data-iv="'+e(action)+'">'+e(label)+'</button>'}
function shell(inner){document.querySelector('#pageTitle').textContent='Luyện phỏng vấn';document.querySelector('#appMain').innerHTML='<div class="iv-root">'+inner+'</div>';document.querySelector('#appMain').querySelectorAll('[data-iv]').forEach(el=>el.addEventListener('click',()=>click(el.dataset.iv)));document.querySelector('#appMain').querySelectorAll('[data-iv-pool]').forEach(el=>el.addEventListener('change',()=>{ui.pool=el.value;ui.mode='home';render()}))}
function header(title,kicker){return '<p class="iv-kicker">'+e(kicker)+'</p><h2 class="iv-title">'+e(title)+'</h2>';}
function home(){
 let dueCount=items.filter(due).length;
 let html='<section class="iv-hero">'+header('Phỏng vấn tự tin hơn mỗi ngày','面接・INTERVIEW LAB')+
 '<p>Nghe → nhớ lại → tự nói → so sánh → ôn đúng ngày. Dựa trên chính tài liệu Kaiwa của bạn.</p><div class="iv-stats"><span><b>'+items.length+'</b> bài tập</span><span><b>'+countLearned()+'</b> đã luyện</span><span><b>'+dueCount+'</b> cần ôn</span></div></section>';
 html+='<section class="iv-panel"><h3>🎯 Chọn bộ học</h3><select id="iv-pool" data-iv-pool aria-label="Chọn bộ học"><option value="priority">⭐ Câu quan trọng + Sensei</option><option value="intro">🎙️ Tự giới thiệu</option><option value="sensei">👩‍🏫 8 bài học với Sensei</option><option value="due">🔁 Đến hạn ôn (SRS)</option><option value="all">📚 Tất cả 65 bài</option></select><div class="iv-actions">'+btn('Học thẻ nhớ','start:cards','primary')+btn('Phỏng vấn mô phỏng','start:mock')+btn('🎮 Trò chơi','start:game')+'</div></section>';
 html+='<div class="iv-grid"><article class="iv-mini"><strong>🗣️ Luyện nói</strong><p>Máy hỏi tiếng Nhật, bạn ghi âm và nghe lại. Không tải tiếng nói lên GitHub.</p></article><article class="iv-mini"><strong>🧠 Nhớ lâu</strong><p>Đánh giá Chưa nhớ / Nhớ / Rất dễ → tự hẹn 1, 3, 7, 14, 30 ngày.</p></article></div>';
 html+='<section class="iv-panel"><h3>📚 Tra cứu theo chủ đề</h3><div class="iv-topic-list">'+B.sections.map(x=>'<button class="iv-topic" data-iv="topic:'+e(x.id)+'">'+e(x.title)+'</button>').join('')+'</div></section>';
 html+='<p class="iv-fine">Nguồn: tài liệu Kaiwa bạn đã chốt. Một số câu (ví dụ ca đêm) có nhiều phương án — bạn tự chọn đáp án phù hợp. Dữ liệu tiến độ lưu trên trình duyệt của thiết bị này.</p>';
 shell(html);document.querySelector('#iv-pool').value=ui.pool;
}
function card(){
 const x=active(),a=x.responses[ui.choice||0]||x.responses[0],n=byOrder().length;
 let h='<div class="iv-top">'+btn('← Danh sách','home')+'<span>Bài '+(ui.index+1)+' / '+n+'</span></div><div class="iv-progress"><div style="width:'+Math.round((ui.index+1)/n*100)+'%"></div></div>';
 h+='<section class="iv-panel iv-question"><span class="iv-kicker">NGƯỜI PHỎNG VẤN</span><h2 lang="ja">'+e(x.question)+'</h2><p class="iv-muted">'+e(x.meaning||x.label||'')+'</p>'+btn('🔊 Nghe câu hỏi','tts:q','soft')+'</section>';
 h+='<section class="iv-panel"><p class="iv-kicker">TRẢ LỜI CỦA BẠN</p><p class="iv-muted">Thử trả lời thành tiếng trước khi bấm Hiện đáp án.</p>'+btn(ui.reveal?'🙈 Ẩn đáp án':'👁️ Hiện đáp án','reveal','primary');
 if(ui.reveal){
 if(x.responses.length>1)h+='<label class="iv-label">Chọn phương án từ file gốc</label><div class="iv-opt">'+x.responses.map((r,i)=>btn((r.label||'Đáp án '+(i+1))+' '+(ui.choice===i?'✓':''),'choice:'+i,ui.choice===i?'selected':'')).join('')+'</div>';
 h+='<div class="iv-answer"><p lang="ja" class="iv-japanese">'+e(a.jp)+'</p><div class="iv-actions">'+btn('🔊 Đọc đáp án','tts:a')+btn(ui.kana?'Ẩn Hiragana':'あ Hiện Hiragana','kana')+btn(ui.meaning?'Ẩn nghĩa':'🇻🇳 Hiện nghĩa','meaning')+'</div>'+(ui.kana?'<p class="iv-reading">'+e(a.kana||'Chưa có cách đọc trong tài liệu')+'</p>':'')+(ui.meaning?'<p class="iv-vietnamese">'+e(a.vi||'Xem nguyên văn tài liệu để đối chiếu')+'</p>':'')+'</div>';
 if(x.extra?.length)h+='<details class="iv-extra"><summary>✦ Những câu sensei ghi chú thêm</summary>'+x.extra.map(z=>'<p lang="ja">'+e(z.jp)+'</p><small>'+e(z.kana)+'</small>').join('')+'</details>';
 if(x.notes?.length)h+='<details class="iv-extra"><summary>📝 Ghi chú và phương án</summary>'+x.notes.map(t=>'<p>'+e(t)+'</p>').join('')+'</details>';
 h+='<div class="iv-assess">'+btn('↻ Chưa nhớ','grade:again')+btn('✓ Nhớ được','grade:good','primary')+btn('⚡ Rất dễ','grade:easy')+'</div>';
 }else{h+='<p class="iv-muted">Đọc câu hỏi, tự trả lời, rồi mở đáp án để đối chiếu.</p>';}
 h+='</section>'+recordingHTML()+'<div class="iv-actions iv-nav">'+btn('← Trước','prev')+btn('Tiếp →','next','primary')+'</div>';
 shell(h);
}
function recordingHTML(){return '<section class="iv-panel"><h3>🎙️ Ghi âm luyện nói</h3><p class="iv-muted">Chọn Ghi âm, nói câu trả lời, dừng rồi nghe lại. Bản ghi chỉ ở thiết bị và mất khi tải lại trang.</p><div class="iv-actions">'+btn(ui.rec?'⏹ Dừng ghi âm':'🎙️ Bắt đầu ghi âm',ui.rec?'record-stop':'record-start',ui.rec?'danger':'')+btn('🛑 Dừng tiếng đọc','tts:stop')+'</div><div id="iv-record-status" class="iv-muted">'+(ui.rec?'🔴 Đang ghi âm…':ui.recUrl?'Đã ghi âm — phát lại bên dưới.':'Sẵn sàng')+'</div>'+(ui.recUrl?'<audio controls class="iv-audio" src="'+e(ui.recUrl)+'"></audio>':'')+'</section>';}
function start(mode,section){
 ui.mode=mode;ui.reveal=false;ui.kana=false;ui.meaning=false;ui.choice=0;ui.index=0;ui.game=0;ui.gameChoice=null;
 let list=section?items.filter(x=>x.sectionId===section):pool();
 if(mode==='mock')list=shuffle(list.slice()).slice(0,Math.min(10,list.length));
 if(mode==='game')list=shuffle(list.slice()).slice(0,Math.min(10,list.length));
 ui.order=list.map(x=>x.id);ui.session=0;ui.started=Date.now();render();
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function game(){
 let items2=byOrder(),x=active();if(!x){ui.mode='finish';return finish()}
 const answer=x.responses[0],others=shuffle(B.cards.filter(y=>y.id!==x.id).map(y=>y.responses[0]?.jp).filter(Boolean)).slice(0,3),options=shuffle([answer.jp,...others]);
 if(ui.gameChoice?.id===x.id&&ui.gameChoice.options)options=ui.gameChoice.options;
 else ui.gameChoice={id:x.id,options,selected:null};
 const selected=ui.gameChoice.selected;
 let h='<div class="iv-top">'+btn('← Thoát','home')+'<span>Câu '+(ui.index+1)+' / '+items2.length+' · '+ui.session+' điểm</span></div>'+header('Chọn câu trả lời phù hợp','🎮 GAME · NHỚ Ý NGHĨA')+
 '<section class="iv-panel iv-question"><h2 lang="ja">'+e(x.question)+'</h2><p>'+e(x.meaning||x.label||'')+'</p>'+btn('🔊 Nghe','tts:q')+'</section><div class="iv-game-options">'+options.map((s,i)=>btn(s,'pick:'+i,'iv-option '+(selected===i?(s===answer.jp?'right':'wrong'):''))).join('')+'</div>';
 if(selected!==null)h+='<section class="iv-panel"><strong>'+(options[selected]===answer.jp?'✅ Chính xác!':'🔁 Chưa đúng — học lại câu này')+'</strong><p lang="ja">'+e(answer.jp)+'</p><p>'+e(answer.vi)+'</p>'+btn('Tiếp tục →','game-next','primary')+'</section>';
 shell(h);
}
function finish(){shell('<section class="iv-hero">'+header('Hoàn thành lượt luyện!','🎉 おつかれさまでした')+'<p>Bạn đã hoàn thành '+byOrder().length+' câu. Trò chơi: '+ui.session+' điểm. Các câu được chấm Chưa nhớ sẽ xuất hiện lại khi ôn.</p><div class="iv-actions">'+btn('Luyện lại','restart','primary')+btn('Về danh sách','home')+'</div></section>');}
function render(){if(ui.mode==='home')home();else if(ui.mode==='game')game();else if(ui.mode==='finish')finish();else card();}
function chooseNext(delta){ui.index+=delta;if(ui.index<0)ui.index=0;if(ui.index>=byOrder().length){ui.mode='finish';return render()}ui.reveal=false;ui.kana=false;ui.meaning=false;ui.choice=0;ui.recUrl&&URL.revokeObjectURL(ui.recUrl);ui.recUrl=null;render();}
function voice(text){if(!('speechSynthesis' in window)){alert('Trình duyệt này chưa hỗ trợ phát âm. Hãy thử Chrome/Edge/Safari.');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=ui.voiceRate;let voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('ja'));if(voices.length)u.voice=voices[0];speechSynthesis.speak(u)}
async function startRecord(){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){alert('Không hỗ trợ ghi âm. Cần HTTPS và quyền micro.');return}
 try{ui.stream=await navigator.mediaDevices.getUserMedia({audio:true});ui.chunks=[];ui.rec=new MediaRecorder(ui.stream);ui.rec.ondataavailable=ev=>{if(ev.data.size)ui.chunks.push(ev.data)};ui.rec.onstop=()=>{let blob=new Blob(ui.chunks,{type:ui.rec?.mimeType||'audio/webm'});if(ui.recUrl)URL.revokeObjectURL(ui.recUrl);ui.recUrl=URL.createObjectURL(blob);ui.stream?.getTracks().forEach(t=>t.stop());ui.stream=null;ui.rec=null;render()};ui.rec.start();render()}catch(err){alert('Không thể bật micro: '+err.message)}
}
function stopRecord(){if(ui.rec?.state==='recording')ui.rec.stop();}
function click(action){
 if(action==='home'){speechSynthesis?.cancel();ui.mode='home';render();return}
 if(action.startsWith('start:')){start(action.slice(6));return}
 if(action.startsWith('topic:')){start('cards',action.slice(6));return}
 if(action==='reveal'){ui.reveal=!ui.reveal;render();return}
 if(action==='kana'){ui.kana=!ui.kana;render();return}
 if(action==='meaning'){ui.meaning=!ui.meaning;render();return}
 if(action.startsWith('choice:')){ui.choice=+action.slice(7);render();return}
 if(action==='prev'){chooseNext(-1);return}
 if(action==='next'){chooseNext(1);return}
 if(action.startsWith('grade:')){rateCard(active().id,action.slice(6));chooseNext(1);return}
 if(action==='restart'){start(ui.mode==='finish'?'cards':ui.mode);return}
 if(action==='record-start'){startRecord();return}
 if(action==='record-stop'){stopRecord();return}
 if(action==='tts:stop'){window.speechSynthesis?.cancel();return}
 if(action==='tts:q'){voice(active().question);return}
 if(action==='tts:a'){voice(active().responses[ui.choice||0]?.jp||'');return}
 if(action.startsWith('pick:')){let pick=+action.slice(5);if(ui.gameChoice.selected!==null)return;ui.gameChoice.selected=pick;if(ui.gameChoice.options[pick]===active().responses[0].jp){ui.session+=10;rateCard(active().id,'good')}else{rateCard(active().id,'again')}render();return}
 if(action==='game-next'){chooseNext(1);return}
}
window.renderInterviewTrainer=function(){ui.mode='home';render();};
window.__INTERVIEW_TRAINER_TEST__={count:items.length,questionCount:B.cards.length,senseiCount:B.sensei.length,introLength:B.intro.lines.length};
};
})();