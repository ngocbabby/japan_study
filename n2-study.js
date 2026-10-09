const n2UI = {
  view:'root',
  type:null,
  tab:'lessons',
  lessonId:null,
  session:null,
  timer:null,
  flashTimer:null,
  flashFlipped:false,
  flashPaused:false,
  flashDeadline:0,
  flashRemaining:0,
  locked:false,
  readingId:null,
  mediaRecorder:null,
  mediaStream:null,
  recognition:null,
  readingStartedAt:0,
  readingTranscript:'',
  audioUrl:null,
  readingShowFurigana:null,
  readingShowTranslation:null
};

function n2Data(){ return window.N2_STUDY_DATA || {vocabLessons:[],kanjiLessons:[],grammarLessons:[],readingLessons:[]}; }

function n2TypeLabel(type){
  return type==='vocab'?'Từ vựng':type==='kanji'?'Kanji':type==='grammar'?'Ngữ pháp':'Đọc';
}

function n2Lessons(type){
  const d=n2Data();
  return type==='vocab'?d.vocabLessons:type==='kanji'?d.kanjiLessons:type==='grammar'?d.grammarLessons:d.readingLessons;
}

function n2ProgressKey(type,lessonId){ return `japanStudy:n2:${type}:${lessonId}`; }
function n2LoadProgress(type,lessonId){
  try{return JSON.parse(localStorage.getItem(n2ProgressKey(type,lessonId))||'{}')}catch{return {}}
}
function n2SaveProgress(type,lessonId,payload){
  localStorage.setItem(n2ProgressKey(type,lessonId),JSON.stringify(payload));
}

function renderN2(){
  setNav('');
  if(n2UI.view!=='reading-detail' && n2ReadingVoice.status!=='stopped') n2StopReadingSpeech();
  if(n2UI.view==='root') return renderN2Root();
  if(n2UI.view==='category') return renderN2Category();
  if(n2UI.view==='detail') return renderN2LessonDetail();
  if(n2UI.view==='study') return renderN2Study();
  if(n2UI.view==='reading') return renderN2ReadingList();
  if(n2UI.view==='docs') return renderN2Documents();
  if(n2UI.view==='planner') return renderN2Planner();
  if(n2UI.view==='reading-detail') return renderN2ReadingDetail();
  n2UI.view='root';
  return renderN2Root();
}

function renderN2Root(){
  title.textContent='N2';
  const d=n2Data();
  const importedKanji=d.kanjiLessons.reduce((n,x)=>n+x.items.length,0);
  const importedGrammar=d.grammarLessons.reduce((n,x)=>n+x.items.length,0);
  const importedReading=(d.readingPractice||[]).filter(x=>x.text).length;
  const planState=(typeof n2PlanLoad==='function')?n2PlanLoad():null;
  const planPriority=planState?.anchorDate?n2PlanPrioritize(planState,n2PlanToday()):null;
  main.innerHTML=`
    <section class="hero n2-hero">
      <div class="hero-grid">
        <div>
          <strong>N2 · học theo bài, nhớ đến khi không còn sai</strong>
          <p>Tài liệu được map theo lộ trình lớp. Mỗi bài có chế độ xem nội dung và chế độ học lặp tự động.</p>
        </div>
        <div class="hero-stat"><b>55</b><span>buổi lộ trình</span></div>
      </div>
    </section>

    ${planPriority?.next?`<button class="n2-plan-home-prompt" data-n2-plan-top type="button"><span class="n2-plan-pill">📌 HỌC ƯU TIÊN</span><strong>Buổi ${planPriority.next.session} · ${planPriority.next.date} · ${planPriority.next.start}</strong><small>${escapeText(planPriority.urgent[0]?.text || planPriority.due[0]?.text || 'Đã hoàn tất việc chuẩn bị. Ôn các bài chưa học.')}</small><span class="n2-plan-openhint">Mở lịch học →</span></button>`:`<button class="n2-plan-home-prompt" data-n2-plan-top type="button"><strong>📅 Ghép lịch học N2 với lộ trình KOSEI</strong><small>Chọn buổi N2 thực tế để biết trước bài ngày mai và bài tập còn thiếu.</small><span class="n2-plan-openhint">Thiết lập lịch →</span></button>`}

    <div class="n2-data-status">
      <strong>Dữ liệu nguồn</strong>
      <span>Mimikara: ${d.vocabImported||0}/${d.vocabTotal||1160} từ đã nhập</span>
      <span>Kanji: ${importedKanji} mục · Ngữ pháp: ${importedGrammar} mẫu · Đọc: ${importedReading} đoạn · lộ trình ${d.readingLessons.length} mục</span>
    </div>

    <div class="section-head"><div><p class="section-kicker">N2</p><h2>Nội dung học</h2></div></div>
    <section class="category-list">
      ${n2Category('語','Từ vựng','Mimikara Oboeru N2 · 25 bài theo đúng dải số của lộ trình','vocab',d.vocabLessons)}
      ${n2Category('漢','Kanji','Soumatome N2 · tuần 1 → tuần 8','kanji',d.kanjiLessons)}
      ${n2Category('文','Ngữ pháp','Shin Kanzen Master N2 · học ý nghĩa, cấu trúc, ngữ cảnh và câu điền','grammar',d.grammarLessons)}
      <button class="category-card" data-n2-planner type="button"><span class="category-icon">📅</span><span><strong>Lịch học & ưu tiên</strong><p>Học bài ngày mai trước → hoàn thành bài tập → quay lại bài chưa học.</p><span class="n2-mini-meta">Nguồn KOSEI 55 buổi + lịch Google Calendar</span></span><span class="chev">›</span></button>
      ${n2ReadingCategory('読','Đọc','Nghe mẫu → tự đọc → ghi âm → chấm độ đúng + tốc độ',d.readingPractice||[])}
      <button class="category-card" data-n2-docs type="button"><span class="category-icon">📑</span><span><strong>Học nhanh từ tài liệu</strong><p>Nhập PDF / DOCX → học từ quan trọng → xem đáp án → làm lại. Không cần trả phí AI.</p><span class="n2-mini-meta">Tài liệu cá nhân · lưu trên thiết bị</span></span><span class="chev">›</span></button>
    </section>

    <div class="notice">
      <div>⚙️</div>
      <div><strong>Không dùng API trả phí.</strong><p>Âm thanh dùng giọng đọc của trình duyệt. Chấm đọc dùng Speech Recognition của trình duyệt khi thiết bị hỗ trợ.</p></div>
    </div>
  `;
  document.querySelectorAll('[data-n2-type]').forEach(b=>b.addEventListener('click',()=>{
    n2UI.type=b.dataset.n2Type;n2UI.view='category';n2UI.tab='lessons';renderN2();
  }));
  const read=document.querySelector('[data-n2-reading]');
  if(read)read.addEventListener('click',()=>{n2UI.view='reading';renderN2()});
  document.querySelector('[data-n2-docs]')?.addEventListener('click',()=>{n2UI.view='docs';n2DocUI.view='list';renderN2()});
  document.querySelector('[data-n2-planner]')?.addEventListener('click',()=>{n2UI.view='planner';renderN2()});
  document.querySelector('[data-n2-plan-top]')?.addEventListener('click',()=>{n2UI.view='planner';renderN2()});
}

function n2Category(icon,name,desc,type,lessons){
  const imported=lessons.filter(x=>x.items?.length).length;
  const mastered=lessons.filter(x=>n2LoadProgress(type,x.id).mastered).length;
  const pct=lessons.length?Math.round(mastered/lessons.length*100):0;
  return `<button class="category-card" data-n2-type="${type}" type="button">
    <span class="category-icon">${icon}</span>
    <span><strong>${name}</strong><p>${desc}</p><span class="n2-mini-meta">${imported}/${lessons.length} bài có dữ liệu</span><span class="progress-bar"><span style="width:${pct}%"></span></span></span>
    <span class="chev">›</span>
  </button>`;
}

function n2ReadingCategory(icon,name,desc,lessons){
  const scores=n2ReadingScores();
  const month=n2MonthStats(scores);
  return `<button class="category-card" data-n2-reading type="button">
    <span class="category-icon">${icon}</span>
    <span><strong>${name}</strong><p>${desc}</p><span class="n2-mini-meta">Điểm tháng: ${month.count?month.avg+' / 100':'chưa có'}</span><span class="progress-bar"><span style="width:${month.count?month.avg:0}%"></span></span></span>
    <span class="chev">›</span>
  </button>`;
}

