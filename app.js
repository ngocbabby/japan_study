const ROADMAP = window.JAPAN_STUDY_ROADMAP_DATA || {days:[],principles:[],generatedAt:null,generatedBy:'ChatGPT'};

const state = {
  page:'home',
  previous:'home',
  level:'N5',
  selectedInterview:null,
  interviewDays:[
    {
      id:'2026-10-07',
      label:'Ngày 07/10',
      summary:'Phỏng vấn xin việc - anzen daiichi, horenso, câu hỏi công ty',
      conversation:[
        '会社で一番大切なことは何ですか。',
        '安全第一です。心を込めて働き、品質の良い製品を作ることが大切だと思います。'
      ],
      vocab:['安全第一','品質','礼儀','報告・連絡・相談'],
      grammar:['～と思います','～ていただけた場合','～予定されていますか'],
      kanji:['安','全','品','質','礼','儀'],
      quick:['入社日はいつ頃を予定されていますか','研修はありますか','会社が評価するポイントは何ですか']
    },
    {
      id:'2026-10-06',
      label:'Ngày 06/10',
      summary:'Ôn câu tự giới thiệu và câu trả lời ngắn khi phỏng vấn',
      conversation:['自己紹介をお願いします。','はい、グエン・ゴック・チャンと申します。'],
      vocab:['自己紹介','経験','希望','採用'],
      grammar:['～と申します','～たいと思っています'],
      kanji:['自','己','紹','介','経','験'],
      quick:['Nói câu trả lời trong 20-30 giây','Không học thuộc từng chữ','Ưu tiên phản xạ tự nhiên']
    }
  ]
};

const main = document.querySelector('#appMain');
const title = document.querySelector('#pageTitle');
const backBtn = document.querySelector('#backBtn');

function go(page, payload){
  state.previous = state.page;
  state.page = page;
  if(payload?.interview) state.selectedInterview = payload.interview;
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function setNav(page){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));
}

function render(){
  backBtn.classList.toggle('hidden',state.page==='home');
  if(state.page==='home') return renderHome();
  if(state.page==='roadmap') return renderRoadmap();
  if(state.page==='foundation') return renderFoundation();
  if(state.page==='n2') return renderN2();
  if(state.page==='interview') return renderInterview();
  if(state.page==='interview-day') return renderInterviewDay();
  if(state.page==='kaiwa') return renderKaiwa();
  if(state.page==='review') return renderReview();
  if(state.page==='progress') return renderProgress();
}

function renderHome(){
  title.textContent='Học gì hôm nay?';
  setNav('home');
  main.innerHTML=`
    <section class="hero">
      <div class="hero-grid">
        <div>
          <strong>Học đúng thứ cần học, đúng lúc.</strong>
          <p>Lộ trình sẽ dùng lịch rảnh để ưu tiên bài cho buổi học kế tiếp mà không nhồi quá mức.</p>
        </div>
        <div class="hero-stat"><b>5</b><span>khu vực học</span></div>
      </div>
    </section>

    <div class="section-head">
      <div><p class="section-kicker">HOME</p><h2>Khu vực học</h2></div>
    </div>

    <section class="module-grid">
      <button class="module-card wide" data-open="roadmap" type="button">
        <div>
          <div class="module-icon">▦</div>
          <h3>Lộ trình</h3>
          <p>Lịch tuần, giờ rảnh, buổi học trên lớp và việc cần chuẩn bị cho ngày hôm sau.</p>
        </div>
        <div class="module-meta"><span>ChatGPT bot + Calendar</span><span class="chev">›</span></div>
      </button>

      <button class="module-card" data-open="foundation" type="button">
        <div>
          <div class="module-icon">基</div>
          <h3>Mất gốc</h3>
          <p>N5 → N4: từ vựng, kanji, ngữ pháp, luyện đề.</p>
        </div>
        <div class="module-meta"><span>N5 / N4</span><span class="chev">›</span></div>
      </button>

      <button class="module-card" data-open="n2" type="button">
        <div>
          <div class="module-icon">N2</div>
          <h3>N2</h3>
          <p>Từ vựng, kanji, ngữ pháp, đọc hiểu và luyện đề.</p>
        </div>
        <div class="module-meta"><span>Dài hạn</span><span class="chev">›</span></div>
      </button>

      <button class="module-card" data-open="interview" type="button">
        <div>
          <div class="module-icon">面</div>
          <h3>Luyện phỏng vấn</h3>
          <p>Lưu theo từng ngày học: hội thoại, từ vựng, ngữ pháp, kanji và phần cần lướt lại.</p>
        </div>
        <div class="module-meta"><span>2 buổi đã lưu</span><span class="chev">›</span></div>
      </button>

      <button class="module-card" data-open="kaiwa" type="button">
        <div>
          <div class="module-icon">話</div>
          <h3>Kaiwa tự nguyện</h3>
          <p>Bài cần chuẩn bị trước buổi học kế tiếp theo giáo trình bạn chọn.</p>
        </div>
        <div class="module-meta"><span>Chuẩn bị trước lớp</span><span class="chev">›</span></div>
      </button>
    </section>

    <div class="notice">
      <div>🤖</div>
      <div><strong>Lộ trình do ChatGPT cập nhật.</strong><p>App không cần giữ đăng nhập Google. ChatGPT đọc lịch, tối ưu kế hoạch rồi cập nhật dữ liệu chung để mọi thiết bị thấy cùng một lộ trình.</p></div>
    </div>
  `;
  bindOpeners();
}



