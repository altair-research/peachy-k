'use strict';
// Writing games (EL Education K writing, "Drawing and writing", labeling, letter formation).
const AREA_WRITE = (u) => B(`Writing · ${u}`, `쓰기 · ${u}`);

// ---------- shared: tap-the-tiles-in-order engine (spell a word / build a sentence) ----------
function tileRound(game, cfg) {
  if (dup(game, cfg.target.join(' '))) return game.play();
  const tokens = shuffle([...cfg.target, ...cfg.extra]);
  view().innerHTML = `
    <div class="prompt">${L(cfg.ask)}<button class="say" id="sp" aria-label="${T().listen}">🔊</button></div>
    <div class="show">${cfg.show || ''}</div>
    <div class="slots">${cfg.target.map(() => '<div class="slot"></div>').join('')}</div>
    <div class="opts tiles">${tokens.map((t, i) => `<button class="opt tile" data-i="${i}">${t}</button>`).join('')}</div>
    <pk-cheer class="cheer" id="cheer"></pk-cheer><div class="fact" id="fact"></div>`;
  const ask = () => say(L(cfg.askSay || cfg.ask));
  $('#sp').onclick = ask; ask();
  let pos = 0, missed = false;
  if (DIAG.active) DIAG.decorate(game);
  $$('.tile').forEach(b => b.onclick = () => {
    if (b.disabled) return;
    const tok = tokens[+b.dataset.i];
    if (tok === cfg.target[pos]) {
      $$('.slot')[pos].textContent = tok; $$('.slot')[pos].classList.add('filled');
      b.disabled = true; b.classList.add('used'); pos++;
      if (cfg.speakTiles) say(tok, 'en-US');
      if (pos === cfg.target.length) {
        if (DIAG.active) { DIAG.answer(game, !missed, null); return; }
        record(game.id, !missed); if (!missed) addPeach();
        $('#cheer').textContent = pick(T().right);
        if (cfg.after) { $('#fact').textContent = L(cfg.after); say(cfg.vocab || L(cfg.after), cfg.vocab ? 'en-US' : undefined); }
        nextButton(() => game.play());
      }
    } else { b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); if (!missed) { missed = true; if (!DIAG.active) record(game.id, false); } say(T().again); }
  });
}

const CVC = [['cat', '🐱', B('cat', '고양이')], ['dog', '🐶', B('dog', '강아지')], ['sun', '☀️', B('sun', '해')], ['hat', '🎩', B('hat', '모자')], ['pig', '🐷', B('pig', '돼지')], ['bus', '🚌', B('bus', '버스')],
  ['cup', '🥤', B('cup', '컵')], ['bed', '🛏️', B('bed', '침대')], ['fox', '🦊', B('fox', '여우')], ['hen', '🐔', B('hen', '암탉')], ['bat', '🦇', B('bat', '박쥐')], ['pen', '🖊️', B('pen', '펜')]];
const BIGGER = [['frog', '🐸', B('frog', '개구리')], ['fish', '🐟', B('fish', '물고기')], ['moon', '🌙', B('moon', '달')], ['star', '⭐', B('star', '별')], ['tree', '🌳', B('tree', '나무')],
  ['duck', '🦆', B('duck', '오리')], ['milk', '🥛', B('milk', '우유')], ['cake', '🎂', B('cake', '케이크')], ['bird', '🐦', B('bird', '새')], ['bear', '🐻', B('bear', '곰')], ['ship', '🚢', B('ship', '배')]];
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');

// ---------- 1. Label it (spell the word for the picture) ----------
registerGame({
  id: 'label', subject: 'write', icon: '🏷️', title: B('Label It', '그림에 이름 붙이기'), sub: B('Spell the word', '글자를 순서대로'),
  area: AREA_WRITE('Labeling'),
  play() {
    const w = pick(lvl('label') === 1 ? CVC : [...CVC, ...BIGGER]);
    const letters = w[0].split(''), extra = others(ALPHA.filter(c => !letters.includes(c)), '', 2);
    tileRound(this, {
      ask: B('Spell the word for the picture!', '그림의 이름을 글자로 만들어요!'), show: `<span class="emo">${w[1]}</span>`,
      target: letters, extra, speakTiles: true, after: B(`${w[0]}!`, `${w[0]} — ${w[2].ko}!`), vocab: w[0]
    });
  }
});

