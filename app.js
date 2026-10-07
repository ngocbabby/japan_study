const STORAGE_KEY = 'japanStudy.v1';

const defaults = {
  settings: { dailyCap: 120, sessionLength: 25, reviewRatio: 30 },
  goals: [],
  slots: [
    { id: crypto.randomUUID(), day: 1, start: '06:00', end: '07:00', energy: 3 },
    { id: crypto.randomUUID(), day: 3, start: '18:30', end: '19:30', energy: 2 },
    { id: crypto.randomUUID(), day: 0, start: '09:00', end: '11:00', energy: 3 }
  ],
  completions: []
};

let state = loadState();

const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved) return structuredClone(defaults);
    return {
      settings:{...defaults.settings,...saved.settings},
      goals:Array.isArray(saved.goals)?saved.goals:[],
      slots:Array.isArray(saved.slots)?saved.slots:defaults.slots,
      completions:Array.isArray(saved.completions)?saved.completions:[]
    };
  }catch{
    return structuredClone(defaults);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }

function daysUntil(dateStr){
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr+'T00:00:00');
  return Math.ceil((target-today)/86400000);
}

function goalProgress(goal){
  if(!goal.units) return 0;
  return clamp(Math.round((goal.mastered/goal.units)*100),0,100);
}

function priorityScore(goal){
  const days = Math.max(0,daysUntil(goal.deadline));
  const urgency = days <= 1 ? 10 : days <= 3 ? 8 : days <= 7 ? 6 : days <= 30 ? 4 : 2;
  const remaining = Math.max(0,goal.units-goal.mastered);
  const gap = remaining / Math.max(1,goal.units);
  return urgency*3 + Number(goal.importance)*2 + Number(goal.difficulty) + gap*8;
}

function availableMinutesToday(){
  const day = new Date().getDay();
  const mins = state.slots
    .filter(s=>Number(s.day)===day)
    .reduce((sum,s)=>sum+Math.max(0,timeToMin(s.end)-timeToMin(s.start)),0);
  return Math.min(mins,state.settings.dailyCap);
}

function timeToMin(t){
  const [h,m]=t.split(':').map(Number);
  return h*60+m;
}

function minToTime(m){
  const h=Math.floor(m/60)%24;
  const mm=m%60;
  return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');
}

function todaySlots(){
  const day = new Date().getDay();
  return state.slots
    .filter(s=>Number(s.day)===day)
    .sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
}

function buildPlan(){
  const goals = state.goals
    .filter(g=>g.mastered<g.units)
    .sort((a,b)=>priorityScore(b)-priorityScore(a));

  const slots = todaySlots();
  const cap = state.settings.dailyCap;
  const session = state.settings.sessionLength;
  const reviewRatio = state.settings.reviewRatio/100;
  const totalFree = Math.min(cap, slots.reduce((s,x)=>s+Math.max(0,timeToMin(x.end)-timeToMin(x.start)),0));

  if(!goals.length || !slots.length || totalFree<=0) return [];

  const reviewBudget = Math.round(totalFree*reviewRatio);
  const newBudget = totalFree-reviewBudget;
  let remainingNew = newBudget;
  let remainingReview = reviewBudget;
  const plan=[];

  const queues = slots.map(s=>({ ...s, cursor: timeToMin(s.start), endMin: timeToMin(s.end) }));

  function nextBlock(minutes, type, goal){
    let need = minutes;
    for(const q of queues){
      if(need<=0) break;
      const room=q.endMin-q.cursor;
      if(room<10) continue;
      const chunk=Math.min(need,room,session);
      if(chunk<10) continue;
      plan.push({
        id:crypto.randomUUID(),
        goalId:goal.id,
        title:goal.title,
        type,
        start:minToTime(q.cursor),
        end:minToTime(q.cursor+chunk),
        minutes:chunk,
        energy:q.energy
      });
      q.cursor+=chunk;
      need-=chunk;
    }
    return need;
  }

  for(const goal of goals){
    if(remainingNew<10) break;
    const remainingUnits=Math.max(1,goal.units-goal.mastered);
    const days=Math.max(1,daysUntil(goal.deadline));
    const targetMinutes=Math.ceil((remainingUnits*Math.max(3,Number(goal.difficulty)*2))/days);
    const allocation=clamp(targetMinutes,10,Math.min(remainingNew,session*2));
    const before=plan.length;
    const left=nextBlock(allocation,'new',goal);
    if(plan.length>before) remainingNew-=allocation-left;
  }

  const reviewGoals=[...goals].sort((a,b)=>{
    const pa=goalProgress(a), pb=goalProgress(b);
    return pa-pb || priorityScore(b)-priorityScore(a);
  });

  for(const goal of reviewGoals){
    if(remainingReview<10) break;
    const allocation=Math.min(session,remainingReview);
    const before=plan.length;
    const left=nextBlock(allocation,'review',goal);
    if(plan.length>before) remainingReview-=allocation-left;
  }

  if(plan.length && totalFree>=30){
    const topGoal=goals[0];
    const testMinutes=Math.min(10, queues.reduce((sum,q)=>sum+Math.max(0,q.endMin-q.cursor),0));
    if(testMinutes>=10) nextBlock(testMinutes,'test',topGoal);
  }

  return plan.sort((a,b)=>a.start.localeCompare(b.start));
}

