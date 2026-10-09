const FOUNDATION_DATA = window.JAPAN_FOUNDATION_DATA || {N5:{vocab:[],kanji:[],grammar:[]},N4:{vocab:[],kanji:[],grammar:[]}};

const foundationUI = {
  view:'root',
  type:'vocab',
  tab:'lessons',
  lessonId:null,
  session:null,
  timer:null,
  deadline:0,
  locked:false
};

const FOUNDATION_PROGRESS_KEY='japanStudy.foundation.progress.v1';

function loadFoundationProgress(){
  try{return JSON.parse(localStorage.getItem(FOUNDATION_PROGRESS_KEY)||'{}')}catch(e){return {}}
}
function saveFoundationProgress(progress){
  localStorage.setItem(FOUNDATION_PROGRESS_KEY,JSON.stringify(progress));
}
function progressKey(level,type,lessonId){return `${level}:${type}:${lessonId}`}
function lessonProgress(level,type,lessonId){
  const p=loadFoundationProgress()[progressKey(level,type,lessonId)];
  return p?.mastered?100:0;
}
function foundationTypeLabel(type){return type==='vocab'?'Từ vựng':type==='kanji'?'Kanji':'Ngữ pháp'}
function foundationTypeIcon(type){return type==='vocab'?'語':type==='kanji'?'漢':'文'}
function foundationLessons(level,type){return FOUNDATION_DATA[level]?.[type]||[]}
function foundationAllItems(level,type){return foundationLessons(level,type).flatMap(x=>x.items||[])}
function foundationTotal(level,type){return foundationAllItems(level,type).length}
function foundationMasteredLessons(level,type){
  return foundationLessons(level,type).filter(x=>lessonProgress(level,type,x.id)===100).length;
}
function foundationOverallPct(level){
  const types=['vocab','kanji','grammar'];
  const total=types.reduce((s,t)=>s+foundationLessons(level,t).length,0);
  const done=types.reduce((s,t)=>s+foundationMasteredLessons(level,t),0);
  return total?Math.round(done/total*100):0;
}

function renderFoundation(){
  stopFoundationTimer();
  setNav('');
  if(foundationUI.view==='root') return renderFoundationRoot();
  if(foundationUI.view==='category') return renderFoundationCategory();
  if(foundationUI.view==='lesson-detail') return renderFoundationLessonDetail();
  if(foundationUI.view==='study') return renderFoundationStudy();
  return renderFoundationRoot();
}

function renderFoundationRoot(){
  title.textContent='Mất gốc';
  const level=state.level;
  const pct=foundationOverallPct(level);
  main.innerHTML=`
    <div class="level-tabs">
      <button class="level-tab ${level==='N5'?'active':''}" data-foundation-level="N5" type="button">N5</button>
      <button class="level-tab ${level==='N4'?'active':''}" data-foundation-level="N4" type="button">N4</button>
    </div>
    <section class="hero">
      <div class="hero-grid">
        <div><strong>${level} · xây lại nền theo bài thật</strong><p>Từ vựng và Kanji giữ đúng cấu trúc tài liệu gốc. Mỗi bài có danh sách kiến thức, âm thanh và chế độ học lặp đến khi không còn câu sai.</p></div>
        <div class="hero-stat"><b>${pct}%</b><span>bài đã vững</span></div>
      </div>
    </section>
    <div class="section-head"><div><p class="section-kicker">${level}</p><h2>Chọn phần học</h2></div></div>
    <section class="category-list foundation-categories">
      ${foundationCategoryCard('vocab','Từ vựng',level==='N5'?'Theo Chuyên đề → Bài':'Theo Tuần → Ngày')}
      ${foundationCategoryCard('kanji','Kanji',level==='N5'?'Theo Chuyên đề → Bài':'Theo Tuần → Ngày')}
      ${foundationCategoryCard('grammar','Ngữ pháp','Nhận diện → phân biệt → nhớ chủ động')}
    </section>
    <div class="notice"><div>🧠</div><div><strong>Không tính “đã xem” là “đã thuộc”.</strong><p>Chỉ đánh dấu hoàn thành khi vượt qua vòng kiểm tra toàn bài mà không còn câu sai.</p></div></div>
  `;
  document.querySelectorAll('[data-foundation-level]').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.foundationLevel; foundationUI.view='root'; renderFoundation();}));
  document.querySelectorAll('[data-foundation-type]').forEach(b=>b.addEventListener('click',()=>{foundationUI.type=b.dataset.foundationType; foundationUI.view='category'; foundationUI.tab='lessons'; foundationUI.lessonId=null; renderFoundation();}));
}