function escapeText(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function typeLabel(type){
  return type==='class'?'TRÊN LỚP':type==='review'?'ÔN LẠI':type==='study'?'AI XẾP':'LỊCH BẬN';
}

function typeClass(type){
  return type==='class'?'type-class':type==='review'?'type-review':type==='study'?'type-study':'type-busy';
}

function renderBotRoadmapDays(){
  if(!ROADMAP.days?.length){
    return '<div class="empty"><strong>Chưa có lộ trình</strong><p>Yêu cầu ChatGPT cập nhật app để tạo lịch mới.</p></div>';
  }
  return ROADMAP.days.map(day=>`<article class="day-card ${day.conflict?'day-conflict':''}">
    <div class="day-head">
      <span class="day-title">${escapeText(day.label)}</span>
      <span class="date-pill">${escapeText(day.date.slice(8,10)+'/'+day.date.slice(5,7))}</span>
    </div>
    ${day.conflict?'<div class="conflict-banner">⚠ Có lịch học bị chồng giờ — cần bạn chọn ưu tiên.</div>':''}
    ${day.items.map(item=>`<div class="schedule-item">
      <div class="schedule-time">${escapeText(item.start)}</div>
      <div class="schedule-body">
        <strong>${escapeText(item.title)}</strong>
        <p>${escapeText(item.detail||'')}</p>
        <span class="type-chip ${typeClass(item.type)}">${typeLabel(item.type)}</span>
      </div>
    </div>`).join('')}
    ${day.note?`<div class="day-note"><strong>AI ghi chú:</strong> ${escapeText(day.note)}</div>`:''}
  </article>`).join('');
}

function renderRoadmap(){
  title.textContent='Lộ trình tuần';
  setNav('roadmap');

  const updated=ROADMAP.generatedAt
    ? new Date(ROADMAP.generatedAt).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
    : 'chưa có';

  main.innerHTML=`
    <section class="hero">
      <div class="hero-grid">
        <div>
          <strong>Lộ trình do ChatGPT quản lý</strong>
          <p>ChatGPT đọc Google Calendar bằng connector, phát hiện lịch bận/xung đột rồi cập nhật kế hoạch chung lên GitHub Pages.</p>
        </div>
        <div class="hero-stat"><b>${ROADMAP.days?.length||0}</b><span>ngày đã xếp</span></div>
      </div>
    </section>

    <div class="section-head">
      <div>
        <p class="section-kicker">BOT SYNC</p>
        <h2>${escapeText(ROADMAP.period?.from||'')} → ${escapeText(ROADMAP.period?.to||'')}</h2>
      </div>
      <span class="status-chip synced">CHATGPT</span>
    </div>

    <section class="n2-plan-panel"><h3>↪ Giáo viên báo nghỉ / dời lịch</h3><p>09/10 lớp N2 nghỉ, chuyển buổi dự kiến sang thứ Hai 12/10. Số buổi và bài cần chuẩn bị không bị bỏ qua.</p><button class="primary-btn" id="openN2Reschedule" type="button">📅 Dời ngày học, xem lịch mới →</button></section>

    <div class="sync-line">Cập nhật gần nhất: <strong>${updated}</strong> · nguồn: ${escapeText(ROADMAP.source||'Google Calendar')}</div>

    <section class="timeline">
      ${renderBotRoadmapDays()}
    </section>

    <div class="notice">
      <div>🧠</div>
      <div><strong>Nguyên tắc planner</strong><p>${escapeText((ROADMAP.principles||[]).join(' · '))}</p></div>
    </div>
  `;
  document.querySelector('#openN2Reschedule')?.addEventListener('click',()=>{state.page='n2';n2UI.view='planner';render()});
}

function dayCard(day,date,items){
  return `<article class="day-card">
    <div class="day-head"><span class="day-title">${day}</span><span class="date-pill">${date}</span></div>
    ${items.map(x=>`<div class="schedule-item">
      <div class="schedule-time">${x[0]}</div>
      <div class="schedule-body"><strong>${x[1]}</strong><p>${x[2]}</p><span class="type-chip type-${x[3]}">${x[3]==='class'?'TRÊN LỚP':x[3]==='review'?'ÔN SAU':'CHUẨN BỊ'}</span></div>
    </div>`).join('')}
  </article>`;
}

function renderFoundation(){
  title.textContent='Mất gốc';
  setNav('');
  main.innerHTML=`
    <div class="level-tabs">
      <button class="level-tab ${state.level==='N5'?'active':''}" data-level="N5" type="button">N5</button>
      <button class="level-tab ${state.level==='N4'?'active':''}" data-level="N4" type="button">N4</button>
    </div>
    <section class="hero">
      <div class="hero-grid"><div><strong>${state.level} · xây lại nền</strong><p>Không học dàn hàng ngang. App theo dõi từng nhóm kiến thức để biết mục nào yếu và cần ôn lại.</p></div><div class="hero-stat"><b>${state.level==='N5'?'34%':'8%'}</b><span>tiến độ</span></div></div>
    </section>
    <div class="section-head"><div><p class="section-kicker">${state.level}</p><h2>Nội dung</h2></div></div>
    <section class="category-list">
      ${category('語','Từ vựng','Học + ôn bằng active recall',state.level==='N5'?42:9)}
      ${category('漢','Kanji','Nhận mặt, âm đọc, từ ghép',state.level==='N5'?28:5)}
      ${category('文','Ngữ pháp','Mẫu câu + ví dụ + lỗi thường gặp',state.level==='N5'?36:7)}
      ${category('試','Luyện đề','Bài ngắn theo phần yếu',state.level==='N5'?18:0)}
    </section>
  `;
  document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level;renderFoundation()}));
}