function render(){
  renderCoverage();
  renderGoals();
  renderSlots();
  renderPlan();
  hydrateSettings();
}

function renderCoverage(){
  const total=state.goals.reduce((s,g)=>s+Number(g.units||0),0);
  const mastered=state.goals.reduce((s,g)=>s+Number(g.mastered||0),0);
  const score=total?Math.round(mastered/total*100):0;
  document.querySelector('#coverageScore').textContent=score+'%';
  const free=availableMinutesToday();
  document.querySelector('#heroText').textContent = free
    ? 'Hôm nay bạn có khoảng '+free+' phút học khả dụng. App sẽ ưu tiên mục gấp và yếu trước.'
    : 'Chưa có khung giờ rảnh hôm nay. Thêm lịch rảnh để app tự xếp.';
}

function renderGoals(){
  const wrap=document.querySelector('#goalList');
  wrap.innerHTML='';
  if(!state.goals.length){
    wrap.append(document.querySelector('#emptyTemplate').content.cloneNode(true));
    return;
  }
  [...state.goals]
    .sort((a,b)=>priorityScore(b)-priorityScore(a))
    .forEach(goal=>{
      const progress=goalProgress(goal);
      const days=daysUntil(goal.deadline);
      const priority=priorityScore(goal);
      const cls=priority>=28?'priority-high':priority>=20?'priority-mid':'priority-low';
      const card=document.createElement('article');
      card.className='goal-card';
      card.innerHTML=`
        <div class="goal-top">
          <div>
            <h3>${escapeHtml(goal.title)}</h3>
            <p>${days<0?'Đã quá hạn':days===0?'Hạn hôm nay':days===1?'Còn 1 ngày':'Còn '+days+' ngày'}</p>
          </div>
          <span class="priority-dot ${cls}" aria-label="Mức ưu tiên"></span>
        </div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <div class="goal-meta"><span>${goal.mastered}/${goal.units} đã vững</span><strong>${progress}%</strong></div>
        <div class="goal-actions">
          <button class="soft-btn" data-action="plus" data-id="${goal.id}" type="button">+1 đã vững</button>
          <button class="delete-btn" data-action="delete" data-id="${goal.id}" type="button">Xóa</button>
        </div>
      `;
      wrap.append(card);
    });
}

function renderSlots(){
  const wrap=document.querySelector('#slotList');
  wrap.innerHTML='';
  if(!state.slots.length){
    wrap.append(document.querySelector('#emptyTemplate').content.cloneNode(true));
    return;
  }
  [...state.slots]
    .sort((a,b)=>Number(a.day)-Number(b.day)||a.start.localeCompare(b.start))
    .forEach(slot=>{
      const row=document.createElement('div');
      row.className='slot-row';
      const e=Number(slot.energy)===3?'Năng lượng cao':Number(slot.energy)===2?'Năng lượng vừa':'Ôn nhẹ';
      row.innerHTML=`
        <div class="slot-day">${dayNames[Number(slot.day)]}</div>
        <div class="slot-time"><strong>${slot.start}–${slot.end}</strong><div class="energy">${e}</div></div>
        <button class="delete-btn" data-slot-delete="${slot.id}" type="button">Xóa</button>
      `;
      wrap.append(row);
    });
}

function renderPlan(){
  const wrap=document.querySelector('#todayPlan');
  wrap.innerHTML='';
  const plan=buildPlan();
  if(!plan.length){
    wrap.append(document.querySelector('#emptyTemplate').content.cloneNode(true));
    return;
  }
  plan.forEach(item=>{
    const card=document.createElement('article');
    card.className='plan-card';
    const label=item.type==='new'?'Học mới':item.type==='review'?'Ôn lại':'Kiểm tra nhớ';
    const tagClass=item.type==='new'?'new':item.type==='review'?'review':'test';
    const explanation=item.type==='new'
      ? 'Ưu tiên do deadline + lượng kiến thức chưa vững.'
      : item.type==='review'
      ? 'Giữ nhịp nhớ dài hạn, tránh học mới liên tục.'
      : 'Tự kiểm tra không nhìn tài liệu để phát hiện lỗ hổng.';
    card.innerHTML=`
      <div class="plan-time"><strong>${item.start}</strong><small>${item.minutes} phút</small></div>
      <div class="plan-main">
        <span class="tag ${tagClass}">${label}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${explanation}</p>
      </div>
      <button class="done-btn" type="button" title="Đánh dấu hoàn thành" data-plan-goal="${item.goalId}" data-plan-type="${item.type}">✓</button>
    `;
    wrap.append(card);
  });
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[ch]));
}