function foundationCategoryCard(type,name,desc){
  const level=state.level;
  const lessons=foundationLessons(level,type);
  const done=foundationMasteredLessons(level,type);
  const pct=lessons.length?Math.round(done/lessons.length*100):0;
  return `<button class="category-card" data-foundation-type="${type}" type="button">
    <span class="category-icon">${foundationTypeIcon(type)}</span>
    <span><strong>${name}</strong><p>${desc} · ${foundationTotal(level,type)} mục</p><span class="progress-bar"><span style="width:${pct}%"></span></span></span>
    <span class="chev">›</span>
  </button>`;
}

function renderFoundationCategory(){
  const level=state.level,type=foundationUI.type,lessons=foundationLessons(level,type);
  title.textContent=`${foundationTypeLabel(type)} ${level}`;
  main.innerHTML=`
    <button class="foundation-inline-back" data-foundation-root type="button">← Mất gốc ${level}</button>
    <div class="study-tabs">
      <button class="study-tab ${foundationUI.tab==='lessons'?'active':''}" data-foundation-tab="lessons" type="button">Bài học</button>
      <button class="study-tab ${foundationUI.tab==='study'?'active':''}" data-foundation-tab="study" type="button">Học bài</button>
    </div>
    ${foundationUI.tab==='lessons'?renderLessonBrowser(lessons):renderLessonPicker(lessons)}
  `;
  document.querySelector('[data-foundation-root]').addEventListener('click',()=>{foundationUI.view='root';renderFoundation()});
  document.querySelectorAll('[data-foundation-tab]').forEach(b=>b.addEventListener('click',()=>{foundationUI.tab=b.dataset.foundationTab;renderFoundation()}));
  document.querySelectorAll('[data-foundation-lesson]').forEach(b=>b.addEventListener('click',()=>{foundationUI.lessonId=b.dataset.foundationLesson;foundationUI.view='lesson-detail';renderFoundation()}));
  document.querySelectorAll('[data-start-foundation]').forEach(b=>b.addEventListener('click',()=>startFoundationSession(b.dataset.startFoundation)));
}

function renderLessonBrowser(lessons){
  return `<section class="lesson-list foundation-lesson-list">
    ${lessons.map((lesson,i)=>{
      const pct=lessonProgress(state.level,foundationUI.type,lesson.id);
      return `<button class="lesson-card foundation-lesson-card" data-foundation-lesson="${lesson.id}" type="button">
        <div class="lesson-card-top"><div><p class="section-kicker">${foundationTypeLabel(foundationUI.type).toUpperCase()}</p><h3>${escapeText(lesson.label)}</h3></div><span class="lesson-count">${lesson.items.length} mục</span></div>
        <div class="lesson-progress-row"><span>${pct===100?'✓ Đã vững':'Chưa hoàn tất'}</span><span>${pct}%</span></div>
        <span class="progress-bar"><span style="width:${pct}%"></span></span>
      </button>`;
    }).join('')}
  </section>`;
}

