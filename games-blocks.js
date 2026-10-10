'use strict';
// Block Drop: an easy, forgiving Tetris-style game. Slow pieces, big controls, a dotted "ghost" showing where the
// piece will land, and no game over: if the stack gets too high the board is cleared and the child keeps going.
const BLOCK_SHAPES = {
  dot: { c: [[0, 0]], col: '#ffd166' }, domino: { c: [[0, 0], [1, 0]], col: '#06d6a0' }, i3: { c: [[0, 0], [1, 0], [2, 0]], col: '#118ab2' },
  l3: { c: [[0, 0], [0, 1], [1, 1]], col: '#ef476f' }, o: { c: [[0, 0], [1, 0], [0, 1], [1, 1]], col: '#ff8c42' },
  i4: { c: [[0, 0], [1, 0], [2, 0], [3, 0]], col: '#8338ec' }, l4: { c: [[0, 0], [0, 1], [0, 2], [1, 2]], col: '#2dc653' }, t4: { c: [[0, 0], [1, 0], [2, 0], [1, 1]], col: '#e63946' }
};
const rotCells = (cells) => { const r = cells.map(([x, y]) => [-y, x]), mx = Math.min(...r.map(p => p[0])), my = Math.min(...r.map(p => p[1])); return r.map(([x, y]) => [x - mx, y - my]); };
registerGame({
  id: 'blocks', subject: 'brain', icon: '🧱', title: B('Block Drop', '블록 쌓기'), sub: B('Fill the rows!', '가로 줄을 채워요!'),
  area: AREA_BRAIN('Spatial planning'), rounds: 1,
  play() {
    const lv = lvl('blocks'), W = lv === 1 ? 6 : 7, H = lv === 1 ? 9 : 10, goal = lv === 1 ? 3 : 5, tickMs = lv === 1 ? 950 : 700;
    const keys = lv === 1 ? ['dot', 'domino', 'i3', 'l3', 'o', 'domino', 'i3'] : Object.keys(BLOCK_SHAPES);
    const ask = B(`Fill a whole row to clear it! Clear ${goal} rows.`, `가로 한 줄을 가득 채우면 사라져요! ${goal}줄을 없애요.`);
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div>
      <div class="bstat" id="bstat"></div>
      <div class="bboard" id="bb" style="--w:${W}"></div>
      <div class="bctl"><button class="pill" id="bl">◀</button><button class="pill" id="br2">↻</button><button class="pill" id="bd">⬇</button><button class="pill" id="bn">▶</button></div>
      <pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    const board = Array.from({ length: H }, () => Array(W).fill(null)); let cur = null, rows = 0, solved = false, missed = false, timer = null;
    const boardEl = $('#bb');
    const collide = (cells, x, y) => cells.some(([cx, cy]) => { const bx = x + cx, by = y + cy; return bx < 0 || bx >= W || by >= H || (by >= 0 && board[by][bx]); });
    const dropY = () => { let y = cur.y; while (!collide(cur.cells, cur.x, y + 1)) y++; return y; };
    const alive = () => document.body.contains(boardEl);
    const draw = () => {
      if (!alive()) return;
      const g = board.map(r => r.slice()), gy = cur ? dropY() : 0, ghost = new Set();
      if (cur) cur.cells.forEach(([cx, cy]) => { ghost.add((gy + cy) * W + cur.x + cx); });
      const live = new Set(); if (cur) cur.cells.forEach(([cx, cy]) => live.add((cur.y + cy) * W + cur.x + cx));
      boardEl.innerHTML = g.map((r, y) => r.map((c, x) => { const i = y * W + x; return live.has(i) ? `<div class="bc f" style="background:${cur.col}"></div>` : c ? `<div class="bc f" style="background:${c}"></div>` : ghost.has(i) ? `<div class="bc g"></div>` : '<div class="bc"></div>'; }).join('')).join('');
      $('#bstat').textContent = `🧱 ${rows}/${goal}`;
    };
    const spawn = () => {
      const k = pick(keys), cells = BLOCK_SHAPES[k].c.map(p => p.slice()), w = Math.max(...cells.map(p => p[0])) + 1;
      cur = { cells, x: Math.floor((W - w) / 2), y: 0, col: BLOCK_SHAPES[k].col };
      if (collide(cur.cells, cur.x, cur.y)) {                       // too high: friendly reset, keep playing
        if (!missed) { missed = true; record('blocks', false); }
        board.forEach(r => r.fill(null)); $('#cheer').textContent = T().again; cur = { cells, x: Math.floor((W - w) / 2), y: 0, col: BLOCK_SHAPES[k].col };
      }
    };
    const lock = () => {
      cur.cells.forEach(([cx, cy]) => { const by = cur.y + cy; if (by >= 0) board[by][cur.x + cx] = cur.col; });
      let cleared = 0; for (let y = H - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(W).fill(null)); cleared++; y++; }
      if (cleared) { rows += cleared; tone(660, 140); tone(880, 200, 0.1); }
      else tone(220, 60, 0, 'triangle', 0.08);
      if (rows >= goal) { solved = true; clearInterval(timer); draw(); record('blocks', !missed); if (!missed) addPeach(); $('#cheer').textContent = pick(T().right); nextButton(() => this.play()); return; }
      spawn(); draw();
    };
    const step = () => { if (!alive()) { clearInterval(timer); return; } if (solved) return; if (!collide(cur.cells, cur.x, cur.y + 1)) { cur.y++; draw(); } else lock(); };
    const move = (dx) => { if (solved || !cur) return; if (!collide(cur.cells, cur.x + dx, cur.y)) { cur.x += dx; draw(); } };
    const rotate = () => { if (solved || !cur) return; const r = rotCells(cur.cells); for (const dx of [0, -1, 1, -2, 2]) if (!collide(r, cur.x + dx, cur.y)) { cur.cells = r; cur.x += dx; draw(); return; } };
    const hardDrop = () => { if (solved || !cur) return; cur.y = dropY(); draw(); lock(); };
    $('#bl').onclick = () => move(-1); $('#bn').onclick = () => move(1); $('#br2').onclick = rotate; $('#bd').onclick = hardDrop;
    const onKey = (e) => { if (!alive()) { document.removeEventListener('keydown', onKey); return; } if (e.key === 'ArrowLeft') move(-1); else if (e.key === 'ArrowRight') move(1); else if (e.key === 'ArrowUp') rotate(); else if (e.key === 'ArrowDown' || e.key === ' ') hardDrop(); else return; e.preventDefault(); };
    document.addEventListener('keydown', onKey);
    // touch: drag sideways to move, tap to rotate, swipe down to drop
    let sx = 0, sy = 0, st = 0, moved = false, lastCol = 0;
    boardEl.onpointerdown = (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); moved = false; lastCol = 0; try { boardEl.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); };
    boardEl.onpointermove = (e) => { const cw = boardEl.getBoundingClientRect().width / W, col = Math.trunc((e.clientX - sx) / cw); if (col !== lastCol) { move(col - lastCol); lastCol = col; moved = true; } e.preventDefault(); };
    boardEl.onpointerup = (e) => { const dy = e.clientY - sy, dt = Date.now() - st; if (!moved && Math.abs(dy) < 14 && dt < 350) rotate(); else if (dy > 50 && dt < 500 && !moved) hardDrop(); };
    spawn(); draw(); timer = setInterval(step, tickMs);
    window.__blocks = { W, H, board, goal, get cur() { return cur; }, get rows() { return rows; }, get solved() { return solved; }, collide, dropY, rotate, hardDrop, move, rotCells, step, stop: () => clearInterval(timer) };
  }
});
