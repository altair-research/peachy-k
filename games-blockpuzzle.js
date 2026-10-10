'use strict';
// Block Puzzle (adventure + endless): drag three pieces onto the board, fill rows or columns to clear them,
// collect gems or clear lines to finish each level. Forgiving: if nothing fits, Peachy tidies up (adventure).
const BP_COLORS = ['#4fd1b8', '#5aa9e6', '#a78bfa', '#f78fb3', '#ffc94d'];
const BP_SHAPES = {
  dot: [[0, 0]], h2: [[0, 0], [1, 0]], h3: [[0, 0], [1, 0], [2, 0]], l3: [[0, 0], [0, 1], [1, 1]], o: [[0, 0], [1, 0], [0, 1], [1, 1]],
  h4: [[0, 0], [1, 0], [2, 0], [3, 0]], l4: [[0, 0], [0, 1], [0, 2], [1, 2]], t4: [[0, 0], [1, 0], [2, 0], [1, 1]],
  h5: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], r23: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], sq3: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]]
};
const BP_SETS = { easy: ['dot', 'h2', 'h3', 'l3', 'o', 'h2', 'h3'], mid: ['dot', 'h2', 'h3', 'l3', 'o', 'h4', 'l4', 't4', 'h2', 'h3', 'l3'], full: ['h2', 'h3', 'l3', 'o', 'h4', 'l4', 't4', 'h5', 'r23', 'sq3', 'l3', 'o', 'h3'] };
const bpVariants = (key) => { const out = []; let c = BP_SHAPES[key]; for (let i = 0; i < 4; i++) { const s = JSON.stringify([...c].sort()); if (!out.some(v => JSON.stringify([...v].sort()) === s)) out.push(c); c = rotCells(c); } return out; };
const GEMS = {
  green: `<svg viewBox="0 0 24 24" class="gemsvg"><polygon points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9" fill="#2fd44a" stroke="#0b6b1c" stroke-width="1.3" stroke-linejoin="round"/><polygon points="12,5 13.6,10.4 19,12 13.6,13.6 12,19 10.4,13.6 5,12 10.4,10.4" fill="#8bf59b" opacity=".6"/></svg>`,
  orange: `<svg viewBox="0 0 24 24" class="gemsvg"><polygon points="12,2 22,9.5 18,21.5 6,21.5 2,9.5" fill="#ff9f1c" stroke="#a65a00" stroke-width="1.3" stroke-linejoin="round"/><polygon points="12,6 18.5,10.6 16.2,18 7.8,18 5.5,10.6" fill="#ffd27a" opacity=".55"/></svg>`
};
function bpLevel(n) {
  const N = n <= 3 ? 6 : n <= 12 ? 7 : 8, set = n <= 3 ? 'easy' : n <= 10 ? 'mid' : 'full';
  if (n <= 2 || n % 3 !== 0) return { n, N, set, type: 'lines', goal: { lines: Math.min(8, 3 + Math.floor(n / 4)) } };
  const types = n < 9 ? ['green'] : ['green', 'orange'], cnt = Math.min(14, 4 + Math.floor(n / 2));
  return { n, N, set, type: 'gems', goal: Object.fromEntries(types.map(t => [t, cnt])) };
}
const BP_LEVELS = 30, BP_ROWS = [8, 8, 7, 7];
S.bp = S.bp || { level: 1, best: 0 };

function bpTitle(cfg) { return cfg.type === 'endless' ? B('Endless: get the highest score!', '끝없이! 최고 점수에 도전해요!') : cfg.type === 'lines' ? B(`Clear ${cfg.goal.lines} lines!`, `줄 ${cfg.goal.lines}개를 없애요!`) : B('Collect the gems!', '보석을 모아요!'); }