function renderN2(){
  title.textContent='N2';
  setNav('');
  main.innerHTML=`
    <section class="hero"><div class="hero-grid"><div><strong>N2 · kế hoạch dài hạn</strong><p>Ưu tiên học đều, có ôn cách quãng; không để N2 lấn hết thời gian của bài gấp.</p></div><div class="hero-stat"><b>12%</b><span>tiến độ</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">N2</p><h2>Nội dung</h2></div></div>
    <section class="category-list">
      ${category('語','Từ vựng','Từ theo chủ đề + từ hay nhầm',15)}
      ${category('漢','Kanji','Kanji N2 + từ ghép thực tế',11)}
      ${category('文','Ngữ pháp','Mẫu N2 + phân biệt sắc thái',13)}
      ${category('読','Đọc','Đoạn ngắn → trung → dài',8)}
      ${category('試','Luyện đề','Theo dõi lỗi và thời gian làm bài',4)}
    </section>
  `;
}

function category(icon,name,desc,pct){
  return `<button class="category-card" type="button">
    <span class="category-icon">${icon}</span>
    <span><strong>${name}</strong><p>${desc}</p><span class="progress-bar"><span style="width:${pct}%"></span></span></span>
    <span class="chev">›</span>
  </button>`;
}

function renderInterview(){
  title.textContent='Luyện phỏng vấn';
  setNav('');
  main.innerHTML=`
    <section class="hero"><div class="hero-grid"><div><strong>Lưu bài theo từng ngày học</strong><p>Sau mỗi buổi, nội dung ChatGPT tổng hợp sẽ được fill vào đúng ngày để bạn chỉ cần mở lại và ôn.</p></div><div class="hero-stat"><b>${state.interviewDays.length}</b><span>buổi</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">NHẬT KÝ HỌC</p><h2>Các buổi đã học</h2></div></div>
    <section class="lesson-list">
      ${state.interviewDays.map(x=>`<button class="lesson-card" data-interview="${x.id}" type="button" style="text-align:left">
        <h3>${x.label}</h3><p>${x.summary}</p>
        <div class="lesson-tags"><span class="lesson-tag">Hội thoại</span><span class="lesson-tag">Từ vựng</span><span class="lesson-tag">Ngữ pháp</span><span class="lesson-tag">Kanji</span></div>
      </button>`).join('')}
    </section>
  `;
  document.querySelectorAll('[data-interview]').forEach(b=>b.addEventListener('click',()=>go('interview-day',{interview:b.dataset.interview})));
}