function hydrateSettings(){
  const f=document.querySelector('#settingsForm');
  f.dailyCap.value=state.settings.dailyCap;
  f.sessionLength.value=state.settings.sessionLength;
  f.reviewRatio.value=state.settings.reviewRatio;
  document.querySelector('#reviewRatioLabel').textContent=state.settings.reviewRatio+'%';
}

function openDialog(id){
  const d=document.querySelector(id);
  if(typeof d.showModal==='function') d.showModal();
}

document.querySelector('#addGoalBtn').addEventListener('click',()=>openDialog('#goalDialog'));
document.querySelector('#addSlotBtn').addEventListener('click',()=>openDialog('#slotDialog'));
document.querySelector('#openSettings').addEventListener('click',()=>openDialog('#settingsDialog'));
document.querySelector('#rebuildPlan').addEventListener('click',renderPlan);

document.querySelectorAll('.close-dialog').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog').close()));

document.querySelector('#goalForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const units=clamp(Number(data.get('units')),1,5000);
  const mastered=clamp(Number(data.get('mastered')),0,units);
  state.goals.push({
    id:crypto.randomUUID(),
    title:String(data.get('title')).trim(),
    deadline:String(data.get('deadline')),
    importance:Number(data.get('importance')),
    units,
    mastered,
    difficulty:Number(data.get('difficulty')),
    notes:String(data.get('notes')||'').trim()
  });
  saveState();
  e.currentTarget.reset();
  e.currentTarget.querySelector('[name="units"]').value=30;
  e.currentTarget.querySelector('[name="mastered"]').value=0;
  e.currentTarget.closest('dialog').close();
  render();
});

document.querySelector('#slotForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const start=String(data.get('start'));
  const end=String(data.get('end'));
  if(timeToMin(end)<=timeToMin(start)){
    alert('Giờ kết thúc phải sau giờ bắt đầu.');
    return;
  }
  state.slots.push({
    id:crypto.randomUUID(),
    day:Number(data.get('day')),
    start,
    end,
    energy:Number(data.get('energy'))
  });
  saveState();
  e.currentTarget.closest('dialog').close();
  render();
});

document.querySelector('#settingsForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  state.settings={
    dailyCap:clamp(Number(data.get('dailyCap')),20,600),
    sessionLength:clamp(Number(data.get('sessionLength')),10,90),
    reviewRatio:clamp(Number(data.get('reviewRatio')),20,60)
  };
  saveState();
  e.currentTarget.closest('dialog').close();
  render();
});

document.querySelector('#settingsForm [name="reviewRatio"]').addEventListener('input',e=>{
  document.querySelector('#reviewRatioLabel').textContent=e.target.value+'%';
});

document.querySelector('#goalList').addEventListener('click',e=>{
  const btn=e.target.closest('button');
  if(!btn) return;
  const id=btn.dataset.id;
  const goal=state.goals.find(g=>g.id===id);
  if(!goal) return;
  if(btn.dataset.action==='plus') goal.mastered=Math.min(goal.units,goal.mastered+1);
  if(btn.dataset.action==='delete') state.goals=state.goals.filter(g=>g.id!==id);
  saveState();
  render();
});

document.querySelector('#slotList').addEventListener('click',e=>{
  const btn=e.target.closest('[data-slot-delete]');
  if(!btn) return;
  state.slots=state.slots.filter(s=>s.id!==btn.dataset.slotDelete);
  saveState();
  render();
});

document.querySelector('#todayPlan').addEventListener('click',e=>{
  const btn=e.target.closest('[data-plan-goal]');
  if(!btn) return;
  const goal=state.goals.find(g=>g.id===btn.dataset.planGoal);
  if(!goal) return;
  if(btn.dataset.planType==='new') goal.mastered=Math.min(goal.units,goal.mastered+1);
  state.completions.push({goalId:goal.id,type:btn.dataset.planType,at:new Date().toISOString()});
  saveState();
  render();
});

document.querySelector('#resetData').addEventListener('click',()=>{
  if(confirm('Xóa toàn bộ mục tiêu, lịch rảnh và tiến độ trên thiết bị này?')){
    localStorage.removeItem(STORAGE_KEY);
    state=structuredClone(defaults);
    saveState();
    document.querySelector('#settingsDialog').close();
    render();
  }
});

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  const view=btn.dataset.view;
  const target=view==='home'?document.querySelector('#todayPlan')
    :view==='goals'?document.querySelector('#goalList')
    :view==='calendar'?document.querySelector('#slotList')
    :document.querySelector('.hero-card');
  target?.scrollIntoView({behavior:'smooth',block:'start'});
}));

render();