// ---------- 2. Build a sentence ----------
const SENTENCES = {
  1: [['I see a cat.', '🐱'], ['I like my dog.', '🐶'], ['We can go up.', '⬆️'], ['The sun is hot.', '☀️'], ['I can run.', '🏃'], ['My hat is red.', '🎩']],
  2: [['I see a big dog.', '🐕'], ['We like to play.', '⚽'], ['The cat is on the bed.', '🐱'], ['I can see the moon.', '🌙'], ['The bird can fly up.', '🐦'], ['My mom and I read.', '📖']]
};
registerGame({
  id: 'sentence', subject: 'write', icon: '📝', title: B('Build a Sentence', '문장 만들기'), sub: B('Put the words in order', '단어를 순서대로'),
  area: AREA_WRITE('Sentences'),
  play() {
    const s = pick(SENTENCES[lvl('sentence')]), words = s[0].split(' ');
    const extraPool = ['to', 'the', 'is', 'we', 'run', 'big', 'and'].filter(x => !words.includes(x));
    tileRound(this, {
      ask: B('Put the words in order to make a sentence!', '단어를 순서대로 놓아 문장을 만들어요!'), show: `<span class="emo">${s[1]}</span>`,
      target: words, extra: others(extraPool, '', 1), speakTiles: false, after: B(s[0], s[0]), vocab: s[0]
    });
  }
});

// ---------- canvas helper ----------
function makeCanvas(w, h) {
  const dpr = window.devicePixelRatio || 1, c = document.createElement('canvas');
  c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px'; c.className = 'draw';
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  return { c, ctx, dpr, w, h };
}
function bindStroke(cv, color, width, onDraw, onEnd) {
  let drawing = false, last = null;
  const pos = (e) => { const r = cv.c.getBoundingClientRect(); return [(e.clientX - r.left) * (cv.w / r.width), (e.clientY - r.top) * (cv.h / r.height)]; };
  cv.c.onpointerdown = (e) => { drawing = true; last = pos(e); try { cv.c.setPointerCapture(e.pointerId); } catch (err) {} onDraw(last, last, true); e.preventDefault(); };
  cv.c.onpointermove = (e) => { if (!drawing) return; const p = pos(e); onDraw(last, p, false); last = p; e.preventDefault(); };
  const end = () => { if (drawing) { drawing = false; if (onEnd) onEnd(); } };
  cv.c.onpointerup = end; cv.c.onpointercancel = end;
}
const canvasSize = () => { const w = Math.min(560, Math.max(260, window.innerWidth - 40)); return [w, Math.round(w * 0.64)]; };

// ---------- 3. Trace letters and numbers ----------
const TRACE_UP = 'ABCDEHILOTUVXYZ'.split(''), TRACE_LOW = 'acehilmnorstuvwxz'.split('');
registerGame({
  id: 'trace', subject: 'write', icon: '✏️', title: B('Trace It', '따라 쓰기'), sub: B('Letters and numbers', '글자와 숫자'),
  area: AREA_WRITE('Letter & number formation'),
  play() {
    const lv = lvl('trace'), mode = pick(lv === 1 ? ['up', 'num'] : ['up', 'low', 'num']);
    const ch = mode === 'up' ? pick(TRACE_UP) : mode === 'low' ? pick(TRACE_LOW) : String(1 + rnd(10));
    if (dup(this, mode + ch)) return this.play();
    const [w, h] = canvasSize(), disp = makeCanvas(w, h), ink = makeCanvas(w, h), mask = makeCanvas(w, h);
    const font = (px) => `800 ${px}px "Arial Rounded MT Bold", Arial, sans-serif`;
    const fs = ch.length > 1 ? h * 0.7 : h * 0.82;
    [mask.ctx, disp.ctx].forEach(x => { x.font = font(fs); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; });
    const base = h * 0.78;
    mask.ctx.fillStyle = '#000'; mask.ctx.fillText(ch, w / 2, base);
    disp.ctx.fillStyle = '#ffd9c7'; disp.ctx.fillText(ch, w / 2, base);
    const maskData = mask.ctx.getImageData(0, 0, w * mask.dpr, h * mask.dpr).data;
    let done = false, missed = false;
    const color = '#ef476f', bw = 16;
    const ask = B(`Trace the ${mode === 'num' ? 'number' : 'letter'} ${ch}. Use your finger!`, `${ch} ${mode === 'num' ? '숫자' : '글자'}를 손가락으로 따라 써요!`);
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div><div class="canvaswrap" id="cw"></div>
      <div><button class="pill" id="clr">${T().clear}</button></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#cw').appendChild(disp.c);
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    if (DIAG.active) DIAG.decorate(this);
    const stroke = (cv) => (a, b) => { cv.ctx.strokeStyle = color; cv.ctx.lineWidth = bw; cv.ctx.beginPath(); cv.ctx.moveTo(a[0], a[1]); cv.ctx.lineTo(b[0] + 0.01, b[1]); cv.ctx.stroke(); };
    const sd = stroke(disp), si = stroke(ink);
    const evaluate = () => {
      const id = ink.ctx.getImageData(0, 0, w * ink.dpr, h * ink.dpr).data; let m = 0, hit = 0, inkPx = 0, spill = 0;
      for (let i = 3; i < id.length; i += 4) { const on = maskData[i] > 128, painted = id[i] > 128; if (on) { m++; if (painted) hit++; } if (painted) { inkPx++; if (!on) spill++; } }
      return { coverage: hit / (m || 1), spill: inkPx ? spill / inkPx : 0 };
    };
    bindStroke(disp, color, bw, (a, b) => { sd(a, b); si(a, b); }, () => {
      if (done) return; const r = evaluate(); window.__trace = r;
      if (r.coverage >= 0.5 && r.spill < 0.65) {
        done = true; if (DIAG.active) { DIAG.answer(this, !missed, null); return; }
        record('trace', !missed); if (!missed) addPeach();
        $('#cheer').textContent = pick(T().right); say(ch, 'en-US'); disp.c.onpointerdown = null; nextButton(() => this.play());
      }
    });
    $('#clr').onclick = () => { missed = true; ink.ctx.clearRect(0, 0, w, h); disp.ctx.clearRect(0, 0, w, h); disp.ctx.fillStyle = '#ffd9c7'; disp.ctx.fillText(ch, w / 2, base); };
    window.__traceTest = { ch, w, h, maskData, ink, disp, dpr: mask.dpr };
  }
});