function renderN2Category(){
  const lessons=n2Lessons(n2UI.type);
  title.textContent=`N2 · ${n2TypeLabel(n2UI.type)}`;
  main.innerHTML=`
    <button class="foundation-inline-back" data-n2-root type="button">← N2</button>
    <section class="hero compact-hero">
      <div class="hero-grid">
        <div><strong>${n2TypeLabel(n2UI.type)}</strong><p>${n2CategoryCopy(n2UI.type)}</p></div>
        <div class="hero-stat"><b>${lessons.length}</b><span>bài</span></div>
      </div>
    </section>
    <div class="n2-tabs">
      <button class="${n2UI.tab==='lessons'?'active':''}" data-n2-tab="lessons" type="button">Bài học</button>
      <button class="${n2UI.tab==='study'?'active':''}" data-n2-tab="study" type="button">Học bài</button>
    </div>
    ${n2UI.tab==='lessons'?n2LessonBrowser(lessons):n2LessonPicker(lessons)}
  `;
  document.querySelector('[data-n2-root]').addEventListener('click',()=>{n2UI.view='root';renderN2()});
  document.querySelectorAll('[data-n2-tab]').forEach(b=>b.addEventListener('click',()=>{n2UI.tab=b.dataset.n2Tab;renderN2()}));
  document.querySelectorAll('[data-n2-lesson]').forEach(b=>b.addEventListener('click',()=>{n2UI.lessonId=b.dataset.n2Lesson;n2UI.view='detail';renderN2()}));
  document.querySelectorAll('[data-n2-start]').forEach(b=>b.addEventListener('click',()=>startN2Session(b.dataset.n2Start)));
}

function n2CategoryCopy(type){
  if(type==='vocab') return 'Bài học hiển thị Kanji, hiragana, nghĩa và nút nghe. Học bài chạy flashcard tự động 3s/5s rồi quiz 5 giây/câu.';
  if(type==='kanji') return 'Cùng giao diện với từ vựng: mặt chữ, âm đọc, nghĩa, từ ghép và vòng quiz lặp đến khi sạch lỗi.';
  return 'Không chỉ học nghĩa. Ngữ pháp được kiểm tra theo 3 lớp: nhận diện mẫu, chọn nghĩa và chọn mẫu trong câu.';
}

function n2LessonBrowser(lessons){
  return `<section class="lesson-list n2-lesson-list">${lessons.map((lesson,i)=>{
    const p=n2LoadProgress(n2UI.type,lesson.id);
    const count=lesson.items?.length||0;
    const expected=n2UI.type==='vocab'?(lesson.to-lesson.from+1):null;
    const complete=count>0 && (!expected || count===expected);
    return `<button class="lesson-card n2-lesson-card" data-n2-lesson="${lesson.id}" type="button">
      <div class="lesson-card-top">
        <div><p class="section-kicker">${n2TypeLabel(n2UI.type).toUpperCase()}</p><h3>${escapeText(lesson.label)}</h3></div>
        <span class="lesson-count">${count}${expected?'/'+expected:''} mục</span>
      </div>
      <p class="n2-source">${escapeText(lesson.source||'')}</p>
      <div class="lesson-progress-row"><span>${p.mastered?'✓ Đã sạch lỗi':complete?'Sẵn sàng học':count?'Có thể học '+count+' mục đã nhập':'Chưa có dữ liệu'}</span><span>${p.mastered?'100%':complete?'0%':'—'}</span></div>
      <span class="progress-bar"><span style="width:${p.mastered?100:0}%"></span></span>
    </button>`;
  }).join('')}</section>`;
}

function n2LessonPicker(lessons){
  return `
    <div class="section-head"><div><p class="section-kicker">HỌC BÀI</p><h2>Chọn bài để bắt đầu</h2></div></div>
    <section class="lesson-list">${lessons.map(lesson=>{
      const count=lesson.items?.length||0;
      const expected=n2UI.type==='vocab'?(lesson.to-lesson.from+1):null;
      const ready=count>0;
      const p=n2LoadProgress(n2UI.type,lesson.id);
      return `<article class="study-pick-card">
        <div><strong>${escapeText(lesson.label)}</strong><p>${count}${expected?'/'+expected:''} mục · ${p.mastered?'đã hoàn thành':ready?(expected&&count<expected?'học thử dữ liệu đã nhập':'sẵn sàng'):'chưa có dữ liệu'}</p></div>
        <button class="primary-btn" data-n2-start="${lesson.id}" type="button" ${ready?'':'disabled'}>${p.mastered?'Học lại':'Bắt đầu'}</button>
      </article>`;
    }).join('')}</section>`;
}

function n2CurrentLesson(){
  return n2Lessons(n2UI.type).find(x=>x.id===n2UI.lessonId);
}

function renderN2LessonDetail(){
  const lesson=n2CurrentLesson();
  if(!lesson){n2UI.view='category';return renderN2Category()}
  title.textContent=lesson.label;
  const count=lesson.items?.length||0;
  const expected=n2UI.type==='vocab'?(lesson.to-lesson.from+1):null;
  const ready=count>0 && (!expected || count===expected);
  main.innerHTML=`
    <button class="foundation-inline-back" data-n2-category type="button">← ${n2TypeLabel(n2UI.type)}</button>
    <div class="lesson-detail-head">
      <div><p class="section-kicker">${n2TypeLabel(n2UI.type).toUpperCase()}</p><h2>${escapeText(lesson.label)}</h2><p>${count}${expected?'/'+expected:''} mục · ${escapeText(lesson.source||'')}</p></div>
      <button class="primary-btn" data-n2-start="${lesson.id}" type="button" ${ready?'':'disabled'}>Học bài</button>
    </div>
    ${ready?'':`<div class="n2-import-warning"><strong>Chưa nhập đủ dữ liệu nguồn.</strong><p>Khung bài đã map đúng lộ trình nhưng app không tự bịa các mục còn thiếu.</p></div>`}
    <section class="knowledge-list">${(lesson.items||[]).map((item,i)=>n2KnowledgeRow(item,i)).join('')}</section>
  `;
  document.querySelector('[data-n2-category]').addEventListener('click',()=>{n2UI.view='category';n2UI.tab='lessons';renderN2()});
  const start=document.querySelector('[data-n2-start]');if(start&&!start.disabled)start.addEventListener('click',()=>startN2Session(lesson.id));
  document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speakJapanese(b.dataset.speak)));
}

function n2KnowledgeRow(item,i){
  if(n2UI.type==='vocab'){
    return `<article class="knowledge-row"><div class="knowledge-index">${item.n||i+1}</div><div class="knowledge-main"><strong class="jp-term">${escapeText(item.term)}</strong><span class="reading">${escapeText(item.reading||'')}</span><p>${escapeText(item.meaning||'')}</p></div><button class="audio-btn" data-speak="${escapeText(item.reading||item.term)}" type="button">🔊</button></article>`;
  }
  if(n2UI.type==='kanji'){
    return `<article class="knowledge-row"><div class="kanji-char">${escapeText(item.char)}</div><div class="knowledge-main"><strong>${escapeText(item.hanViet||item.meaning||'')}</strong><span class="reading">${escapeText(item.reading||'')}</span>${item.wordEntries?.length?`<div class="n2-kanji-words">${item.wordEntries.map(w=>`<div class="n2-word-pair"><span><b>${escapeText(w.term)}</b> · ${escapeText(w.reading)}</span><span>${escapeText(w.meaning)}</span><button class="audio-btn compact" data-speak="${escapeText(w.reading)}" type="button" aria-label="Nghe từ">🔊</button></div>`).join('')}</div>`:`<p>${escapeText(item.words||'')}</p>`}</div></article>`;
  }
  return `<article class="knowledge-row grammar-row"><div class="knowledge-index">${i+1}</div><div class="knowledge-main"><strong class="grammar-pattern">${escapeText(item.pattern)}</strong><p>${escapeText(item.meaning||'')}</p><span class="reading">${escapeText(item.structure||'')}</span><p class="jp-example">${escapeText(item.example||'')}</p></div><button class="audio-btn" data-speak="${escapeText(item.example||item.pattern)}" type="button">🔊</button></article>`;
}

function startN2Session(lessonId){
  const lesson=n2Lessons(n2UI.type).find(x=>x.id===lessonId);
  if(!lesson?.items?.length) return;
  n2UI.lessonId=lessonId;
  n2UI.session={
    all:lesson.items.slice(),
    phase:'preview',
    queue:lesson.items.slice(),
    index:0,
    weak:new Set(),
    correct:new Set(),
    round:0,
    quizCorrect:0,
    quizTotal:0,
    sessionCorrect:0,
    sessionTotal:0,
    lastResult:null,
    pendingPhase:null
  };
  n2UI.view='study';
  renderN2();
}

function stopN2Timers(){
  if(n2UI.timer){clearInterval(n2UI.timer);n2UI.timer=null}
  if(n2UI.flashTimer){clearTimeout(n2UI.flashTimer);n2UI.flashTimer=null}
}

function renderN2Study(){
  const s=n2UI.session,lesson=n2CurrentLesson();
  if(!s||!lesson){n2UI.view='category';return renderN2Category()}
  title.textContent=`Học · ${lesson.label}`;
  if(s.phase==='complete') return renderN2Complete();
  if(s.phase==='result') return renderN2RoundResult();
  if(s.phase.includes('flash') || s.phase==='preview' || s.phase==='review-all') return renderN2Flash();
  return renderN2Quiz();
}