function renderLessonPicker(lessons){
  return `
    <section class="hero compact-hero"><div class="hero-grid"><div><strong>Chọn 1 bài rồi học đến cùng</strong><p>${foundationUI.type==='grammar'?'Ngữ pháp dùng 10 giây/câu và hỏi hai chiều: mẫu → nghĩa, nghĩa → mẫu.':'Quiz 5 giây/câu, không quay lại. Sai hoặc hết giờ sẽ tự đi vào vòng ôn yếu.'}</p></div><div class="hero-stat"><b>${lessons.length}</b><span>bài</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">HỌC BÀI</p><h2>Chọn bài</h2></div></div>
    <section class="lesson-list">
      ${lessons.map(lesson=>{
        const pct=lessonProgress(state.level,foundationUI.type,lesson.id);
        return `<article class="study-pick-card"><div><strong>${escapeText(lesson.label)}</strong><p>${lesson.items.length} mục · ${pct===100?'đã hoàn thành':'chưa hoàn thành'}</p></div><button class="primary-btn" data-start-foundation="${lesson.id}" type="button">${pct===100?'Học lại':'Bắt đầu'}</button></article>`;
      }).join('')}
    </section>`;
}

function getFoundationLesson(){return foundationLessons(state.level,foundationUI.type).find(x=>x.id===foundationUI.lessonId)}

function renderFoundationLessonDetail(){
  const lesson=getFoundationLesson();
  if(!lesson){foundationUI.view='category'; return renderFoundationCategory();}
  title.textContent=lesson.label;
  main.innerHTML=`
    <button class="foundation-inline-back" data-foundation-category type="button">← ${foundationTypeLabel(foundationUI.type)} ${state.level}</button>
    <div class="lesson-detail-head"><div><p class="section-kicker">${foundationTypeLabel(foundationUI.type).toUpperCase()}</p><h2>${escapeText(lesson.label)}</h2><p>${lesson.items.length} mục trong tài liệu</p></div><button class="primary-btn" data-start-foundation="${lesson.id}" type="button">Học bài</button></div>
    <section class="knowledge-list">${lesson.items.map((item,i)=>renderKnowledgeRow(item,i)).join('')}</section>
  `;
  document.querySelector('[data-foundation-category]').addEventListener('click',()=>{foundationUI.view='category';foundationUI.tab='lessons';renderFoundation()});
  document.querySelector('[data-start-foundation]').addEventListener('click',()=>startFoundationSession(lesson.id));
  document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speakJapanese(b.dataset.speak)));
}

function renderKnowledgeRow(item,i){
  if(foundationUI.type==='vocab'){
    return `<article class="knowledge-row"><div class="knowledge-index">${i+1}</div><div class="knowledge-main"><strong class="jp-term">${escapeText(item.term)}</strong><span class="reading">${escapeText(item.reading||'')}</span><p>${escapeText(item.meaning||'')}</p></div><button class="audio-btn" data-speak="${escapeText(item.reading||item.term)}" type="button" aria-label="Nghe">🔊</button></article>`;
  }
  if(foundationUI.type==='kanji'){
    return `<article class="knowledge-row"><div class="kanji-char">${escapeText(item.char)}</div><div class="knowledge-main"><strong>${escapeText(item.hanViet||item.meaning||'')}</strong><span class="reading">On: ${escapeText(item.on||'—')} · Kun: ${escapeText(item.kun||'—')}</span><p>${escapeText(item.meaning||item.hanViet||'')}</p></div><button class="audio-btn" data-speak="${escapeText(item.char)}" type="button" aria-label="Nghe">🔊</button></article>`;
  }
  return `<article class="knowledge-row grammar-row"><div class="knowledge-index">${item.n}</div><div class="knowledge-main"><strong class="grammar-pattern">${escapeText(item.pattern)}</strong><p>${escapeText(item.meaning)}</p></div></article>`;
}

function speakJapanese(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text||''));
  u.lang='ja-JP';u.rate=.82;u.pitch=1;
  window.speechSynthesis.speak(u);
}

