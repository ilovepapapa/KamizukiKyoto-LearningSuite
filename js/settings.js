"use strict";
document.addEventListener("DOMContentLoaded",()=>{
  const current=Kamizuki.settings(),goal=document.getElementById("daily-goal"),rate=document.getElementById("speech-rate"),rateOut=document.getElementById("speech-rate-value"),auto=document.getElementById("auto-play"),file=document.getElementById("import-file");
  goal.value=String(current.dailyGoal);rate.value=String(current.speechRate);rateOut.textContent=Number(current.speechRate).toFixed(2);auto.checked=!!current.autoPlay;
  rate.addEventListener("input",()=>rateOut.textContent=Number(rate.value).toFixed(2));
  document.getElementById("test-voice").addEventListener("click",()=>Kamizuki.speak("こんにちは。今日も日本語を勉強しましょう。"));
  document.getElementById("save-settings").addEventListener("click",()=>{Kamizuki.saveSettings({dailyGoal:Number(goal.value),speechRate:Number(rate.value),autoPlay:auto.checked});Kamizuki.headerProgress();Kamizuki.toast("设置已保存");});
  document.getElementById("reset-today").addEventListener("click",()=>{if(!confirm("确定重置今天的学习计数吗？"))return;localStorage.removeItem(Kamizuki.dailyKey());Kamizuki.headerProgress();Kamizuki.toast("今日计数已重置");});
  document.getElementById("export-data").addEventListener("click",exportData);
  file.addEventListener("change",()=>importData(file.files?.[0]));
  document.getElementById("reset-all").addEventListener("click",resetAll);
});
function exportData(){const data={schema:"kamizuki-backup-v1",exportedAt:new Date().toISOString(),items:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("kamizuki"))data.items[k]=localStorage.getItem(k);}const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`kamizuki-backup-${Kamizuki.todayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);Kamizuki.toast("学习记录已导出");}
async function importData(file){if(!file)return;try{const data=JSON.parse(await file.text());if(data.schema!=="kamizuki-backup-v1"||!data.items)throw new Error("格式不匹配");if(!confirm("导入会用备份中的同名学习记录覆盖当前记录。继续吗？"))return;for(const [k,v] of Object.entries(data.items)){if(k.startsWith("kamizuki")&&typeof v==="string")localStorage.setItem(k,v);}Kamizuki.toast("导入成功，正在刷新");setTimeout(()=>location.reload(),700);}catch(e){alert("无法导入：这不是有效的神月京都物语备份文件。");}}
function resetAll(){if(!confirm("确定清空全部学习记录吗？此操作无法撤销。"))return;if(!confirm("再次确认：五十音、单词、语法、句型、听力、阅读和统计记录都会清空。"))return;const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("kamizuki"))keys.push(k);}keys.forEach(k=>localStorage.removeItem(k));Kamizuki.toast("全部学习记录已清空");setTimeout(()=>location.reload(),700);}