function n2PhaseLabel(phase){
  const grammar=n2UI.type==='grammar';
  const map={
    'preview':['B1 · Flashcard toàn bài',grammar?'4 giây mặt trước → 6 giây mặt sau':'3 giây mặt trước → 5 giây mặt sau'],
    'quiz-all':['B2 · Quiz toàn bài',grammar?'10 giây/câu · không quay lại':'5 giây/câu · không quay lại'],
    'review-all':['B3 · Flashcard phân loại','Câu đúng trước → câu sai/chưa thuộc sau'],
    'quiz-weak':['Quiz câu yếu',grammar?'Câu điền / nhận diện mẫu · 10 giây':'5 giây/câu · chỉ phần chưa thuộc'],
    'flash-weak':['Flashcard câu yếu','Tự lật, tự đọc, tự chuyển tiếp'],
    'verify-flash':['Kiểm tra cuối · Flashcard toàn bài','Rà lại tất cả mục đã học'],
    'verify-quiz':['Kiểm tra cuối · Quiz toàn bài','Phải 0 câu sai mới hoàn thành']
  };
  return map[phase]||['N2',''];
}

function renderN2Flash(){
  const s=n2UI.session;
  if(s.index>=s.queue.length){ finishN2Flash(); return; }
  const item=s.queue[s.index], [phase,desc]=n2PhaseLabel(s.phase);
  n2UI.flashFlipped=false;
  main.innerHTML=`
    <div class="study-session-head"><button class="foundation-inline-back danger-link" data-n2-exit type="button">✕ Thoát</button><span>${s.index+1}/${s.queue.length}</span></div>
    <div class="phase-strip"><strong>${phase}</strong><span>${desc}</span></div>
    <div class="n2-auto-line"><span id="n2FlashCountdown" role="status" aria-live="off"></span><div class="n2-flash-actions"><button class="secondary-btn small" data-n2-flip-side type="button" aria-label="Lật sang mặt sau hoặc mặt trước">↪ Xem đáp án</button><button class="secondary-btn small" data-n2-pause type="button">⏸ Tạm dừng</button></div></div>
    <section class="flash-card n2-auto-card" data-n2-flip>
      <div class="flash-front">${n2FlashFront(item)}<span class="flip-hint">Chạm để xem đáp án · có thể lật lại mặt trước</span></div>
      <div class="flash-back hidden-card">${n2FlashBack(item)}</div>
    </section>
  `;
  document.querySelector('[data-n2-exit]').addEventListener('click',exitN2Study);
  document.querySelector('[data-n2-flip]').addEventListener('click',()=>n2ToggleFlashCard(item));
  document.querySelector('[data-n2-flip-side]').addEventListener('click',()=>n2ToggleFlashCard(item));
  document.querySelector('[data-n2-pause]').addEventListener('click',()=>n2ToggleFlashPause(item));
  document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();speakJapanese(b.dataset.speak)}));
  startN2FlashCycle(item);
}

function n2FlashFront(item){
  if(n2UI.type==='vocab') return `<p class="section-kicker">TỪ VỰNG</p><div class="flash-main">${escapeText(item.term)}</div><div class="flash-reading">${escapeText(item.reading||'')}</div>`;
  if(n2UI.type==='kanji') return `<p class="section-kicker">KANJI</p><div class="flash-main kanji-big">${escapeText(item.char)}</div>`;
  return `<p class="section-kicker">NGỮ PHÁP</p><div class="flash-main grammar-big">${escapeText(item.pattern)}</div><p class="flash-reading">${escapeText(item.structure||'')}</p>`;
}

function n2FlashBack(item){
  if(n2UI.type==='vocab') return `<p class="section-kicker">ĐÁP ÁN</p><div class="flash-answer">${escapeText(item.meaning)}</div><div class="flash-reading">${escapeText(item.term)} · ${escapeText(item.reading||'')}</div><button class="audio-inline" data-speak="${escapeText(item.reading||item.term)}" type="button">🔊 Nghe lại</button>`;
  if(n2UI.type==='kanji') return `<p class="section-kicker">ĐÁP ÁN</p><div class="flash-answer">${escapeText(item.meaning)}</div><div class="flash-reading">${escapeText(item.reading||'')}</div><p>${escapeText(item.words||'')}</p><button class="audio-inline" data-speak="${escapeText((item.words||item.char).split('・')[0])}" type="button">🔊 Nghe lại</button>`;
  return `<p class="section-kicker">Ý NGHĨA + NGỮ CẢNH</p><div class="flash-answer">${escapeText(item.meaning)}</div><p>${escapeText(item.structure||'')}</p><p class="jp-example">${escapeText(item.example||'')}</p><button class="audio-inline" data-speak="${escapeText(item.example||item.pattern)}" type="button">🔊 Nghe ví dụ</button>`;
}

function n2FlashDurations(){
  return n2UI.type==='grammar'?{front:4000,back:6000}:{front:3000,back:5000};
}

function startN2FlashCycle(item){
  stopN2Timers();
  n2UI.flashPaused=false;
  n2ScheduleFlashStep(item,n2FlashDurations().front,'front');
}

function n2ScheduleFlashStep(item,ms,side){
  stopN2Timers();
  n2UI.flashDeadline=performance.now()+ms;
  n2UI.flashRemaining=ms;
  n2FlashCountdown(ms,side==='front'?'Lật sau':'Tiếp theo sau');
  n2UI.flashTimer=setTimeout(()=>{
    n2UI.flashTimer=null;
    if(side==='front') return n2FlipNow(item);
    const s=n2UI.session;
    if(!s || n2UI.view!=='study') return;
    s.index++;
    renderN2Study();
  },ms);
}

function n2FlashCountdown(ms,prefix){
  const label=document.querySelector('#n2FlashCountdown');
  if(!label)return;
  const end=performance.now()+ms;
  const tick=()=>{
    const left=Math.max(0,end-performance.now());
    label.textContent=`${prefix} ${(left/1000).toFixed(1)}s`;
    if(left<=0&&n2UI.timer){clearInterval(n2UI.timer);n2UI.timer=null}
  };
  tick();
  n2UI.timer=setInterval(tick,100);
}

function n2ToggleFlashPause(item){
  const button=document.querySelector('[data-n2-pause]');
  const label=document.querySelector('#n2FlashCountdown');
  if(!n2UI.flashPaused){
    n2UI.flashRemaining=Math.max(0,n2UI.flashDeadline-performance.now());
    stopN2Timers();
    n2UI.flashPaused=true;
    if(button)button.textContent='▶ Tiếp tục';
    if(label)label.textContent='Đã dừng tự chuyển · lật tự do';
  }else{
    n2UI.flashPaused=false;
    if(button)button.textContent='⏸ Tạm dừng';
    // If the paused countdown expired, give enough time to see the card.
    const remaining=Math.max(n2UI.flashRemaining,1000);
    n2ScheduleFlashStep(item,remaining,n2UI.flashFlipped?'back':'front');
  }
}
function n2SetFlashSide(item,back,withSound){
  stopN2Timers();
  n2UI.flashFlipped=back;
  document.querySelector('.flash-front')?.classList.toggle('hidden-card',back);
  document.querySelector('.flash-back')?.classList.toggle('hidden-card',!back);
  const flipButton=document.querySelector('[data-n2-flip-side]');
  if(flipButton)flipButton.textContent=back?'↩ Mặt trước':'↪ Xem đáp án';
  const timerButton=document.querySelector('[data-n2-pause]');
  if(timerButton)timerButton.textContent=n2UI.flashPaused?'▶ Tiếp tục':'⏸ Tạm dừng';
  if(back&&withSound){
    if(n2UI.type==='vocab')speakJapanese(item.reading||item.term);
    else if(n2UI.type==='kanji')speakJapanese((item.words||item.char).split('・')[0]);
    else speakJapanese(item.example||item.pattern);
  }
  const side=back?'back':'front';
  n2UI.flashRemaining=n2FlashDurations()[side];
  if(n2UI.flashPaused){
    const label=document.querySelector('#n2FlashCountdown');
    if(label)label.textContent='Đang tạm dừng · bấm Tiếp tục để tự chuyển';
  }else{
    n2ScheduleFlashStep(item,n2UI.flashRemaining,side);
  }
}
function n2ToggleFlashCard(item){
  // Manual flips work in BOTH directions; reviewing the front restarts its
  // 3-second timer rather than unexpectedly advancing to the next word.
  n2SetFlashSide(item,!n2UI.flashFlipped,true);
}
function n2FlipNow(item){
  // Auto flip only applies to a currently visible front side.
  if(n2UI.flashFlipped)return;
  n2SetFlashSide(item,true,true);
}

function finishN2Flash(){
  stopN2Timers();
  const s=n2UI.session;
  if(s.phase==='preview'){
    s.phase='quiz-all';s.index=0;s.queue=s.all.slice();resetN2QuizCounter();
  }else if(s.phase==='review-all'){
    if(s.weak.size){s.round=1;s.phase='quiz-weak';s.index=0;s.queue=s.all.filter(x=>s.weak.has(x.id));resetN2QuizCounter();}
    else {s.phase='verify-flash';s.index=0;s.queue=s.all.slice();}
  }else if(s.phase==='flash-weak'){
    s.phase='quiz-weak';s.index=0;s.queue=s.all.filter(x=>s.weak.has(x.id));resetN2QuizCounter();
  }else if(s.phase==='verify-flash'){
    s.weak=new Set();s.phase='verify-quiz';s.index=0;s.queue=s.all.slice();resetN2QuizCounter();
  }
  renderN2Study();
}

