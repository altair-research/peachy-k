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
const DIAG = { active: false };                    // quick-check mode (see profile.js)
const lvl = (id) => (DIAG.active ? (DIAG.lv || 1) : stat(id).level);

// Speech is always paired with visible text/visuals, so muted devices (and missing voices) still work.
function say(text, lang, keepQueue) {
  try {
    if (S.muted || !('speechSynthesis' in window) || !text) return;
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
  if (SESSION.id === id) { SESSION.done = (SESSION.done || 0) + (ok ? 1 : 0); }
  if (ok) { s.right++; s.streak++; if (s.streak >= 4 && s.level < 2) { s.level++; s.streak = 0; } }
  else { s.wrong++; s.streak = 0; if (s.level > 1 && s.wrong % 3 === 0) s.level--; }
  save();
}

// A play session = a few rounds of one game (or a mixed run), so rounds never repeat endlessly.
const ROUNDS = 6;
const SESSION = { id: null, n: 0, mix: false, done: 0 };
const recent = {};                                   // per game: keys of the last rounds, to avoid repeats
// true if this round's key was seen in the last rounds (caller should regenerate); gives up after 8 tries
function dup(game, key) {
  const r = (recent[game.id] = recent[game.id] || []); game._tries = game._tries || 0;
  if (r.includes(key) && game._tries < 8) { game._tries++; return true; }
  game._tries = 0; r.push(key); if (r.length > 5) r.shift(); return false;
}
function launch(game, mix) {
  Object.assign(SESSION, { id: game.id, n: 0, mix: !!mix, done: 0, rounds: mix ? 2 : ROUNDS });
  game.play();
}
function surprise() {                                // mixed run: different game every couple of rounds
  const picks = (typeof currentPicks === 'function' ? currentPicks(3) : []).map(p => p.id);
  const pool = GAMES.filter(g => g.id !== SESSION.id && !(SESSION.hist || []).slice(-4).includes(g.id));
  const g = (picks.length && rnd(2) === 0 ? GAMES.find(x => x.id === pick(picks)) : null) || pick(pool);
  SESSION.hist = [...(SESSION.hist || []), g.id]; launch(g, true);
}
function sessionEnd(game) {
  const t = T(), good = SESSION.done;
  view().innerHTML = `<h1>🎉 ${t.roundDone}</h1><p class="tag">${t.gotRight(good, SESSION.rounds)}</p>
    <div class="menu intro"><button class="big math" id="again"><span class="gi">🔁</span>${t.playAgain}</button>
    <button class="big read" id="mixbtn"><span class="gi">🎲</span>${t.surprise}</button>
    <button class="big ss" id="goHome"><span class="gi">🏠</span>${t.pickAnother}</button></div>`;
  $('#again').onclick = () => launch(game); $('#mixbtn').onclick = surprise; $('#goHome').onclick = home;
  say(t.roundDone);
}
let NEXT_TOK = 0;
// Shows a "Next" button and moves on by itself after a short pause (tap to go sooner).
function nextButton(fn, opts = {}) {
  const tok = ++NEXT_TOK;
  setTimeout(() => {
    const cheer = $('#cheer'); if (!cheer || tok !== NEXT_TOK) return;
    cheer.insertAdjacentHTML('afterend', `<button class="next" id="nx">${T().next}</button>`);
    const btn = $('#nx');
    const go = () => {
      if (tok !== NEXT_TOK || !document.body.contains(btn)) return;
      NEXT_TOK++; SESSION.n++;
      const g = GAMES.find(x => x.id === SESSION.id);
      if (!g || SESSION.n < SESSION.rounds) return fn();
      return SESSION.mix ? surprise() : sessionEnd(g);
    };
    btn.onclick = go;
    if (opts.auto !== false && !DIAG.active) { const f = $('#fact'); setTimeout(go, opts.auto || Math.min(4200, 1300 + 45 * (f ? f.textContent.length : 0))); }
  }, 450);
}

// Generic multiple-choice round.
// item: { ask, show?, opts:[{html,label?,ok?}], after?, vocab?, onRender?, onCorrect?, cls? }
function quiz(game, item) {
  const askText = L(item.ask);
  const key = askText + '|' + (item.show || '').replace(/style="[^"]*"/g, '') + '|' + item.opts.map(o => o.html + (o.ok ? '*' : '')).sort().join(',');
  if (dup(game, key)) return game.play();
  const opts = shuffle(item.opts);
  view().innerHTML = `
    <div class="prompt">${askText}<button class="say" id="sp" aria-label="${T().listen}">🔊</button></div>
    ${item.show ? `<div class="show">${item.show}</div>` : ''}
    <div class="opts ${item.cls || ''}">${opts.map((o, i) => `<button class="opt" data-i="${i}">${o.html}${o.label ? `<span class="ol">${labelText(o.label)}</span>` : ''}</button>`).join('')}</div>
    <div class="cheer" id="cheer"></div><div class="fact" id="fact"></div>`;
  const ask = () => { say(item.askSay ? L(item.askSay) : askText); if (item.askExtra) say(item.askExtra.t, item.askExtra.lang, true); };
  $('#sp').onclick = ask; ask();
  if (item.onRender) item.onRender();
  let missed = false;
  if (DIAG.active) DIAG.decorate(game);
  $$('.opt').forEach(btn => btn.onclick = () => {
    if (DIAG.active) { DIAG.answer(game, !!opts[+btn.dataset.i].ok, btn); return; }
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
