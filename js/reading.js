"use strict";
let readingData=[],currentReading=null,readingCategory="all",readingQuery="",answered=false;

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    readingData=await Kamizuki.loadStudyData("../data/reading.json",Kamizuki.keys.reading);
    buildCategories(); chooseReading(); renderReadingList(); updateCount();
  }catch(err){console.error(err);document.getElementById("reading-focus").innerHTML=`<div class="page-message">无法读取阅读数据。</div>`;}
  document.getElementById("reading-search").addEventListener("input",e=>{readingQuery=e.target.value.trim().toLowerCase();renderReadingList();});
  document.getElementById("reading-category").addEventListener("change",e=>{readingCategory=e.target.value;renderReadingList();});
});
function buildCategories(){const cats=[...new Set(readingData.map(x=>x.category))];document.getElementById("reading-category").insertAdjacentHTML("beforeend",cats.map(c=>`<option value="${Kamizuki.attr(c)}">${Kamizuki.esc(c)}</option>`).join(""));}
function chooseReading(){currentReading=Kamizuki.pickWeighted(readingData,r=>{const s=r.study||{};return (Number(s.seen||0)===0?80:0)+Number(s.review||0)*30+Number(s.wrong||0)*20-Number(s.understood||0)*8;})||readingData[0];answered=false;renderFocus();}
function renderFocus(){if(!currentReading)return;const r=currentReading,s=r.study||{};document.getElementById("reading-focus").innerHTML=`
  <div class="focus-kicker">${Kamizuki.esc(r.category)} · READING</div>
  <h2 class="reading-title">${Kamizuki.esc(r.title)}</h2>
  <div class="reading-text">${Kamizuki.esc(r.jp)}</div>
  <div class="focus-audio-row"><button class="audio-pill" data-speak="${Kamizuki.attr(r.jp)}">🔊 听全文</button><button class="audio-pill subtle" id="toggle-translation">显示中文</button></div>
  <div class="reading-translation" id="reading-translation" hidden>${Kamizuki.esc(r.cn)}</div>
  <div class="keyword-strip">${r.keywords.map(([jp,cn])=>`<span><b>${Kamizuki.esc(jp)}</b>${Kamizuki.esc(cn)}</span>`).join("")}</div>
  <div class="reading-question"><span>理解确认</span><h3>${Kamizuki.esc(r.question)}</h3><div class="reading-options">${r.options.map((o,i)=>`<button data-answer="${i}">${Kamizuki.esc(o)}</button>`).join("")}</div><div id="reading-feedback" class="quiz-feedback"></div></div>
  <div class="study-note-box"><b>阅读提示</b><p>${Kamizuki.esc(r.note)}</p></div>
  <div class="study-actions"><button class="study-action retry" id="reading-review">需要再读</button><button class="study-action remember" id="reading-known">读懂了 +7 EXP</button><button class="study-action neutral" id="reading-next">换一篇</button></div>
  <div class="mini-progress">读过 ${Number(s.seen||0)} 次 · 理解 ${Number(s.understood||0)} 次 · 复习 ${Number(s.review||0)} 次</div>`;
  Kamizuki.bindGlobalAudio(document.getElementById("reading-focus"));
  document.getElementById("toggle-translation").addEventListener("click",()=>{const box=document.getElementById("reading-translation");box.hidden=!box.hidden;document.getElementById("toggle-translation").textContent=box.hidden?"显示中文":"隐藏中文";});
  document.querySelectorAll(".reading-options [data-answer]").forEach(btn=>btn.addEventListener("click",()=>checkAnswer(Number(btn.dataset.answer))));
  document.getElementById("reading-review").addEventListener("click",()=>markReading(false));
  document.getElementById("reading-known").addEventListener("click",()=>markReading(true));
  document.getElementById("reading-next").addEventListener("click",chooseReading);
}
function checkAnswer(index){if(answered)return;answered=true;const r=currentReading,s=r.study||{};const ok=index===Number(r.answer);if(ok)s.correct=Number(s.correct||0)+1;else s.wrong=Number(s.wrong||0)+1;Kamizuki.saveStudyData(Kamizuki.keys.reading,readingData);document.querySelectorAll(".reading-options [data-answer]").forEach((b,i)=>{b.disabled=true;if(i===Number(r.answer))b.classList.add("correct");else if(i===index&&!ok)b.classList.add("wrong");});document.getElementById("reading-feedback").textContent=ok?"✓ 理解正确":"答案已标出。再听一次全文，再看关键词。";}
function markReading(ok){const s=currentReading.study ||= {};s.seen=Number(s.seen||0)+1;if(ok)s.understood=Number(s.understood||0)+1;else s.review=Number(s.review||0)+1;Kamizuki.saveStudyData(Kamizuki.keys.reading,readingData);Kamizuki.record("reading",{correct:ok?1:0,wrong:ok?0:1,exp:ok?7:0});Kamizuki.toast(ok?"短文已理解 · +7 EXP":"已加入阅读复习");updateCount();renderReadingList();setTimeout(chooseReading,250);}
function updateCount(){document.getElementById("reading-known").textContent=readingData.filter(r=>Number(r.study?.understood||0)>0).length;}
function renderReadingList(){const list=readingData.filter(r=>{const cat=readingCategory==="all"||r.category===readingCategory;const hay=`${r.title} ${r.jp} ${r.cn}`.toLowerCase();return cat&&hay.includes(readingQuery);});const root=document.getElementById("reading-list");root.innerHTML=list.map(r=>`<button class="library-item ${currentReading?.id===r.id?"active":""}" data-id="${Kamizuki.attr(r.id)}"><span class="library-main"><b>${Kamizuki.esc(r.title)}</b><small>${Kamizuki.esc(r.category)}</small></span>${Number(r.study?.understood||0)>0?'<i>✓</i>':""}</button>`).join("")||`<div class="page-message small">没有匹配内容。</div>`;root.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>{currentReading=readingData.find(x=>x.id===btn.dataset.id);answered=false;renderFocus();renderReadingList();window.scrollTo({top:0,behavior:"smooth"});}));}