function resetN2QuizCounter(){ const s=n2UI.session;s.quizCorrect=0;s.quizTotal=0; }

function renderN2Quiz(){
  const s=n2UI.session;
  if(s.index>=s.queue.length){finishN2Quiz();return}
  const item=s.queue[s.index];
  const [phase,desc]=n2PhaseLabel(s.phase);
  const seconds=n2UI.type==='grammar'?10:5;
  const q=n2BuildQuestion(item,s.index);
  main.innerHTML=`
    <div class="study-session-head"><button class="foundation-inline-back danger-link" data-n2-exit type="button">✕ Thoát</button><span>${s.index+1}/${s.queue.length}</span></div>
    <div class="phase-strip"><strong>${phase}${s.phase==='quiz-weak'?' · vòng '+s.round:''}</strong><span>${desc}</span></div>
    <div class="timer-track"><span id="n2TimerBar"></span></div>
    <div class="timer-line"><strong id="n2TimerText">${seconds}.0s</strong><span>Hết giờ = sai · không quay lại</span></div>
    <section class="quiz-card">
      <p class="section-kicker">${q.kicker}</p>
      <div class="quiz-prompt">${escapeText(q.prompt)}</div>
      ${q.sub?`<div class="quiz-sub">${escapeText(q.sub)}</div>`:''}
      ${q.speak?`<button class="audio-inline" data-speak="${escapeText(q.speak)}" type="button">🔊 Nghe</button>`:''}
    </section>
    <section class="answer-grid">${q.options.map((x,i)=>`<button class="answer-btn" data-n2-answer="${i}" type="button">${escapeText(x)}</button>`).join('')}</section>
    <div id="n2AnswerFeedback" class="answer-feedback"></div>
  `;
  document.querySelector('[data-n2-exit]').addEventListener('click',exitN2Study);
  const audio=document.querySelector('[data-speak]');if(audio)audio.addEventListener('click',()=>speakJapanese(audio.dataset.speak));
  document.querySelectorAll('[data-n2-answer]').forEach(b=>b.addEventListener('click',()=>answerN2Question(Number(b.dataset.n2Answer),q.correctIndex)));
  startN2QuestionTimer(seconds,()=>answerN2Question(-1,q.correctIndex,true));
}

function n2BuildQuestion(item,index){
  const all=n2CurrentLesson().items;
  if(n2UI.type==='vocab'){
    const reverse=n2UI.session.phase==='quiz-weak' && n2UI.session.round%2===0;
    const correct=reverse?item.term:item.meaning;
    const pool=all.filter(x=>x.id!==item.id).map(x=>reverse?x.term:x.meaning).filter(Boolean);
    const options=n2MakeOptions(correct,pool);
    return {kicker:reverse?'NGHĨA → TỪ':'TỪ → NGHĨA',prompt:reverse?item.meaning:item.term,sub:reverse?'Chọn từ đúng':item.reading,speak:item.reading||item.term,options,correctIndex:options.indexOf(correct)};
  }
  if(n2UI.type==='kanji'){
    const reverse=n2UI.session.phase==='quiz-weak' && n2UI.session.round%2===0;
    const correct=reverse?item.char:item.meaning;
    const pool=all.filter(x=>x.id!==item.id).map(x=>reverse?x.char:x.meaning).filter(Boolean);
    const options=n2MakeOptions(correct,pool);
    return {kicker:reverse?'NGHĨA → KANJI':'KANJI → NGHĨA',prompt:reverse?item.meaning:item.char,sub:item.reading||'',speak:(item.words||item.char).split('・')[0],options,correctIndex:options.indexOf(correct)};
  }
  const phase=n2UI.session.phase;
  const mode=phase==='quiz-all'?index%2:phase==='quiz-weak'?(n2UI.session.round+index)%2:(index+1)%2;
  // Ask for the grammar *function* via its Vietnamese situational context.
  // A full unmasked Japanese sentence would reveal the correct pattern.
  const correct=mode?item.pattern:item.meaning;
  const pool=all.filter(x=>x.id!==item.id).map(x=>mode?x.pattern:x.meaning).filter(Boolean);
  const options=n2MakeOptions(correct,pool);
  return {
    kicker:mode?'NGỮ CẢNH → MẪU NGỮ PHÁP':'MẪU → CHỨC NĂNG',
    prompt:mode?(item.exampleVi||item.meaning):item.pattern,
    sub:mode?'Chọn mẫu ngữ pháp phù hợp với câu tiếng Việt':(item.structure||'Chọn đúng ý nghĩa và cách dùng'),
    speak:'',options,correctIndex:options.indexOf(correct)
  };
}

function n2MakeOptions(correct,pool){
  const unique=[...new Set(pool.filter(x=>x&&x!==correct))];
  for(let i=unique.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[unique[i],unique[j]]=[unique[j],unique[i]]}
  const arr=[correct,...unique.slice(0,3)];
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr;
}

function startN2QuestionTimer(seconds,onTimeout){
  stopN2Timers();
  n2UI.locked=false;
  const end=performance.now()+seconds*1000;
  const bar=document.querySelector('#n2TimerBar'),label=document.querySelector('#n2TimerText');
  const tick=()=>{
    const left=Math.max(0,end-performance.now());
    if(bar)bar.style.width=`${left/(seconds*1000)*100}%`;
    if(label)label.textContent=`${(left/1000).toFixed(1)}s`;
    if(left<=0){stopN2Timers();onTimeout()}
  };
  tick();n2UI.timer=setInterval(tick,100);
}

function answerN2Question(selected,correctIndex,timedOut=false){
  if(n2UI.locked)return;
  n2UI.locked=true;stopN2Timers();
  const s=n2UI.session,item=s.queue[s.index];
  const ok=selected===correctIndex;
  s.quizTotal++;s.sessionTotal++;
  if(ok){s.quizCorrect++;s.sessionCorrect++;s.correct.add(item.id);if(s.phase==='quiz-weak')s.weak.delete(item.id);}
  else {s.weak.add(item.id);s.correct.delete(item.id);}
  document.querySelectorAll('[data-n2-answer]').forEach((b,i)=>{b.disabled=true;if(i===correctIndex)b.classList.add('correct');else if(i===selected)b.classList.add('wrong')});
  const fb=document.querySelector('#n2AnswerFeedback');
  if(fb)fb.innerHTML=ok?'<strong>Đúng.</strong>':'<strong>'+(timedOut?'Hết giờ.':'Sai.')+'</strong> Câu này được đưa vào nhóm chưa thuộc.';
  setTimeout(()=>{s.index++;n2UI.locked=false;renderN2Study()},500);
}

function finishN2Quiz(){
  stopN2Timers();
  const s=n2UI.session;
  s.lastResult={correct:s.quizCorrect,total:s.quizTotal,weak:s.weak.size,phase:s.phase};
  if(s.phase==='quiz-all'){
    const known=s.all.filter(x=>s.correct.has(x.id));
    const weak=s.all.filter(x=>s.weak.has(x.id));
    s.pendingPhase='review-all';s.reviewQueue=[...known,...weak];
    s.phase='result';return renderN2Study();
  }
  if(s.phase==='quiz-weak'){
    s.pendingPhase=s.weak.size?'flash-weak':'verify-flash';
    s.phase='result';return renderN2Study();
  }
  if(s.phase==='verify-quiz'){
    if(s.weak.size===0){s.phase='complete';return renderN2Study()}
    s.pendingPhase='flash-weak';s.round++;s.phase='result';return renderN2Study();
  }
}

function renderN2RoundResult(){
  const s=n2UI.session,r=s.lastResult||{correct:0,total:0,weak:s.weak.size};
  const pct=r.total?Math.round(r.correct/r.total*100):0;
  main.innerHTML=`
    <section class="complete-card n2-result-card">
      <div class="complete-mark">${s.weak.size?'↻':'✓'}</div>
      <p class="section-kicker">KẾT QUẢ VÒNG</p>
      <h2>${r.correct}/${r.total} đúng · ${pct}%</h2>
      <p>Còn <strong>${s.weak.size}</strong> mục chưa thuộc. ${s.weak.size?'App chỉ lặp lại đúng nhóm này.':'Bắt đầu kiểm tra toàn bài.'}</p>
    </section>
    <div class="complete-actions"><button class="primary-btn" data-n2-next type="button">Tiếp tục</button></div>
  `;
  document.querySelector('[data-n2-next]').addEventListener('click',()=>{
    const next=s.pendingPhase;s.pendingPhase=null;s.phase=next;s.index=0;
    if(next==='flash-weak')s.queue=s.all.filter(x=>s.weak.has(x.id));
    else if(next==='review-all')s.queue=s.reviewQueue||s.all.slice();
    else if(next==='verify-flash')s.queue=s.all.slice();
    if(next==='quiz-weak'){s.queue=s.all.filter(x=>s.weak.has(x.id));resetN2QuizCounter();}
    renderN2Study();
  });
}

