"use strict";
let patternData=[], currentPattern=null, patternQuery="", patternCategory="all";

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    patternData=await Kamizuki.loadStudyData("../data/patterns.json",Kamizuki.keys.patterns);
    buildPatternCategories();choosePattern();renderPatternList();updatePatternKnown();
  }catch(err){
    console.error(err);document.getElementById("pattern-focus").innerHTML=`<div class="page-message">无法读取句型数据。</div>`;
  }
  document.getElementById("pattern-search").addEventListener("input",e=>{patternQuery=e.target.value.trim().toLowerCase();renderPatternList();});
  document.getElementById("pattern-category").addEventListener("change",e=>{patternCategory=e.target.value;renderPatternList();});
});

function buildPatternCategories(){
  const cats=[...new Set(patternData.map(x=>x.category))];
  document.getElementById("pattern-category").insertAdjacentHTML("beforeend",cats.map(c=>`<option value="${Kamizuki.attr(c)}">${Kamizuki.esc(c)}</option>`).join(""));
}
function choosePattern(){
  currentPattern=Kamizuki.pickWeighted(patternData,p=>{
    const s=p.study||{};return (Number(s.seen||0)===0?80:0)+Number(s.review||0)*30-Number(s.mastered||0)*9;
  })||patternData[0];renderPatternFocus();
}
function renderPatternFocus(){
  if(!currentPattern)return;
  const p=currentPattern,s=p.study||{};
  document.getElementById("pattern-focus").innerHTML=`
    <div class="focus-kicker">${Kamizuki.esc(p.category)} · SENTENCE</div>
    <h2 class="pattern-title">${Kamizuki.esc(p.pattern)}</h2>
    <p class="pattern-meaning">${Kamizuki.esc(p.meaning)}</p>
    <div class="example-block large">
      <span>真实例句</span>
      <div class="example-with-audio">
        <strong>${Kamizuki.esc(p.example)}</strong>
        <button class="inline-audio" data-speak="${Kamizuki.attr(p.example)}">🔊</button>
      </div>
      <p>${Kamizuki.esc(p.example_cn)}</p>
    </div>
    <div class="study-note-box"><b>怎么用</b><p>${Kamizuki.esc(p.note)}</p></div>
    <div class="shadow-practice">
      <span>跟读练习</span>
      <button class="audio-pill" data-speak="${Kamizuki.attr(p.example)}">▶ 播放一次</button>
      <small>听 → 暂停 → 模仿整句，不要逐字翻译。</small>
    </div>
    <div class="study-actions">
      <button class="study-action retry" id="pattern-review">再练一次</button>
      <button class="study-action remember" id="pattern-known-btn">掌握了 +6 EXP</button>
      <button class="study-action neutral" id="pattern-next">换一句</button>
    </div>
    <div class="mini-progress">见过 ${Number(s.seen||0)} 次 · 掌握 ${Number(s.mastered||0)} 次 · 复习 ${Number(s.review||0)} 次</div>
  `;
  Kamizuki.bindGlobalAudio(document.getElementById("pattern-focus"));
  document.getElementById("pattern-review").addEventListener("click",()=>markPattern(false));
  document.getElementById("pattern-known-btn").addEventListener("click",()=>markPattern(true));
  document.getElementById("pattern-next").addEventListener("click",choosePattern);
}
function markPattern(ok){
  const s=currentPattern.study ||= {};s.seen=Number(s.seen||0)+1;
  if(ok)s.mastered=Number(s.mastered||0)+1;else s.review=Number(s.review||0)+1;
  Kamizuki.saveStudyData(Kamizuki.keys.patterns,patternData);
  Kamizuki.record("patterns",{correct:ok?1:0,wrong:ok?0:1,exp:ok?6:0});
  Kamizuki.toast(ok?"句型已掌握 · +6 EXP":"已加入复习");
  updatePatternKnown();renderPatternList();setTimeout(choosePattern,250);
}
function updatePatternKnown(){document.getElementById("patterns-known").textContent=patternData.filter(p=>Number(p.study?.mastered||0)>0).length;}
function renderPatternList(){
  const list=patternData.filter(p=>{
    const cat=patternCategory==="all"||p.category===patternCategory;
    const hay=`${p.pattern} ${p.meaning} ${p.example} ${p.example_cn}`.toLowerCase();
    return cat&&hay.includes(patternQuery);
  });
  const root=document.getElementById("pattern-list");
  root.innerHTML=list.map(p=>`
    <button class="library-item pattern-item ${currentPattern?.id===p.id?"active":""}" data-id="${Kamizuki.attr(p.id)}">
      <span class="library-main"><b>${Kamizuki.esc(p.pattern)}</b><small>${Kamizuki.esc(p.meaning)}</small></span>
      ${Number(p.study?.mastered||0)>0?'<i>✓</i>':""}
    </button>`).join("");
  root.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>{
    currentPattern=patternData.find(x=>x.id===btn.dataset.id);renderPatternFocus();renderPatternList();window.scrollTo({top:0,behavior:"smooth"});
  }));
}
