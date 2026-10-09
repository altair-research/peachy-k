'use strict';
// Core: device-local state, speech, helpers, and the shared multiple-choice quiz engine.
const KEY = 'sag.v2';
const freshStat = () => ({ right: 0, wrong: 0, streak: 0, level: 1 });
let S = { lang: 'en', peaches: 0, stats: {}, addr: { street: '', city: '' } };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const T = () => I18N[S.lang];
const L = (o) => (typeof o === 'string' ? o : (o[S.lang] || o.en));
const B = (en, ko) => ({ en, ko });
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const view = () => $('#view');
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const others = (arr, not, n) => shuffle(arr.filter(x => x !== not)).slice(0, n);
const stat = (id) => (S.stats[id] = S.stats[id] || freshStat());
const lvl = (id) => stat(id).level;

// Speech is always paired with visible text/visuals, so muted devices (and missing voices) still work.
function say(text, lang, keepQueue) {
  try {
    if (!('speechSynthesis' in window) || !text) return;
    if (!keepQueue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || T().speech; u.rate = 0.85;
    speechSynthesis.speak(u);
  } catch (e) {}
}

function renderPeaches() {
  const b = Math.floor(S.peaches / 10), r = S.peaches % 10;
  $('#peaches').textContent = (b ? `🧺${b} ` : '') + `🍑${r}`;
}
function addPeach() { S.peaches++; save(); renderPeaches(); }

// 4 clean answers in a row -> level up (max 2); every 3rd miss -> level down.
function record(id, ok) {
  const s = stat(id);
  if (ok) { s.right++; s.streak++; if (s.streak >= 4 && s.level < 2) { s.level++; s.streak = 0; } }
  else { s.wrong++; s.streak = 0; if (s.level > 1 && s.wrong % 3 === 0) s.level--; }
  save();
}

function nextButton(fn) {
  setTimeout(() => {
    const c = $('#cheer'); if (!c) return;
    c.insertAdjacentHTML('afterend', `<button class="next" id="nx">${T().next}</button>`);
    $('#nx').onclick = fn;
  }, 900);
}

// Generic multiple-choice round.
// item: { ask, show?, opts:[{html,label?,ok?}], after?, vocab?, onRender?, onCorrect?, cls? }
function quiz(game, item) {
  const askText = L(item.ask);
  const opts = shuffle(item.opts);
  view().innerHTML = `
    <div class="prompt">${askText}<button class="say" id="sp" aria-label="${T().listen}">🔊</button></div>
    <div class="show">${item.show || ''}</div>
    <div class="opts ${item.cls || ''}">${opts.map((o, i) => `<button class="opt" data-i="${i}">${o.html}${o.label ? `<span class="ol">${labelText(o.label)}</span>` : ''}</button>`).join('')}</div>
    <div class="cheer" id="cheer"></div><div class="fact" id="fact"></div>`;
  const ask = () => { say(item.askSay ? L(item.askSay) : askText); if (item.askExtra) say(item.askExtra.t, item.askExtra.lang, true); };
  $('#sp').onclick = ask; ask();
  if (item.onRender) item.onRender();
  let missed = false;
  $$('.opt').forEach(btn => btn.onclick = () => {
    if (opts[+btn.dataset.i].ok) {
      btn.classList.add('ok');
      record(game.id, !missed); if (!missed) addPeach();
      $('#cheer').textContent = pick(T().right);
      if (item.after) $('#fact').textContent = L(item.after);
      say(item.vocab && S.lang !== 'en' ? item.vocab : (item.after ? L(item.after) : ''), item.vocab && S.lang !== 'en' ? 'en-US' : undefined);
      if (item.vocab && S.lang !== 'en' && item.after) say(L(item.after), undefined, true);
      $$('.opt').forEach(o => o.disabled = true);
      if (item.onCorrect) item.onCorrect();
      nextButton(() => game.play());
    } else {
      btn.classList.add('no'); missed = true; record(game.id, false);
      $('#cheer').textContent = T().again; say(T().again);
      setTimeout(() => btn.classList.remove('no'), 400);
    }
  });
}
// Bilingual labels: English mode shows English; Korean mode shows English + Korean (vocabulary help).
function labelText(l) { if (typeof l === 'string') return l; return S.lang === 'en' ? l.en : `${l.en}<br>${l.ko}`; }

// Helpers for building visuals
const emojiRow = (n, e, cls = '') => `<div class="grp ${cls}">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</div>`;
const numOpts = (ans, lo, hi, n = 3) => {
  const set = new Set([ans]); let guard = 0;
  while (set.size < n && guard++ < 50) { const v = ans + pick([-2, -1, 1, 2]); if (v >= lo && v <= hi) set.add(v); }
  return [...set].map(v => ({ html: `<span class="num">${v}</span>`, ok: v === ans }));
};

const GAMES = [];
const registerGame = (g) => GAMES.push(g);