function renderN2Complete(){
  const s=n2UI.session,lesson=n2CurrentLesson();
  const accuracy=s.sessionTotal?Math.round(s.sessionCorrect/s.sessionTotal*100):100;
  const old=n2LoadProgress(n2UI.type,lesson.id);
  const partial=n2UI.type==='vocab' && lesson.items.length < lesson.to-lesson.from+1;
  if(!old.mastered || partial){
    n2SaveProgress(n2UI.type,lesson.id,{mastered:!partial,partial,completedAt:new Date().toISOString(),attempts:(old.attempts||0)+1,accuracy});
  }
  main.innerHTML=`
    <section class="complete-card">
      <div class="complete-mark">✓</div><p class="section-kicker">HOÀN THÀNH</p>
      <h2>${escapeText(lesson.label)}</h2>
      <p>Vòng cuối đã đạt <strong>0 câu sai</strong>. ${n2UI.type==='vocab' && lesson.items.length < lesson.to-lesson.from+1?'Bạn đã hoàn thành phần từ được nhập; bài chưa được đánh dấu hoàn thành toàn bộ vì còn thiếu dữ liệu.':'Bài được tính hoàn thành sau khi kiểm tra toàn bộ không còn lỗi.'}</p>
      <div class="complete-stats"><div><b>${lesson.items.length}</b><span>mục</span></div><div><b>${s.round}</b><span>vòng yếu</span></div><div><b>${accuracy}%</b><span>đúng toàn phiên</span></div></div>
    </section>
    <div class="complete-actions"><button class="secondary-btn" data-n2-list type="button">Về danh sách</button><button class="primary-btn" data-n2-again type="button">Học lại</button></div>
  `;
  document.querySelector('[data-n2-list]').addEventListener('click',()=>{n2UI.session=null;n2UI.view='category';n2UI.tab='study';renderN2()});
  document.querySelector('[data-n2-again]').addEventListener('click',()=>startN2Session(lesson.id));
}

function exitN2Study(){
  stopN2Timers();window.speechSynthesis?.cancel();
  n2UI.session=null;n2UI.view='category';n2UI.tab='study';renderN2();
}

/* Reading + pronunciation scoring */
function n2ReadingScores(){
  try{return JSON.parse(localStorage.getItem('japanStudy:n2:readingScores')||'[]')}catch{return []}
}
function n2SaveReadingScore(row){
  const rows=n2ReadingScores();rows.push(row);
  localStorage.setItem('japanStudy:n2:readingScores',JSON.stringify(rows.slice(-300)));
}
function n2MonthStats(rows){
  const now=new Date(),key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const m=rows.filter(x=>String(x.date||'').startsWith(key));
  return {count:m.length,avg:m.length?Math.round(m.reduce((a,b)=>a+(b.score||0),0)/m.length):0};
}

function renderN2ReadingList(){
  title.textContent='N2 · Đọc';
  const lessons=n2Data().readingPractice||[];
  const month=n2MonthStats(n2ReadingScores());
  main.innerHTML=`
    <button class="foundation-inline-back" data-n2-root type="button">← N2</button>
    <section class="hero compact-hero">
      <div class="hero-grid"><div><strong>Đọc thành tiếng + chấm điểm</strong><p>Nghe bài đọc, ghi âm, nhận xét mức độ khớp văn bản và tốc độ. Dưới 60 điểm cần luyện lại.</p></div><div class="hero-stat"><b>${month.count?month.avg:'—'}</b><span>điểm tháng</span></div></div>
    </section>
    <section class="lesson-list">${lessons.map(x=>`
      <button class="lesson-card n2-reading-card" data-n2-reading-id="${x.id}" type="button">
        <div class="lesson-card-top"><div><p class="section-kicker">${escapeText(x.exercise)}</p><h3>${escapeText(x.label)}</h3></div><span class="lesson-count">${x.text?'Sẵn sàng':'Chưa nhập đoạn'}</span></div>
        <p>${escapeText(x.source||'')} · ${x.verified?'Đã đối chiếu trang sách':'Chưa đối chiếu toàn bộ trang sách'}</p>
      </button>`).join('')}</section>
  `;
  document.querySelector('[data-n2-root]').addEventListener('click',()=>{n2UI.view='root';renderN2()});
  document.querySelectorAll('[data-n2-reading-id]').forEach(b=>b.addEventListener('click',()=>{n2UI.readingId=b.dataset.n2ReadingId;n2UI.view='reading-detail';renderN2()}));
}

function n2CurrentReading(){return (n2Data().readingPractice||[]).find(x=>x.id===n2UI.readingId)}


/* Reading controls: dictionary-backed ruby + two independent visibility preferences. */
function n2ReadingGetPref(name){
  try{return localStorage.getItem('japanStudy:n2:'+name)==='1'}catch{return false}
}
function n2ReadingSetPref(name,enabled){
  try{localStorage.setItem('japanStudy:n2:'+name,enabled?'1':'0')}catch{}
}
function n2RenderReadingDisplay(lesson){
  const text=document.querySelector('#n2ReadingJapanese');
  if(text){
    if(n2UI.readingShowFurigana && typeof window.n2ReadingRubyHTML==='function'){
      const result=window.n2ReadingRubyHTML(lesson.text);
      text.innerHTML=result.html;
      const help=document.querySelector('#readingFuriganaHelp');
      if(help){help.hidden=result.coverage===100;help.textContent='Furigana: '+result.coverage+'% chữ Hán được gắn cách đọc; phần chưa có dữ liệu giữ nguyên, không đoán âm.'}
    }else{
      text.textContent=lesson.text;
      const help=document.querySelector('#readingFuriganaHelp');
      if(help)help.hidden=true;
    }
  }
  const translation=document.querySelector('#readingVietnamese');
  if(translation)translation.hidden=!n2UI.readingShowTranslation;
  const f=document.querySelector('[data-reading-furigana]');
  if(f){f.textContent=n2UI.readingShowFurigana?'あ Ẩn Furigana':'あ Hiện Furigana';f.setAttribute('aria-pressed',String(n2UI.readingShowFurigana))}
  const v=document.querySelector('[data-reading-translation]');
  if(v){v.textContent=n2UI.readingShowTranslation?'🌐 Ẩn dịch nghĩa':'🌐 Hiện dịch nghĩa';v.setAttribute('aria-pressed',String(n2UI.readingShowTranslation));v.setAttribute('aria-expanded',String(n2UI.readingShowTranslation))}
}

/* Chrome Android sometimes reports synth.speaking/paused even after resume has
   silently lost its audio output. Instead of native pause()/resume(), pause
   cancels the active short chunk; continue creates a NEW utterance for that
   same chunk. Word-accurate seeking is not available in Web Speech. */
const n2ReadingVoice={
  status:'stopped',run:0,parts:[],index:0,lessonId:null,utterance:null,
  bootTimer:null,startTimer:null,retries:0
};