function startFoundationSession(lessonId){
  const lesson=foundationLessons(state.level,foundationUI.type).find(x=>x.id===lessonId);
  if(!lesson||!lesson.items.length) return;
  foundationUI.lessonId=lessonId;
  foundationUI.session={
    cycle:'initial',mode:'quiz',all:lesson.items.slice(),remaining:new Set(lesson.items.map(x=>x.id)),known:new Set(),queue:lesson.items.slice(),index:0,
    quizErrors:new Set(),flashUnknown:new Set(),round:1,totalAnswers:0,correctAnswers:0
  };
  foundationUI.view='study';
  renderFoundation();
}

function stopFoundationTimer(){
  if(foundationUI.timer){clearInterval(foundationUI.timer);foundationUI.timer=null}
  foundationUI.deadline=0;
}

function renderFoundationStudy(){
  const s=foundationUI.session,lesson=getFoundationLesson();
  if(!s||!lesson){foundationUI.view='category';return renderFoundationCategory()}
  title.textContent=`Học · ${lesson.label}`;
  if(s.mode==='complete') return renderFoundationComplete(lesson);
  if(s.mode==='quiz') return renderFoundationQuiz(lesson);
  return renderFoundationFlashcard(lesson);
}

function phaseCopy(){
  const s=foundationUI.session;
  if(s.cycle==='initial'&&s.mode==='quiz') return ['B1 · Quiz toàn bài',`${foundationUI.type==='grammar'?10:5} giây/câu · không quay lại`];
  if(s.cycle==='initial'&&s.mode==='flash') return ['B2 · Flashcard','Câu thuộc trước → câu chưa thuộc'];
  if(s.cycle==='target'&&s.mode==='quiz') return [`Vòng ${s.round} · Quiz câu yếu`,'Chỉ hỏi các câu chưa thuộc'];
  if(s.cycle==='target'&&s.mode==='flash') return [`Vòng ${s.round} · Flashcard câu yếu`,'Ôn đúng phần vừa sai/chưa chắc'];
  if(s.cycle==='verify'&&s.mode==='flash') return ['Kiểm tra cuối · Flashcard toàn bài','Rà lại toàn bộ câu đã thuộc'];
  return ['Kiểm tra cuối · Quiz toàn bài','Phải 0 câu sai mới hoàn thành'];
}

function renderFoundationQuiz(lesson){
  const s=foundationUI.session;
  if(s.index>=s.queue.length){finishQuizPhase();return}
  const item=s.queue[s.index];
  const [phase,desc]=phaseCopy();
  const seconds=foundationUI.type==='grammar'?10:5;
  const q=buildFoundationQuestion(item,s.index);
  main.innerHTML=`
    <div class="study-session-head"><button class="foundation-inline-back danger-link" data-exit-study type="button">✕ Thoát</button><span>${s.index+1}/${s.queue.length}</span></div>
    <div class="phase-strip"><strong>${phase}</strong><span>${desc}</span></div>
    <div class="timer-track"><span id="foundationTimerBar"></span></div>
    <div class="timer-line"><strong id="foundationTimerText">${seconds}.0s</strong><span>Sai/hết giờ → tự đưa vào vòng ôn</span></div>
    <section class="quiz-card">
      <p class="section-kicker">${q.kicker}</p>
      <div class="quiz-prompt">${escapeText(q.prompt)}</div>
      ${q.sub?`<div class="quiz-sub">${escapeText(q.sub)}</div>`:''}
      ${foundationUI.type!=='grammar'?`<button class="audio-inline" data-speak="${escapeText(q.speak)}" type="button">🔊 Nghe</button>`:''}
    </section>
    <section class="answer-grid">${q.options.map((x,i)=>`<button class="answer-btn" data-answer-index="${i}" type="button">${escapeText(x)}</button>`).join('')}</section>
    <div id="answerFeedback" class="answer-feedback"></div>
  `;
  document.querySelector('[data-exit-study]').addEventListener('click',exitFoundationStudy);
  const audio=document.querySelector('[data-speak]');if(audio) audio.addEventListener('click',()=>speakJapanese(audio.dataset.speak));
  document.querySelectorAll('[data-answer-index]').forEach(b=>b.addEventListener('click',()=>answerFoundationQuestion(Number(b.dataset.answerIndex),q.correctIndex)));
  startQuestionTimer(seconds,()=>answerFoundationQuestion(-1,q.correctIndex,true));
}

