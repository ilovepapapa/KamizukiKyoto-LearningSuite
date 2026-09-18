"use strict";

let kanaData=[], vocabData=[], patternData=[];
let quiz=null;

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    [kanaData,vocabData,patternData]=await Promise.all([
      Kamizuki.loadStudyData("../data/cards.json",Kamizuki.keys.cards),
      Kamizuki.loadStudyData("../data/vocabulary.json",Kamizuki.keys.vocab),
      Kamizuki.loadStudyData("../data/patterns.json",Kamizuki.keys.patterns)
    ]);
  }catch(err){
    console.error(err);
    document.getElementById("listening-stage").innerHTML=`<div class="page-message">无法读取听力数据。</div>`;
  }
  document.getElementById("start-listening").addEventListener("click",startQuiz);
});

function startQuiz(){
  const mode=document.getElementById("listening-mode").value;
  const total=Number(document.getElementById("listening-count").value||10);
  quiz={mode,total,index:0,correct:0,current:null,answered:false};
  nextQuestion();
}

function nextQuestion(){
  if(quiz.index>=quiz.total){showResult();return;}
  quiz.answered=false;
  quiz.current=makeQuestion(quiz.mode);
  renderQuestion();
  setTimeout(()=>Kamizuki.speak(quiz.current.speak),180);
}

function makeQuestion(mode){
  let actual=mode;
  if(mode==="mixed"){
    actual=["kana","vocab","patterns"][Math.floor(Math.random()*3)];
  }
  if(actual==="kana") return makeKanaQuestion();
  if(actual==="vocab") return makeVocabQuestion();
  return makePatternQuestion();
}

function makeKanaQuestion(){
  let pool=kanaData.filter(x=>x.unlocked);
  if(pool.length<4) pool=kanaData.slice(0,Math.max(10,4));
  const target=pool[Math.floor(Math.random()*pool.length)];
  const distractors=shuffle(kanaData.filter(x=>x.id!==target.id)).slice(0,3);
  const options=shuffle([target,...distractors]).map(x=>({id:x.id,label:x.hiragana}));
  return {
    type:"kana",
    title:"你听到的是哪个假名？",
    speak:target.hiragana,
    answer:target.id,
    answerText:`${target.hiragana} · ${target.roma}`,
    options
  };
}

function makeVocabQuestion(){
  const target=vocabData[Math.floor(Math.random()*vocabData.length)];
  const distractors=uniqueBy(
    shuffle(vocabData.filter(x=>x.id!==target.id && x.meaning!==target.meaning)),
    x=>x.meaning
  ).slice(0,3);
  const options=shuffle([target,...distractors]).map(x=>({id:x.id,label:x.meaning}));
  return {
    type:"vocab",
    title:"这个单词是什么意思？",
    speak:target.word,
    answer:target.id,
    answerText:`${target.word}（${target.reading}）· ${target.meaning}`,
    options
  };
}

function makePatternQuestion(){
  const target=patternData[Math.floor(Math.random()*patternData.length)];
  const distractors=uniqueBy(
    shuffle(patternData.filter(x=>x.id!==target.id && x.example_cn!==target.example_cn)),
    x=>x.example_cn
  ).slice(0,3);
  const options=shuffle([target,...distractors]).map(x=>({id:x.id,label:x.example_cn}));
  return {
    type:"patterns",
    title:"这句话是什么意思？",
    speak:target.example,
    answer:target.id,
    answerText:`${target.example} · ${target.example_cn}`,
    options
  };
}

function renderQuestion(){
  const q=quiz.current;
  const number=quiz.index+1;
  document.getElementById("listening-stage").className="listening-stage";
  document.getElementById("listening-stage").innerHTML=`
    <div class="quiz-topline"><span>QUESTION ${number} / ${quiz.total}</span><span>${quiz.correct} correct</span></div>
    <div class="listen-orb">🎧</div>
    <h2>${Kamizuki.esc(q.title)}</h2>
    <p class="listen-instruction">不要先看文字。听完以后再选择。</p>
    <button class="listen-play" id="listen-play">🔊 再听一次</button>
    <div class="listen-options large-options">
      ${q.options.map(o=>`<button class="listen-option" data-id="${Kamizuki.attr(o.id)}">${Kamizuki.esc(o.label)}</button>`).join("")}
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
  `;
  document.getElementById("listen-play").addEventListener("click",()=>Kamizuki.speak(q.speak));
  document.querySelectorAll(".listen-option").forEach(btn=>btn.addEventListener("click",()=>answer(btn.dataset.id)));
}

function answer(id){
  if(quiz.answered)return;
  quiz.answered=true;
  const correct=id===quiz.current.answer;
  if(correct) quiz.correct+=1;

  document.querySelectorAll(".listen-option").forEach(btn=>{
    btn.disabled=true;
    if(btn.dataset.id===quiz.current.answer) btn.classList.add("correct");
    else if(btn.dataset.id===id&&!correct) btn.classList.add("wrong");
  });

  Kamizuki.record("listening",{correct:correct?1:0,wrong:correct?0:1,exp:correct?3:0});
  const f=document.getElementById("quiz-feedback");
  f.innerHTML=`
    <div class="${correct?"feedback-correct":"feedback-wrong"}">${correct?"✓ 正确":"再听一次也没关系"}</div>
    <p>${Kamizuki.esc(quiz.current.answerText)}</p>
    <button class="study-action remember" id="listen-next">${quiz.index+1>=quiz.total?"查看结果":"下一题"}</button>
  `;
  document.getElementById("listen-next").addEventListener("click",()=>{
    quiz.index+=1;
    nextQuestion();
  });
}

function showResult(){
  const pct=Math.round(quiz.correct/quiz.total*100);
  document.getElementById("listening-score").textContent=`${pct}%`;
  document.getElementById("listening-stage").innerHTML=`
    <div class="result-seal">聴</div>
    <h2>这一轮完成</h2>
    <div class="result-score">${quiz.correct}<span>/ ${quiz.total}</span></div>
    <p>${resultText(pct)}</p>
    <div class="study-actions">
      <button class="study-action remember" id="listen-again">再做一轮</button>
      <a class="study-action neutral link-button" href="../index.html">回学习主页</a>
    </div>
  `;
  document.getElementById("listen-again").addEventListener("click",startQuiz);
}

function resultText(pct){
  if(pct>=90)return "耳朵已经开始直接识别日语了。保持短时重复即可。";
  if(pct>=70)return "基础连接已经建立。把错题再听两三次，比继续刷题更有效。";
  if(pct>=50)return "很正常。听力需要比阅读更多重复，先追求熟悉感。";
  return "不要追求一次答对。先把声音听熟，再回到单词和句型页面复习。";
}

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function uniqueBy(arr,keyFn){
  const seen=new Set();
  return arr.filter(x=>{const k=keyFn(x);if(seen.has(k))return false;seen.add(k);return true;});
}