function n2ReadingSentenceChunks(text){
  const sentences=String(text||'').match(/[^。！？!?]+[。！？!?]*/gu)||[];
  const chunks=[];
  for(const original of sentences){
    let part=original.trim();
    while(part.length>65){
      let cut=part.lastIndexOf('、',65)+1;
      if(cut<20)cut=58;
      chunks.push(part.slice(0,cut));
      part=part.slice(cut).trim();
    }
    if(part)chunks.push(part);
  }
  return chunks;
}
function n2ClearReadingSpeechTimers(){
  const speech=n2ReadingVoice;
  if(speech.bootTimer!==null){clearTimeout(speech.bootTimer);speech.bootTimer=null}
  if(speech.startTimer!==null){clearTimeout(speech.startTimer);speech.startTimer=null}
}
function n2UpdateReadingSpeechControls(message){
  const play=document.querySelector('[data-reading-listen]');
  const pause=document.querySelector('[data-reading-pause]');
  const stop=document.querySelector('[data-reading-tts-stop]');
  const status=document.querySelector('#readingAudioStatus');
  const mode=n2ReadingVoice.status;
  if(play)play.textContent=mode==='stopped'?'🔊 Đọc đoạn văn':'↻ Đọc lại từ đầu';
  if(pause){
    pause.disabled=mode==='stopped';
    pause.textContent=mode==='paused'?'▶ Tiếp tục':'⏸ Tạm dừng';
  }
  if(stop)stop.disabled=mode==='stopped';
  if(status)status.textContent=message||(
    mode==='starting'?'⏳ Đang chờ giọng đọc tiếng Nhật...':
    mode==='playing'?'🔊 Đang đọc đoạn văn...':
    mode==='paused'?'⏸ Đã tạm dừng. Tiếp tục sẽ đọc lại đoạn đang dở.':
    'Sẵn sàng nghe.'
  );
}
function n2CancelReadingUtterance(){
  const speech=n2ReadingVoice;
  // Invalidate onend/onerror events BEFORE cancel(). Android may fire them late.
  speech.run++;
  n2ClearReadingSpeechTimers();
  speech.utterance=null;
  try{
    window.speechSynthesis?.cancel();
    // Defensive cleanup of any stale paused state from an older app version.
    if(window.speechSynthesis?.paused)window.speechSynthesis.resume();
  }catch{}
  return speech.run;
}
function n2StopReadingSpeech(message){
  const speech=n2ReadingVoice;
  n2CancelReadingUtterance();
  speech.status='stopped';
  speech.parts=[];
  speech.index=0;
  speech.lessonId=null;
  speech.retries=0;
  n2UpdateReadingSpeechControls(message||'⏹ Đã dừng đọc.');
}
function n2RetryReadingChunk(run,utterance){
  const speech=n2ReadingVoice;
  if(run!==speech.run||utterance!==speech.utterance||speech.status==='paused'||speech.status==='stopped')return;
  if(speech.retries>=1){
    n2StopReadingSpeech('⚠️ Không khởi động được giọng tiếng Nhật trên trình duyệt. Hãy kiểm tra âm lượng và giọng đọc tiếng Nhật trong cài đặt chuyển văn bản thành giọng nói, rồi bấm Đọc lại.');
    return;
  }
  speech.retries++;
  const nextRun=n2CancelReadingUtterance();
  speech.status='starting';
  n2UpdateReadingSpeechControls('⏳ Chrome chưa phát được tiếng. Đang thử lại đoạn '+(speech.index+1)+'...');
  // Android TTS needs a brief gap after cancel() before queuing a new voice.
  speech.bootTimer=setTimeout(()=>{
    speech.bootTimer=null;
    if(speech.run===nextRun&&speech.status==='starting')n2PlayReadingNext(nextRun);
  },240);
}
function n2PlayReadingNext(run){
  const speech=n2ReadingVoice;
  if(run!==speech.run||!['playing','starting'].includes(speech.status))return;
  if(speech.index>=speech.parts.length){
    n2StopReadingSpeech('✅ Đã đọc hết đoạn văn.');
    return;
  }
  const synth=window.speechSynthesis;
  const utterance=new SpeechSynthesisUtterance(speech.parts[speech.index]);
  let started=false;
  speech.utterance=utterance;
  speech.status='starting';
  utterance.lang='ja-JP';
  utterance.rate=.85;
  utterance.pitch=1;
  const jpVoice=synth.getVoices?.().find(v=>/^ja(?:-|_)/i.test(v.lang));
  if(jpVoice)utterance.voice=jpVoice;
  utterance.onstart=()=>{
    if(run!==speech.run||utterance!==speech.utterance||speech.status==='paused')return;
    started=true;
    if(speech.startTimer!==null){clearTimeout(speech.startTimer);speech.startTimer=null}
    speech.retries=0;
    speech.status='playing';
    n2UpdateReadingSpeechControls('🔊 Đang đọc · đoạn '+(speech.index+1)+'/'+speech.parts.length);
  };
  utterance.onend=()=>{
    if(run!==speech.run||utterance!==speech.utterance||speech.status==='paused')return;
    if(!started){n2RetryReadingChunk(run,utterance);return}
    n2ClearReadingSpeechTimers();
    speech.utterance=null;
    speech.retries=0;
    speech.index++;
    if(speech.index>=speech.parts.length){
      n2StopReadingSpeech('✅ Đã đọc hết đoạn văn.');
      return;
    }
    speech.status='starting';
    n2UpdateReadingSpeechControls('⏳ Chuẩn bị đoạn '+(speech.index+1)+'/'+speech.parts.length+'...');
    speech.bootTimer=setTimeout(()=>{
      speech.bootTimer=null;
      if(run===speech.run && speech.status==='starting')n2PlayReadingNext(run);
    },70);
  };
  utterance.onerror=e=>{
    if(run!==speech.run||utterance!==speech.utterance||speech.status==='paused')return;
    if(['canceled','interrupted','audio-busy'].includes(e.error)){
      n2RetryReadingChunk(run,utterance);
      return;
    }
    n2StopReadingSpeech('⚠️ Không thể phát tiếng Nhật ('+(e.error||'lỗi giọng đọc')+'). Kiểm tra cài đặt Text-to-speech trên điện thoại.');
  };
  n2UpdateReadingSpeechControls('⏳ Đang khởi động giọng đọc · đoạn '+(speech.index+1)+'/'+speech.parts.length+'...');
  try{synth.speak(utterance)}catch(e){
    n2StopReadingSpeech('⚠️ Không khởi động được loa đọc: '+(e?.message||'lỗi không xác định'));
    return;
  }
  // Do not say "Đang đọc" until the browser confirms an actual start.
  // One retry only, to avoid an endless silent loop on broken Android engines.
  if(run===speech.run && speech.status==='starting'){
    speech.startTimer=setTimeout(()=>{
      speech.startTimer=null;
      if(run===speech.run && speech.utterance===utterance && speech.status==='starting'){
        n2RetryReadingChunk(run,utterance);
      }
    },8000);
  }
}
function n2StartReadingSpeech(lesson){
  if(n2UI.mediaRecorder?.state==='recording'){
    n2UpdateReadingSpeechControls('Hãy dừng ghi âm trước khi nghe giọng mẫu.');
    return;
  }
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){
    n2UpdateReadingSpeechControls('Trình duyệt không hỗ trợ phát giọng đọc.');
    return;
  }
  n2StopReadingSpeech();
  const speech=n2ReadingVoice;
  speech.parts=n2ReadingSentenceChunks(lesson.text);
  if(!speech.parts.length){n2UpdateReadingSpeechControls('Đoạn văn trống.');return}
  speech.lessonId=lesson.id;
  speech.status='starting';
  speech.retries=0;
  n2PlayReadingNext(speech.run);
}
function n2ToggleReadingSpeechPause(){
  const speech=n2ReadingVoice;
  if(speech.status==='stopped')return;
  if(speech.status!=='paused'){
    // Chrome Android's native resume() can remain silent while "speaking" is
    // true. Stop the TTS engine and remember the CURRENT chunk index instead.
    n2CancelReadingUtterance();
    speech.status='paused';
    n2UpdateReadingSpeechControls('⏸ Đã tạm dừng tại đoạn '+(speech.index+1)+'/'+speech.parts.length+'. Tiếp tục sẽ đọc lại đoạn này.');
  }else{
    const run=n2CancelReadingUtterance();
    speech.status='starting';
    speech.retries=0;
    n2UpdateReadingSpeechControls('⏳ Đang khởi động lại đoạn '+(speech.index+1)+'/'+speech.parts.length+'...');
    // Fresh utterance rather than native resume; never trust synth.speaking.
    n2PlayReadingNext(run);
  }
}

function renderN2ReadingDetail(){
  const lesson=n2CurrentReading();if(!lesson){n2UI.view='reading';return renderN2ReadingList()}
  title.textContent=lesson.label;
  const ready=!!lesson.text;
  if(n2UI.readingShowFurigana===null)n2UI.readingShowFurigana=n2ReadingGetPref('readingFurigana');
  if(n2UI.readingShowTranslation===null)n2UI.readingShowTranslation=n2ReadingGetPref('readingTranslation');
  main.innerHTML=`
    <button class="foundation-inline-back" data-n2-reading-back type="button">← Đọc N2</button>
    <div class="lesson-detail-head"><div><p class="section-kicker">${escapeText(lesson.exercise)}</p><h2>${escapeText(lesson.label)}</h2><p>${escapeText(lesson.source||'')} · ${lesson.verified?'Đã đối chiếu PDF':'Bản phiên chép, cần đối chiếu PDF'}</p></div></div>
    ${ready?`
      <section class="reading-passage">
        <div class="reading-toolbar reading-audio-toolbar">
          <button class="primary-btn" data-reading-listen type="button">🔊 Đọc đoạn văn</button>
          <button class="secondary-btn" data-reading-pause type="button" disabled>⏸ Tạm dừng</button>
          <button class="secondary-btn" data-reading-tts-stop type="button" disabled>⏹ Dừng hẳn</button>
        </div>
        <div class="reading-toolbar reading-display-toolbar" role="group" aria-label="Tuỳ chọn hiển thị đoạn văn">
          <button class="secondary-btn n2-reading-toggle" data-reading-furigana aria-pressed="false" type="button">あ Hiện Furigana</button>
          <button class="secondary-btn n2-reading-toggle" data-reading-translation aria-controls="readingVietnamese" aria-expanded="false" aria-pressed="false" type="button">🌐 Hiện dịch nghĩa</button>
        </div>
        <p id="readingAudioStatus" class="reading-audio-status" role="status" aria-live="polite">Sẵn sàng nghe.</p>
        <p id="readingFuriganaHelp" class="reading-furigana-help" hidden></p>
        <p id="n2ReadingJapanese" lang="ja">${escapeText(lesson.text)}</p>
      </section>
      <section id="readingVietnamese" class="reading-translation" lang="vi" hidden>
        <h3>🇻🇳 Dịch nghĩa tiếng Việt</h3>
        <p>${escapeText(lesson.translation||'Chưa có bản dịch tiếng Việt cho đoạn văn này.')}</p>
      </section>
      <section class="reading-recorder">
        <h3>🎙️ Đọc to để chấm điểm</h3>
        <p>Ứng dụng dùng nhận dạng tiếng Nhật trực tiếp khi bạn đọc. Điểm chỉ là ước tính dựa trên chữ máy nghe được (85%) và tốc độ (15%), chưa đo chính xác từng âm.</p>
        <div class="record-actions"><button class="record-btn" data-reading-record type="button">🎤 Bắt đầu đọc & chấm</button><button class="secondary-btn" data-reading-stop type="button" disabled>■ Dừng & chấm</button></div>
        <div id="readingLiveStatus" class="reading-live-status" role="status" aria-live="polite">Nhấn bắt đầu, cấp quyền micro và đọc rõ tiếng Nhật.</div>
        <div id="readingScoreBox"></div>
        <details class="n2-recorder-extras"><summary>🎧 Ghi âm riêng để nghe lại</summary>
          <p>Ghi âm và chấm tự động là hai chế độ riêng. File ghi âm vẫn dùng được nếu dịch vụ nhận dạng tiếng Nhật trên Chrome gặp lỗi.</p>
          <div class="record-actions"><button class="secondary-btn" data-record-only type="button">● Ghi âm nghe lại</button><button class="secondary-btn" data-record-only-stop type="button" disabled>■ Dừng ghi âm</button></div>
          <p id="readingCaptureStatus" class="reading-live-status">Chưa ghi âm.</p>
          <div id="readingAudioBox"></div>
        </details>
      </section>`
    :`<div class="n2-import-warning"><strong>Chưa có nguyên đoạn văn trong dữ liệu app.</strong><p>Khung bài đã gắn đúng vị trí trong lộ trình. Cần nhập nguyên văn từ PDF nguồn trước khi bật ghi âm/chấm điểm.</p></div>`}
  `;
  document.querySelector('[data-n2-reading-back]').addEventListener('click',()=>{n2StopReadingSpeech();stopN2Reading();n2UI.view='reading';renderN2()});
  if(!ready)return;
  n2RenderReadingDisplay(lesson);
  n2UpdateReadingSpeechControls();
  document.querySelector('[data-reading-listen]').addEventListener('click',()=>n2StartReadingSpeech(lesson));
  document.querySelector('[data-reading-pause]').addEventListener('click',n2ToggleReadingSpeechPause);
  document.querySelector('[data-reading-tts-stop]').addEventListener('click',()=>n2StopReadingSpeech());
  document.querySelector('[data-reading-furigana]').addEventListener('click',()=>{
    n2UI.readingShowFurigana=!n2UI.readingShowFurigana;
    n2ReadingSetPref('readingFurigana',n2UI.readingShowFurigana);
    n2RenderReadingDisplay(lesson);
  });
  document.querySelector('[data-reading-translation]').addEventListener('click',()=>{
    n2UI.readingShowTranslation=!n2UI.readingShowTranslation;
    n2ReadingSetPref('readingTranslation',n2UI.readingShowTranslation);
    n2RenderReadingDisplay(lesson);
  });
  document.querySelector('[data-reading-record]').addEventListener('click',()=>startN2Reading(lesson));
  document.querySelector('[data-reading-stop]').addEventListener('click',()=>stopAndScoreN2Reading(lesson));
  document.querySelector('[data-record-only]').addEventListener('click',n2CaptureAudioOnly);
  document.querySelector('[data-record-only-stop]').addEventListener('click',n2StopCaptureOnly);
}

