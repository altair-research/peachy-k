'use strict';
// Starting-point finder and check-ups:
//  (1) read a progress report (PDF or pasted text) with rule-based parsing,
//  (2) a full "quick check" (16 questions) and per-subject check-ups (8-10 questions),
//  (3) re-check any time: results are stored per date on this device and compared with the last time.
// All of this produces "Peachy's picks". Everything runs in the browser; nothing is uploaded.

const DIAG_IDS = ['count', 'order', 'tens', 'teens', 'compare', 'addsub', 'shapes2d', 'pattern',
  'letters', 'sounds', 'rhyme', 'flags', 'address', 'compass', 'living', 'motion'];
const CHECK_SKIP = ['ten', 'draw', 'memory', 'dots', 'lines', 'maze', 'simon', 'robot'];                       // games that cannot be scored as one question
const gameById = (id) => GAMES.find(g => g.id === id);

// ---- check history ----
S.checks = S.checks || [];
function latestResults() {                                          // per game: result of the most recent check
  const r = {};
  S.checks.forEach(c => { const per = {}; c.items.forEach(it => { per[it.id] = (per[it.id] !== false) && it.ok; }); Object.assign(r, per); });
  if (!S.checks.length && S.profile && S.profile.diag) S.profile.diag.missed.forEach(id => { r[id] = false; });   // older saves
  return r;
}

// ---- picks ----
function currentPicks(max = 3) {
  const P = S.profile || {}, res = latestResults();
  const need = {}, why = {};
  const add = (id, v, r) => { need[id] = (need[id] || 0) + v; (why[id] = why[id] || []).push(r); };
  if (P.report && P.report.picks.length) {
    const top = P.report.picks[0].score || 1;
    P.report.picks.forEach(p => add(p.id, (p.score / top) * 3, p.reasons[0]));
  }
  Object.keys(res).forEach(id => { if (res[id] === false) add(id, 3, '__quick__'); });
  return Object.keys(need)
    .filter(id => gameById(id) && (stat(id).right - stat(id).wrong) < 8)        // drop once clearly mastered in play
    .sort((a, b) => need[b] - need[a]).slice(0, max)
    .map(id => ({ id, need: need[id], why: why[id] }));
}

// ---- check-ups ----
function buildCheck(scope) {
  if (scope === 'all') return DIAG_IDS.map(id => ({ id, lv: 1 }));
  const capable = GAMES.filter(g => g.subject === scope && !CHECK_SKIP.includes(g.id));
  const items = shuffle(capable).map(g => ({ id: g.id, lv: 1 }));
  const extra = shuffle(capable).map(g => ({ id: g.id, lv: 2 }));        // second, harder question for small subjects
  while (items.length < 8 && extra.length) items.push(extra.shift());
  return items.slice(0, 10);
}
DIAG.decorate = (game) => {
  const n = DIAG.i + 1, tot = DIAG.items.length;
  view().insertAdjacentHTML('afterbegin', `<div class="progress"><div style="width:${Math.round(100 * DIAG.i / tot)}%"></div><span>${n}/${tot}</span></div>`);
  $('.prompt').insertAdjacentHTML('afterend', `<button class="skip" id="skip">🤷 ${T().dontKnow}</button>`);
  $('#skip').onclick = () => DIAG.answer(game, false, null);
};
DIAG.answer = (game, ok, btn) => {
  if (DIAG.busy) return; DIAG.busy = true;
  DIAG.res.push({ id: game.id, lv: DIAG.lv, ok });
  if (btn) btn.classList.add('picked');
  setTimeout(() => { DIAG.busy = false; DIAG.i++; diagStep(); }, 450);
};
function startDiag(scope) {
  S.introSeen = true; DIAG.scope = typeof scope === 'string' ? scope : 'all';
  DIAG.items = buildCheck(DIAG.scope); DIAG.active = true; DIAG.i = 0; DIAG.res = []; DIAG.busy = false; diagStep();
}
function diagStep() {
  if (DIAG.i >= DIAG.items.length) return finishDiag();
  const it = DIAG.items[DIAG.i]; DIAG.lv = it.lv; gameById(it.id).play();
}
function finishDiag() {
  DIAG.active = false;
  const prev = [...S.checks].reverse().find(c => c.scope === DIAG.scope);
  const check = { at: new Date().toISOString().slice(0, 16), scope: DIAG.scope, items: DIAG.res, ok: DIAG.res.filter(x => x.ok).length, total: DIAG.res.length };
  S.checks.push(check); if (S.checks.length > 40) S.checks.shift();
  S.profile = S.profile || {}; save(); checkResult(check, prev);
}
function quitDiag() { DIAG.active = false; DIAG.busy = false; }
const scopeName = (scope) => (scope === 'all' ? T().scopeAll : T().subjects[scope]);

