"use strict";
document.addEventListener("DOMContentLoaded",async()=>{
  const id=new URLSearchParams(location.search).get("id");
  const root=document.getElementById("card-detail-root");
  try{
    const cards=await Kamizuki.loadStudyData("../data/cards.json",Kamizuki.keys.cards);
    const c=cards.find(x=>x.id===id)||cards[0],s=c.study||{};
    root.innerHTML=`
      <section class="detail-card upgraded">
        <div class="detail-hero">
          <div><span>${Kamizuki.esc(c.group)}</span><b>${Kamizuki.esc(c.hiragana)}</b><em>${Kamizuki.esc(c.katakana)}</em><strong>${Kamizuki.esc(c.roma)}</strong></div>
          <div class="detail-audio"><button class="audio-pill" data-speak="${Kamizuki.attr(c.hiragana)}">🔊 假名</button><button class="audio-pill" data-speak="${Kamizuki.attr(c.word)}">🔊 例词</button></div>
        </div>
        <div class="detail-grid">
          <article><h3>字源</h3><p>${Kamizuki.esc(c.origin?.note||"暂不显示未经核实的历史字源结论。")}</p></article>
          <article><h3>记忆关键词</h3><p>${Kamizuki.esc(c.memory?.keyword||"")}</p></article>
          <article><h3>字形联想</h3><p>${Kamizuki.esc(c.memory?.shape||"")}</p></article>
          <article><h3>发音</h3><p>${Kamizuki.esc(c.pronunciation?.tip||"")}</p></article>
          <article><h3>例词</h3><p><strong>${Kamizuki.esc(c.word)}</strong> · ${Kamizuki.esc(c.meaning)}</p></article>
          <article><h3>学习记录</h3><p>见过 ${Number(s.seen||0)} 次 · 记住 ${Number(s.correct||0)} 次 · 再复习 ${Number(s.wrong||0)} 次 · 熟练度 ${Number(s.mastery||0)}%</p></article>
        </div>
      </section>`;
    Kamizuki.bindGlobalAudio(root);
  }catch(err){console.error(err);root.innerHTML=`<div class="page-message">无法读取卡牌数据。</div>`;}
});