// ---------- adventure map ----------
function bpMap() {
  const cur = Math.min(S.bp.level, BP_LEVELS); let n = 0;
  const rows = BP_ROWS.map(sz => Array.from({ length: sz }, () => ++n)).reverse();
  view().innerHTML = `<div class="bpmap"><div class="bphead">${L(B('Adventure', '어드벤처'))}</div>
    <div class="trophy">${'<svg viewBox="0 0 64 64"><path d="M16 8h32v14c0 10-7 18-16 18S16 32 16 22z" fill="#27346e"/><path d="M16 12H6c0 10 4 16 12 18M48 12h10c0 10-4 16-12 18" fill="none" stroke="#27346e" stroke-width="5"/><rect x="28" y="38" width="8" height="10" fill="#27346e"/><rect x="18" y="48" width="28" height="8" rx="2" fill="#27346e"/><polygon points="32,14 34.5,20 41,20.5 36,24.5 37.6,31 32,27.5 26.4,31 28,24.5 23,20.5 29.5,20" fill="#3a4a8f"/></svg>'}</div>
    <p class="bpcap">${L(B('Take part in the Adventure and win the trophy.', '어드벤처를 끝까지 하고 트로피를 받아요.'))}</p>
    <div class="bptiles">${rows.map(r => `<div class="bprow">${r.map(k => `<button class="bpt ${k < cur ? 'done' : k === cur ? 'cur' : 'lock'}" data-k="${k}" ${k > cur ? 'disabled' : ''}>${k}</button>`).join('')}</div>`).join('')}</div>
    <button class="bpgo" id="bpgo">${L(B('Level', '레벨'))} ${cur}</button>
    <button class="bpend" id="bpend">♾ ${L(B('Endless', '끝없이'))} · ${S.bp.best}</button></div>`;
  $$('.bpt:not(.lock)').forEach(b => b.onclick = () => bpPlay(+b.dataset.k));
  $('#bpgo').onclick = () => bpPlay(cur); $('#bpend').onclick = () => bpPlay('endless');
  say(L(B('Pick a level!', '레벨을 골라요!')));
}

registerGame({
  id: 'blockpuzzle', subject: 'brain', icon: '🧩', title: B('Block Puzzle', '블록 퍼즐'), sub: B('Adventure levels & gems', '레벨 모험과 보석'),
  area: AREA_BRAIN('Spatial planning'), rounds: 1,
  play() { bpMap(); }
});

