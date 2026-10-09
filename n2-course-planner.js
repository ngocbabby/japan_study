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
 title.textContent='N2 · Lịch & ưu tiên';
 const p=n2PlanLoad(),today=n2PlanToday(),next=n2PlanPrioritize(p,today);
 const cancellations=n2PlanChanges(p);
 const source=window.N2_CLASS_SOURCE, actual=source.shubAssignments||[], teacher=source.teacherMessages?.[0], estimate=source.estimatedLesson;
 const target=next.next,lessons=window.N2_CLASS_SOURCE.lessons;
 const upcoming=n2PlanSessions(p,today,32).slice(0,11);
 const tomorrowEvents=n2PlanClasses(n2PlanShift(today,1),1);
 const conflicts=[];
 for(let i=0;i<tomorrowEvents.length;i++)for(let j=i+1;j<tomorrowEvents.length;j++){
  const a=tomorrowEvents[i],b=tomorrowEvents[j];
  if(a.start<b.end&&b.start<a.end)conflicts.push(a.label+' ↔ '+b.label);
 }
 const all=lessons.filter(x=>x.number>=1&&x.number<=55);
 const lessonEstimate=estimate && lessons[estimate.anchorSession-1];
 const moveDefault=cancellations.some(c=>c.from===today)?n2PlanNextClassDate(today):today;

 const realPending=[...(teacher?.items||[]),...actual].filter(t=>!p.done[t.id]);
 const options=all.map(x=>'<option value="'+x.number+'" '+(p.anchorSession===x.number?'selected':'')+'>Buổi '+x.number+' · '+n2PlanEscape(x.contents.slice(0,2).join(', ').slice(0,72))+'</option>').join('');
 let html='<button class="foundation-inline-back" data-n2-root>← N2</button>'+
 '<section class="hero n2-hero"><strong>🗓️ Học gì trước buổi tới?</strong><p>Ưu tiên chuẩn bị cho lớp gần nhất. Chỉ khi xong việc ưu tiên mới chuyển sang bài tồn đọng.</p></section>'+
 '<div class="n2-plan-panel"><h3>📍 Lịch học thực tế + giáo trình tham khảo</h3><p>SHub và lời Sensei là dữ liệu bài giao thực tế. KOSEI 55 buổi chỉ là kế hoạch dự kiến, không tự coi là bài đã giao.</p>'+
 '<div class="n2-plan-inputs"><label>Ngày của buổi đã xác nhận<input id="planAnchorDate" type="date" value="'+n2PlanEscape(p.anchorDate)+'"></label>'+
 '<label>Buổi trong giáo trình<select id="planAnchorSession">'+options+'</select></label></div>'+
 '<button class="secondary-btn" id="planSaveAnchor">💾 Lưu mốc lớp N2</button>'+
 '<p class="n2-plan-hint">'+(p.anchorDate?(p.confirmed?'✅ Đã xác nhận: ':'⚠️ Mốc dự kiến, chưa xác nhận: ')+'buổi '+p.anchorSession+' ngày '+p.anchorDate+'. Lịch sau đây được suy ra theo T2–T4–T6; nghỉ/đổi buổi phải cập nhật.':'⚠️ Chưa chọn buổi thực tế. App chưa tự đoán bạn đang học đến đâu.')+'</p></div>';
 html+='<div class="n2-plan-priority"><span class="n2-plan-pill">📌 ƯU TIÊN TỪ NGUỒN THỰC TẾ</span><h3>🧑‍🏫 Sensei thông báo (Zalo 06/10)</h3><p class="n2-plan-hint">Ảnh ghi “kiểm tra buổi sau” nhưng KHÔNG xác định ngày kiểm tra. Có thể đã kiểm tra trong buổi trước hôm nay. Đánh dấu “Đã kiểm tra” khi bạn xác nhận, không coi đây là bài tối nay.</p>'+
 (teacher?teacher.items.map(t=>'<div class="n2-plan-task"><label class="n2-plan-check"><input data-n2-plan-item="'+n2PlanEscape(t.id)+'" type="checkbox"><span>'+n2PlanEscape(t.text)+'</span></label><button class="secondary-btn" data-plan-open="'+n2PlanEscape(t.link)+'">Ôn nhanh →</button></div>').join(''):'')+'</div>';
 html+='<section class="n2-plan-panel"><h3>📝 Danh sách bài tập SHub (từ ảnh)</h3><p class="n2-plan-hint">Ảnh chưa hiện hạn nộp, trạng thái 0/19 không khẳng định bài đã làm hoặc buổi học tương ứng. Bạn có thể tự tích khi hoàn tất.</p>'+
 actual.map(t=>'<div class="n2-plan-task"><label class="n2-plan-check"><input data-n2-plan-item="'+n2PlanEscape(t.id)+'" type="checkbox"><span>'+n2PlanEscape(t.text)+'</span></label></div>').join('')+'</section>';
 if(!p.confirmed && lessonEstimate) html+='<section class="n2-plan-panel"><h3>🗓️ Tối 09/10: dự kiến buổi 6</h3><p>Bạn cho biết “chắc học buổi 6”. Chưa xác minh được với SHub, nên <strong>đang dùng mốc dự kiến</strong>.</p><p>Trong kế hoạch KOSEI, buổi 6: '+n2PlanEscape(lessonEstimate.contents.join(' · '))+'</p><button class="secondary-btn" id="planUseEstimate">Dùng buổi 6 làm mốc dự kiến</button></section>';
 html+='<section class="n2-plan-panel"><h3>📆 Dời ngày học N2</h3><p>Nếu Sensei báo nghỉ, đánh dấu ngày nghỉ. Buổi học giữ nguyên số thứ tự, tự chuyển sang ngày N2 kế tiếp; toàn bộ buổi phía sau lùi theo, không nhân đôi bài.</p>'+
 '<div class="n2-plan-inputs"><label>Ngày được nghỉ<input type="date" id="n2MoveFrom" value="'+n2PlanEscape(today)+'"></label><label>Ngày học tiếp<input type="date" id="n2MoveTo" value="'+n2PlanEscape(n2PlanShift(today,3))+'"></label></div>'+
 '<label>Lý do<input id="n2MoveReason" class="n2-plan-input" value="Sensei báo nghỉ"></label>'+
 '<button class="secondary-btn" id="n2MoveSubmit">↪ Dời buổi học</button><p id="n2MoveStatus" role="status"></p>'+
 '<h4>Những ngày đã thay đổi</h4>'+
 (cancellations.length?cancellations.map(c=>'<div class="n2-plan-task"><span><strong>⏸ '+n2PlanEscape(c.from)+'</strong> → '+n2PlanEscape(c.to)+'<br><small>'+n2PlanEscape(c.reason)+'</small></span><button data-move-undo="'+n2PlanEscape(c.id)+'" class="secondary-btn">Hoàn tác</button></div>').join(''):'<p>Chưa có buổi nghỉ.</p>')+'</section>';
 if(target){
  html+='<div class="n2-plan-priority"><span class="n2-plan-pill">🔴 ƯU TIÊN 1 · '+(target.date===next.tomorrow?'HỌC TRƯỚC CHO NGÀY MAI':'CHUẨN BỊ BUỔI KẾ TIẾP')+'</span>'+
  '<h2>'+n2PlanLabel(target)+'</h2><p>⚠️ '+(p.confirmed?'Mốc học do bạn xác nhận; ':'Mốc buổi học vẫn chỉ là dự đoán; ')+'nội dung KOSEI chỉ mang tính tham khảo: '+n2PlanEscape(target.lesson.contents.join(' · '))+'</p>'+
  '<h3>① Học trước bài sẽ lên lớp</h3>'+n2PlanLinked(next.urgent)+
  '<h3>② Bài tập cần hoàn thành trước buổi tới</h3>'+(next.due.length?n2PlanLinked(next.due):'<p>Chưa ghi nhận bài tập còn thiếu từ buổi trước.</p>')+
  '<div class="n2-plan-lock">'+(next.needPrep?'🔒 Hoàn tất mục ưu tiên trước khi chuyển sang bài còn tồn.':'✅ Đã hoàn thành phần ưu tiên. Có thể quay lại học các bài bỏ lỡ.')+'</div></div>';
 }else html+='<div class="n2-plan-panel"><p>📍 Chọn mốc buổi học ở trên để mở đúng bài cần chuẩn bị, bài tập và ưu tiên.</p></div>';
 if(!next.needPrep && !realPending.length && next.backlog.length)html+='<section class="n2-plan-panel"><h3>🟡 Ưu tiên 2 · Bài chưa học</h3>'+n2PlanLinked(next.backlog.slice(0,16))+'</section>';
 else if((next.needPrep || realPending.length) && next.backlog.length)html+='<div class="n2-plan-muted">📦 Có '+next.backlog.length+' đầu mục từ các buổi cũ chưa đánh dấu xong; sẽ hiện sau khi hoàn tất việc ưu tiên.</div>';
 html+='<section class="n2-plan-panel"><h3>📆 Lịch sắp tới</h3><p class="n2-plan-hint">Lớp N2 T2/T4/T6 · 21:00–23:00. Lớp Mất gốc T3/T5/T7 · 20:45–22:45. Theo Google Calendar đã đối chiếu.</p>'+
 n2PlanClasses(today,13).map(e=>n2PlanEventsHtml({...e,label:e.label||'Lớp học'})).join('')+
 (conflicts.length?'<p class="n2-plan-conflict">⚠️ Ngày mai trùng lịch: '+n2PlanEscape(conflicts.join(', '))+'</p>':'')+'</section>';
 html+='<section class="n2-plan-panel"><h3>📘 55 buổi theo nguồn KOSEI</h3><p>Chọn từng buổi để xem bài học và bài tập nguồn. Không xem bài tập của buổi cũ là đã hoàn thành nếu chưa đánh dấu.</p>'+
 '<div class="n2-plan-sessions">'+all.map(l=>'<details><summary>Buổi '+l.number+' · '+n2PlanEscape(l.contents.slice(0,2).join(' · '))+'</summary>'+
 '<strong>Nội dung học:</strong><ul>'+l.contents.map(x=>'<li>'+n2PlanEscape(x)+'</li>').join('')+'</ul><strong>Bài tập về nhà:</strong><ul>'+l.homework.map(x=>'<li>'+n2PlanEscape(x)+'</li>').join('')+'</ul></details>').join('')+'</div></section>';
 html+='<section class="n2-plan-panel"><h3>🔔 Nhắc nhở</h3><p>Trang tự đổi việc ưu tiên theo ngày khi bạn mở app. Có thể bật thông báo lúc 20:00 khi trang vẫn đang mở. Đây chưa phải push nền, nên đóng ứng dụng sẽ không có lời nhắc đáng tin cậy.</p><button class="secondary-btn" id="planNotify">🔔 Bật thông báo thiết bị</button><p id="planNotifyStatus" role="status"></p></section>';
 main.innerHTML=html;
 document.querySelector('[data-n2-root]').onclick=()=>{n2UI.view='root';renderN2()};
 document.querySelector('#planSaveAnchor').onclick=()=>{
  const date=document.querySelector('#planAnchorDate').value,session=Number(document.querySelector('#planAnchorSession').value);
  if(!date||!window.N2_CLASS_SOURCE.timetable[0].days.includes(n2PlanDay(date))){alert('Vui lòng chọn ngày T2, T4 hoặc T6 của lớp N2.');return}
  p.anchorDate=date;p.anchorSession=session;p.confirmed=true;n2PlanSave(p);renderN2Planner();
 };
 document.querySelectorAll('[data-n2-plan-item]').forEach(el=>{
  const id=el.dataset.n2PlanItem;el.checked=!!p.done[id];el.onchange=()=>n2PlanMark(id,el.checked);
 });
 document.querySelectorAll('[data-plan-open]').forEach(el=>el.onclick=()=>n2PlanOpen(el.dataset.planOpen));
 document.querySelector('#planUseEstimate')?.addEventListener('click',()=>{const state=n2PlanLoad();state.anchorDate=estimate.anchorDate;state.anchorSession=estimate.anchorSession;state.confirmed=false;n2PlanSave(state);renderN2Planner()});
 document.querySelector('#n2MoveSubmit').onclick=()=>{
   const date=document.querySelector('#n2MoveFrom').value,to=document.querySelector('#n2MoveTo').value,reason=document.querySelector('#n2MoveReason').value;
   try{n2PlanAddMove(p,date,to,reason);n2PlanSave(p);renderN2Planner()}
   catch(e){document.querySelector('#n2MoveStatus').textContent='⚠️ '+e.message}
 };
 document.querySelectorAll('[data-move-undo]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.moveUndo;
   if((source.classChanges||[]).some(c=>c.id===id)){p.changes={...(p.changes||{}),[id]:false}}
   else if(p.changes)delete p.changes[id];
   n2PlanSave(p);renderN2Planner();
 });
 document.querySelector('#planNotify').onclick=async()=>{
  const status=document.querySelector('#planNotifyStatus');
  if(!('Notification' in window)){status.textContent='Trình duyệt này không hỗ trợ Notification.';return}
  const permission=await Notification.requestPermission();
  if(permission==='granted'){const p=n2PlanLoad();p.notifications=true;n2PlanSave(p);n2PlanNotifyCheck();}
  status.textContent=permission==='granted'?'Đã bật nhắc lúc 20:00 khi ứng dụng đang mở. Khi đóng ứng dụng, trình duyệt không đảm bảo thông báo.':'Chưa cấp quyền nhận thông báo.';
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