function renderInterviewDay(){
  const item = state.interviewDays.find(x=>x.id===state.selectedInterview) || state.interviewDays[0];
  title.textContent=item.label;
  setNav('');
  main.innerHTML=`
    <section class="detail-block"><h3>Đoạn hội thoại</h3>${item.conversation.map(x=>`<p>• ${x}</p>`).join('')}</section>
    <section class="detail-block"><h3>Từ vựng</h3><div class="lesson-tags">${item.vocab.map(x=>`<span class="lesson-tag">${x}</span>`).join('')}</div></section>
    <section class="detail-block"><h3>Ngữ pháp</h3><ul class="quick-list">${item.grammar.map(x=>`<li>${x}</li>`).join('')}</ul></section>
    <section class="detail-block"><h3>Kanji</h3><div class="lesson-tags">${item.kanji.map(x=>`<span class="lesson-tag">${x}</span>`).join('')}</div></section>
    <section class="detail-block"><h3>Cần học lướt nhanh</h3><ul class="quick-list">${item.quick.map(x=>`<li>${x}</li>`).join('')}</ul></section>
  `;
}

function renderKaiwa(){
  title.textContent='Kaiwa tự nguyện';
  setNav('');
  main.innerHTML=`
    <section class="hero"><div class="hero-grid"><div><strong>Chuẩn bị trước buổi học</strong><p>Mỗi bài bám theo giáo trình bạn chọn. App chỉ kéo ra phần cần chuẩn bị cho buổi kế tiếp.</p></div><div class="hero-stat"><b>1</b><span>bài sắp tới</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">BUỔI KẾ TIẾP</p><h2>Thứ 7 · 19:00</h2></div></div>
    <section class="detail-block"><h3>Bài chuẩn bị</h3><p><strong>Giáo trình:</strong> Chưa gắn</p><p><strong>Chủ đề:</strong> Tự giới thiệu + nói về công việc</p></section>
    <section class="detail-block"><h3>Trước khi đi học</h3><ul class="quick-list"><li>Đọc trước 1 đoạn hội thoại mẫu</li><li>Học 10 từ khóa</li><li>Chuẩn bị 3 câu hỏi muốn hỏi giáo viên</li><li>Nói thử 2 phút không nhìn giấy</li></ul></section>
    <div class="notice"><div>＋</div><div><strong>Bạn sẽ cung cấp giáo trình sau.</strong><p>Khi có file, app sẽ map chương/bài → lịch Kaiwa → tự tạo phần chuẩn bị cho buổi kế tiếp.</p></div></div>
  `;
}

function renderReview(){
  title.textContent='Ôn hôm nay';
  setNav('review');
  main.innerHTML=`
    <section class="hero"><div class="hero-grid"><div><strong>Ôn ít nhưng đúng điểm rơi</strong><p>Chỉ hiện phần sắp quên hoặc vừa sai gần đây.</p></div><div class="hero-stat"><b>18</b><span>mục cần ôn</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">HÔM NAY</p><h2>Ưu tiên ôn</h2></div></div>
    <section class="category-list">
      ${category('面','Phỏng vấn','6 câu trả lời cần nói lại',62)}
      ${category('文','N5 ngữ pháp','7 mẫu câu sắp quên',48)}
      ${category('語','N2 từ vựng','5 từ sai gần nhất',31)}
    </section>
  `;
}

function renderProgress(){
  title.textContent='Tiến độ';
  setNav('progress');
  main.innerHTML=`
    <section class="hero"><div class="hero-grid"><div><strong>Không đo bằng số giờ ngồi học</strong><p>Đo bằng độ phủ kiến thức, mức nhớ lại và số mục thực sự đã vững.</p></div><div class="hero-stat"><b>27%</b><span>tổng thể</span></div></div></section>
    <div class="section-head"><div><p class="section-kicker">TỔNG QUAN</p><h2>Độ phủ</h2></div></div>
    <section class="category-list">
      ${category('基','Mất gốc N5/N4','Nền tảng',34)}
      ${category('N2','N2','Dài hạn',12)}
      ${category('面','Phỏng vấn','Thực hành phản xạ',58)}
      ${category('話','Kaiwa','Chuẩn bị trước lớp',22)}
    </section>
  `;
}

function bindOpeners(){
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.open)));
}

backBtn.addEventListener('click',()=>{
  if(state.page==='foundation' && typeof foundationUI!=='undefined' && foundationUI.view!=='root'){
    if(foundationUI.view==='study'){ exitFoundationStudy(); return; }
    if(foundationUI.view==='lesson-detail'){
      foundationUI.view='category';
      foundationUI.tab='lessons';
      renderFoundation();
      return;
    }
    if(foundationUI.view==='category'){
      foundationUI.view='root';
      renderFoundation();
      return;
    }
  }
  go(state.page==='interview-day'?'interview':'home');
});
document.querySelector('#settingsBtn').addEventListener('click',()=>document.querySelector('#settingsDialog').showModal());
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>go(b.dataset.nav)));

render();