// ---------- playing a level ----------
function bpPlay(which) {
  const cfg = which === 'endless' ? { n: 0, N: 8, set: 'full', type: 'endless', goal: {} } : bpLevel(which);
  const N = cfg.N, gemTypes = cfg.type === 'gems' ? Object.keys(cfg.goal) : [];
  const board = Array.from({ length: N }, () => Array(N).fill(null));
  let tray = [], clearing = null, busy = false, lines = 0, score = 0, got = { green: 0, orange: 0 }, rescued = false, done = false, drag = null;
  const ask = bpTitle(cfg);
  view().innerHTML = `<div class="bpscreen"><div class="bphud" id="bphud"></div>
    <div class="bpboardwrap"><div class="bpboard" id="bpb" style="--n:${N}"></div></div>
    <div class="bptray" id="bptray"></div><div class="bphint" id="bphint"></div></div>`;
  const boardEl = $('#bpb'), trayEl = $('#bptray');
  const alive = () => document.body.contains(boardEl);
  const tile = (cell) => cell ? `<div class="bpc f${cell.g ? ' gem' : ''}" style="--tc:${cell.c}">${cell.g ? GEMS[cell.g] : ''}</div>` : '';
  const hud = () => {
    const h = $('#bphud'); if (!h) return;
    if (cfg.type === 'lines') h.innerHTML = `<div class="goal"><span class="gi2">🧱</span><b>${Math.max(0, cfg.goal.lines - lines)}</b></div><div class="lvl">${L(B('Level', '레벨'))} ${cfg.n}</div>`;
    else if (cfg.type === 'gems') h.innerHTML = gemTypes.map(t => `<div class="goal">${GEMS[t]}<b>${Math.max(0, cfg.goal[t] - got[t]) || '✓'}</b></div>`).join('') + `<div class="lvl">${L(B('Level', '레벨'))} ${cfg.n}</div>`;
    else h.innerHTML = `<div class="goal"><span class="gi2">👑</span><b>${S.bp.best}</b></div><div class="bigscore2">${score}</div>`;
  };
  const render = () => {
    if (!alive()) return;
    boardEl.innerHTML = board.map((r, y) => r.map((c, x) => { const i = y * N + x; return `<div class="bpcell${clearing && clearing.has(i) ? ' clr' : ''}" data-i="${i}">${c ? tile(c) : ''}</div>`; }).join('')).join('');
    trayEl.innerHTML = tray.map((p, i) => `<div class="bpslot" data-i="${i}">${p ? pieceHtml(p, 'mini') : ''}</div>`).join(''); hud();
  };
  const dims = (p) => [Math.max(...p.cells.map(c => c[0])) + 1, Math.max(...p.cells.map(c => c[1])) + 1];
  const pieceHtml = (p, cls) => { const [w, h] = dims(p); return `<div class="bppiece ${cls}" style="--pw:${w};--ph:${h}">${Array.from({ length: w * h }, (_, i) => { const x = i % w, y = Math.floor(i / w), c = p.cells.find(q => q[0] === x && q[1] === y); return c ? tile({ c: p.col, g: c[2] }) : '<span></span>'; }).join('')}</div>`; };
  const fits = (p, col, row) => p.cells.every(([x, y]) => { const bx = col + x, by = row + y; return bx >= 0 && by >= 0 && bx < N && by < N && !board[by][bx]; });
  const anyFit = () => tray.some(p => p && Array.from({ length: N * N }, (_, i) => fits(p, i % N, Math.floor(i / N))).some(Boolean));
  const genPiece = () => {
    const key = pick(BP_SETS[cfg.set]), cells = pick(bpVariants(key)).map(c => [c[0], c[1]]);
    if (gemTypes.length && rnd(100) < 60) { const k = rnd(cells.length); cells[k] = [cells[k][0], cells[k][1], pick(gemTypes)]; if (cells.length > 3 && rnd(100) < 25) { const k2 = (k + 1 + rnd(cells.length - 1)) % cells.length; cells[k2] = [cells[k2][0], cells[k2][1], pick(gemTypes)]; } }
    return { cells, col: pick(BP_COLORS) };
  };
  const newTray = () => { tray = [genPiece(), genPiece(), genPiece()]; if (!anyFit()) tray[0] = { cells: [[0, 0]], col: pick(BP_COLORS) }; };
  const finishWin = () => {
    done = true; const stars = rescued ? 2 : 3; record('blockpuzzle', true); addPeach(); S.bp.level = Math.max(S.bp.level, Math.min(BP_LEVELS + 1, cfg.n + 1)); save(); sfx('win'); confetti(140);
    const o = document.createElement('div'); o.className = 'bpover';
    o.innerHTML = `<div class="bpcard"><h2>${L(B('Level complete!', '레벨 완료!'))}</h2><div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><button class="bpgo" id="bpnext">${cfg.n < BP_LEVELS ? L(B('Next level', '다음 레벨')) : L(B('Back to map', '지도로'))} ▶</button><button class="link" id="bpmap">${L(B('Map', '지도'))}</button></div>`;
    document.body.appendChild(o); $('#bpnext').onclick = () => { o.remove(); cfg.n < BP_LEVELS ? bpPlay(cfg.n + 1) : bpMap(); }; $('#bpmap').onclick = () => { o.remove(); bpMap(); };
  };
  const finishEndless = () => {
    done = true; const best = score > S.bp.best; if (best) { S.bp.best = score; save(); } record('blockpuzzle', score >= 60); if (score >= 60) addPeach(); sfx(best ? 'win' : 'no'); if (best) confetti(120);
    const o = document.createElement('div'); o.className = 'bpover';
    o.innerHTML = `<div class="bpcard"><h2>${L(B('No more room!', '자리가 없어요!'))}</h2><div class="bigscore2">${score}</div><p>${best ? L(B('New best score!', '새 최고 점수!')) : L(B('Best', '최고')) + ': ' + S.bp.best}</p><button class="bpgo" id="bpagain">${L(B('Play again', '다시 하기'))}</button><button class="link" id="bpmap">${L(B('Map', '지도'))}</button></div>`;
    document.body.appendChild(o); $('#bpagain').onclick = () => { o.remove(); bpPlay('endless'); }; $('#bpmap').onclick = () => { o.remove(); bpMap(); };
  };
  const rescue = () => {                                              // adventure: nothing fits -> Peachy clears the bottom rows
    rescued = true; const hint = $('#bphint'); if (hint) hint.textContent = L(B('No room! Peachy tidies up.', '자리가 없어요! 피치가 정리해 줘요.'));
    for (let y = N - 1; y >= Math.ceil(N / 2); y--) board[y].fill(null); sfx('ok'); render();
    setTimeout(() => { const h = $('#bphint'); if (h) h.textContent = ''; }, 2200);
  };
  const place = (i, col, row) => {
    const p = tray[i]; if (!p || busy || done || !fits(p, col, row)) return false;
    p.cells.forEach(([x, y, g]) => { board[row + y][col + x] = { c: p.col, g }; }); tray[i] = null; score += p.cells.length; tone(300 + 40 * p.cells.length, 90, 0, 'triangle', 0.1);
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
    const fr = [], fc = []; for (let y = 0; y < N; y++) if (board[y].every(Boolean)) fr.push(y); for (let x = 0; x < N; x++) if (board.every(r => r[x])) fc.push(x);
    const set = new Set(); fr.forEach(y => { for (let x = 0; x < N; x++) set.add(y * N + x); }); fc.forEach(x => { for (let y = 0; y < N; y++) set.add(y * N + x); });
    const after = () => {
      if (!tray.some(Boolean)) newTray();
      render();
      if (cfg.type === 'endless') { if (!anyFit()) finishEndless(); return; }
      if (!anyFit()) rescue();
    };
    if (!set.size) { render(); after(); return true; }
    busy = true; clearing = set; const nl = fr.length + fc.length; lines += nl; score += 10 * nl * nl;
    set.forEach(idx => { const c = board[Math.floor(idx / N)][idx % N]; if (c && c.g) got[c.g]++; });
    tone(523, 120); tone(659, 120, 0.1); tone(784, 220, 0.2); confetti(18); render();
    setTimeout(() => {
      set.forEach(idx => { board[Math.floor(idx / N)][idx % N] = null; }); clearing = null; busy = false; if (!alive()) return;
      const goalDone = cfg.type === 'lines' ? lines >= cfg.goal.lines : cfg.type === 'gems' ? gemTypes.every(t => got[t] >= cfg.goal[t]) : false;
      if (goalDone) { render(); finishWin(); return; }
      after();
    }, 320);
    return true;
  };
  // ---- drag and drop ----
  const geom = () => { const c0 = boardEl.children[0].getBoundingClientRect(), c1 = boardEl.children[1].getBoundingClientRect(); return { left: c0.left, top: c0.top, cs: c1.left - c0.left, size: c0.width }; };
  const clearPreview = () => $$('#bpb .bpcell').forEach(c => c.classList.remove('gv', 'gx', 'gw'));
  const target = (e) => { const g = geom(), p = drag.p, [w, h] = dims(p), left = e.clientX - (w * g.cs) / 2, top = e.clientY - h * g.cs - 34; drag.el.style.left = left + 'px'; drag.el.style.top = top + 'px'; return { col: Math.round((left - g.left) / g.cs), row: Math.round((top - g.top) / g.cs) }; };
  const preview = (col, row) => {
    clearPreview(); const p = drag.p, ok = fits(p, col, row); const cells = [];
    p.cells.forEach(([x, y]) => { const bx = col + x, by = row + y; if (bx >= 0 && by >= 0 && bx < N && by < N) cells.push([bx, by]); });
    cells.forEach(([bx, by]) => boardEl.children[by * N + bx].classList.add(ok ? 'gv' : 'gx'));
    if (ok) {                                                          // glow the lines that would clear
      const t = board.map(r => r.map(Boolean)); p.cells.forEach(([x, y]) => { t[row + y][col + x] = true; });
      for (let y = 0; y < N; y++) if (t[y].every(Boolean)) for (let x = 0; x < N; x++) boardEl.children[y * N + x].classList.add('gw');
      for (let x = 0; x < N; x++) if (t.every(r => r[x])) for (let y = 0; y < N; y++) boardEl.children[y * N + x].classList.add('gw');
    }
  };
  const endDrag = (e, cancel) => {
    if (!drag) return; const d = drag; drag = null; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel);
    const t = (!cancel && e) ? (() => { drag = d; const r = target(e); drag = null; return r; })() : null; d.el.remove(); clearPreview();
    const slot = trayEl.children[d.i]; if (slot) slot.classList.remove('lift');
    if (t && place(d.i, t.col, t.row)) return; if (t) tone(180, 120, 0, 'triangle', 0.1);
  };
  const onMove = (e) => { if (!drag) return; const t = target(e); preview(t.col, t.row); e.preventDefault(); };
  const onUp = (e) => endDrag(e, false), onCancel = (e) => endDrag(e, true);
  trayEl.onpointerdown = (e) => {
    const slot = e.target.closest('.bpslot'); if (!slot || busy || done || drag) return; const i = +slot.dataset.i, p = tray[i]; if (!p) return;
    const g = geom(), [w, h] = dims(p), el = document.createElement('div'); el.className = 'bpdrag'; el.style.setProperty('--cs', g.cs + 'px'); el.innerHTML = pieceHtml(p, 'full'); el.style.width = w * g.cs + 'px'; el.style.height = h * g.cs + 'px'; document.body.appendChild(el);
    drag = { i, p, el }; slot.classList.add('lift'); const t = target(e); preview(t.col, t.row); tone(440, 50, 0, 'sine', 0.06);
    window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel); e.preventDefault();
  };
  newTray(); render(); say(L(ask)); $('#bphint').textContent = L(ask);
  if (cfg.n === 1) setTimeout(() => { const h = $('#bphint'); if (h && !done && alive()) h.textContent = L(B('Drag a block to the board. Fill a whole row or column!', '블록을 판에 끌어다 놓아요. 가로나 세로 한 줄을 채워요!')); }, 1800);
  window.__bp = { cfg, N, board, get tray() { return tray; }, get lines() { return lines; }, get got() { return got; }, get done() { return done; }, get busy() { return busy; }, fits, place, anyFit, render };
}
