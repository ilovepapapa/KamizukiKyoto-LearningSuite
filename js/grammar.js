"use strict";
let grammarData=[], currentGrammar=null, grammarQuery="";

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    grammarData=await Kamizuki.loadStudyData("../data/grammar.json",Kamizuki.keys.grammar);
    chooseGrammar(); renderGrammarList(); updateGrammarKnown();
  }catch(err){
    console.error(err);
    document.getElementById("grammar-focus").innerHTML=`<div class="page-message">无法读取语法数据。</div>`;
  }
  document.getElementById("grammar-search").addEventListener("input",e=>{grammarQuery=e.target.value.trim().toLowerCase();renderGrammarList();});
});

function chooseGrammar(){
  currentGrammar=Kamizuki.pickWeighted(grammarData,g=>{
    const s=g.study||{};
    return (Number(s.seen||0)===0?80:0)+Number(s.review||0)*35-Number(s.understood||0)*10;
  })||grammarData[0];
  renderGrammarFocus();
}

function renderGrammarFocus(){
  if(!currentGrammar)return;
  const g=currentGrammar,s=g.study||{};
  document.getElementById("grammar-focus").innerHTML=`
    <div class="focus-kicker">${Kamizuki.esc(g.level)} · GRAMMAR</div>
    <h2 class="grammar-title">${Kamizuki.esc(g.title)}</h2>
    <div class="formation-box"><span>结构</span><strong>${Kamizuki.esc(g.formation)}</strong></div>
    <p class="grammar-meaning">${Kamizuki.esc(g.meaning)}</p>

    <div class="grammar-examples">
      ${g.examples.map((ex,i)=>`
        <article>
          <span>例句 ${i+1}</span>
          <button class="inline-audio" data-speak="${Kamizuki.attr(ex.jp)}">🔊</button>
          <strong>${Kamizuki.esc(ex.jp)}</strong>
          <p>${Kamizuki.esc(ex.cn)}</p>
        </article>
      `).join("")}
    </div>

    <div class="study-note-box"><b>注意</b><p>${Kamizuki.esc(g.note)}</p></div>

    <div class="study-actions">
      <button class="study-action retry" id="grammar-review">需要复习</button>
      <button class="study-action remember" id="grammar-known-btn">理解了 +8 EXP</button>
      <button class="study-action neutral" id="grammar-next">下一条</button>
    </div>
    <div class="mini-progress">见过 ${Number(s.seen||0)} 次 · 理解 ${Number(s.understood||0)} 次 · 复习 ${Number(s.review||0)} 次</div>
  `;
  Kamizuki.bindGlobalAudio(document.getElementById("grammar-focus"));
  document.getElementById("grammar-review").addEventListener("click",()=>markGrammar(false));
  document.getElementById("grammar-known-btn").addEventListener("click",()=>markGrammar(true));
  document.getElementById("grammar-next").addEventListener("click",chooseGrammar);
}

function markGrammar(ok){
  const s=currentGrammar.study ||= {};
  s.seen=Number(s.seen||0)+1;
  if(ok)s.understood=Number(s.understood||0)+1;else s.review=Number(s.review||0)+1;
  Kamizuki.saveStudyData(Kamizuki.keys.grammar,grammarData);
  Kamizuki.record("grammar",{correct:ok?1:0,wrong:ok?0:1,exp:ok?8:0});
  Kamizuki.toast(ok?"语法已理解 · +8 EXP":"已加入复习");
  updateGrammarKnown(); renderGrammarList(); setTimeout(chooseGrammar,250);
}

function updateGrammarKnown(){
  document.getElementById("grammar-known").textContent=grammarData.filter(g=>Number(g.study?.understood||0)>0).length;
}
function renderGrammarList(){
  const root=document.getElementById("grammar-list");
  const q=grammarQuery;
  const list=grammarData.filter(g=>`${g.title} ${g.formation} ${g.meaning}`.toLowerCase().includes(q));
  root.innerHTML=list.map(g=>`
    <button class="library-item grammar-item ${currentGrammar?.id===g.id?"active":""}" data-id="${Kamizuki.attr(g.id)}">
      <span class="library-main"><b>${Kamizuki.esc(g.title)}</b><small>${Kamizuki.esc(g.formation)}</small></span>
      ${Number(g.study?.understood||0)>0?'<i>✓</i>':""}
    </button>`).join("");
  root.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>{
    currentGrammar=grammarData.find(x=>x.id===btn.dataset.id);renderGrammarFocus();renderGrammarList();window.scrollTo({top:0,behavior:"smooth"});
  }));
}
