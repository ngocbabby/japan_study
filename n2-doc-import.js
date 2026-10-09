/* N2 free local document importer. */
const n2DocUI={view:'list',id:null,tab:'vocab',practice:null,index:0,lock:false};
const N2_DOC_STORE='japanStudy:n2:doc-import:v1';
function n2DocAll(){try{return JSON.parse(localStorage.getItem(N2_DOC_STORE)||'[]')}catch{return []}}
function n2DocStore(docs){localStorage.setItem(N2_DOC_STORE,JSON.stringify(docs.slice(0,7)))}
function n2DocCurrent(){return n2DocAll().find(d=>d.id===n2DocUI.id)}
function n2DocEsc(x){return N2DocCore.html(x)}
function renderN2Documents(){
  title.textContent='N2 · Học từ tài liệu';
  if(n2DocUI.view==='upload')return n2DocUpload();
  if(n2DocUI.view==='detail')return n2DocDetail();
  if(n2DocUI.view==='quiz')return n2DocQuiz();
  const docs=n2DocAll();
  main.innerHTML='<button class="foundation-inline-back" id="docHome">← N2</button>'+
    '<section class="hero n2-hero"><strong>📑 Học nhanh từ tài liệu</strong><p>Nhập PDF hoặc Word, lấy từ N2, xem đáp án trước rồi tự luyện lại.</p></section>'+
    '<button class="primary-btn" id="docNew">＋ Thêm PDF / DOCX</button>'+
    '<p class="n2-doc-hint">Chạy trên điện thoại, không dùng API AI trả phí. Đáp án không có trong file sẽ được đánh dấu chưa xác minh.</p>'+
    '<section class="lesson-list">'+docs.map(d=>'<button class="lesson-card" data-doc="'+n2DocEsc(d.id)+'"><h3>'+n2DocEsc(d.title)+'</h3><p>'+d.words.length+' từ N2 · '+d.questions.length+' câu hỏi</p></button>').join('')+'</section>';
  document.querySelector('#docHome').onclick=()=>{n2UI.view='root';renderN2()};
  document.querySelector('#docNew').onclick=()=>{n2DocUI.view='upload';renderN2Documents()};
  document.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>{n2DocUI.id=b.dataset.doc;n2DocUI.tab='vocab';n2DocUI.view='detail';renderN2Documents()});
}
function n2DocUpload(){
 main.innerHTML='<button class="foundation-inline-back" id="docBack">← Tài liệu</button>'+
 '<section class="hero n2-hero"><strong>📎 Thêm tài liệu N2</strong><p>PDF có chữ, DOCX hoặc dán nội dung. File xử lý tại máy của bạn.</p></section>'+
 '<section class="n2-doc-panel"><label>File PDF / DOCX (tối đa 10 MB)<input type="file" accept=".pdf,.docx,.doc" id="docFile"></label>'+
 '<label>Hoặc dán bài tập<textarea id="docPaste" rows="5" placeholder="Dán văn bản tiếng Nhật..."></textarea></label>'+
 '<label><input id="docOcr" type="checkbox"> Thử OCR tiếng Nhật nếu PDF là ảnh scan (chậm)</label>'+
 '<button class="primary-btn" id="docAnalyze">✨ Phân tích miễn phí</button><p id="docStatus" role="status"></p></section>';
 document.querySelector('#docBack').onclick=()=>{n2DocUI.view='list';renderN2Documents()};
 document.querySelector('#docAnalyze').onclick=n2DocAnalyze;
}
async function n2DocLibrary(url,ready){
 if(ready())return;
 await new Promise((done,fail)=>{
  const t=document.createElement('script');t.src=url;t.onload=done;t.onerror=()=>fail(Error('Không tải được bộ đọc file. Kiểm tra mạng.'));document.head.append(t);
 });
 if(!ready())throw Error('Trình duyệt không hỗ trợ thư viện này.');
}
async function n2DocAnalyze(){
 const file=document.querySelector('#docFile').files[0],paste=document.querySelector('#docPaste').value.trim(),status=document.querySelector('#docStatus'),btn=document.querySelector('#docAnalyze');
 btn.disabled=true;
 try{
  let extracted=paste,name='Bài tập tự dán',kind='text',pageRange='',ocr=false;
  if(file){
   if(file.size>10*1024*1024)throw Error('File quá 10 MB. Hãy chia nhỏ.');
   name=file.name;kind=name.split('.').pop().toLowerCase();
   if(kind==='doc')throw Error('Định dạng .doc cũ: hãy lưu lại thành .docx.');
   if(kind==='docx'){
    status.textContent='Đang đọc Word...';
    await n2DocLibrary('https://cdn.jsdelivr.net/npm/mammoth@1.9.1/mammoth.browser.min.js',()=>!!window.mammoth);
    extracted=(await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;
   }else if(kind==='pdf'){
    await n2DocLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
    const pages=Math.min(pdf.numPages,25);pageRange='1–'+pages+'/'+pdf.numPages;
    const scans=[];
    extracted='';
    for(let i=1;i<=pages;i++){
     status.textContent='Đang trích trang '+i+'/'+pages;
     const pg=await pdf.getPage(i),c=await pg.getTextContent();
     const t=c.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('').trim();
     extracted+='\n'+t;if(t.length<35)scans.push(i);
     if(extracted.length>55000)break;
    }
    if(scans.length&&document.querySelector('#docOcr').checked){
      ocr=true;
      await n2DocLibrary('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',()=>!!window.Tesseract);
      const worker=await window.Tesseract.createWorker('jpn',1);
      try{
       for(const p of scans.slice(0,6)){
        status.textContent='OCR trang '+p+' (tối đa 6 trang scan/lần)';
        const pg=await pdf.getPage(p),vp=pg.getViewport({scale:1.5}),canvas=document.createElement('canvas');
        canvas.width=vp.width;canvas.height=vp.height;
        await pg.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
        extracted+='\n'+(await worker.recognize(canvas)).data.text;
       }
      }finally{await worker.terminate()}
    }
    if(extracted.trim().length<45&&!ocr)throw Error('PDF này là ảnh scan. Bật OCR hoặc dán nội dung.');
   }else throw Error('Chỉ nhận PDF và DOCX.');
  }
  const d=N2DocCore.buildDocument({name,text:extracted,kind,pageRange,ocr});
  if(!d.words.length&&!d.questions.length)throw Error('Không thấy từ N2 hoặc câu trắc nghiệm 4 lựa chọn. Hãy kiểm tra bản trích xuất.');
  n2DocStore([d,...n2DocAll()]);n2DocUI.id=d.id;n2DocUI.view='detail';renderN2Documents();
 }catch(e){status.textContent='⚠️ '+(e.message||String(e))}
 finally{btn.disabled=false}
}
function n2DocDetail(){
 const d=n2DocCurrent();if(!d){n2DocUI.view='list';return renderN2Documents()}
 const verified=d.questions.filter(q=>q.answerIndex!==null).length;
 main.innerHTML='<button class="foundation-inline-back" id="docBack">← Tài liệu</button>'+
 '<section class="hero n2-hero"><strong>'+n2DocEsc(d.title)+'</strong><p>'+d.words.length+' từ N2 · '+verified+'/'+d.questions.length+' câu đã có đáp án</p></section>'+
 '<div class="n2-doc-tabs"><button data-tab="vocab">📚 Học từ trước</button><button data-tab="solutions">👁 Xem lời giải trước</button><button data-tab="practice">🧠 Tự làm lại</button></div>'+
 '<div class="n2-doc-panel" id="docBody"></div><button class="secondary-btn" id="docDelete">🗑 Xóa tài liệu</button>';
 document.querySelector('#docBack').onclick=()=>{n2DocUI.view='list';renderN2Documents()};
 document.querySelector('#docDelete').onclick=()=>{if(confirm('Xóa tài liệu và kết quả học?')){n2DocStore(n2DocAll().filter(x=>x.id!==d.id));n2DocUI.view='list';renderN2Documents()}};
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{n2DocUI.tab=b.dataset.tab;n2DocDetailContent(d)});
 n2DocDetailContent(d);
}
function n2DocDetailContent(d){
 const body=document.querySelector('#docBody');
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===n2DocUI.tab));
 if(n2DocUI.tab==='practice'){
  body.innerHTML='<h3>Luyện tập ngay</h3><p>Có thể xem đáp án ở bước trước, sau đó làm lại mà không xem trước đáp án.</p>'+
  '<button class="primary-btn" data-quiz="vocab">Quiz nghĩa từ vựng</button> <button class="secondary-btn" data-quiz="cloze">Điền từ theo đoạn</button> <button class="secondary-btn" data-quiz="paper">Làm lại câu trong PDF</button>'+
  '<p class="n2-doc-hint">Câu trong PDF chỉ được chấm khi có đáp án rõ ràng hoặc bạn nhập đáp án.</p>';
  document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>n2DocStart(b.dataset.quiz));return;
 }
 if(n2DocUI.tab==='vocab'){
  body.innerHTML='<h3>⚡ Từ cần học trước</h3><p>Ưu tiên những từ xuất hiện nhiều. Bấm 🔊 để nghe.</p>'+
   '<div class="n2-doc-words">'+d.words.map(w=>'<article class="n2-doc-word"><div><strong>'+n2DocEsc(w.term)+'</strong> <small>'+n2DocEsc(w.reading)+'</small><p>'+n2DocEsc(w.meaning)+'</p></div><button type="button" data-say="'+n2DocEsc(w.reading)+'">🔊</button></article>').join('')+'</div>';
  document.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speakJapanese(b.dataset.say));return;
 }
 body.innerHTML='<h3>👁 Xem trước lời giải rồi tự nhớ</h3>'+
 (d.questions.length?d.questions.map((q,i)=>'<article class="n2-doc-paper"><h4>Câu '+q.number+': '+n2DocEsc(q.question)+'</h4>'+q.options.map((o,j)=>'<p>'+(j+1)+'. '+n2DocEsc(o.text)+'</p>').join('')+
 '<button data-reveal="'+i+'">👁 Hiện lời giải</button><div class="n2-doc-answer" id="answer-'+i+'" hidden>'+
 (q.answerIndex===null?'<p>⚠️ Tài liệu chưa có đáp án xác minh.</p>':'<p><strong>Đáp án '+(q.answerIndex+1)+':</strong> '+n2DocEsc(q.options[q.answerIndex].text)+'</p>')+
 '<label>Chọn đáp án từ giáo viên (tùy chọn): <select data-set="'+i+'"><option value="">Chưa rõ</option>'+q.options.map((o,j)=>'<option value="'+j+'" '+(q.answerIndex===j?'selected':'')+'>'+(j+1)+'</option>').join('')+'</select></label></div></article>').join(''):'<p>Không tìm thấy câu trắc nghiệm gốc. Bạn vẫn có thể tạo quiz và bài điền từ bằng từ vựng trong file.</p>');
 document.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const e=document.querySelector('#answer-'+b.dataset.reveal);e.hidden=!e.hidden;b.textContent=e.hidden?'👁 Hiện lời giải':'🙈 Ẩn lời giải'});
 document.querySelectorAll('[data-set]').forEach(b=>b.onchange=()=>{const x=d.questions[Number(b.dataset.set)];x.answerIndex=b.value===''?null:Number(b.value);x.sourceOfAnswer='manual';const all=n2DocAll(),i=all.findIndex(x=>x.id===d.id);all[i]=d;n2DocStore(all);n2DocDetailContent(d)});
}
function n2DocStart(kind){
 const d=n2DocCurrent();if(!d)return;
 const qs=kind==='paper'?d.questions.filter(x=>x.answerIndex!==null):N2DocCore.generatePractice(d,kind);
 if(!qs.length){alert('Không đủ câu hỏi có đáp án cho chế độ này.');return}
 n2DocUI.practice={questions:qs.slice(0,40),kind,correct:0,mistakes:[]};n2DocUI.index=0;n2DocUI.lock=false;n2DocUI.view='quiz';renderN2Documents();
}
function n2DocQuiz(){
 const p=n2DocUI.practice;
 if(!p){n2DocUI.view='detail';return renderN2Documents()}
 const q=p.questions[n2DocUI.index];
 if(!q){
  main.innerHTML='<button class="foundation-inline-back" id="docBack">← Bài học</button><section class="hero n2-hero"><strong>🎯 Kết quả: '+p.correct+'/'+p.questions.length+'</strong><p>'+p.mistakes.length+' câu cần ôn lại</p></section>'+
  p.mistakes.map(x=>'<div class="n2-doc-panel"><p>'+n2DocEsc(x.question)+'</p><strong>Đáp án: '+n2DocEsc(x.options[x.answerIndex].text)+'</strong></div>').join('')+
  '<button class="primary-btn" id="retry">Làm lại</button>';
  document.querySelector('#docBack').onclick=()=>{n2DocUI.view='detail';renderN2Documents()};
  document.querySelector('#retry').onclick=()=>n2DocStart(p.kind);return;
 }
 main.innerHTML='<button class="foundation-inline-back" id="docBack">← Bài học</button><section class="hero compact-hero"><strong>Quiz '+(n2DocUI.index+1)+'/'+p.questions.length+'</strong></section>'+
 '<div class="quiz-card"><h3 class="n2-doc-question">'+n2DocEsc(q.question)+'</h3><div class="n2-doc-choices">'+q.options.map((o,i)=>'<button data-pick="'+i+'">'+n2DocEsc(o.text)+'</button>').join('')+'</div><div id="docFeedback"></div></div>';
 document.querySelector('#docBack').onclick=()=>{n2DocUI.view='detail';renderN2Documents()};
 document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  if(n2DocUI.lock)return;n2DocUI.lock=true;
  const ok=Number(b.dataset.pick)===q.answerIndex;if(ok)p.correct++;else p.mistakes.push(q);
  document.querySelectorAll('[data-pick]').forEach(el=>el.disabled=true);
  document.querySelector('#docFeedback').innerHTML='<div class="n2-doc-answer"><strong>'+(ok?'✅ Đúng':'❌ Sai')+'</strong><p>'+n2DocEsc(q.options[q.answerIndex].text)+'</p><small>'+(q.origin==='document'?'Theo đáp án đã nhập / file gốc':'Theo từ điển N2')+'</small></div><button id="nextDoc" class="primary-btn">Câu tiếp →</button>';
  document.querySelector('#nextDoc').onclick=()=>{n2DocUI.index++;n2DocUI.lock=false;renderN2Documents()};
 });
}
