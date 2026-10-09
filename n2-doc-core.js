/* Japan Study / N2 - local document analysis engine.
 * No remote AI requests. Every marked-correct answer is either in the source
 * answer key or determined by a matching word in the N2 dictionaries.
 */
window.N2DocCore = (() => {
  'use strict';
  const MAX_TEXT = 60000, MAX_WORDS = 65, MAX_QUESTIONS = 60;
  const jpKanji=/[\u3400-\u9fff々]/u;
  const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=s=>String(s||'').replace(/[０-９]/g,c=>String(c.charCodeAt(0)-65296));
  const normalize=s=>number(String(s||'')).replace(/\u3000/g,' ').replace(/[ \t]+/g,' ').trim();
  const compact=s=>String(s||'').replace(/[\s\u3000]+/g,'').trim();
  const clip=(s,n)=>String(s||'').slice(0,n);
  const optionNo=s=>{
    const v=number(String(s||'').replace(/[①②③④]/g,c=>String('①②③④'.indexOf(c)+1)).toUpperCase());
    return /^[1-4]$/.test(v)?Number(v)-1:/^[A-D]$/.test(v)?v.charCodeAt(0)-65:null;
  };
  const stemRegex=/^(?:(?:【\s*)?(?:(?:第\s*\d{1,3}\s*問)|(?:問(?:題)?|Ｑ|Q)\s*\d{1,3})(?:\s*[】\]）).:：、．]*)?)(.*)$/u;
  const choiceRegex=/^\s*([1-4１-４①②③④Ａ-ＤA-D])\s*[.．、:：)）]?\s+(.+)$/u;
  function dictionary(){
    const all=new Map();
    const lessons=window.N2_STUDY_DATA?.vocabLessons||[];
    for(const lesson of lessons)for(const w of (lesson.items||[])){
      if(w.term && w.reading && w.meaning)
        all.set(w.term,{id:w.id,term:w.term,reading:w.reading,meaning:w.meaning,source:'Mimikara N2'});
    }
    for(const lesson of window.N2_STUDY_DATA?.kanjiLessons||[])
      for(const item of lesson.items||[])
        for(const w of item.wordEntries||[]){
          if(w.term&&w.reading&&w.meaning&&!all.has(w.term))
            all.set(w.term,{id:'kanji-'+w.term,term:w.term,reading:w.reading,meaning:w.meaning,source:'Soumatome N2'});
        }
    return [...all.values()].filter(w=>w.term.length>=2 && w.term.length<=15 && (jpKanji.test(w.term)||w.term.length>=4) && !w.meaning.startsWith('—'));
  }
  function termsFromText(text, limit=MAX_WORDS){
    const plain=compact(text).slice(0,MAX_TEXT);
    if(!plain)return [];
    const found=[];
    for(const term of dictionary()){
      let hits=0,from=0,index=-1;
      while((index=plain.indexOf(term.term,from))!==-1 && hits<30){
        if(hits===0)term._index=index;
        hits++;
        from=index+term.term.length;
      }
      if(hits){
        const item={...term,count:hits};
        delete item._index;
        // Longer words rank above short accidental substring matches.
        item.priority=(hits*3)+Math.min(term.term.length,8)+ (term.source==='Mimikara N2'?1:0);
        found.push(item);
      }
    }
    return found.sort((a,b)=>b.priority-a.priority||a.term.localeCompare(b.term,'ja')).slice(0,Math.max(1,Math.min(limit,MAX_WORDS)))
      .map(({priority,...term})=>term);
  }
  function parseAnswerKey(text){
    const dict=new Map();
    const t=number(String(text||''));
    const lines=t.split(/\r?\n/).map(normalize).filter(Boolean);
    for(const line of lines){
      // Reliable explicit markings: "問1：2", "問1 の答え：2", "正解 問1 2".
      const patterns=[
        /(?:問(?:題)?|Q)\s*(\d{1,3})\s*(?:の\s*)?(?:答え|正解|解答)?\s*[:：=＝\-→]\s*([1-4A-D①②③④])(?=\s|$|[。．、])/iu,
        /(?:正解|答え|解答)\s*[:：]?\s*(?:問|Q)\s*(\d{1,3})\s*[:：=＝\-→\s]+\s*([1-4A-D①②③④])(?=\s|$|[。．、])/iu
      ];
      for(const pat of patterns){
        const m=line.match(pat);
        if(m){const x=optionNo(m[2]);if(x!==null)dict.set(Number(m[1]),{correctIndex:x,explanation:''});break;}
      }
    }
    return dict;
  }
  function parseQuestions(text){
    const original=String(text||'').replace(/\r/g,'').slice(0,MAX_TEXT);
    // Preserve PDF line breaks; do not invent inferred solutions.
    const lines=original.split('\n').map(normalize).filter(Boolean);
    const answers=parseAnswerKey(original),questions=[];
    for(let i=0;i<lines.length && questions.length<MAX_QUESTIONS;i++){
      const h=lines[i].match(stemRegex);
      if(!h || !/^(?:【\s*)?(?:第\s*\d{1,3}\s*問|(?:問(?:題)?|Ｑ|Q)\s*\d{1,3})/u.test(h[0]))continue;
      const num=Number((h[0].match(/(?:第\s*|問(?:題)?\s*|[QＱ]\s*)(\d{1,3})/u)||[])[1]);
      if(num<1 || num>300)continue;
      let question=(h[2]||'').trim();
      if(/^(?:[:：=＝\-→])\s*[1-4]$/.test(question))continue;
      const opts=[];
      let j=i+1,linesConsumed=0;
      while(j<lines.length && j<i+21){
        const line=lines[j];
        const nextHeader=line.match(stemRegex);
        if(nextHeader && /^(?:【\s*)?(?:第\s*\d{1,3}\s*問|(?:問(?:題)?|Ｑ|Q)\s*\d{1,3})/u.test(nextHeader[0]) && j>i+1)break;
        const m=line.match(choiceRegex);
        const expected=opts.length;
        if(m&&optionNo(m[1])===expected){
          opts.push({id:expected+1,text:clip(m[2],400)});
        }else if(!opts.length && linesConsumed<3){
          question+=(question?' ':'')+line;
        }else if(opts.length && !m && line.length < 110 && !/^(?:正解|解答|答え|解説)/.test(line)){
          opts[opts.length-1].text+=' '+line;
        }else if(opts.length===4){break;}
        linesConsumed++;j++;
        if(opts.length===4)break;
      }
      if(opts.length!==4||!question||opts.some(o=>o.text.length<1))continue;
      const known=answers.get(num)||null;
      const nearby=lines.slice(Math.max(0,i-5),i).join(' ').slice(-240);
      questions.push({
        id:'paper-'+num+'-'+questions.length,
        number:num,question:clip(question,500),options:opts,
        answerIndex:known?.correctIndex??null,
        explanation:known?.explanation||'',
        evidence:clip(nearby,240),origin:'document',
        sourceOfAnswer:known?'answer-key':'missing'
      });
      i=j-1;
    }
    return questions;
  }
  function normalizeOptions(choices,answerIndex,kind,question,evidence=''){
    return {id:'auto-'+kind+'-'+question.slice(0,32),number:0,
      question,options:choices.map((text,i)=>({id:i+1,text})),
      answerIndex,explanation:'Đáp án xác định trực tiếp từ danh sách từ vựng đã có trong ứng dụng.',evidence,origin:kind,sourceOfAnswer:'dictionary'};
  }
  function makeOptions(correct,candidates,seed){
    const unique=[...new Set(candidates.filter(Boolean).map(s=>String(s).trim()))].filter(x=>x && x!==correct);
    if(unique.length<3)return null;
    const picks=[];
    const start=Math.abs(seed*43 + correct.length*3) % unique.length;
    for(let i=0;i<unique.length && picks.length<3;i++){
      const value=unique[(start+i*7)%unique.length];if(!picks.includes(value))picks.push(value);
    }
    // In rare cases the striding cycle repeats.
    for(const x of unique)if(picks.length<3&&!picks.includes(x))picks.push(x);
    const position=seed%4;
    const choices=picks.slice(0,3);
    choices.splice(position,0,correct);
    return {choices,answerIndex:position};
  }
  function sentenceForWord(text,word){
    const parts=String(text||'').split(/(?<=[。！？!?；\n])/u);
    const s=parts.find(p=>p.includes(word)&&compact(p).length>=12&&compact(p).length<=165);
    return s?.trim().replace(/\s+/g,' ').slice(0,165)||'';
  }
  function generatePractice(doc,kind){
    const current=(doc.words||[]).filter(x=>x.learn!==false);
    const bank=dictionary();
    const allWords=[...current,...bank.filter(w=>!current.some(x=>x.term===w.term))];
    const quizzes=[];
    for(let i=0;i<current.length&&quizzes.length<60;i++){
      const w=current[i];
      if(kind==='vocab'){
        const opt=makeOptions(w.meaning,allWords.map(x=>x.meaning),i+5);
        if(opt)quizzes.push(normalizeOptions(opt.choices,opt.answerIndex,kind,'「'+w.term+'」（'+w.reading+'）có nghĩa là gì?',w.source));
      }else if(kind==='cloze'){
        const sentence=sentenceForWord(doc.text,w.term);
        if(!sentence)continue;
        const masked=sentence.replace(w.term,'＿＿＿＿');
        const opt=makeOptions(w.term,allWords.map(x=>x.term),i+9);
        if(opt)quizzes.push(normalizeOptions(opt.choices,opt.answerIndex,kind,'Điền từ phù hợp vào câu:\n'+masked,sentence));
      }
    }
    return quizzes;
  }
  function buildDocument({name,text,kind='text',pageRange='',ocr=false}){
    const raw=String(text||'').trim().slice(0,MAX_TEXT);
    if(raw.length<45)throw Error('Không trích xuất được đủ chữ Nhật. Với PDF dạng ảnh, hãy bật OCR; hoặc dán văn bản vào ô nhập.');
    return {
      id:'doc-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
      title:clip(name||'Tài liệu N2',110),
      date:new Date().toISOString(),kind,pageRange,ocr, text:raw,
      words:termsFromText(raw),questions:parseQuestions(raw),
      attempts:[],createdWith:'local-dictionary',version:1
    };
  }
  return {MAX_TEXT,termsFromText,parseQuestions,parseAnswerKey,generatePractice,buildDocument,html,number,normalize,dictionary};
})();