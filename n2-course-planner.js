/* N2 course calendar and preparation queue; no paid services. */
const N2PLAN_KEY='japanStudy:n2:classPlanner:v2';
const n2PlanState={page:'dashboard',selected:0};
function n2PlanLoad(){
 try{return {...{anchorDate:'2026-10-09',anchorSession:6,confirmed:false,done:{},extra:{},tasks:{}},...JSON.parse(localStorage.getItem(N2PLAN_KEY)||'{}')}}catch{return {anchorDate:'2026-10-09',anchorSession:6,confirmed:false,done:{},extra:{},tasks:{}}}
}
function n2PlanSave(s){localStorage.setItem(N2PLAN_KEY,JSON.stringify(s))}
function n2PlanDate(d){const t=new Date(d);return [t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')}
function n2PlanToday(){return n2PlanDate(new Date())}
function n2PlanShift(date,n){const d=new Date(date+'T12:00:00+09:00');d.setDate(d.getDate()+n);return n2PlanDate(d)}
function n2PlanDay(date){return new Date(date+'T12:00:00+09:00').getDay()}
function n2PlanNextClassDate(date){let out=n2PlanShift(date,1);for(let i=0;i<7;i++,out=n2PlanShift(out,1))if([1,3,5].includes(n2PlanDay(out)))return out;return out}
function n2PlanChanges(state){
 const seeded=window.N2_CLASS_SOURCE.classChanges||[];
 const custom=state?.changes||{};
 return seeded.filter(x=>custom[x.id]!==false).concat(Object.values(custom).filter(x=>x&&typeof x==='object'&&x.from&&x.to));
}
function n2PlanRescheduledDates(state){
 if(!state.anchorDate)return [];
 const weekdays=window.N2_CLASS_SOURCE.timetable.find(t=>t.id==='n2').days;
 const changes=n2PlanChanges(state);
 const dates=[];
 // Iterate the fixed course sequence, skipping teacher-cancelled days without
 // consuming a lesson number. Future classes therefore shift, never double.
 for(let d=state.anchorDate,guard=0;guard<240&&dates.length<56;d=n2PlanShift(d,1),guard++){
   if(!weekdays.includes(n2PlanDay(d)))continue;
   if(changes.some(c=>c.classId==='n2'&&c.from===d))continue;
   dates.push(d);
 }
 return dates;
}
function n2PlanClasses(from,days=38){
 const src=window.N2_CLASS_SOURCE;
 const state=n2PlanLoad(),changes=n2PlanChanges(state);
 const out=[];
 for(let i=0;i<days;i++){
  const date=n2PlanShift(from,i),weekday=n2PlanDay(date);
  for(const t of src.timetable){
    if(!t.days.includes(weekday))continue;
    const changed=changes.find(c=>c.classId===t.id&&c.from===date);
    if(changed)out.push({date,...t,cancelled:true,label:t.label+' · NGHỈ',reason:changed.reason});
    else out.push({date,...t});
  }
  for(const e of src.special)if(e.date===date)out.push({...e,source:'Google Calendar'});
 }
 return out.sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
}
function n2PlanSessions(state,from,days=24){
 if(!state.anchorDate)return [];
 const dates=n2PlanRescheduledDates(state),limit=n2PlanShift(from,days);
 return dates.map((date,i)=>({date,id:'n2',label:'Lớp N2',start:'21:00',end:'23:00',
    session:state.anchorSession+i,lesson:window.N2_CLASS_SOURCE.lessons[state.anchorSession+i-1]}))
  .filter(e=>e.session<=55&&e.date>=from&&e.date<limit&&e.lesson);
}
function n2PlanAddMove(state,from,to,reason){
 if(!from||!to||to<=from)throw Error('Ngày học bù phải sau ngày nghỉ.');
 const valid=window.N2_CLASS_SOURCE.timetable.find(t=>t.id==='n2').days;
 if(!valid.includes(n2PlanDay(from))||!valid.includes(n2PlanDay(to)))throw Error('Ngày nghỉ và ngày học bù phải là T2, T4 hoặc T6.');
 const changes=n2PlanChanges(state);
 if(changes.some(c=>c.classId==='n2'&&c.from===from))throw Error('Ngày này đã được đánh dấu nghỉ.');
 const sequence=n2PlanRescheduledDates(state);
 if(state.anchorDate&&sequence.length&&from>=state.anchorDate){
   const i=sequence.indexOf(from);
   if(i===-1)throw Error('Ngày này không có buổi N2 để dời.');
   if(sequence[i+1]!==to)throw Error('Để không trùng buổi, chọn ngày học N2 kế tiếp: '+sequence[i+1]+'.');
 }
 const id='local-'+from;
 state.changes={...(state.changes||{}),[id]:{id,classId:'n2',from,to,reason:reason||'Giáo viên báo nghỉ'}};
 return state;
}
function n2PlanPrioritize(state,date=n2PlanToday()){
 const upcoming=n2PlanSessions(state,date,21);
 const next=upcoming[0]||null;
 const tomorrow=n2PlanShift(date,1);
 // Tomorrow always wins over all backlog until all preview items are marked complete.
 const active=next && next.date===tomorrow?next:next;
 const prev=next?.session>1?window.N2_CLASS_SOURCE.lessons[next.session-2]:null;
 const pending=(state.anchorDate?window.N2_CLASS_SOURCE.lessons.slice(0,Math.max(0,(next?.session||state.anchorSession)-1)):[])
  .flatMap(l=>l.contents.map((text,i)=>({id:'learn:'+l.number+':'+i,text,session:l.number})))
  .filter(x=>!state.done[x.id]);
 const urgent=active?active.lesson.contents.map((text,i)=>({id:'learn:'+active.session+':'+i,text,session:active.session})).filter(x=>!state.done[x.id]):[];
 const due=prev?prev.homework.map((text,i)=>({id:'hw:'+prev.number+':'+i,text,session:prev.number})).filter(x=>!state.done[x.id]):[];
 return {next:active,tomorrow,urgent,due,backlog:pending.filter(x=>!urgent.some(y=>y.id===x.id)),needPrep:urgent.length>0||due.length>0};
}
function n2PlanEscape(s){return N2DocCore.html(s)}
function n2PlanLabel(x){return x ? 'Buổi '+x.session+' · '+x.date.slice(8)+'/'+x.date.slice(5,7)+' · '+x.start : 'Chưa có lịch đã ghép';}
function n2PlanMark(id,yes){
 const p=n2PlanLoad();if(yes)p.done[id]=new Date().toISOString();else delete p.done[id];n2PlanSave(p);renderN2Planner();
}
function n2PlanCheck(items,p){
 return items.map(t=>'<label class="n2-plan-check"><input type="checkbox" data-n2-plan-item="'+n2PlanEscape(t.id)+'" '+(p.done[t.id]?'checked':'')+'><span>'+n2PlanEscape(t.text)+'</span></label>').join('');
}
function n2PlanMatch(t){
 const d=n2Data();
 const voc=t.match(/Từ vựng\s*(\d+)\s*[~–\-]\s*(\d+)/i);
 if(voc){const a=+voc[1],b=+voc[2];return d.vocabLessons?.find(l=>l.from<=a&&l.to>=b)?{type:'vocab',id:d.vocabLessons.find(l=>l.from<=a&&l.to>=b).id}:null}
 const kan=t.match(/週\s*(\d+)\s*[-–]\s*(\d+)|tuần\s*(\d+)\s*(?:[-–]\s*)?(?:bài|ngày)\s*(\d+)/i);
 if(kan)return {type:'kanji',id:'kanji-w'+(kan[1]||kan[3])+'-'+(kan[2]||kan[4])};
 const gram=t.match(/Ngữ\s*pháp\s*B\s*(\d+)/i);
 if(gram)return {type:'grammar',id:'grammar-'+String(gram[1]).padStart(2,'0')};
 return null;
}
function n2PlanOpen(text){
 const link=n2PlanMatch(text);
 if(!link){alert('Mục này chưa có bài tự động được ánh xạ. Xem tài liệu gốc hoặc học nhanh từ PDF.');return}
 n2UI.type=link.type;n2UI.lessonId=link.id;n2UI.view='detail';renderN2();
}
function n2PlanLinked(items){
 return items.map(x=>{
 const link=n2PlanMatch(x.text);
 return '<div class="n2-plan-task"><label class="n2-plan-check"><input type="checkbox" data-n2-plan-item="'+n2PlanEscape(x.id)+'"><span>'+n2PlanEscape(x.text)+'</span></label>'+
 (link?'<button class="secondary-btn" data-plan-open="'+n2PlanEscape(x.text)+'">Học ngay →</button>':'')+'</div>'
 }).join('');
}
function n2PlanEventsHtml(e){
 return '<article class="n2-plan-event"><span class="n2-plan-date">'+e.date.slice(8)+'/'+e.date.slice(5,7)+'</span><div><strong>'+n2PlanEscape(e.label)+' · '+e.start+'–'+e.end+'</strong><p>'+n2PlanEscape(e.detail||'')+'</p></div></article>';
}
function renderN2Planner(){
 title.textContent='N2 · Lịch học';
 const p=n2PlanLoad(),today=n2PlanToday(),focus=n2PlanPrioritize(p,today);
 const source=window.N2_CLASS_SOURCE,teacher=source.teacherMessages?.[0],actual=source.shubAssignments||[];
 const next=focus.next,changes=n2PlanChanges(p);
 const teacherTasks=(teacher?.items||[]).filter(x=>!p.done[x.id]);
 const shubTasks=actual.filter(x=>!p.done[x.id]);
 const urgent=focus.urgent,due=focus.due;
 const count=teacherTasks.length+shubTasks.length+urgent.length+due.length;
 const esc=n2PlanEscape;
 const task=(x,tag)=>{
   const label=x.link||x.text;
   const linked=n2PlanMatch(label);
   return '<div class="plan2-checkline"><label><input type="checkbox" data-n2-plan-item="'+esc(x.id)+'" '+(p.done[x.id]?'checked':'')+'/><span>'+esc(x.text)+'</span></label>'+
   (linked?'<button type="button" data-plan-open="'+esc(label)+'" class="plan2-link">Học →</button>':'')+'</div>';
 };
 const lastCancellation=changes.slice().sort((x,y)=>y.from.localeCompare(x.from))[0];
 let html='<button class="foundation-inline-back" data-n2-root type="button">← N2</button>'+
 '<div class="plan2-screen"><div class="plan2-intro"><div><p class="plan2-eyebrow">LỚP N2</p><h2>Lịch & bài cần học</h2></div><button type="button" id="planChangeShow" class="plan2-small-action">⚙ Chỉnh</button></div>'+
 '<section class="plan2-focus"><span class="plan2-focus-tag">BUỔI TIẾP THEO '+(p.confirmed?'':'· DỰ KIẾN')+'</span>'+
 '<strong>'+(next?'Buổi '+next.session+' · '+next.date.slice(8)+'/'+next.date.slice(5,7)+' · '+next.start:'Chưa xác định')+'</strong>'+
 '<p>'+(next?'Giáo trình dự kiến: '+esc(next.lesson.contents.slice(0,2).join(' · ')):'Chọn buổi học để gắn lịch với giáo trình')+'</p>'+
 (lastCancellation?'<small>↪ '+esc(lastCancellation.from.slice(8)+'/'+lastCancellation.from.slice(5,7))+' nghỉ → '+esc(lastCancellation.to.slice(8)+'/'+lastCancellation.to.slice(5,7))+' học tiếp</small>':'')+
 '</section>'+
 '<div class="plan2-section-head"><h3>Cần hoàn thành</h3><span class="plan2-count">'+count+' mục chưa tích</span></div>';
 if(teacherTasks.length)html+='<section class="plan2-card"><h4>🧑‍🏫 Thầy đã nhắn</h4><p class="plan2-note">Thông báo Zalo 06/10; chưa xác nhận ngày kiểm tra.</p>'+teacherTasks.map(x=>task(x,'teacher')).join('')+'</section>';
 if(shubTasks.length)html+='<section class="plan2-card"><h4>📝 Bài trên SHub</h4><p class="plan2-note">Chưa có hạn nộp trong ảnh.</p>'+shubTasks.map(x=>task(x,'shub')).join('')+'</section>';
 if(next && (urgent.length||due.length))html+='<section class="plan2-card"><h4>📘 Chuẩn bị buổi '+next.session+'</h4><p class="plan2-note">Gợi ý từ KOSEI, chưa phải bài thầy xác nhận.</p>'+urgent.map(x=>task(x,'prep')).join('')+
 (due.length?'<details class="plan2-details"><summary>Bài tập theo giáo trình ('+due.length+')</summary>'+due.map(x=>task(x,'hw')).join('')+'</details>':'')+'</section>';
 if(!count)html+='<section class="plan2-card"><strong>✅ Không còn mục ưu tiên chưa hoàn thành.</strong><p>Có thể ôn bài tồn hoặc đọc trước bài tiếp theo.</p></section>';
 if(!focus.needPrep&&!teacherTasks.length&&!shubTasks.length&&focus.backlog.length)
 html+='<details class="plan2-card"><summary>📦 Học bù ('+focus.backlog.length+')</summary>'+focus.backlog.slice(0,12).map(x=>task(x,'backlog')).join('')+'</details>';
 html+='<details class="plan2-card"><summary>📅 Lịch 7 ngày tới</summary>'+
 n2PlanClasses(today,7).map(e=>'<div class="plan2-classline"><span>'+esc(e.date.slice(8)+'/'+e.date.slice(5,7))+'</span><span>'+esc(e.cancelled?'⏸ '+e.label:e.label)+'</span><small>'+esc(e.start)+'</small></div>').join('')+
 '</details>';
 html+='<details id="planSettings" class="plan2-card"><summary>⚙️ Chỉnh buổi học / dời ngày</summary>'+
 '<p class="plan2-note">Bạn có thể đổi mốc buổi hoặc ghi nhận ngày giáo viên báo nghỉ. Số buổi đã học không tự tăng khi nghỉ.</p>'+
 '<div class="n2-plan-inputs"><label>Ngày mốc<input id="planAnchorDate" type="date" value="'+esc(p.anchorDate)+'"></label>'+
 '<label>Buổi số <select id="planAnchorSession">'+source.lessons.map(x=>'<option value="'+x.number+'" '+(x.number===p.anchorSession?'selected':'')+'>'+x.number+'</option>').join('')+'</select></label></div>'+
 '<button type="button" class="secondary-btn" id="planSaveAnchor">Lưu mốc</button>'+
 '<div class="plan2-section-head"><h4>↪ Dời buổi N2</h4></div>'+
 '<div class="n2-plan-inputs"><label>Ngày nghỉ<input type="date" id="n2MoveFrom" value="'+esc(today)+'"></label><label>Học tiếp<input type="date" id="n2MoveTo" value="'+esc(n2PlanNextClassDate(today))+'"></label></div>'+
 '<label>Lý do<input id="n2MoveReason" class="n2-plan-input" value="Giáo viên báo nghỉ"></label>'+
 '<button type="button" class="secondary-btn" id="n2MoveSubmit">Lưu ngày nghỉ</button><p id="n2MoveStatus" class="plan2-note" role="status"></p>'+
 changes.map(c=>'<div class="plan2-classline"><span>⏸ '+esc(c.from)+'</span><span>→ '+esc(c.to)+'</span><button class="plan2-link" data-move-undo="'+esc(c.id)+'">Hoàn tác</button></div>').join('')+
 '</details>';
 html+='<details class="plan2-card"><summary>📚 Toàn bộ 55 buổi & nguồn dữ liệu</summary><p class="plan2-note">KOSEI là lịch dự kiến; Zalo và SHub là nguồn nhiệm vụ thật đã nhập từ ảnh. Thời gian lớp theo Calendar, chưa đồng bộ hai chiều.</p>'+
 '<div class="n2-plan-sessions">'+source.lessons.map(l=>'<details><summary>Buổi '+l.number+' · '+esc(l.contents[0]||'Ôn tập')+'</summary>'+
 '<p>'+l.contents.map(esc).join(' · ')+'</p><strong>BTVN</strong><p>'+l.homework.map(esc).join(' · ')+'</p></details>').join('')+'</div></details>';
 html+='<details class="plan2-card"><summary>🔔 Cài đặt nhắc học</summary><p class="plan2-note">Chỉ thông báo khi trang vẫn mở; chưa có push nền.</p><button type="button" class="secondary-btn" id="planNotify">Bật thông báo 20:00</button><p id="planNotifyStatus" role="status"></p></details></div>';
 main.innerHTML=html;
 document.querySelector('[data-n2-root]').onclick=()=>{n2UI.view='root';renderN2()};
 document.querySelector('#planChangeShow').onclick=()=>{const d=document.querySelector('#planSettings');d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'})};
 document.querySelectorAll('[data-n2-plan-item]').forEach(el=>{el.onchange=()=>n2PlanMark(el.dataset.n2PlanItem,el.checked)});
 document.querySelectorAll('[data-plan-open]').forEach(el=>{el.onclick=()=>n2PlanOpen(el.dataset.planOpen)});
 document.querySelector('#planSaveAnchor').onclick=()=>{
   const date=document.querySelector('#planAnchorDate').value,session=Number(document.querySelector('#planAnchorSession').value);
   if(!date||!source.timetable[0].days.includes(n2PlanDay(date))){alert('Mốc N2 phải là T2, T4 hoặc T6.');return}
   p.anchorDate=date;p.anchorSession=session;p.confirmed=true;n2PlanSave(p);renderN2Planner();
 };
 document.querySelector('#n2MoveSubmit').onclick=()=>{
   try{
     n2PlanAddMove(p,document.querySelector('#n2MoveFrom').value,document.querySelector('#n2MoveTo').value,document.querySelector('#n2MoveReason').value);
     n2PlanSave(p);renderN2Planner();
   }catch(e){document.querySelector('#n2MoveStatus').textContent='⚠️ '+e.message}
 };
 document.querySelectorAll('[data-move-undo]').forEach(el=>el.onclick=()=>{
   const id=el.dataset.moveUndo;
   if((source.classChanges||[]).some(c=>c.id===id)){p.changes={...(p.changes||{}),[id]:false}}
   else if(p.changes)delete p.changes[id];
   n2PlanSave(p);renderN2Planner();
 });
 document.querySelector('#planNotify').onclick=async()=>{
   const status=document.querySelector('#planNotifyStatus');
   if(!('Notification' in window)){status.textContent='Không hỗ trợ thông báo trên trình duyệt này.';return}
   const permission=await Notification.requestPermission();
   if(permission==='granted'){const cfg=n2PlanLoad();cfg.notifications=true;n2PlanSave(cfg);n2PlanNotifyCheck()}
   status.textContent=permission==='granted'?'Đã bật nhắc khi app đang mở.':'Chưa cấp quyền.';
 };
}

/* Notification API on a static GitHub Pages site is foreground-only here.
 * No claim of guaranteed push after browser/app is closed. */
function n2PlanNotifyCheck(){
 const p=n2PlanLoad();
 if(!p.notifications || !('Notification' in window)||Notification.permission!=='granted')return;
 const now=new Date(),key=n2PlanToday();
 const mins=now.getHours()*60+now.getMinutes();
 if(mins<1200 || mins>=1210)return;
 if(p.lastNotified===key)return;
 const next=n2PlanPrioritize(p,key);
 if(!next.next)return;
 const what=next.urgent[0]?.text||next.due[0]?.text||next.backlog[0]?.text;
 if(!what)return;
 try{
  new Notification('📘 N2 · Ưu tiên học trước',{body:'Buổi '+next.next.session+' ('+next.next.date+'): '+what,tag:'n2-daily-prep'});
  p.lastNotified=key;n2PlanSave(p);
 }catch{}
}
if(typeof window!=='undefined' && typeof window.setInterval==='function'){
 window.setInterval(n2PlanNotifyCheck,60000);
 window.addEventListener('focus',n2PlanNotifyCheck);
}
