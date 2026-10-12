/* Japanese full-chapter reader. Matches N2 controls and Android-safe pause/resume behavior. */
(function(){
'use strict';
const tts={status:'stopped',run:0,index:0,parts:[],chapterId:null,
 utterance:null,bootTimer:null,startTimer:null,retries:0,rate:0.87,
 message:'Sẵn sàng nghe.',subscriber:null};
const check=()=>typeof window!=='undefined'&&('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window);
const clearTimers=()=>{if(tts.bootTimer!==null){clearTimeout(tts.bootTimer);tts.bootTimer=null}
 if(tts.startTimer!==null){clearTimeout(tts.startTimer);tts.startTimer=null}};
function notify(message){
 if(message)tts.message=message;
 if(typeof tts.subscriber==='function')tts.subscriber(getState());
}
function cancelCurrent(){
 tts.run++;clearTimers();tts.utterance=null;
 try{window.speechSynthesis?.cancel();
   if(window.speechSynthesis?.paused)window.speechSynthesis.resume();
 }catch{}
 return tts.run;
}
function stop(message){
 cancelCurrent();
 tts.status='stopped';tts.index=0;tts.parts=[];tts.chapterId=null;tts.retries=0;
 notify(message||'⏹ Đã dừng hẳn.');
}
function chunks(text,row){
 const source=String(text||'').trim(),sentences=source.match(/[^。！？!?]+[。！？!?]*/gu)||[];
 let list=[];
 for(const s of sentences){
  let piece=s.trim();
  while(piece.length>65){
   let at=piece.lastIndexOf('、',65)+1;
   if(at<20)at=58;
   list.push({text:piece.slice(0,at),row});
   piece=piece.slice(at).trim();
  }
  if(piece)list.push({text:piece,row});
 }
 return list;
}
function retry(run,utterance){
 if(run!==tts.run||utterance!==tts.utterance||tts.status==='paused'||tts.status==='stopped')return;
 if(tts.retries>=1){
   stop('⚠️ Không khởi động được giọng Nhật. Kiểm tra âm lượng và ngôn ngữ giọng đọc trên thiết bị.');
   return;
 }
 tts.retries++;
 const next=cancelCurrent();tts.status='starting';
 notify('⏳ Đang thử phát lại đoạn '+(tts.index+1)+'...');
 tts.bootTimer=setTimeout(()=>{tts.bootTimer=null;
  if(tts.run===next&&tts.status==='starting')playNext(next);
 },240);
}
function playNext(run){
 if(run!==tts.run||!['playing','starting'].includes(tts.status))return;
 if(tts.index>=tts.parts.length){stop('✅ Đã đọc hết bài.');return;}
 if(!check()){stop('⚠️ Thiết bị không hỗ trợ đọc văn bản tiếng Nhật.');return;}
 const synth=window.speechSynthesis,phrase=tts.parts[tts.index];
 const utterance=new SpeechSynthesisUtterance(phrase.text);
 let started=false;tts.utterance=utterance;tts.status='starting';
 utterance.lang='ja-JP';utterance.rate=tts.rate;utterance.pitch=1;
 const voices=synth.getVoices?.()||[];
 utterance.voice=voices.find(v=>/^ja(?:-|_)/i.test(v.lang)&&v.localService)||voices.find(v=>/^ja(?:-|_)/i.test(v.lang))||null;
 utterance.onstart=()=>{
   if(run!==tts.run||utterance!==tts.utterance||tts.status==='paused')return;
   started=true;
   if(tts.startTimer!==null){clearTimeout(tts.startTimer);tts.startTimer=null;}
   tts.retries=0;tts.status='playing';notify('🔊 Đang đọc · đoạn '+(tts.index+1)+'/'+tts.parts.length);
 };
 utterance.onend=()=>{
   if(run!==tts.run||utterance!==tts.utterance||tts.status==='paused')return;
   if(!started){retry(run,utterance);return}
   clearTimers();tts.utterance=null;tts.retries=0;tts.index++;
   if(tts.index>=tts.parts.length){stop('✅ Đã đọc hết bài.');return;}
   tts.status='starting';notify('⏳ Chuẩn bị đoạn '+(tts.index+1)+'/'+tts.parts.length+'...');
   tts.bootTimer=setTimeout(()=>{tts.bootTimer=null;
     if(run===tts.run&&tts.status==='starting')playNext(run);
   },70);
 };
 utterance.onerror=e=>{
  if(run!==tts.run||utterance!==tts.utterance||tts.status==='paused')return;
  if(['canceled','interrupted','audio-busy'].includes(e.error)){retry(run,utterance);return}
  stop('⚠️ Không thể phát âm tiếng Nhật ('+(e.error||'lỗi thiết bị')+').');
 };
 notify('⏳ Đang khởi động giọng Nhật · đoạn '+(tts.index+1)+'/'+tts.parts.length+'...');
 try{synth.speak(utterance)}catch(e){stop('⚠️ Không phát được âm thanh: '+(e?.message||'lỗi trình duyệt'));return}
 if(run===tts.run&&tts.status==='starting')tts.startTimer=setTimeout(()=>{
  tts.startTimer=null;
  if(run===tts.run&&tts.utterance===utterance&&tts.status==='starting')retry(run,utterance);
 },8000);
}
function start(chapterId,lines,rate){
 if(!check()){notify('⚠️ Trình duyệt không có tính năng đọc tiếng Nhật.');return false}
 stop();
 tts.chapterId=chapterId;tts.rate=Number(rate)||0.87;
 tts.parts=(lines||[]).flatMap(line=>chunks(line.text,line.row));
 if(!tts.parts.length){notify('Bài này chưa có nội dung tiếng Nhật để đọc.');return false}
 tts.status='starting';tts.index=0;tts.retries=0;
 playNext(tts.run);return true;
}
function togglePause(){
 if(tts.status==='stopped')return;
 if(tts.status!=='paused'){
  // Same behavior as N2: on Android resume() may stay silent. Restart current chunk safely.
  cancelCurrent();tts.status='paused';
  notify('⏸ Tạm dừng ở đoạn '+(tts.index+1)+'/'+tts.parts.length+'. Tiếp tục sẽ đọc lại đoạn này.');
 }else{
  const run=cancelCurrent();tts.status='starting';tts.retries=0;
  notify('⏳ Tiếp tục từ đoạn '+(tts.index+1)+'/'+tts.parts.length+'...');
  playNext(run);
 }
}
function speakOnce(text,rate){
 return start('single', [{text:String(text||''),row:null}],rate);
}
function getState(){
 return {status:tts.status,index:tts.index,total:tts.parts.length,chapterId:tts.chapterId,
  row:tts.parts[tts.index]?.row??null,message:tts.message};
}
function paint(root){
 if(!root||!root.querySelector)return;
 const status=getState();
 const play=root.querySelector('[data-action="reader-start"]');
 const pause=root.querySelector('[data-action="reader-pause"]');
 const stopBtn=root.querySelector('[data-action="reader-stop"]');
 const msg=root.querySelector('#ib-audio-status');
 if(play)play.textContent=status.status==='stopped'?'🔊 Đọc cả bài':'↻ Đọc lại từ đầu';
 if(pause){pause.disabled=status.status==='stopped';pause.textContent=status.status==='paused'?'▶ Tiếp tục':'⏸ Tạm dừng';}
 if(stopBtn)stopBtn.disabled=status.status==='stopped';
 if(msg)msg.textContent=status.message;
 for(const el of root.querySelectorAll('[data-read-row]'))el.classList.toggle('is-reading',status.status==='playing'&&status.row!==null&&String(status.row)===el.dataset.readRow);
}
function subscribe(callback){tts.subscriber=callback;notify()}
window.KaiwaAudio={start,stop,togglePause,speakOnce,getState,paint,subscribe};
})();