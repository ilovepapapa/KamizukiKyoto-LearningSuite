"use strict";
let vocabData = [];
let currentVocab = null;
let currentCategory = "all";
let query = "";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    vocabData = await Kamizuki.loadStudyData("../data/vocabulary.json", Kamizuki.keys.vocab);
    buildCategories();
    chooseNext();
    renderList();
    updateKnown();
  } catch (err) {
    console.error(err);
    document.getElementById("vocab-focus").innerHTML = `<div class="page-message">无法读取单词数据。</div>`;
  }

  document.getElementById("vocab-search").addEventListener("input", e => {
    query = e.target.value.trim().toLowerCase();
    renderList();
  });
  document.getElementById("vocab-category").addEventListener("change", e => {
    currentCategory = e.target.value;
    renderList();
  });
});

function buildCategories() {
  const cats = [...new Set(vocabData.map(x=>x.category))];
  const select = document.getElementById("vocab-category");
  select.insertAdjacentHTML("beforeend", cats.map(c=>`<option value="${Kamizuki.attr(c)}">${Kamizuki.esc(c)}</option>`).join(""));
}

function chooseNext() {
  currentVocab = Kamizuki.pickWeighted(vocabData, item => {
    const s=item.study||{};
    return (Number(s.seen||0)===0?70:0) + Number(s.review||0)*30 - Number(s.known||0)*8;
  }) || vocabData[0];
  renderFocus();
}

function renderFocus() {
  if (!currentVocab) return;
  const v=currentVocab, s=v.study||{};
  document.getElementById("vocab-focus").innerHTML = `
    <div class="focus-kicker">${Kamizuki.esc(v.category)}</div>
    <div class="vocab-word">${Kamizuki.esc(v.word)}</div>
    <div class="vocab-reading">${Kamizuki.esc(v.reading)}</div>
    <div class="vocab-meaning">${Kamizuki.esc(v.meaning)}</div>

    <div class="focus-audio-row">
      <button class="audio-pill" data-speak="${Kamizuki.attr(v.word)}">🔊 单词</button>
      <button class="audio-pill" data-speak="${Kamizuki.attr(v.example)}">🔊 例句</button>
    </div>

    <div class="example-block">
      <span>例句</span>
      <strong>${Kamizuki.esc(v.example)}</strong>
      <p>${Kamizuki.esc(v.example_cn)}</p>
    </div>

    <div class="study-note-box"><b>学习提示</b><p>${Kamizuki.esc(v.note)}</p></div>

    <div class="study-actions">
      <button class="study-action retry" id="vocab-review">再复习</button>
      <button class="study-action remember" id="vocab-known-btn">会了 +5 EXP</button>
      <button class="study-action neutral" id="vocab-next">换一个</button>
    </div>
    <div class="mini-progress">见过 ${Number(s.seen||0)} 次 · 会了 ${Number(s.known||0)} 次 · 复习 ${Number(s.review||0)} 次</div>
  `;
  Kamizuki.bindGlobalAudio(document.getElementById("vocab-focus"));
  document.getElementById("vocab-review").addEventListener("click",()=>mark(false));
  document.getElementById("vocab-known-btn").addEventListener("click",()=>mark(true));
  document.getElementById("vocab-next").addEventListener("click",chooseNext);
}

function mark(known) {
  const s=currentVocab.study ||= {};
  s.seen=Number(s.seen||0)+1;
  if(known) s.known=Number(s.known||0)+1;
  else s.review=Number(s.review||0)+1;
  Kamizuki.saveStudyData(Kamizuki.keys.vocab,vocabData);
  Kamizuki.record("vocab",{correct:known?1:0,wrong:known?0:1,exp:known?5:0});
  Kamizuki.toast(known?"单词已掌握 · +5 EXP":"已加入复习");
  updateKnown(); renderList();
  setTimeout(chooseNext,250);
}

function updateKnown() {
  const count=vocabData.filter(v=>Number(v.study?.known||0)>0).length;
  document.getElementById("vocab-known").textContent=count;
}

function filtered() {
  return vocabData.filter(v=>{
    const cat=currentCategory==="all"||v.category===currentCategory;
    const hay=`${v.word} ${v.reading} ${v.meaning}`.toLowerCase();
    return cat && hay.includes(query);
  });
}

function renderList() {
  const list=filtered();
  const root=document.getElementById("vocab-list");
  root.innerHTML=list.map(v=>`
    <button class="library-item ${currentVocab?.id===v.id?"active":""}" data-id="${Kamizuki.attr(v.id)}">
      <span class="library-main"><b>${Kamizuki.esc(v.word)}</b><small>${Kamizuki.esc(v.reading)}</small></span>
      <span class="library-meaning">${Kamizuki.esc(v.meaning)}</span>
      ${Number(v.study?.known||0)>0?'<i>✓</i>':""}
    </button>
  `).join("") || `<div class="page-message small">没有匹配内容。</div>`;
  root.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>{
    currentVocab=vocabData.find(x=>x.id===btn.dataset.id);
    renderFocus(); renderList();
    window.scrollTo({top:0,behavior:"smooth"});
  }));
}