function buildFoundationQuestion(item,index){
  const all=foundationAllItems(state.level,foundationUI.type);
  if(foundationUI.type==='grammar'){
    const reverse=index%2===1;
    const prompt=reverse?item.meaning:item.pattern;
    const correct=reverse?item.pattern:item.meaning;
    const pool=all.filter(x=>x.id!==item.id).map(x=>reverse?x.pattern:x.meaning).filter(Boolean);
    const options=makeOptions(correct,pool);
    return {kicker:reverse?'NGHĨA → MẪU':'MẪU → NGHĨA',prompt,sub:reverse?'Chọn mẫu ngữ pháp phù hợp':'Chọn chức năng/ý nghĩa đúng',speak:'',options,correctIndex:options.indexOf(correct)};
  }
  const prompt=foundationUI.type==='vocab'?item.term:item.char;
  const sub=foundationUI.type==='vocab'?(item.reading||''):`${item.hanViet||''} · On/Kun sẽ xem ở flashcard`;
  const correct=item.meaning||item.hanViet||'';
  const pool=all.filter(x=>x.id!==item.id).map(x=>x.meaning||x.hanViet||'').filter(Boolean);
  const options=makeOptions(correct,pool);
  return {kicker:foundationUI.type==='vocab'?'TỪ VỰNG → NGHĨA':'KANJI → Ý NGHĨA',prompt,sub,speak:foundationUI.type==='vocab'?(item.reading||item.term):item.char,options,correctIndex:options.indexOf(correct)};
}

function makeOptions(correct,pool){
  const unique=[...new Set(pool.filter(x=>x&&x!==correct))];
  for(let i=unique.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[unique[i],unique[j]]=[unique[j],unique[i]]}
  const arr=[correct,...unique.slice(0,3)];
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr;
}

function startQuestionTimer(seconds,onTimeout){
  stopFoundationTimer();
  foundationUI.locked=false;
  foundationUI.deadline=performance.now()+seconds*1000;
  const bar=document.querySelector('#foundationTimerBar'),label=document.querySelector('#foundationTimerText');
  const tick=()=>{
    const left=Math.max(0,foundationUI.deadline-performance.now());
    const ratio=left/(seconds*1000);
    if(bar)bar.style.width=`${Math.max(0,Math.min(100,ratio*100))}%`;
    if(label)label.textContent=`${(left/1000).toFixed(1)}s`;
    if(left<=0){stopFoundationTimer();onTimeout()}
  };
  tick();foundationUI.timer=setInterval(tick,100);
}

function answerFoundationQuestion(selected,correctIndex,timedOut=false){
  if(foundationUI.locked) return;
  foundationUI.locked=true;stopFoundationTimer();
  const s=foundationUI.session,item=s.queue[s.index];
  const ok=selected===correctIndex;
  s.totalAnswers++;if(ok)s.correctAnswers++;
  if(s.cycle==='verify'){
    if(!ok)s.remaining.add(item.id);
  }else if(ok){s.remaining.delete(item.id);s.known.add(item.id)}else{s.remaining.add(item.id);s.known.delete(item.id)}
  if(!ok)s.quizErrors.add(item.id);
  const buttons=[...document.querySelectorAll('[data-answer-index]')];
  buttons.forEach((b,i)=>{b.disabled=true;if(i===correctIndex)b.classList.add('correct');else if(i===selected)b.classList.add('wrong')});
  const fb=document.querySelector('#answerFeedback');
  if(fb)fb.innerHTML=ok?'<strong>Đúng.</strong>':'<strong>'+(timedOut?'Hết giờ.':'Sai.')+'</strong> Câu này sẽ quay lại.';
  setTimeout(()=>{s.index++;foundationUI.locked=false;renderFoundationStudy()},650);
}