/* Speech recognition and playback recording are deliberately separated.
 * Running MediaRecorder and SpeechRecognition concurrently on Android may
 * record a WebM file but return no speech transcript to score. */
const n2SpeechCheck={
  session:0,active:false,stopping:false,scored:false,startedAt:0,
  recognized:[],currentFinal:[],interim:'',blankRestarts:0,errors:[],
  restartTimer:null,finishTimer:null,lesson:null
};
function n2SpeechStatus(message){
 const el=document.querySelector('#readingLiveStatus');
 if(el)el.textContent=message;
}
function n2SpeechErrorHelp(code){
 const descriptions={
  'not-allowed':'Quyền micro đã bị chặn. Mở quyền trang web trong Chrome → Micro → Cho phép.',
  'service-not-allowed':'Chrome chặn dịch vụ nhận dạng giọng nói. Kiểm tra quyền micro và cài đặt nhận dạng của Android.',
  'network':'Dịch vụ nhận dạng giọng nói của Chrome không kết nối được. Cần Internet ổn định; ghi âm riêng vẫn dùng được.',
  'no-speech':'Không nhận ra lời nói. Hãy đọc gần micro, tăng âm lượng và thử lại.',
  'audio-capture':'Không lấy được âm thanh từ micro. Có thể micro đang được ứng dụng khác sử dụng.',
  'language-not-supported':'Trình duyệt không hỗ trợ nhận dạng tiếng Nhật.',
  'aborted':'Phiên nhận dạng bị ngắt. Bạn có thể bắt đầu lại.'
 };
 return descriptions[code]||('Nhận dạng giọng nói gặp lỗi: '+(code||'không xác định')+'.');
}
function n2SpeechClearTimers(){
 const s=n2SpeechCheck;
 if(s.restartTimer!==null){clearTimeout(s.restartTimer);s.restartTimer=null}
 if(s.finishTimer!==null){clearTimeout(s.finishTimer);s.finishTimer=null}
}
function n2SpeechUpdateTranscript(){
 const s=n2SpeechCheck;
 n2UI.readingTranscript=[...s.recognized,...s.currentFinal,s.interim].join('');
 if(n2UI.readingTranscript)n2SpeechStatus('🎤 Đã nhận dạng: '+n2UI.readingTranscript.slice(-115));
}
function n2SpeechFinalize(lesson,session){
 const s=n2SpeechCheck;
 if(session!==s.session||s.scored)return;
 s.scored=true;s.active=false;s.stopping=false;
 n2SpeechClearTimers();
 n2UI.recognition=null;
 // Keep interim text only when the recognizer did not return a final transcript.
 n2UI.readingTranscript=[...s.recognized,...s.currentFinal,s.interim].join('');
 const elapsed=Math.max(1,(performance.now()-s.startedAt)/1000);
 document.querySelector('[data-reading-record]')?.removeAttribute('disabled');
 const stop=document.querySelector('[data-reading-stop]');if(stop)stop.disabled=true;
 scoreN2Reading(lesson,elapsed,s.errors.at(-1)||'');
}
function n2SpeechRunRecognizer(lesson,session){
 const s=n2SpeechCheck;
 if(session!==s.session||!s.active||s.stopping)return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const recog=new SR();
 n2UI.recognition=recog;
 recog.lang='ja-JP';recog.continuous=true;recog.interimResults=true;recog.maxAlternatives=1;
 recog.onresult=e=>{
   if(session!==s.session)return;
   s.currentFinal=[];s.interim='';
   for(let i=0;i<e.results.length;i++){
     const txt=e.results[i]?.[0]?.transcript||'';
     if(e.results[i].isFinal)s.currentFinal.push(txt);
     else s.interim+=txt;
   }
   if(s.currentFinal.length||s.interim)s.blankRestarts=0;
   n2SpeechUpdateTranscript();
 };
 recog.onerror=e=>{
   if(session!==s.session)return;
   const code=e.error||'unknown';
   if(code==='no-speech'){n2SpeechStatus('⚠️ Chưa nghe thấy tiếng Nhật. Đọc rõ hơn, ứng dụng sẽ thử nghe lại.');return}
   s.errors.push(code);
   n2SpeechStatus('⚠️ '+n2SpeechErrorHelp(code));
   if(['not-allowed','service-not-allowed','audio-capture','language-not-supported','network'].includes(code)){
     s.active=false;s.stopping=true;
     const record=document.querySelector('[data-reading-record]');
     if(record)record.disabled=false;
     const stop=document.querySelector('[data-reading-stop]');
     if(stop)stop.disabled=true;
     if(!n2UI.readingTranscript){
       const box=document.querySelector('#readingScoreBox');
       if(box)box.innerHTML='<div class="score-panel fail"><strong>Chưa thể chấm.</strong><p>'+escapeText(n2SpeechErrorHelp(code))+'</p></div>';
     }
   }
 };
 recog.onend=()=>{
   if(session!==s.session)return;
   const heardThisRound=Boolean(s.currentFinal.length||s.interim.trim());
   if(s.currentFinal.length)s.recognized.push(...s.currentFinal);
   else if(s.interim)s.recognized.push(s.interim);
   s.currentFinal=[];s.interim='';
   n2UI.recognition=null;
   n2SpeechUpdateTranscript();
   if(s.stopping || !s.active){
     if(s.errors.length && !s.recognized.length){
       s.scored=true;n2SpeechClearTimers();
       return;
     }
     if(s.finishTimer!==null)clearTimeout(s.finishTimer);
     s.finishTimer=setTimeout(()=>n2SpeechFinalize(lesson,session),300);
     return;
   }
   if(heardThisRound)s.blankRestarts=0;
   else s.blankRestarts++;
   if(s.blankRestarts>=3){
     s.active=false;s.stopping=true;
     n2SpeechStatus('⚠️ Chrome không nhận ra lời nói sau nhiều lần thử. Hãy kiểm tra micro hoặc dùng Ghi âm nghe lại.');
     const box=document.querySelector('#readingScoreBox');
     if(box)box.innerHTML='<div class="score-panel fail"><strong>Chưa thể chấm.</strong><p>Không nhận được bản chép tiếng Nhật. Không thể suy ra điểm chỉ từ file âm thanh.</p></div>';
     document.querySelector('[data-reading-record]')?.removeAttribute('disabled');
     const stop=document.querySelector('[data-reading-stop]');if(stop)stop.disabled=true;
     return;
   }
   n2SpeechStatus('⏳ Nhận dạng vừa ngắt; đang mở lại micro để tiếp tục...');
   s.restartTimer=setTimeout(()=>{
     s.restartTimer=null;
     if(session===s.session&&s.active&&!s.stopping)n2SpeechRunRecognizer(lesson,session);
   },400);
 };
 try{
   recog.start();
   n2SpeechStatus('🎤 Đang nghe tiếng Nhật... Hãy bắt đầu đọc.');
 }catch(e){
   s.active=false;s.stopping=true;s.errors.push('start-failed');
   n2SpeechStatus('⚠️ Không khởi động được nhận dạng: '+(e?.message||'Lỗi trình duyệt'));
   document.querySelector('[data-reading-record]')?.removeAttribute('disabled');
   const stop=document.querySelector('[data-reading-stop]');if(stop)stop.disabled=true;
 }
}
function startN2Reading(lesson){
 const status=document.querySelector('#readingLiveStatus');
 if(n2UI.mediaRecorder?.state==='recording'){
   n2SpeechStatus('Đang ghi âm riêng. Hãy dừng ghi âm trước khi chấm phát âm.');return;
 }
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){
   n2SpeechStatus('⚠️ Trình duyệt này không hỗ trợ nhận dạng tiếng Nhật trực tiếp. Hãy thử Chrome Android hoặc ghi âm để nghe lại.');
   return;
 }
 if(!window.isSecureContext){
   n2SpeechStatus('⚠️ Cần mở ứng dụng qua HTTPS để dùng micro.');return;
 }
 n2StopReadingSpeech('⏹ Đã dừng giọng đọc mẫu để bạn đọc thử.');
 stopN2Reading();
 const s=n2SpeechCheck;
 s.session++;s.active=true;s.stopping=false;s.scored=false;
 s.startedAt=performance.now();s.recognized=[];s.currentFinal=[];s.interim='';
 s.blankRestarts=0;s.errors=[];s.lesson=lesson;
 n2UI.readingStartedAt=s.startedAt;n2UI.readingTranscript='';
 const score=document.querySelector('#readingScoreBox');if(score)score.innerHTML='';
 const start=document.querySelector('[data-reading-record]');if(start)start.disabled=true;
 const stop=document.querySelector('[data-reading-stop]');if(stop)stop.disabled=false;
 n2SpeechRunRecognizer(lesson,s.session);
}
function stopAndScoreN2Reading(lesson){
 const s=n2SpeechCheck;
 if(!s.active&&!s.stopping)return;
 s.active=false;s.stopping=true;
 n2SpeechClearTimers();
 n2SpeechStatus('⏳ Đang chờ Chrome trả bản chép tiếng Nhật để chấm...');
 const finishSession=s.session;
 try{
   if(n2UI.recognition)n2UI.recognition.stop();
   else n2SpeechFinalize(lesson,finishSession);
 }catch{n2SpeechFinalize(lesson,finishSession)}
 // Some Android builds fail to deliver "onend"; finish without inventing speech.
 if(!s.scored&&s.finishTimer===null)s.finishTimer=setTimeout(()=>n2SpeechFinalize(lesson,finishSession),1750);
}
function stopN2Reading(){
 const s=n2SpeechCheck;
 s.session++;s.active=false;s.stopping=false;s.scored=true;
 n2SpeechClearTimers();
 try{n2UI.recognition?.abort()}catch{}
 n2UI.recognition=null;
 n2StopCaptureOnly();
}
async function n2CaptureAudioOnly(){
 const el=document.querySelector('#readingCaptureStatus');
 if(n2SpeechCheck.active||n2SpeechCheck.stopping){if(el)el.textContent='Hãy dừng phiên chấm trước khi ghi âm riêng.';return}
 if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder){if(el)el.textContent='Trình duyệt này không hỗ trợ ghi âm.';return}
 try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   n2UI.mediaStream=stream;
   const recorder=new MediaRecorder(stream);n2UI.mediaRecorder=recorder;
   const chunks=[];
   recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
   recorder.onstop=()=>{
     const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
     if(!blob.size)return;
     if(n2UI.audioUrl)URL.revokeObjectURL(n2UI.audioUrl);
     n2UI.audioUrl=URL.createObjectURL(blob);
     const box=document.querySelector('#readingAudioBox');
     if(box)box.innerHTML='<audio controls src="'+escapeText(n2UI.audioUrl)+'"></audio>';
   };
   recorder.start();
   if(el)el.textContent='🔴 Đang ghi âm để nghe lại (chế độ này không chấm tự động).';
   const start=document.querySelector('[data-record-only]');if(start)start.disabled=true;
   const stop=document.querySelector('[data-record-only-stop]');if(stop)stop.disabled=false;
 }catch(e){if(el)el.textContent='⚠️ Không mở được micro. Mở quyền trang web trong Chrome → Micro → Cho phép.';}
}
function n2StopCaptureOnly(){
 try{if(n2UI.mediaRecorder&&n2UI.mediaRecorder.state!=='inactive')n2UI.mediaRecorder.stop()}catch{}
 n2UI.mediaStream?.getTracks?.().forEach(t=>t.stop());
 n2UI.mediaRecorder=null;n2UI.mediaStream=null;
 const start=document.querySelector('[data-record-only]');if(start)start.disabled=false;
 const stop=document.querySelector('[data-record-only-stop]');if(stop)stop.disabled=true;
 const msg=document.querySelector('#readingCaptureStatus');
 if(msg)msg.textContent='Đã dừng ghi âm. Bấm phát để nghe lại.';
}

