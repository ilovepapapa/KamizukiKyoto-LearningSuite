"use strict";
document.addEventListener("DOMContentLoaded",renderStats);
function parseArray(key){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[];}catch{return[];}}
function renderStats(){
  const s=Kamizuki.getStats(),d=Kamizuki.getDaily(),goal=Kamizuki.settings().dailyGoal;
  const kana=parseArray(Kamizuki.keys.cards),vocab=parseArray(Kamizuki.keys.vocab),grammar=parseArray(Kamizuki.keys.grammar),patterns=parseArray(Kamizuki.keys.patterns),reading=parseArray(Kamizuki.keys.reading);
  const basicDen=Number(s.correct||0)+Number(s.wrong||0),acc=basicDen?Math.round(Number(s.correct||0)/basicDen*100):0;
  const metrics=[
    ["总经验",Number(s.exp||0),"EXP"],["今日学习",Math.min(d.total,goal),`/ ${goal}`],["正向反馈率",acc,"%"],["学习天数",Object.keys(s.activeDays||{}).length,"天"],
    ["五十音解锁",kana.filter(x=>x.unlocked).length||1,"/ 46"],["单词掌握",vocab.filter(x=>Number(x.study?.known||0)>0).length,"/ 130"],["语法理解",grammar.filter(x=>Number(x.study?.understood||0)>0).length,"/ 51"],["句型掌握",patterns.filter(x=>Number(x.study?.mastered||0)>0).length,"/ 60"],["短文理解",reading.filter(x=>Number(x.study?.understood||0)>0).length,"/ 20"]
  ];
  document.getElementById("stats-grid").innerHTML=metrics.map(([l,v,u])=>`<article class="stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}<span>${u}</span></div></article>`).join("");

  const labels={kana:"五十音",vocab:"单词",grammar:"语法",patterns:"句型",listening:"听力",reading:"阅读"};
  const max=Math.max(1,...Object.values(s.moduleActions||{}).map(Number));
  document.getElementById("module-bars").innerHTML=Object.keys(labels).map(k=>{const n=Number(s.moduleActions?.[k]||0),pct=Math.round(n/max*100);return `<div class="module-bar"><span>${labels[k]}</span><div class="module-bar-track"><div class="module-bar-fill" style="width:${pct}%"></div></div><b>${n} 次</b></div>`;}).join("");

  const days=[];for(let i=6;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);const key=Kamizuki.todayKey(x);days.push({label:["日","一","二","三","四","五","六"][x.getDay()],active:!!s.activeDays?.[key]});}
  document.getElementById("week-strip").innerHTML=days.map(x=>`<div class="day-dot ${x.active?"active":""}"><span>周${x.label}</span><b>${x.active?"✓":"·"}</b></div>`).join("");
}
