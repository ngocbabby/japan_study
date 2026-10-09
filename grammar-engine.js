// Grammar-specific study experience. Loaded after foundation-study.js.
(function(){
  const baseRenderKnowledgeRow = renderKnowledgeRow;
  const baseRenderLessonPicker = renderLessonPicker;
  const basePhaseCopy = phaseCopy;
  const baseBuildQuestion = buildFoundationQuestion;
  const baseFlashBack = flashBack;
  const baseRenderQuiz = renderFoundationQuiz;

  renderKnowledgeRow = function(item,i){
    if(foundationUI.type!=='grammar') return baseRenderKnowledgeRow(item,i);
    return `<article class="knowledge-row grammar-row">
      <div class="knowledge-index">${item.n}</div>
      <div class="knowledge-main grammar-knowledge">
        <strong class="grammar-pattern">${escapeText(item.pattern)}</strong>
        <p class="grammar-meaning">${escapeText(item.meaning)}</p>
        ${item.exampleJp?`<div class="grammar-example">
          <span class="grammar-example-label">例</span>
          <div class="grammar-example-copy"><strong>${escapeText(item.exampleJp)}</strong>${item.exampleVi?`<p>${escapeText(item.exampleVi)}</p>`:''}</div>
          <button class="audio-btn compact" data-speak="${escapeText(item.exampleJp)}" type="button" aria-label="Nghe ví dụ">🔊</button>
        </div>`:''}
        ${item.note?`<div class="grammar-note"><strong>Ghi chú:</strong> ${escapeText(item.note)}</div>`:''}
        ${item.sourcePage?`<span class="source-page">Tài liệu · trang ${item.sourcePage}</span>`:''}
      </div>
    </article>`;
  };

  renderLessonPicker = function(lessons){
    if(foundationUI.type!=='grammar') return baseRenderLessonPicker(lessons);
    return `
      <section class="hero compact-hero">
        <div class="hero-grid">
          <div>
            <strong>Ngữ pháp không học kiểu chỉ nhớ nghĩa</strong>
            <p>App trộn 3 dạng: mẫu → nghĩa, nghĩa → mẫu và ngữ cảnh tiếng Việt → chọn mẫu. Câu sai sẽ đổi dạng khi quay lại.</p>
          </div>
          <div class="hero-stat"><b>${lessons.length}</b><span>bài</span></div>
        </div>
      </section>
      <div class="grammar-method">
        <div><b>G1</b><span>Nhận diện</span><small>Mẫu → nghĩa</small></div>
        <div><b>G2</b><span>Gọi lại</span><small>Nghĩa → mẫu</small></div>
        <div><b>G3</b><span>Áp dụng</span><small>Ngữ cảnh → mẫu</small></div>
      </div>
      <div class="section-head"><div><p class="section-kicker">HỌC BÀI</p><h2>Chọn bài</h2></div></div>
      <section class="lesson-list">
        ${lessons.map(lesson=>{
          const pct=lessonProgress(state.level,foundationUI.type,lesson.id);
          return `<article class="study-pick-card"><div><strong>${escapeText(lesson.label)}</strong><p>${lesson.items.length} mẫu · ${pct===100?'đã hoàn thành':'chưa hoàn thành'}</p></div><button class="primary-btn" data-start-foundation="${lesson.id}" type="button">${pct===100?'Học lại':'Bắt đầu'}</button></article>`;
        }).join('')}
      </section>`;
  };

  phaseCopy = function(){
    if(foundationUI.type!=='grammar') return basePhaseCopy();
    const s=foundationUI.session;
    if(s.cycle==='initial'&&s.mode==='quiz') return ['G1 · Kiểm tra đầu vào','Trộn 3 dạng câu hỏi · không quay lại'];
    if(s.cycle==='initial'&&s.mode==='flash') return ['G2 · Hiểu mẫu','Đã đúng trước → mẫu còn yếu sau'];
    if(s.cycle==='target'&&s.mode==='quiz') return [`G3 · Vòng ${s.round} câu yếu`,'Đổi hướng hỏi để tránh nhớ đáp án máy móc'];
    if(s.cycle==='target'&&s.mode==='flash') return [`G4 · Giải thích lại mẫu yếu`,'Nghĩa + ví dụ + ghi chú từ tài liệu'];
    if(s.cycle==='verify'&&s.mode==='flash') return ['G5 · Rà toàn bài','Tự nói cách dùng trước khi lật'];
    return ['G6 · Kiểm tra hỗn hợp','Phải 0 câu sai mới hoàn thành'];
  };

  function grammarQuestionMode(item,index){
    const s=foundationUI.session||{cycle:'initial',round:1};
    const offset=s.cycle==='verify'?2:s.cycle==='target'?(s.round%3):0;
    return ((Number(item.n)||0)+index+offset)%3;
  }

  buildFoundationQuestion = function(item,index){
    if(foundationUI.type!=='grammar') return baseBuildQuestion(item,index);
    const all=foundationAllItems(state.level,'grammar');
    const mode=grammarQuestionMode(item,index);

    if(mode===0){
      const correct=item.meaning;
      const pool=all.filter(x=>x.id!==item.id).map(x=>x.meaning).filter(Boolean);
      const options=makeOptions(correct,pool);
      return {
        kicker:'MẪU → NGHĨA',
        prompt:item.pattern,
        sub:'Nhận diện chức năng/cách dùng của mẫu',
        speak:item.exampleJp||'',
        seconds:10,
        options,
        correctIndex:options.indexOf(correct)
      };
    }

    if(mode===1 || !item.exampleVi){
      const correct=item.pattern;
      const pool=all.filter(x=>x.id!==item.id).map(x=>x.pattern).filter(Boolean);
      const options=makeOptions(correct,pool);
      return {
        kicker:'NGHĨA → MẪU',
        prompt:item.meaning,
        sub:'Tự gọi lại mẫu trong đầu trước khi chạm đáp án',
        speak:'',
        seconds:12,
        options,
        correctIndex:options.indexOf(correct)
      };
    }

    const correct=item.pattern;
    const pool=all.filter(x=>x.id!==item.id).map(x=>x.pattern).filter(Boolean);
    const options=makeOptions(correct,pool);
    return {
      kicker:'NGỮ CẢNH → MẪU',
      prompt:item.exampleVi,
      sub:'Chọn mẫu dùng trong câu ví dụ Nhật tương ứng',
      speak:item.exampleJp||'',
      seconds:15,
      options,
      correctIndex:options.indexOf(correct)
    };
  };

  renderFoundationQuiz = function(lesson){
    if(foundationUI.type!=='grammar') return baseRenderQuiz(lesson);
    const s=foundationUI.session;
    if(s.index>=s.queue.length){finishQuizPhase();return}
    const item=s.queue[s.index];
    const [phase,desc]=phaseCopy();
    const q=buildFoundationQuestion(item,s.index);
    const seconds=q.seconds||12;

    main.innerHTML=`
      <div class="study-session-head"><button class="foundation-inline-back danger-link" data-exit-study type="button">✕ Thoát</button><span>${s.index+1}/${s.queue.length}</span></div>
      <div class="phase-strip"><strong>${phase}</strong><span>${desc}</span></div>
      <div class="timer-track"><span id="foundationTimerBar"></span></div>
      <div class="timer-line"><strong id="foundationTimerText">${seconds}.0s</strong><span>Sai/hết giờ → đưa lại vào vòng ôn</span></div>
      <section class="quiz-card grammar-quiz-card">
        <p class="section-kicker">${q.kicker}</p>
        <div class="quiz-prompt">${escapeText(q.prompt)}</div>
        ${q.sub?`<div class="quiz-sub">${escapeText(q.sub)}</div>`:''}
        ${q.speak?`<button class="audio-inline" data-speak="${escapeText(q.speak)}" type="button">🔊 Nghe câu ví dụ</button>`:''}
      </section>
      <section class="answer-grid">${q.options.map((x,i)=>`<button class="answer-btn" data-answer-index="${i}" type="button">${escapeText(x)}</button>`).join('')}</section>
      <div id="answerFeedback" class="answer-feedback"></div>
    `;

    document.querySelector('[data-exit-study]').addEventListener('click',exitFoundationStudy);
    const audio=document.querySelector('[data-speak]');
    if(audio) audio.addEventListener('click',()=>speakJapanese(audio.dataset.speak));
    document.querySelectorAll('[data-answer-index]').forEach(b=>b.addEventListener('click',()=>answerFoundationQuestion(Number(b.dataset.answerIndex),q.correctIndex)));
    startQuestionTimer(seconds,()=>answerFoundationQuestion(-1,q.correctIndex,true));
  };

  flashBack = function(item){
    if(foundationUI.type!=='grammar') return baseFlashBack(item);
    return `<p class="section-kicker">CÁCH DÙNG</p>
      <div class="flash-answer">${escapeText(item.meaning)}</div>
      ${item.note?`<div class="grammar-note flash-grammar-note"><strong>Ghi chú:</strong> ${escapeText(item.note)}</div>`:''}
      ${item.exampleJp?`<div class="grammar-example flash-example">
        <span class="grammar-example-label">例</span>
        <div class="grammar-example-copy"><strong>${escapeText(item.exampleJp)}</strong>${item.exampleVi?`<p>${escapeText(item.exampleVi)}</p>`:''}</div>
        <button class="audio-btn compact" data-speak="${escapeText(item.exampleJp)}" type="button" aria-label="Nghe ví dụ">🔊</button>
      </div>`:''}
      <p class="grammar-study-rule">Khi học flashcard, tự nói: “mẫu này dùng khi nào?” trước khi lật.</p>`;
  };
})();