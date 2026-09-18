(() => {
  "use strict";

  const page = document.body.dataset.page || "home";
  const inPages = location.pathname.includes("/pages/");
  const root = inPages ? "../" : "";

  const nav = [
    ["home","🏯","学习主页",`${root}index.html`],
    ["kana","あ","五十音",`${root}pages/kana.html`],
    ["vocab","単","单词",`${root}pages/vocabulary.html`],
    ["grammar","文","语法",`${root}pages/grammar.html`],
    ["patterns","句","句型",`${root}pages/patterns.html`],
    ["listening","🎧","听力",`${root}pages/listening.html`],
    ["reading","読","阅读",`${root}pages/reading.html`],
    ["collection","🎴","收藏",`${root}pages/collection.html`],
    ["stats","📊","统计",`${root}pages/stats.html`],
    ["culture","⛩","日本文化",`${root}pages/culture.html`],
    ["settings","⚙","设置",`${root}pages/settings.html`]
  ];

  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
      <div class="logo-area">
        <div class="logo-jp">神月京都物语</div>
        <div class="logo-en">Kamizuki Kyoto</div>
      </div>
      <nav class="menu" aria-label="主导航">
        ${nav.map(([key,icon,label,href]) => `
          <a class="menu-item ${page === key ? "active" : ""}" href="${href}">
            <span class="menu-icon">${icon}</span><span>${label}</span>
          </a>
        `).join("")}
      </nav>
      <div class="sidebar-foot">
        <span>静かな一歩を、毎日。</span>
      </div>
    `;
  }

  const defaults = {
    dailyGoal: 12,
    speechRate: 0.78,
    autoPlay: false,
    compactCards: false
  };

  const keys = {
    cards: "kamizukiCards",
    vocab: "kamizukiVocab",
    grammar: "kamizukiGrammar",
    patterns: "kamizukiPatterns",
    reading: "kamizukiReading",
    stats: "kamizukiStats",
    settings: "kamizukiSettings"
  };

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function dailyKey(date = new Date()) {
    return `kamizukiDailyV2_${todayKey(date)}`;
  }

  function getDaily(date = new Date()) {
    const base = { total:0, kana:0, vocab:0, grammar:0, patterns:0, listening:0, reading:0, exp:0 };
    return { ...base, ...safeParse(localStorage.getItem(dailyKey(date)), {}) };
  }

  function addDaily(module, exp = 0) {
    const d = getDaily();
    d.total += 1;
    if (module in d) d[module] += 1;
    d.exp += exp;
    localStorage.setItem(dailyKey(), JSON.stringify(d));
    return d;
  }

  function getStats() {
    const old = safeParse(localStorage.getItem(keys.stats), {});
    return {
      studyActions:0,
      correct:0,
      wrong:0,
      listeningCorrect:0,
      listeningTotal:0,
      exp:0,
      activeDays:{},
      moduleActions:{kana:0,vocab:0,grammar:0,patterns:0,listening:0,reading:0},
      ...old,
      moduleActions:{
        kana:0,vocab:0,grammar:0,patterns:0,listening:0,reading:0,
        ...(old.moduleActions || {})
      }
    };
  }

  function record(module, {correct=0, wrong=0, exp=0} = {}) {
    const s = getStats();
    s.studyActions += 1;
    s.correct += correct;
    s.wrong += wrong;
    s.exp += exp;
    s.moduleActions[module] = (Number(s.moduleActions[module]) || 0) + 1;
    const day = todayKey();
    s.activeDays = s.activeDays || {};
    s.activeDays[day] = true;
    s.lastStudyDate = day;
    localStorage.setItem(keys.stats, JSON.stringify(s));
    addDaily(module, exp);
    window.dispatchEvent(new CustomEvent("kamizuki:progress"));
    return s;
  }

  async function loadJson(path) {
    const res = await fetch(path, {cache:"no-store"});
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return await res.json();
  }

  async function loadStudyData(path, storageKey) {
    const base = await loadJson(path);
    const saved = safeParse(localStorage.getItem(storageKey), []);
    if (!Array.isArray(saved)) return base;
    const map = new Map(saved.map(x => [x.id,x]));
    return base.map(item => {
      const old = map.get(item.id) || {};
      return {
        ...item,
        ...old,
        study:{...(item.study||{}),...(old.study||{})},
        memory:{...(item.memory||{}),...(old.memory||{})},
        origin:{...(item.origin||{}),...(old.origin||{})},
        pronunciation:{...(item.pronunciation||{}),...(old.pronunciation||{})}
      };
    });
  }

  function saveStudyData(storageKey, data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function settings() {
    return { ...defaults, ...safeParse(localStorage.getItem(keys.settings), {}) };
  }

  function saveSettings(next) {
    const s = {...settings(),...next};
    localStorage.setItem(keys.settings, JSON.stringify(s));
    return s;
  }

  function speak(text) {
    if (!text || !("speechSynthesis" in window)) return false;
    const cfg = settings();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = "ja-JP";
    u.rate = Number(cfg.speechRate) || 0.78;
    u.pitch = 1;
    u.volume = 1;
    const voices = speechSynthesis.getVoices();
    const ja = voices.find(v => /^ja[-_]/i.test(v.lang));
    if (ja) u.voice = ja;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  }

  function toast(message) {
    let node = document.getElementById("global-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "global-toast";
      node.className = "global-toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove("show"), 1800);
  }

  function esc(v) {
    return String(v ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  function attr(v) {
    return esc(v).replaceAll("'","&#39;");
  }

  function pickWeighted(items, scoreFn) {
    if (!items.length) return null;
    let best = items[0], bestScore = -Infinity;
    for (const item of items) {
      const score = Number(scoreFn(item)) + Math.random()*3;
      if (score > bestScore) { best = item; bestScore = score; }
    }
    return best;
  }

  function headerProgress() {
    const d = getDaily();
    const goal = settings().dailyGoal;
    const ratio = Math.min(100, Math.round(d.total / goal * 100));
    const exp = getStats().exp || 0;

    const total = document.querySelector("[data-header-daily]");
    const bar = document.querySelector("[data-header-bar]");
    const expNode = document.querySelector("[data-header-exp]");
    if (total) total.textContent = `今日 ${Math.min(d.total,goal)} / ${goal}`;
    if (bar) bar.style.width = `${ratio}%`;
    if (expNode) expNode.textContent = `总经验 ${exp} EXP`;
  }

  function bindGlobalAudio(scope=document) {
    scope.querySelectorAll("[data-speak]").forEach(btn => {
      if (btn.dataset.boundSpeak) return;
      btn.dataset.boundSpeak = "1";
      btn.addEventListener("click", e => {
        e.stopPropagation();
        speak(btn.dataset.speak);
      });
    });
  }

  window.Kamizuki = {
    keys, nav, root,
    todayKey, dailyKey, getDaily, getStats, record,
    loadJson, loadStudyData, saveStudyData,
    settings, saveSettings, speak, toast, esc, attr,
    pickWeighted, headerProgress, bindGlobalAudio
  };

  document.addEventListener("DOMContentLoaded", headerProgress);
  window.addEventListener("kamizuki:progress", headerProgress);

  if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`${root}service-worker.js`).catch(() => {});
    });
  }
})();
