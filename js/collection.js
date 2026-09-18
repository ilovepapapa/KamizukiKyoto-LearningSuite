"use strict";
const GROUP_ORDER=["あ行","か行","さ行","た行","な行","は行","ま行","や行","ら行","わ行","ん"];
let data={kana:[],vocab:[],grammar:[],patterns:[],reading:[]};
let activeTab="kana";

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    [data.kana,data.vocab,data.grammar,data.patterns,data.reading]=await Promise.all([
      Kamizuki.loadStudyData("../data/cards.json",Kamizuki.keys.cards),
      Kamizuki.loadStudyData("../data/vocabulary.json",Kamizuki.keys.vocab),
      Kamizuki.loadStudyData("../data/grammar.json",Kamizuki.keys.grammar),
      Kamizuki.loadStudyData("../data/patterns.json",Kamizuki.keys.patterns),
      Kamizuki.loadStudyData("../data/reading.json",Kamizuki.keys.reading)
    ]);
    updateTotal();render();
  }catch(err){
    console.error(err);document.getElementById("collection-content").innerHTML=`<div class="page-message">无法读取收藏数据。</div>`;
  }
  document.getElementById("collection-tabs").addEventListener("click",e=>{
    const btn=e.target.closest("[data-tab]");if(!btn)return;
    activeTab=btn.dataset.tab;
    document.querySelectorAll("#collection-tabs [data-tab]").forEach(x=>x.classList.toggle("active",x===btn));
    render();
  });
});

function updateTotal(){
  const total=
    data.kana.filter(x=>Number(x.study?.seen||0)>0).length+
    data.vocab.filter(x=>Number(x.study?.seen||0)>0).length+
    data.grammar.filter(x=>Number(x.study?.seen||0)>0).length+
    data.patterns.filter(x=>Number(x.study?.seen||0)>0).length+
    data.reading.filter(x=>Number(x.study?.seen||0)>0).length;
  document.getElementById("collection-total").textContent=total;
}
function render(){
  if(activeTab==="kana")renderKana();
  if(activeTab==="vocab")renderVocab();
  if(activeTab==="grammar")renderGrammar();
  if(activeTab==="patterns")renderPatterns();
  if(activeTab==="reading")renderReading();
}
function renderKana(){
  const root=document.getElementById("collection-content");
  root.innerHTML=GROUP_ORDER.map(group=>{
    const items=data.kana.filter(c=>c.group===group);if(!items.length)return"";
    const unlocked=items.filter(c=>c.unlocked).length;
    return `<section class="kana-group-section">
      <div class="kana-group-header"><div class="kana-group-title">${group}</div><div class="kana-group-progress">${unlocked} / ${items.length}</div></div>
      <div class="kana-group-grid">${items.map(c=>c.unlocked?`
        <a class="collection-card active" href="card-detail.html?id=${encodeURIComponent(c.id)}">
          <small>${Kamizuki.esc(c.group)}</small><b>${Kamizuki.esc(c.hiragana)}</b><span>${Kamizuki.esc(c.katakana)} · ${Kamizuki.esc(c.roma)}</span><em>${Kamizuki.esc(c.word)} · ${Kamizuki.esc(c.meaning)}</em>
        </a>`:`
        <article class="collection-card locked"><small>${Kamizuki.esc(c.group)}</small><b>${Kamizuki.esc(c.hiragana)}</b><span>🔒</span><em>继续学习以解锁</em></article>`).join("")}</div>
    </section>`;
  }).join("");
}
function renderVocab(){
  const learned=data.vocab.filter(v=>Number(v.study?.known||0)>0);
  document.getElementById("collection-content").innerHTML=learned.length?`
    <div class="mastery-grid">${learned.map(v=>`<article class="mastery-card"><span>${Kamizuki.esc(v.category)}</span><h3>${Kamizuki.esc(v.word)}</h3><small>${Kamizuki.esc(v.reading)}</small><p>${Kamizuki.esc(v.meaning)}</p></article>`).join("")}</div>`:
    empty("还没有标记为“会了”的单词。","去单词页面开始学习","vocabulary.html");
}
function renderGrammar(){
  const learned=data.grammar.filter(g=>Number(g.study?.understood||0)>0);
  document.getElementById("collection-content").innerHTML=learned.length?`
    <div class="mastery-list">${learned.map(g=>`<article><b>${Kamizuki.esc(g.title)}</b><span>${Kamizuki.esc(g.formation)}</span><p>${Kamizuki.esc(g.meaning)}</p></article>`).join("")}</div>`:
    empty("还没有标记为“理解”的语法。","去语法页面开始学习","grammar.html");
}
function renderPatterns(){
  const learned=data.patterns.filter(p=>Number(p.study?.mastered||0)>0);
  document.getElementById("collection-content").innerHTML=learned.length?`
    <div class="mastery-list">${learned.map(p=>`<article><b>${Kamizuki.esc(p.pattern)}</b><span>${Kamizuki.esc(p.category)}</span><p>${Kamizuki.esc(p.meaning)}</p></article>`).join("")}</div>`:
    empty("还没有标记为“掌握”的句型。","去句型页面开始学习","patterns.html");
}
function empty(text,label,href){return `<div class="empty-library"><div>月</div><h2>${text}</h2><a class="primary-action" href="${href}">${label}</a></div>`;}

function renderReading(){
  const learned=data.reading.filter(r=>Number(r.study?.understood||0)>0);
  document.getElementById("collection-content").innerHTML=learned.length?`
    <div class="mastery-list">${learned.map(r=>`<article><b>${Kamizuki.esc(r.title)}</b><span>${Kamizuki.esc(r.category)}</span><p>${Kamizuki.esc(r.cn)}</p></article>`).join("")}</div>`:
    empty("还没有标记为“读懂”的短文。","去阅读页面开始学习","reading.html");
}
