const GOOGLE_CLIENT_ID = '1073381001843-1jsn6tu2rnrl6umh9lml20q6c91jccf7.apps.googleusercontent.com';
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const CALENDAR_CACHE_KEY = 'japanStudy.calendarCache.v1';

const state = {
  page:'home',
  previous:'home',
  level:'N5',
  selectedInterview:null,
  calendar:{
    tokenClient:null,
    accessToken:null,
    connected:false,
    loading:false,
    error:'',
    calendars:[],
    events:[],
    lastSync:null
  },
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
        <div class="module-meta"><span>Google Calendar + AI planner</span><span class="chev">›</span></div>
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
      <div>⚠️</div>
      <div><strong>Google Calendar chưa nối vào app thật.</strong><p>Giao diện đã chuẩn bị sẵn. Bước backend tiếp theo mới làm OAuth và đọc free/busy để tự xếp lịch.</p></div>
    </div>
  `;
  bindOpeners();
}


function loadCalendarCache(){
  try{
    const cached=JSON.parse(sessionStorage.getItem(CALENDAR_CACHE_KEY));
    if(!cached) return;
    state.calendar.calendars=Array.isArray(cached.calendars)?cached.calendars:[];
    state.calendar.events=Array.isArray(cached.events)?cached.events:[];
    state.calendar.lastSync=cached.lastSync||null;
    state.calendar.connected=state.calendar.events.length>0 || state.calendar.calendars.length>0;
  }catch{}
}

function saveCalendarCache(){
  sessionStorage.setItem(CALENDAR_CACHE_KEY,JSON.stringify({
    calendars:state.calendar.calendars,
    events:state.calendar.events,
    lastSync:state.calendar.lastSync
  }));
}

function ensureGoogleIdentity(){
  return new Promise((resolve,reject)=>{
    if(window.google?.accounts?.oauth2) return resolve();
    const existing=document.querySelector('script[data-google-identity]');
    if(existing){
      existing.addEventListener('load',()=>resolve(),{once:true});
      existing.addEventListener('error',()=>reject(new Error('Không tải được Google Identity Services.')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://accounts.google.com/gsi/client';
    script.async=true;
    script.defer=true;
    script.dataset.googleIdentity='true';
    script.onload=()=>resolve();
    script.onerror=()=>reject(new Error('Không tải được Google Identity Services.'));
    document.head.appendChild(script);
  });
}

async function connectGoogleCalendar(){
  state.calendar.loading=true;
  state.calendar.error='';
  renderRoadmap();
  try{
    await ensureGoogleIdentity();
    if(!state.calendar.tokenClient){
      state.calendar.tokenClient=google.accounts.oauth2.initTokenClient({
        client_id:GOOGLE_CLIENT_ID,
        scope:GOOGLE_CALENDAR_SCOPE,
        callback:async response=>{
          if(response.error){
            state.calendar.loading=false;
            state.calendar.error=response.error;
            renderRoadmap();
            return;
          }
          state.calendar.accessToken=response.access_token;
          await syncGoogleCalendar();
        }
      });
    }
    state.calendar.tokenClient.requestAccessToken({
      prompt:state.calendar.accessToken?'':'consent'
    });
  }catch(error){
    state.calendar.loading=false;
    state.calendar.error=error.message||'Không thể kết nối Google Calendar.';
    renderRoadmap();
  }
}

async function googleApi(path){
  if(!state.calendar.accessToken) throw new Error('Chưa có quyền truy cập Google Calendar.');
  const response=await fetch('https://www.googleapis.com/calendar/v3'+path,{
    headers:{Authorization:'Bearer '+state.calendar.accessToken}
  });
  if(response.status===401){
    state.calendar.accessToken=null;
    throw new Error('Phiên Google đã hết hạn. Hãy kết nối lại Calendar.');
  }
  if(!response.ok){
    let detail='';
    try{detail=(await response.json())?.error?.message||'';}catch{}
    throw new Error(detail||('Google Calendar API lỗi '+response.status));
  }
  return response.json();
}

async function listAllCalendars(){
  const all=[];
  let pageToken='';
  do{
    const qs=new URLSearchParams({maxResults:'250'});
    if(pageToken) qs.set('pageToken',pageToken);
    const data=await googleApi('/users/me/calendarList?'+qs.toString());
    all.push(...(data.items||[]));
    pageToken=data.nextPageToken||'';
  }while(pageToken);
  return all.filter(c=>c.primary || c.selected!==false);
}

async function listCalendarEvents(calendarId,timeMin,timeMax){
  const all=[];
  let pageToken='';
  do{
    const qs=new URLSearchParams({
      singleEvents:'true',
      orderBy:'startTime',
      timeMin,
      timeMax,
      maxResults:'2500'
    });
    if(pageToken) qs.set('pageToken',pageToken);
    const data=await googleApi('/calendars/'+encodeURIComponent(calendarId)+'/events?'+qs.toString());
    all.push(...(data.items||[]));
    pageToken=data.nextPageToken||'';
  }while(pageToken);
  return all;
}

async function syncGoogleCalendar(){
  state.calendar.loading=true;
  state.calendar.error='';
  renderRoadmap();
  try{
    const calendars=await listAllCalendars();
    const now=new Date();
    const from=new Date(now.getFullYear(),0,1,0,0,0);
    const to=new Date(now.getFullYear()+1,11,31,23,59,59);
    const batches=await Promise.all(calendars.map(async cal=>{
      try{
        const events=await listCalendarEvents(cal.id,from.toISOString(),to.toISOString());
        return events.map(event=>normalizeCalendarEvent(event,cal));
      }catch(error){
        return [];
      }
    }));
    state.calendar.calendars=calendars.map(c=>({id:c.id,summary:c.summary,primary:!!c.primary}));
    state.calendar.events=batches.flat().filter(e=>e.status!=='cancelled').sort((a,b)=>a.start.localeCompare(b.start));
    state.calendar.lastSync=new Date().toISOString();
    state.calendar.connected=true;
    state.calendar.loading=false;
    saveCalendarCache();
    renderRoadmap();
  }catch(error){
    state.calendar.loading=false;
    state.calendar.error=error.message||'Không thể đọc Calendar.';
    renderRoadmap();
  }
}

function normalizeCalendarEvent(event,calendar){
  const allDay=!!event.start?.date;
  const start=allDay?event.start.date:event.start?.dateTime;
  const end=allDay?event.end?.date:event.end?.dateTime;
  return {
    id:event.id,
    calendarId:calendar.id,
    calendarName:calendar.summary||'Calendar',
    summary:event.summary||'(Không có tiêu đề)',
    description:event.description||'',
    location:event.location||'',
    start:start||'',
    end:end||start||'',
    allDay,
    status:event.status||'confirmed',
    transparency:event.transparency||'opaque'
  };
}

function eventDate(value,allDay){
  if(!value) return new Date(NaN);
  if(allDay && /^\d{4}-\d{2}-\d{2}$/.test(value)){
    const [y,m,d]=value.split('-').map(Number);
    return new Date(y,m-1,d);
  }
  return new Date(value);
}

function startOfLocalDay(date){
  const d=new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

function addDays(date,n){
  const d=new Date(date);
  d.setDate(d.getDate()+n);
  return d;
}

function overlapsDay(event,day){
  const start=eventDate(event.start,event.allDay);
  const end=eventDate(event.end,event.allDay);
  const dayStart=startOfLocalDay(day);
  const dayEnd=addDays(dayStart,1);
  return start<dayEnd && end>dayStart;
}

function formatClock(date){
  return date.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false});
}

function formatDayLabel(date){
  const weekdays=['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
  return weekdays[date.getDay()];
}

function formatDateShort(date){
  return String(date.getDate()).padStart(2,'0')+'/'+String(date.getMonth()+1).padStart(2,'0');
}

function isStudyClass(event){
  return /(n2|n5|n4|mất gốc|kaiwa|会話|日本語|phỏng vấn|面接|lớp|class)/i.test(event.summary||'');
}

function getBusyRangesForDay(day){
  const dayStart=startOfLocalDay(day);
  const dayEnd=addDays(dayStart,1);
  return state.calendar.events
    .filter(e=>e.transparency!=='transparent' && overlapsDay(e,day))
    .map(e=>{
      if(e.allDay) return {start:new Date(dayStart),end:new Date(dayEnd)};
      const s=eventDate(e.start,false), en=eventDate(e.end,false);
      return {
        start:new Date(Math.max(s.getTime(),dayStart.getTime())),
        end:new Date(Math.min(en.getTime(),dayEnd.getTime()))
      };
    })
    .sort((a,b)=>a.start-b.start);
}

function getFreeSlotsForDay(day,minMinutes=20){
  const windows=[
    [5,0,8,0],
    [17,0,23,30]
  ];
  const busy=getBusyRangesForDay(day);
  const free=[];
  for(const [sh,sm,eh,em] of windows){
    const start=startOfLocalDay(day); start.setHours(sh,sm,0,0);
    const end=startOfLocalDay(day); end.setHours(eh,em,0,0);
    let cursor=new Date(start);
    for(const range of busy){
      if(range.end<=start || range.start>=end) continue;
      const rs=new Date(Math.max(range.start.getTime(),start.getTime()));
      const re=new Date(Math.min(range.end.getTime(),end.getTime()));
      const bufferedStart=new Date(rs.getTime()-15*60000);
      const bufferedEnd=new Date(re.getTime()+15*60000);
      if(bufferedStart>cursor){
        const mins=(bufferedStart-cursor)/60000;
        if(mins>=minMinutes) free.push({start:new Date(cursor),end:new Date(bufferedStart),minutes:Math.floor(mins)});
      }
      if(bufferedEnd>cursor) cursor=new Date(bufferedEnd);
    }
    if(cursor<end){
      const mins=(end-cursor)/60000;
      if(mins>=minMinutes) free.push({start:new Date(cursor),end:new Date(end),minutes:Math.floor(mins)});
    }
  }
  return free;
}

function suggestedBlocksForDay(day){
  const events=state.calendar.events.filter(e=>!e.allDay && overlapsDay(e,day));
  const classes=events.filter(isStudyClass);
  const free=getFreeSlotsForDay(day,15);
  const suggestions=[];
  for(const cls of classes){
    const classStart=eventDate(cls.start,false);
    const classEnd=eventDate(cls.end,false);
    const before=free.filter(s=>s.end<=classStart && s.minutes>=20).sort((a,b)=>b.end-a.end)[0];
    if(before){
      const mins=Math.min(30,before.minutes);
      suggestions.push({
        start:new Date(before.end.getTime()-mins*60000),
        end:new Date(before.end),
        title:'Chuẩn bị: '+cls.summary,
        detail:'Xem trước bài, từ khóa và phần cần hỏi trong buổi học.',
        type:'study'
      });
    }
    const after=free.filter(s=>s.start>=classEnd && s.start-classEnd<=3*3600000 && s.minutes>=15).sort((a,b)=>a.start-b.start)[0];
    if(after){
      const mins=Math.min(20,after.minutes);
      suggestions.push({
        start:new Date(after.start),
        end:new Date(after.start.getTime()+mins*60000),
        title:'Ôn sau: '+cls.summary,
        detail:'Active recall: ghi lại phần giáo viên sửa và mục chưa chắc.',
        type:'review'
      });
    }
  }
  return suggestions.sort((a,b)=>a.start-b.start);
}

function renderCalendarWeek(){
  const today=startOfLocalDay(new Date());
  const days=Array.from({length:7},(_,i)=>addDays(today,i));
  return days.map(day=>{
    const events=state.calendar.events
      .filter(e=>overlapsDay(e,day))
      .sort((a,b)=>eventDate(a.start,a.allDay)-eventDate(b.start,b.allDay));
    const suggestions=suggestedBlocksForDay(day);
    const combined=[
      ...events.map(e=>({
        start:e.allDay?null:eventDate(e.start,false),
        title:e.summary,
        detail:e.allDay?'Cả ngày':(e.calendarName||'Google Calendar'),
        type:isStudyClass(e)?'class':'busy',
        allDay:e.allDay
      })),
      ...suggestions
    ].sort((a,b)=>{
      if(a.allDay && !b.allDay) return -1;
      if(!a.allDay && b.allDay) return 1;
      return (a.start?.getTime()||0)-(b.start?.getTime()||0);
    });
    const free=getFreeSlotsForDay(day,30);
    const freeHint=free.length?free.slice(0,2).map(s=>formatClock(s.start)+'–'+formatClock(s.end)).join(' · '):'Không có slot ≥30 phút';
    return `<article class="day-card">
      <div class="day-head">
        <span class="day-title">${formatDayLabel(day)}</span>
        <span class="date-pill">${formatDateShort(day)}</span>
      </div>
      ${combined.length?combined.map(item=>`<div class="schedule-item">
        <div class="schedule-time">${item.allDay?'Cả ngày':formatClock(item.start)}</div>
        <div class="schedule-body">
          <strong>${escapeText(item.title)}</strong>
          <p>${escapeText(item.detail||'')}</p>
          <span class="type-chip ${item.type==='class'?'type-class':item.type==='review'?'type-review':item.type==='study'?'type-study':'type-busy'}">${item.type==='class'?'TRÊN LỚP':item.type==='review'?'ÔN SAU':item.type==='study'?'CHUẨN BỊ':'LỊCH BẬN'}</span>
        </div>
      </div>`).join(''):`<div class="empty"><strong>Không có lịch bận</strong><p>Ngày này Calendar chưa có event.</p></div>`}
      <div class="free-hint"><strong>Khoảng rảnh gợi ý:</strong> ${freeHint}</div>
    </article>`;
  }).join('');
}

function escapeText(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function renderRoadmap(){
  title.textContent='Lộ trình tuần';
  setNav('roadmap');

  const syncText=state.calendar.lastSync
    ? new Date(state.calendar.lastSync).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
    : '';

  main.innerHTML=`
    <section class="hero">
      <div class="hero-grid">
        <div>
          <strong>${state.calendar.connected?'Lịch thật từ Google Calendar':'Kết nối lịch để app tự xếp giờ học'}</strong>
          <p>${state.calendar.connected?'App đọc lịch bận, tìm free slots và chèn chuẩn bị/ôn quanh các buổi học nhận diện được.':'Sau khi cấp quyền chỉ đọc, app sẽ lấy lịch của bạn và tự dựng lộ trình theo tuần.'}</p>
        </div>
        <div class="hero-stat"><b>${state.calendar.connected?state.calendar.events.length:'0'}</b><span>${state.calendar.connected?'event đã tải':'event'}</span></div>
      </div>
    </section>

    <div class="section-head">
      <div>
        <p class="section-kicker">GOOGLE CALENDAR</p>
        <h2>${state.calendar.connected?'7 ngày tới':'Chưa kết nối'}</h2>
      </div>
      <button class="text-btn" type="button" id="calendarConnect">${state.calendar.loading?'Đang tải…':state.calendar.connected?'Đồng bộ lại':'Kết nối Calendar'}</button>
    </div>

    ${state.calendar.error?`<div class="notice"><div>⚠️</div><div><strong>Không đọc được Calendar</strong><p>${escapeText(state.calendar.error)}</p></div></div>`:''}
    ${state.calendar.connected&&syncText?`<div class="sync-line">Đồng bộ gần nhất: <strong>${syncText}</strong> · ${state.calendar.calendars.length} calendar</div>`:''}

    <section class="timeline">
      ${state.calendar.connected?renderCalendarWeek():`<div class="empty"><strong>Chưa có dữ liệu lịch thật</strong><p>Bấm “Kết nối Calendar” → chọn tài khoản Google → Allow quyền chỉ đọc Calendar.</p></div>`}
    </section>

    <div class="notice">
      <div>🧠</div>
      <div><strong>Planner hiện dùng rule an toàn</strong><p>Không xếp trùng event, chừa buffer 15 phút quanh lịch bận, ưu tiên chuẩn bị trước và review sau lớp. Nội dung cụ thể của từng buổi học bạn sẽ cung cấp sau.</p></div>
    </div>
  `;

  document.querySelector('#calendarConnect')?.addEventListener('click',connectGoogleCalendar);
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

backBtn.addEventListener('click',()=>go(state.page==='interview-day'?'interview':'home'));
document.querySelector('#settingsBtn').addEventListener('click',()=>document.querySelector('#settingsDialog').showModal());
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>go(b.dataset.nav)));

loadCalendarCache();
render();
