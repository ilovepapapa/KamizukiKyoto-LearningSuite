"use strict";

let cards = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    cards = await Kamizuki.loadStudyData("../data/cards.json", Kamizuki.keys.cards);
    currentIndex = chooseBestIndex();
    render();
  } catch (err) {
    console.error(err);
    document.getElementById("lesson-area").innerHTML = `<div class="page-message">无法读取五十音数据。</div>`;
  }

  document.getElementById("previous-button").addEventListener("click", () => move(-1));
  document.getElementById("next-button").addEventListener("click", () => move(1));
});

function chooseBestIndex() {
  const candidates = cards.map((card,index)=>({card,index})).filter(x=>x.card.unlocked);
  const best = Kamizuki.pickWeighted(candidates, ({card}) => {
    const s=card.study||{};
    const seen=Number(s.seen||0), correct=Number(s.correct||0), wrong=Number(s.wrong||0), mastery=Number(s.mastery||0);
    return (seen===0?90:0) + wrong*35 + (100-mastery)*.45 - correct*5;
  });
  return best ? best.index : 0;
}

function render() {
  const card = cards[currentIndex];
  if (!card) return;
  const unlocked = cards.filter(c=>c.unlocked).length;
  document.getElementById("kana-unlocked").textContent = unlocked;

  document.getElementById("lesson-area").innerHTML = `
    <article class="flip-card" id="flip-card" tabindex="0">
      <div class="flip-inner">
        <section class="flip-front">
          <div class="card-decoration">${Kamizuki.esc(card.group)} · KANA</div>
          <div class="card-main-kana">${Kamizuki.esc(card.hiragana)}</div>
          <button type="button" class="sound-orb" data-speak="${Kamizuki.attr(card.hiragana)}">🔊</button>
          <div class="tap-tip">点击卡片查看答案</div>
        </section>

        <section class="flip-back">
          <div class="card-decoration">${Kamizuki.esc(card.group)} · ANSWER</div>
          <div class="card-katakana">${Kamizuki.esc(card.katakana)}</div>
          <div class="card-romaji">${Kamizuki.esc(card.roma)}</div>
          <div class="divider"></div>
          <div class="word-area"><strong>${Kamizuki.esc(card.word)}</strong><span>${Kamizuki.esc(card.meaning)}</span></div>
          <div class="audio-practice-row">
            <button type="button" class="audio-pill" data-speak="${Kamizuki.attr(card.hiragana)}">🔊 假名</button>
            <button type="button" class="audio-pill" data-speak="${Kamizuki.attr(card.word)}">🔊 例词</button>
          </div>
          <div class="study-actions">
            <button type="button" class="study-action retry" id="kana-review">再复习</button>
            <button type="button" class="study-action remember" id="kana-known">记住了 +10 EXP</button>
          </div>
          <div class="card-level">Lv.${Number(card.level||1)} · EXP ${Number(card.exp||0)}/100</div>
        </section>
      </div>
    </article>
  `;

  const flip = document.getElementById("flip-card");
  flip.addEventListener("click", e => {
    if (!e.target.closest("button")) flip.classList.toggle("flipped");
  });
  flip.addEventListener("keydown", e => {
    if (e.key==="Enter" || e.key===" ") { e.preventDefault(); flip.classList.toggle("flipped"); }
  });

  Kamizuki.bindGlobalAudio(document.getElementById("lesson-area"));
  document.getElementById("kana-known").addEventListener("click", markKnown);
  document.getElementById("kana-review").addEventListener("click", markReview);

  updateNotes(card);
  updateAyano(card);
  updateArrows();

  if (Kamizuki.settings().autoPlay) setTimeout(()=>Kamizuki.speak(card.hiragana),120);
}

function markKnown() {
  const card=cards[currentIndex], s=card.study ||= {};
  s.seen=Number(s.seen||0)+1;
  s.correct=Number(s.correct||0)+1;
  card.exp=Number(card.exp||0)+10;
  while(card.exp>=100){card.exp-=100;card.level=Number(card.level||1)+1;}
  recalc(card);
  if (cards[currentIndex+1]) cards[currentIndex+1].unlocked=true;
  Kamizuki.saveStudyData(Kamizuki.keys.cards,cards);
  Kamizuki.record("kana",{correct:1,exp:10});
  Kamizuki.toast("记住了 · +10 EXP");
  setTimeout(()=>{currentIndex=chooseBestIndex();render();},300);
}

function markReview() {
  const card=cards[currentIndex], s=card.study ||= {};
  s.seen=Number(s.seen||0)+1;
  s.wrong=Number(s.wrong||0)+1;
  recalc(card);
  Kamizuki.saveStudyData(Kamizuki.keys.cards,cards);
  Kamizuki.record("kana",{wrong:1,exp:0});
  Kamizuki.toast("已提高复习优先级");
  setTimeout(()=>{currentIndex=chooseBestIndex();render();},300);
}

function recalc(card){
  const s=card.study||{}, c=Number(s.correct||0), w=Number(s.wrong||0), total=c+w;
  s.mastery=total?Math.round(c/total*100):0;
}

function move(dir) {
  for(let i=currentIndex+dir;i>=0&&i<cards.length;i+=dir){
    if(cards[i].unlocked){currentIndex=i;render();return;}
  }
}

function updateArrows() {
  const prev=cards.slice(0,currentIndex).some(c=>c.unlocked);
  const next=cards.slice(currentIndex+1).some(c=>c.unlocked);
  document.getElementById("previous-button").disabled=!prev;
  document.getElementById("next-button").disabled=!next;
}

function updateNotes(card) {
  document.getElementById("tip-origin").textContent = card.origin?.note || "这一张不显示未经核实的字源结论；右侧内容作为学习记忆提示。";
  document.getElementById("tip-shape").textContent = card.memory?.shape || "观察整体轮廓。";
  document.getElementById("tip-pronunciation").textContent = card.pronunciation?.tip || "听一次，模仿一次。";
  document.getElementById("tip-example").innerHTML = `<strong>${Kamizuki.esc(card.word)}</strong> · ${Kamizuki.esc(card.meaning)}<br><span>${Kamizuki.esc(card.memory?.keyword||"")}</span>`;
}

function updateAyano(card) {
  document.getElementById("ayano-jp-text").textContent = `今日は「${card.hiragana}」を覚えましょう。`;
  document.getElementById("ayano-cn-text").textContent = `今天练「${card.hiragana}」。先听声音，再看字形，最后用「${card.word}」固定记忆。`;
}