function finishQuizPhase(){
  const s=foundationUI.session;
  stopFoundationTimer();
  if(s.cycle==='initial'){
    s.mode='flash';s.index=0;s.flashUnknown=new Set();
    const known=s.all.filter(x=>s.known.has(x.id));const weak=s.all.filter(x=>s.remaining.has(x.id));
    s.queue=[...known,...weak];
  }else if(s.cycle==='target'){
    if(s.remaining.size===0){beginVerifyFlash()}else{ s.mode='flash';s.index=0;s.queue=s.all.filter(x=>s.remaining.has(x.id));s.flashUnknown=new Set(); }
  }else{
    if(s.remaining.size===0){completeFoundationSession()}else{ s.cycle='target';s.round++;s.mode='flash';s.index=0;s.queue=s.all.filter(x=>s.remaining.has(x.id));s.flashUnknown=new Set(); }
  }
  renderFoundationStudy();
}

function renderFoundationFlashcard(lesson){
  const s=foundationUI.session;
  if(s.index>=s.queue.length){finishFlashPhase();return}
  const item=s.queue[s.index], [phase,desc]=phaseCopy();
  main.innerHTML=`
    <div class="study-session-head"><button class="foundation-inline-back danger-link" data-exit-study type="button">✕ Thoát</button><span>${s.index+1}/${s.queue.length}</span></div>
    <div class="phase-strip"><strong>${phase}</strong><span>${desc}</span></div>
    <section class="flash-card" data-flip-card>
      <div class="flash-front">${flashFront(item)}<span class="flip-hint">Chạm để lật</span></div>
      <div class="flash-back hidden-card">${flashBack(item)}</div>
    </section>
    <div class="flash-actions">
      <button class="secondary-btn bad" data-flash="no" type="button">Chưa thuộc</button>
      <button class="primary-btn good" data-flash="yes" type="button">Thuộc</button>
    </div>
    <p class="flash-note">Đừng bấm “Thuộc” chỉ vì vừa nhìn thấy đáp án. Chỉ bấm khi bạn tự nhớ ra trước khi lật.</p>
  `;
  document.querySelector('[data-exit-study]').addEventListener('click',exitFoundationStudy);
  document.querySelector('[data-flip-card]').addEventListener('click',e=>{document.querySelector('.flash-front').classList.toggle('hidden-card');document.querySelector('.flash-back').classList.toggle('hidden-card')});
  document.querySelectorAll('[data-flash]').forEach(b=>b.addEventListener('click',()=>markFlash(b.dataset.flash==='yes')));
  document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();speakJapanese(b.dataset.speak)}));
}

function flashFront(item){
  if(foundationUI.type==='vocab') return `<p class="section-kicker">TỪ VỰNG</p><div class="flash-main">${escapeText(item.term)}</div><div class="flash-reading">${escapeText(item.reading||'')}</div><button class="audio-inline" data-speak="${escapeText(item.reading||item.term)}" type="button">🔊 Nghe</button>`;
  if(foundationUI.type==='kanji') return `<p class="section-kicker">KANJI</p><div class="flash-main kanji-big">${escapeText(item.char)}</div><button class="audio-inline" data-speak="${escapeText(item.char)}" type="button">🔊 Nghe</button>`;
  return `<p class="section-kicker">NGỮ PHÁP</p><div class="flash-main grammar-big">${escapeText(item.pattern)}</div>`;
}
function flashBack(item){
  if(foundationUI.type==='vocab') return `<p class="section-kicker">ĐÁP ÁN</p><div class="flash-answer">${escapeText(item.meaning)}</div><div class="flash-reading">${escapeText(item.term)} · ${escapeText(item.reading||'')}</div>`;
  if(foundationUI.type==='kanji') return `<p class="section-kicker">ĐÁP ÁN</p><div class="flash-answer">${escapeText(item.hanViet||item.meaning||'')}</div><div class="flash-reading">On: ${escapeText(item.on||'—')}</div><div class="flash-reading">Kun: ${escapeText(item.kun||'—')}</div><p>${escapeText(item.meaning||'')}</p>`;
  return `<p class="section-kicker">Ý NGHĨA</p><div class="flash-answer">${escapeText(item.meaning)}</div><p>Ngữ pháp sẽ kiểm tra hai chiều ở quiz: nhận diện mẫu và chọn lại mẫu từ nghĩa.</p>`;
}

