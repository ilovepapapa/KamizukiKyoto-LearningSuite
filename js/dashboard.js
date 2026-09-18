"use strict";
document.addEventListener("DOMContentLoaded", renderDashboard);
window.addEventListener("kamizuki:progress", renderDashboard);

function renderDashboard() {
  const d = Kamizuki.getDaily();
  const goal = Kamizuki.settings().dailyGoal;
  const pct = Math.min(100, Math.round(d.total / goal * 100));

  document.getElementById("today-total").textContent = `${Math.min(d.total,goal)} / ${goal}`;
  document.getElementById("daily-progress-fill").style.width = `${pct}%`;
  for (const key of ["kana","vocab","grammar","patterns","listening","reading"]) {
    const el = document.getElementById(`daily-${key}`);
    if (el) el.textContent = d[key] || 0;
  }

  const jp = document.getElementById("dashboard-ayano");
  const cn = document.getElementById("dashboard-ayano-cn");
  if (d.total === 0) {
    jp.textContent = "今日は、少しずつ進めましょう。";
    cn.textContent = "今天从最小的一步开始就好。";
  } else if (d.total < goal) {
    jp.textContent = "いいペースです。このまま続けましょう。";
    cn.textContent = `节奏很好。今天已经完成 ${d.total} 次学习动作。`;
  } else {
    jp.textContent = "今日の目標、達成です。よく頑張りました。";
    cn.textContent = "今天的目标已经完成。可以停下来，也可以轻松复习。";
  }
}