function normalizeJa(s){
  return String(s||'').normalize('NFKC').replace(/[\s。、！？!?「」『』（）()・，,．.：:；;ー]/g,'');
}

function levenshtein(a,b){
  if(!a.length)return b.length;if(!b.length)return a.length;
  const prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1);
  for(let i=1;i<=a.length;i++){
    cur[0]=i;
    for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<=b.length;j++)prev[j]=cur[j];
  }
  return prev[b.length];
}

function scoreN2Reading(lesson,duration,speechError=''){
  const target=normalizeJa(lesson.text),spoken=normalizeJa(n2UI.readingTranscript);
  const box=document.querySelector('#readingScoreBox'),status=document.querySelector('#readingLiveStatus');
  if(!spoken){
    if(box)box.innerHTML='<div class="score-panel fail"><strong>Chưa thể chấm.</strong><p>'+escapeText(speechError?n2SpeechErrorHelp(speechError):'Chrome không trả bản chép tiếng Nhật. Kiểm tra quyền micro, kết nối mạng và thử “Bắt đầu đọc & chấm” lại. Ghi âm để nghe lại không thể tự cho điểm.')+'</p></div>';
    if(status)status.textContent='Đã dừng nhận dạng. Không có chữ để so sánh nên chưa có điểm.';
    return;
  }
  const dist=levenshtein(target,spoken);
  const accuracy=Math.max(0,Math.round((1-dist/Math.max(target.length,spoken.length,1))*100));
  const cpm=Math.round(spoken.length/(duration/60));
  const speed=Math.max(0,Math.min(100,Math.round(100-Math.abs(cpm-260)*0.35)));
  const score=Math.round(accuracy*.85+speed*.15);
  const pass=score>=60;
  n2SaveReadingScore({date:new Date().toISOString(),lessonId:lesson.id,score,accuracy,cpm,speed});
  if(status)status.textContent=`Nhận dạng được: ${n2UI.readingTranscript}`;
  if(box)box.innerHTML=`<div class="score-panel ${pass?'pass':'fail'}">
    <div class="score-main"><b>${score}</b><span>/100</span></div>
    <div class="score-grid"><div><strong>${accuracy}%</strong><span>khớp văn bản</span></div><div><strong>${cpm}</strong><span>ký tự/phút</span></div><div><strong>${speed}%</strong><span>nhịp độ</span></div></div>
    <p>${pass?'Đạt. Bạn có thể chuyển sang bài khác.':'Dưới 60 điểm: bài này chưa được tính qua. Hãy đọc lại.'}</p>
  </div>`;
}

backBtn.addEventListener('click',e=>{
  if(state.page!=='n2'||n2UI.view==='root')return;
  e.preventDefault();e.stopImmediatePropagation();
  stopN2Timers();
  if(n2UI.view==='study'){exitN2Study();return}
  if(n2UI.view==='detail'){n2UI.view='category';n2UI.tab='lessons';renderN2();return}
  if(n2UI.view==='category'){n2UI.view='root';renderN2();return}
  if(n2UI.view==='reading-detail'){n2StopReadingSpeech();stopN2Reading();n2UI.view='reading';renderN2();return}
  if(n2UI.view==='reading'){n2UI.view='root';renderN2();return}
  if(n2UI.view==='planner'){n2UI.view='root';renderN2();return}
  if(n2UI.view==='docs'){if(n2DocUI.view!=='list'){n2DocUI.view='list';renderN2()}else{n2UI.view='root';renderN2()}return}
},true);
window.addEventListener('pagehide',()=>n2StopReadingSpeech());
document.querySelectorAll('.bottom-nav [data-nav]').forEach(button=>button.addEventListener('click',()=>{
  if(n2ReadingVoice.status!=='stopped')n2StopReadingSpeech();
}));