// ---------- 4. Free drawing ("Drawing and writing") ----------
const DRAW_PROMPTS = [B('Draw your favorite toy!', '좋아하는 장난감을 그려요!'), B('Draw your family!', '우리 가족을 그려요!'), B('Draw something in the sky!', '하늘에 있는 것을 그려요!'),
  B('Draw your home!', '우리 집을 그려요!'), B('Draw a Georgia peach!', '조지아 복숭아를 그려요!'), B('Draw your best friend!', '가장 친한 친구를 그려요!')];
registerGame({
  id: 'draw', subject: 'write', icon: '🎨', title: B('Draw & Tell', '그리고 말해요'), sub: B('Draw, then tell a story', '그림을 그리고 이야기해요'),
  area: AREA_WRITE('Drawing and writing'),
  play() {
    const pr = pick(DRAW_PROMPTS); if (dup(this, pr.en)) return this.play();
    const [w, h] = canvasSize(), cv = makeCanvas(w, h);
    const colors = ['#1d3557', '#ef476f', '#ff8c42', '#ffd166', '#06d6a0', '#118ab2', '#8338ec', '#8d5524'];
    let color = colors[0], size = 8;
    cv.ctx.fillStyle = '#fff'; cv.ctx.fillRect(0, 0, w, h);
    view().innerHTML = `<div class="prompt">${L(pr)}<button class="say" id="sp">🔊</button></div><div class="canvaswrap" id="cw"></div>
      <div class="palette">${colors.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" data-c="${c}" style="background:${c}" aria-label="color"></button>`).join('')}
      <button class="sw sz" data-s="5">·</button><button class="sw sz" data-s="12">●</button><button class="sw sz" data-s="22">⬤</button></div>
      <div><button class="pill" id="clr">${T().clear}</button> <button class="next" id="done">${T().done}</button></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#cw').appendChild(cv.c);
    $('#sp').onclick = () => say(L(pr)); say(L(pr));
    $$('.sw[data-c]').forEach(b => b.onclick = () => { color = b.dataset.c; $$('.sw[data-c]').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); });
    $$('.sw.sz').forEach(b => b.onclick = () => { size = +b.dataset.s; });
    bindStroke(cv, color, size, (a, b) => { cv.ctx.strokeStyle = color; cv.ctx.lineWidth = size; cv.ctx.beginPath(); cv.ctx.moveTo(a[0], a[1]); cv.ctx.lineTo(b[0] + 0.01, b[1]); cv.ctx.stroke(); });
    $('#clr').onclick = () => { cv.ctx.fillStyle = '#fff'; cv.ctx.fillRect(0, 0, w, h); };
    $('#done').onclick = () => {
      record('draw', true); addPeach(); $('#done').disabled = true;
      $('#cheer').textContent = T().tellAbout; say(T().tellAbout);
      nextButton(() => this.play(), { auto: false });
    };
  }
});
