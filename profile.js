'use strict';
// Starting-point finder: (1) read a progress report (PDF or pasted text) with rule-based parsing,
// (2) a 3-minute "quick check" built from the real games. Both produce "Peachy's picks".
// Everything runs in the browser; nothing is uploaded.

const DIAG_IDS = ['count', 'order', 'tens', 'teens', 'compare', 'addsub', 'shapes2d', 'pattern',
  'letters', 'sounds', 'rhyme', 'flags', 'address', 'compass', 'living', 'motion'];
const gameById = (id) => GAMES.find(g => g.id === id);

// ---- picks ----
function currentPicks(max = 3) {
  const P = S.profile; if (!P) return [];
  const need = {}, why = {};
  const add = (id, v, r) => { need[id] = (need[id] || 0) + v; (why[id] = why[id] || []).push(r); };
  if (P.report && P.report.picks.length) {
    const top = P.report.picks[0].score || 1;
    P.report.picks.forEach(p => add(p.id, (p.score / top) * 3, p.reasons[0]));
  }
  if (P.diag) P.diag.missed.forEach(id => add(id, 3, '__quick__'));
  return Object.keys(need)
    .filter(id => gameById(id) && (stat(id).right - stat(id).wrong) < 8)        // drop once clearly mastered in play
    .sort((a, b) => need[b] - need[a]).slice(0, max)
    .map(id => ({ id, need: need[id], why: why[id] }));
}

// ---- quick check ----
DIAG.decorate = (game) => {
  const n = DIAG.i + 1, tot = DIAG_IDS.length;
  view().insertAdjacentHTML('afterbegin', `<div class="progress"><div style="width:${Math.round(100 * DIAG.i / tot)}%"></div><span>${n}/${tot}</span></div>`);
  $('.prompt').insertAdjacentHTML('afterend', `<button class="skip" id="skip">🤷 ${T().dontKnow}</button>`);
  $('#skip').onclick = () => DIAG.answer(game, false, null);
};
DIAG.answer = (game, ok, btn) => {
  if (DIAG.busy) return; DIAG.busy = true;
  DIAG.res[game.id] = ok;
  if (btn) btn.classList.add('picked');
  setTimeout(() => { DIAG.busy = false; DIAG.i++; diagStep(); }, 450);
};
function startDiag() { S.introSeen = true; DIAG.active = true; DIAG.i = 0; DIAG.res = {}; DIAG.busy = false; diagStep(); }
function diagStep() {
  if (DIAG.i >= DIAG_IDS.length) return finishDiag();
  gameById(DIAG_IDS[DIAG.i]).play();
}
function finishDiag() {
  DIAG.active = false;
  S.profile = S.profile || {};
  S.profile.diag = { at: new Date().toISOString().slice(0, 10), missed: DIAG_IDS.filter(id => DIAG.res[id] === false) };
  save(); picksScreen(true);
}
function quitDiag() { DIAG.active = false; DIAG.busy = false; }

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
  $$('.pick').forEach(b => b.onclick = () => gameById(b.dataset.id).play());
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
  $('#iq').onclick = startDiag; $('#ir').onclick = importScreen; $('#ip').onclick = () => { S.introSeen = true; save(); home(); };
}