function markFlash(knows){
  const s=foundationUI.session,item=s.queue[s.index];
  const wasWeak=s.remaining.has(item.id);
  if(knows){
    s.known.add(item.id);
    // A self-rating must not let a weak item escape the next quiz.
    // Only an actual correct quiz answer removes an already-weak item.
    if(!wasWeak && s.cycle!=='verify') s.remaining.delete(item.id);
  }else{
    s.remaining.add(item.id);s.known.delete(item.id);s.flashUnknown.add(item.id);
  }
  s.index++;renderFoundationStudy();
}

function finishFlashPhase(){
  const s=foundationUI.session;
  if(s.cycle==='initial'){
    if(s.remaining.size===0) beginVerifyFlash();
    else {s.cycle='target';s.round=1;s.mode='quiz';s.index=0;s.quizErrors=new Set();s.queue=s.all.filter(x=>s.remaining.has(x.id));}
  }else if(s.cycle==='target'){
    if(s.remaining.size===0) beginVerifyFlash();
    else {s.mode='quiz';s.index=0;s.quizErrors=new Set();s.queue=s.all.filter(x=>s.remaining.has(x.id));}
  }else{
    // verify flash always followed by a full quiz; items marked unknown already remain in set
    s.mode='quiz';s.index=0;s.quizErrors=new Set();s.queue=s.all.slice();
  }
  renderFoundationStudy();
}

function beginVerifyFlash(){
  const s=foundationUI.session;
  s.cycle='verify';s.mode='flash';s.index=0;s.remaining=new Set();s.flashUnknown=new Set();s.queue=s.all.slice();
}

function completeFoundationSession(){
  const s=foundationUI.session;
  s.mode='complete';
  const progress=loadFoundationProgress();
  const key=progressKey(state.level,foundationUI.type,foundationUI.lessonId);
  const old=progress[key]||{};
  progress[key]={mastered:true,completedAt:new Date().toISOString(),attempts:(old.attempts||0)+1,totalAnswers:s.totalAnswers,correctAnswers:s.correctAnswers};
  saveFoundationProgress(progress);
}

function renderFoundationComplete(lesson){
  const s=foundationUI.session;
  const accuracy=s.totalAnswers?Math.round(s.correctAnswers/s.totalAnswers*100):100;
  main.innerHTML=`
    <section class="complete-card"><div class="complete-mark">✓</div><p class="section-kicker">HOÀN THÀNH</p><h2>${escapeText(lesson.label)}</h2><p>Bạn đã đi hết vòng ôn và vượt qua kiểm tra toàn bài với <strong>0 câu sai ở vòng cuối</strong>.</p><div class="complete-stats"><div><b>${lesson.items.length}</b><span>mục</span></div><div><b>${s.round}</b><span>vòng sửa lỗi</span></div><div><b>${accuracy}%</b><span>đúng toàn phiên</span></div></div></section>
    <div class="complete-actions"><button class="secondary-btn" data-complete-list type="button">Về danh sách</button><button class="primary-btn" data-complete-again type="button">Học lại</button></div>
  `;
  document.querySelector('[data-complete-list]').addEventListener('click',()=>{foundationUI.session=null;foundationUI.view='category';foundationUI.tab='study';renderFoundation()});
  document.querySelector('[data-complete-again]').addEventListener('click',()=>startFoundationSession(lesson.id));
}

function exitFoundationStudy(){
  stopFoundationTimer();
  foundationUI.session=null;foundationUI.view='category';foundationUI.tab='study';renderFoundation();
}