function checkResult(check, prev) {
  const per = (c) => { const r = {}; c.items.forEach(it => { r[it.id] = (r[it.id] !== false) && it.ok; }); return r; };
  const now = per(check), before = prev ? per(prev) : {};
  const improved = Object.keys(now).filter(id => now[id] && before[id] === false);
  const stillMissed = Object.keys(now).filter(id => !now[id]);
  const gameLine = (id) => `${gameById(id).icon} ${L(gameById(id).title)}`;
  view().innerHTML = `<h1>📋 ${T().checkDone}</h1>
    <p class="tag">${scopeName(check.scope)}</p>
    <div class="scorebox"><span class="bigscore">${check.ok}/${check.total}</span><span class="peachrow">${'🍑'.repeat(check.ok)}</span></div>
    ${prev ? `<p class="cmp">${T().lastTime(prev.ok, prev.total)} → ${check.ok >= prev.ok ? '⬆️' : '➡️'} ${check.ok}/${check.total}${check.ok > prev.ok ? ` — ${T().better}` : ''}</p>` : ''}
    ${improved.length ? `<p class="good">✅ ${T().improved}: ${improved.map(gameLine).join(' · ')}</p>` : ''}
    ${stillMissed.length ? `<p class="note2">💪 ${T().practiceThese}: ${stillMissed.map(gameLine).join(' · ')}</p>` : `<p class="good">🌟 ${T().allRight}</p>`}
    <button class="next" id="seePicks">${T().seePicks}</button><div><button class="link" id="b">${T().letsPlay}</button></div>`;
  $('#seePicks').onclick = () => picksScreen(true);
  $('#b').onclick = home;
  say(T().checkDone);
}

// ---- report import ----
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function pdfToLines(file) {
  if (!window.pdfjsLib) await loadScript('vendor/pdfjs/pdf.min.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let lines = [];
  for (let i = 1; i <= doc.numPages; i++) lines = lines.concat(itemsToLines((await (await doc.getPage(i)).getTextContent()).items));
  return lines;
}

function importScreen() {
  S.introSeen = true; save();
  view().innerHTML = `<h1>📄 ${T().importTitle}</h1>
    <p class="note2">${T().importHelp}</p>
    <div class="form"><input type="file" id="file" accept=".pdf,.txt,application/pdf,text/plain"></div>
    <p class="note2">${T().orPaste}</p>
    <textarea id="paste" rows="6" placeholder="${T().pastePh}"></textarea>
    <div><button class="next" id="go">${T().readIt}</button></div>
    <div id="result"></div>
    <button class="link" id="b">${T().back}</button>`;
  $('#b').onclick = intro;
  $('#go').onclick = async () => {
    const out = $('#result'); out.textContent = '…';
    try {
      const f = $('#file').files[0];
      const lines = f ? (/pdf$/i.test(f.name) || f.type === 'application/pdf' ? await pdfToLines(f) : (await f.text()).split(/\r?\n/)) : $('#paste').value.split(/\r?\n/);
      const parsed = parseReportLines(lines), sc = scoreReport(parsed);
      if (!parsed.items.length) { out.innerHTML = `<p class="warn">${T().noItems}</p>`; return; }
      const graded = parsed.items.filter(i => GRADE_POINTS[i.grade] >= 2);
      S.profile = S.profile || {};
      S.profile.report = { at: new Date().toISOString().slice(0, 10), count: parsed.items.length, weak: graded.length, picks: sc.picks.slice(0, 8), unmapped: sc.unmapped };
      save();
      out.innerHTML = `<p>✅ ${T().found(parsed.items.length, graded.length)}</p>
        ${sc.unmapped.length ? `<p class="note2">${T().unmapped}: ${sc.unmapped.join(' · ')}</p>` : ''}
        <button class="next" id="seePicks">${T().seePicks}</button>`;
      $('#seePicks').onclick = () => picksScreen(false);
    } catch (e) { out.innerHTML = `<p class="warn">${T().readFail}</p>`; }
  };
}

// ---- screens ----
function picksScreen(fromQuiz) {
  const picks = currentPicks(3);
  view().innerHTML = `<h1>⭐ ${T().picksTitle}</h1>
    <p class="tag">${fromQuiz ? T().quizDone : T().reportDone}</p>
    <div class="menu">${picks.map(p => { const g = gameById(p.id); return `<button class="big ${g.subject} pick" data-id="${g.id}"><span class="gi">${g.icon}</span>${L(g.title)}<small>${whyText(p)}</small></button>`; }).join('') || `<p>${T().noPicks}</p>`}</div>
    <button class="next" id="home">${T().letsPlay}</button>`;
  $$('.pick').forEach(b => b.onclick = () => launch(gameById(b.dataset.id)));
  $('#home').onclick = home;
}
function whyText(p) {
  const quick = p.why.includes('__quick__'), rep = p.why.find(x => x !== '__quick__');
  return [rep ? `${T().fromReport}: ${rep}` : '', quick ? T().fromQuick : ''].filter(Boolean).join(' · ');
}

function intro() {
  quitDiag();
  view().innerHTML = `<h1>🍑 ${T().app}</h1>
    <div class="tag">${T().introLead}</div>
    <div class="menu intro">
      <button class="big ss" id="iq"><span class="gi">🍑</span>${T().quickCheck}<small>${T().quickCheckSub}</small></button>
      <button class="big math" id="ir"><span class="gi">📄</span>${T().importCard}<small>${T().importCardSub}</small></button>
      <button class="big sci" id="ip"><span class="gi">▶</span>${T().justPlay}<small>${T().justPlaySub}</small></button>
    </div>
    <p class="note">${T().privacy}</p>`;
  $('#iq').onclick = () => startDiag('all'); $('#ir').onclick = importScreen; $('#ip').onclick = () => { S.introSeen = true; save(); home(); };
}
