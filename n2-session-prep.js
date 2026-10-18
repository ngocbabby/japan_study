/* N2 pre-class desk: sourced from the 55-session KOSEI outline and the app's existing datasets. */
(function(){
  function esc(value){return n2PlanEscape(String(value == null ? '' : value));}
  function getLesson(type,id){
    var set=n2Lessons(type);
    return set.find(function(x){return x.id===id;})||null;
  }
  function action(text){
    var link=n2PlanMatch(text);
    if(!link)return '';
    var lesson=getLesson(link.type,link.id);
    if(!lesson || !lesson.items || !lesson.items.length)return '';
    return '<button type="button" class="n2prep-link" data-n2prep-open="'+esc(link.type)+'" data-n2prep-id="'+esc(link.id)+'" data-n2prep-mode="detail">Mở bài →</button>';
  }
  function checklist(items,number,p){
    if(!items.length)return '<p class="n2prep-muted">Không có mục nào trong lộ trình.</p>';
    return items.map(function(value,i){
      var id=value.kind+':'+number+':'+i;
      var txt=value.text;
      var note='';
      if(!n2PlanMatch(txt)){
        if(/Nghe|聴解|問題/.test(txt))note='Audio gốc chưa được tích hợp vào app; luyện bằng giáo trình/nghe của lớp.';
        else if(/Đọc|読解|練習/.test(txt))note='Đối chiếu bài luyện tập trong sách Đọc hiểu N2.';
      }
      return '<div class="n2prep-task"><label><input type="checkbox" data-n2prep-mark="'+esc(id)+'" '+(p.done[id]?'checked':'')+'><span>'+esc(txt)+(note?'<small>'+esc(note)+'</small>':'')+'</span></label>'+action(txt)+'</div>';
    }).join('');
  }
  function openLesson(type,id,mode){
    var lesson=getLesson(type,id);
    if(!lesson || !lesson.items || !lesson.items.length){
      alert('Bài này chưa có đủ nội dung để mở. Xem giáo trình gốc.');return;
    }
    n2UI.type=type;
    n2UI.lessonId=id;
    if(mode==='study')startN2Session(id);
    else {n2UI.view='detail';renderN2();}
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function launchButtons(type,lesson){
    if(!lesson || !lesson.items || !lesson.items.length)return '';
    return '<div class="n2prep-buttons"><button type="button" class="primary-btn" data-n2prep-open="'+type+'" data-n2prep-id="'+esc(lesson.id)+'" data-n2prep-mode="detail">Xem toàn bài →</button>'+
     '<button type="button" class="secondary-btn" data-n2prep-open="'+type+'" data-n2prep-id="'+esc(lesson.id)+'" data-n2prep-mode="study">Luyện flashcard / quiz →</button></div>';
  }
  function sessionInfo(){
    var p=n2PlanLoad();
    var upcoming=n2PlanSessions(p,n2PlanToday(),45);
    var num=Number(n2UI.prepSession)||Number(upcoming[0] && upcoming[0].session)||9;
    var lesson=window.N2_CLASS_SOURCE.lessons.find(function(l){return l.number===num;});
    var scheduled=upcoming.find(function(x){return x.session===num;});
    var date=scheduled ? scheduled.date : (num===9?'2026-10-19':'');
    return {p:p,number:num,lesson:lesson,date:date};
  }
  window.renderN2SessionPrep=function(){
    var ctx=sessionInfo(),p=ctx.p,number=ctx.number,lesson=ctx.lesson;
    if(!lesson){n2UI.view='planner';renderN2();return;}
    title.textContent='N2 · Chuẩn bị Buổi '+number;
    var prev=window.N2_CLASS_SOURCE.lessons[number-2]||{homework:[],number:number-1};
    var items=lesson.contents.map(function(text){return {text:text,kind:'learn'};});
    var prevItems=prev.homework.map(function(text){return {text:text,kind:'hw'};});
    var countAll=items.length+prevItems.length;
    var countDone=items.filter(function(x,i){return p.done['learn:'+number+':'+i];}).length+
      prevItems.filter(function(x,i){return p.done['hw:'+prev.number+':'+i];}).length;
    var grammarName=lesson.contents.find(function(s){return /Ngữ\s*pháp\s*B/i.test(s);});
    var grammarRef=grammarName?n2PlanMatch(grammarName):null;
    var grammar=grammarRef?getLesson('grammar',grammarRef.id):null;
    var vocabName=lesson.contents.find(function(s){return /^Từ vựng\s*\d/.test(s);});
    var vocabRef=vocabName?n2PlanMatch(vocabName):null;
    var vocab=vocabRef?getLesson('vocab',vocabRef.id):null;
    var kanjiName=lesson.contents.find(function(s){return /Kanji|週\d/i.test(s);});
    var kanjiRef=kanjiName?n2PlanMatch(kanjiName):null;
    var kanji=kanjiRef?getLesson('kanji',kanjiRef.id):null;
    var listen=lesson.contents.filter(function(s){return /Nghe|聴解|問題/.test(s);});
    var dateString=ctx.date?ctx.date.split('-').reverse().join('/'):'Theo lộ trình (chưa gắn ngày)';
    var grammarRows=grammar?.items?.map(function(g){
      return '<article class="n2prep-grammar-line"><strong>'+esc(g.pattern)+'</strong><p>'+esc(g.meaning)+'</p>'+
       (g.example?'<p class="n2prep-japanese" lang="ja">'+esc(g.example)+'</p>':'')+
       (g.exampleReading?'<small>'+esc(g.exampleReading)+'</small>':'')+
       (g.exampleVi?'<p class="n2prep-translation">'+esc(g.exampleVi)+'</p>':'')+'</article>';
    }).join('')||'';
    var vocabRows=vocab?.items?.map(function(w){
      return '<div class="n2prep-word"><span class="n2prep-no">'+esc(w.n)+'</span><span><strong lang="ja">'+esc(w.term)+'</strong><small>'+esc(w.reading)+'</small><span>'+esc(w.meaning)+'</span></span><button type="button" class="n2prep-sound" data-n2prep-speak="'+esc(w.term)+'" aria-label="Nghe từ '+esc(w.term)+'">🔊</button></div>';
    }).join('')||'';
    var kanjiRows=kanji?.items?.map(function(k){
      var examples=(k.wordEntries||[]).slice(0,2).map(function(w){return esc(w.term)+'（'+esc(w.reading)+'）';}).join(' · ');
      return '<div class="n2prep-kanji-line"><b lang="ja">'+esc(k.char)+'</b><span><strong>'+esc(k.hanViet||k.meaning)+'</strong><small>'+esc(k.reading)+'</small><span>'+examples+'</span></span></div>';
    }).join('')||'';
    var html='<button type="button" class="foundation-inline-back" id="n2prep-back">← N2</button>'+
      '<div class="n2prep-shell"><section class="n2prep-hero"><span class="n2prep-overline">LỘ TRÌNH KOSEI 55 BUỔI · DỰ KIẾN</span>'+
      '<h2>📚 Bàn học Buổi '+number+'</h2><p>'+esc(dateString)+' · 21:00–23:00 (Nhật Bản)</p>'+
      '<div class="n2prep-progress"><span>'+countDone+'/'+countAll+' mục đã chuẩn bị</span><progress max="'+countAll+'" value="'+countDone+'"></progress></div>'+
      '<small>Tiến độ dựa trên mốc học và ngày nghỉ đã nhập; giáo viên có thể điều chỉnh nội dung.</small></section>'+
      '<div class="n2prep-quicknav"><a href="#n2prep-before">Cần làm</a><a href="#n2prep-grammar">Ngữ pháp</a><a href="#n2prep-vocab">Từ vựng</a><a href="#n2prep-kanji">Kanji</a><a href="#n2prep-listen">Nghe</a></div>'+
      '<section class="n2prep-panel" id="n2prep-before"><h3>✅ Việc phải chuẩn bị trước giờ học</h3>'+
      '<p class="n2prep-muted">Tích khi thực sự đã học/làm xong. Dấu tích được đồng bộ với mục “Lịch học & ưu tiên” trên cùng thiết bị.</p>'+
      '<h4>1. Xong bài tập từ Buổi '+prev.number+'</h4>'+checklist(prevItems,prev.number,p)+
      '<h4>2. Xem trước Buổi '+number+'</h4>'+checklist(items,number,p)+'</section>';
    if(grammar){
      html+='<section class="n2prep-panel" id="n2prep-grammar"><div class="n2prep-head"><div><span>01 · NGỮ PHÁP</span><h3>'+esc(grammar.label)+'</h3></div><b>'+grammar.items.length+' mẫu</b></div>'+
        '<p class="n2prep-muted">Đọc nghĩa và câu ví dụ trước, sau đó dùng nút luyện flashcard/quiz.</p>'+
        grammarRows+launchButtons('grammar',grammar)+'</section>';
    }else html+='<section class="n2prep-panel" id="n2prep-grammar"><h3>Ngữ pháp</h3><p class="n2prep-muted">Buổi này không có bài ngữ pháp riêng trong lộ trình.</p></section>';
    if(vocab){
      html+='<section class="n2prep-panel" id="n2prep-vocab"><div class="n2prep-head"><div><span>02 · TỪ VỰNG</span><h3>Mimikara '+esc(vocab.from)+'–'+esc(vocab.to)+'</h3></div><b>'+vocab.items.length+' từ</b></div>'+
       '<p class="n2prep-muted">Ưu tiên đọc tiếng Nhật trước rồi đoán nghĩa, không chỉ nhìn bản dịch.</p>'+
       launchButtons('vocab',vocab)+'<details class="n2prep-expand"><summary>Xem toàn bộ '+vocab.items.length+' từ trong app</summary><div class="n2prep-words">'+vocabRows+'</div></details></section>';
    }else html+='<section class="n2prep-panel" id="n2prep-vocab"><h3>Từ vựng</h3><p>Buổi này không có từ vựng mới trong lộ trình.</p></section>';
    if(kanji){
      html+='<section class="n2prep-panel" id="n2prep-kanji"><div class="n2prep-head"><div><span>03 · KANJI</span><h3>'+esc(kanji.label)+'</h3></div><b>'+kanji.items.length+' chữ</b></div>'+
        '<p class="n2prep-muted">'+esc(kanji.topicVi||kanji.topic||'Soumatome N2')+'</p>'+
        launchButtons('kanji',kanji)+'<details class="n2prep-expand"><summary>Xem '+kanji.items.length+' chữ và từ ghép</summary><div>'+kanjiRows+'</div></details></section>';
    }else html+='<section class="n2prep-panel" id="n2prep-kanji"><h3>Kanji</h3><p>Không có buổi Kanji riêng trong lộ trình.</p></section>';
    html+='<section class="n2prep-panel" id="n2prep-listen"><div class="n2prep-head"><div><span>04 · NGHE HIỂU</span><h3>'+esc(listen.join(' · ')||'Nghe hiểu theo giáo trình')+'</h3></div></div>'+
     '<p>Chuẩn bị sách <strong>Shin Kanzen Master N2 Choukai</strong>. Mở đúng bài '+esc(listen.join(' · ')||'giáo viên hướng dẫn')+' và nghe bằng audio của sách/lớp.</p>'+
     '<p class="n2prep-note">App hiện chưa có tệp âm thanh bài này. Không dùng giọng đọc tự động thay cho audio nghe hiểu gốc.</p></section>'+
     '<section class="n2prep-panel"><h3>📌 Bài tập dự kiến sau Buổi '+number+'</h3>'+
     '<p class="n2prep-muted">Chỉ là mục “Bài tập về nhà” trong lộ trình KOSEI, chưa xác nhận thầy đã giao tối nay.</p>'+
     (lesson.homework.length?lesson.homework.map(function(h){return '<div class="n2prep-after"><span>• '+esc(h)+'</span>'+action(h)+'</div>';}).join(''):'<p>Chưa có bài tập ghi trong lộ trình.</p>')+'</section>'+
     '<div class="n2prep-footer"><button type="button" class="secondary-btn" id="n2prep-to-plan">Xem toàn bộ lịch 55 buổi →</button></div></div>';
    main.innerHTML=html;
    document.querySelector('#n2prep-back')?.addEventListener('click',function(){n2UI.view='root';renderN2();});
    document.querySelector('#n2prep-to-plan')?.addEventListener('click',function(){n2UI.view='planner';renderN2();});
    document.querySelectorAll('[data-n2prep-open]').forEach(function(btn){btn.addEventListener('click',function(){openLesson(btn.dataset.n2prepOpen,btn.dataset.n2prepId,btn.dataset.n2prepMode);});});
    document.querySelectorAll('[data-n2prep-mark]').forEach(function(box){box.addEventListener('change',function(){
      var current=n2PlanLoad();
      if(box.checked)current.done[box.dataset.n2prepMark]=new Date().toISOString();
      else delete current.done[box.dataset.n2prepMark];
      n2PlanSave(current);renderN2SessionPrep();
    });});
    document.querySelectorAll('[data-n2prep-speak]').forEach(function(btn){btn.addEventListener('click',function(){speakJapanese(btn.dataset.n2prepSpeak);});});
  };
})();
