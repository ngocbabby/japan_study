/* Kaiwa Japanese furigana, aligned only against readings already provided in the user's document.
 * No external service or guessed dictionary readings. A failed alignment leaves Japanese unchanged.
 */
(function(){
'use strict';
const KANJI=/[\p{Script=Han}々〆〇]/u;
const UNKNOWN=/[\p{Script=Han}々〆〇0-9０-９A-Za-z]/u;
const abcHira=c=>{
 const n=c.charCodeAt(0);
 return n>=0x30a1&&n<=0x30f6?String.fromCharCode(n-0x60):c;
};
const normalize=s=>String(s||'').normalize('NFKC').split('').map(abcHira).join('')
  .replace(/[\u0020\u3000\t\n\r]+/g,'').replace(/[，､]/g,'、')
  .replace(/[｡．]/g,'。').replace(/[!！]/g,'！').replace(/[?？]/g,'？')
  .replace(/[｢｣]/g,'');
const trimReading=s=>String(s||'').replace(/^[（(]\s*/,'').replace(/\s*[）)]$/,'').trim();
function splitTokens(japanese){
 const arr=[];let start=0,opaque=UNKNOWN.test(japanese[0]||'');
 for(let i=0;i<japanese.length;i++){
   const v=UNKNOWN.test(japanese[i]);
   if(v!==opaque){arr.push({start,end:i,opaque,raw:japanese.slice(start,i)});start=i;opaque=v}
 }
 if(start<japanese.length)arr.push({start,end:japanese.length,opaque,raw:japanese.slice(start)});
 return arr;
}
function align(japanese,reading){
 const original=String(japanese||''),r=normalize(trimReading(reading));
 const tokens=splitTokens(original);
 if(!r||!tokens.length||r.length>900||original.length>900)return null;
 const memo=new Map();
 function estimate(word){
   const n=Array.from(word).filter(c=>KANJI.test(c)).length;
   const digits=(word.match(/[0-9０-９]/g)||[]).length;
   const latin=(word.match(/[A-Za-z]/g)||[]).length;
   return Math.max(1,2.3*n+2.0*digits+1.5*latin);
 }
 function walk(i,pos){
   const key=i+':'+pos;if(memo.has(key))return memo.get(key);
   if(i===tokens.length){const ans=pos===r.length?{cost:0,choices:[]}:null;memo.set(key,ans);return ans}
   const tk=tokens[i];
   if(!tk.opaque){
     const v=normalize(tk.raw);
     const next= r.startsWith(v,pos)?walk(i+1,pos+v.length):null;
     if(!next){memo.set(key,null);return null}
     const out={cost:next.cost,choices:[{from:tk.start,to:tk.end,reading:''},...next.choices]};
     memo.set(key,out);return out;
   }
   const exp=estimate(tk.raw),max=Math.min(r.length-pos,Math.ceil(exp*3+16),75);
   let best=null;
   for(let count=1;count<=max;count++){
     const segment=r.slice(pos,pos+count);
     if(/[、。！？（）]/.test(segment))break;
     const rest=walk(i+1,pos+count);if(!rest)continue;
     let cost=rest.cost+Math.pow(count-exp,2)/(exp+2)+Math.max(0,count-exp*2)*2;
     if(!/^[ぁ-んゔー・]+$/u.test(segment))cost+=30;
     if(!best||cost<best.cost)best={cost,choices:[{from:tk.start,to:tk.end,reading:segment},...rest.choices]};
   }
   memo.set(key,best);return best;
 }
 const result=walk(0,0);
 if(!result)return null;
 const totalKanji=[...original].filter(ch=>KANJI.test(ch)).length;
 const annotated=result.choices.reduce((n,part)=>n+(part.reading?[...original.slice(part.from,part.to)].filter(c=>KANJI.test(c)).length:0),0);
 return {parts:result.choices,totalKanji,annotated,penalty:result.cost};
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function decoratedRange(p,start,end){
 const runs=p.r?.length?p.r:[{t:p.t}];let offset=0,out='';
 for(const run of runs){
   const last=offset+run.t.length,left=Math.max(start,offset),right=Math.min(end,last);
   if(left<right){
     const text=run.t.slice(left-offset,right-offset);
     const color=run.c&&/^#[0-9a-f]{6}$/i.test(run.c)?'color:'+run.c+';':'';
     const bg=run.h&&/^#[0-9a-f]{6}$/i.test(run.h)?'background-color:'+run.h+';':'';
     const css=(run.b?'font-weight:700;':'')+(run.i?'font-style:italic;':'')+(run.u?'text-decoration:underline;':'')+color+bg;
     out+='<span'+(css?' style="'+css+'"':'')+(bg?' class="ib-source-highlight"':'')+'>'+escapeHtml(text)+'</span>';
   }
   offset=last;if(offset>=end)break;
 }
 return out||escapeHtml(p.t.slice(start,end));
}
function decorate(p,japaneseStart,japaneseEnd,reading,showRuby,omit){
 const raw=p.t.slice(japaneseStart,japaneseEnd);
 const aligned=showRuby&&reading?align(raw,reading):null;
 const gap=(start,end)=>omit&&start<omit.end&&end>omit.start
   ?(start<omit.start?decoratedRange(p,start,omit.start):'')+
    (end>omit.end?decoratedRange(p,omit.end,end):'')
   :decoratedRange(p,start,end);
 if(!aligned||!aligned.annotated)return gap(0,p.t.length);
 let out=gap(0,japaneseStart);
 for(const part of aligned.parts){
   const fragment=decoratedRange(p,japaneseStart+part.from,japaneseStart+part.to);
   out+=part.reading&&KANJI.test(raw.slice(part.from,part.to))
     ?'<ruby class="ib-ruby">'+fragment+'<rt>'+escapeHtml(part.reading)+'</rt></ruby>'
     :fragment;
 }
 return out+gap(japaneseEnd,p.t.length);
}
function isReadingOnly(text){
 const t=String(text||'').trim();
 return /^[（(][\u3040-\u30ff\s、。！？・「」ー]+[）)]$/u.test(t) && /[\u3041-\u3096]/u.test(t);
}
function plan(chapter){
 if(chapter.__rubyPlan)return chapter.__rubyPlan;
 const hidden=new Set(),readings=new Map(),inline=new Map(),arr=chapter.items||[];
 if(chapter.id==='c0'){
  const a=arr.findIndex(x=>x.t.startsWith('【日本語'));
  const b=arr.findIndex(x=>x.t.startsWith('【ひらがな'));
  const c=arr.findIndex(x=>x.t.startsWith('【NGHĨA'));
  if(a>=0&&b>a&&c>b){
    const first=arr.slice(a+1,b),second=arr.slice(b+1,c);
    if(first.length===second.length)first.forEach((_,j)=>readings.set(a+1+j,second[j].t));
    for(let j=b;j<c;j++)hidden.add(j);
  }
 }
 for(let i=0;i<arr.length;i++){
  if(hidden.has(i))continue;
  const text=arr[i].t;
  if(isReadingOnly(text)){
    const previous=i>0?arr[i-1].t:'';
    if(i>0&&/[\p{Script=Han}\p{Script=Katakana}]/u.test(previous)){
      readings.set(i-1,trimReading(text));
      hidden.add(i);
    }
    continue;
  }
  // Some priority sentences contain their old hiragana and Vietnamese meaning
  // in a single paragraph. Keep both written parts but omit only the phonetic parentheses.
  if(chapter.id==='c21'){
    const m=/（([^）]+)）/u.exec(text);
    if(m && /[\u3040-\u3096]/u.test(m[1])){
      const before=text.slice(0,m.index);
      if(/[\p{Script=Han}\p{Script=Katakana}]/u.test(before))
        inline.set(i,{reading:m[1],start:m.index,end:m.index+m[0].length});
    }
  }
 }
 const data={hidden,readings,inline};
 Object.defineProperty(chapter,'__rubyPlan',{value:data,configurable:true});
 return data;
}
window.KaiwaRuby={align,decorate,normalize,trimReading,decoratedRange,escapeHtml,plan,isReadingOnly};
})();