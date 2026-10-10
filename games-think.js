'use strict';
// Think & Create: executive-function games (self-control, rule switching, working memory, visual attention)
// and open-ended creative games (what could it be? build a scene, story sparks). See docs/brain-research.md.
const sp = (ms) => ms * (window.__speed || 1);                      // tests can shrink timings
const sleep2 = (ms) => new Promise(r => setTimeout(r, sp(ms)));
const AREA_CREATE = (u) => B(`Create · ${u}`, `창의 · ${u}`);

// ---------- 1. Go / No-Go: tap only the go picture ----------
registerGame({
  id: 'gonogo', subject: 'brain', icon: '🚦', title: B('Tap Only Peaches', '복숭아만 눌러요'), sub: B('Stop and think first', '멈추고 먼저 생각해요'),
  area: AREA_BRAIN('Self-control'), rounds: 2,
  play() {
    const lv = lvl('gonogo'), N = lv === 1 ? 10 : 14, showMs = lv === 1 ? 1500 : 1000, go = pick(['🍑', '🍎', '⭐']), nogo = pick(['🐝', '🕷️', '🌵']);
    let seq; do { seq = Array.from({ length: N }, (_, i) => (i < 2 || rnd(100) >= 30) ? go : nogo); } while (seq.filter(x => x === nogo).length < 3);
    const ask = B(`Tap only the ${go}! Do NOT tap the ${nogo}.`, `${go}만 눌러요! ${nogo}는 누르지 않아요.`);
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div>
      <div class="gdots" id="gdots">${seq.map(() => '<i></i>').join('')}</div>
      <button class="gstage" id="gstage" aria-label="tap"></button><div class="gfb" id="gfb"></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    const stage = $('#gstage'); let active = false, tapped = false, okc = 0;
    stage.onpointerdown = () => { if (active && !tapped) { tapped = true; stage.classList.add('tap'); tone(520, 80); } };
    (async () => {
      await sleep2(1200);
      for (let i = 0; i < N; i++) {
        if (!document.body.contains(stage)) return;
        tapped = false; active = true; stage.classList.remove('tap'); stage.textContent = seq[i]; await sleep2(showMs); active = false;
        const ok = (seq[i] === go) === tapped; if (ok) okc++; $('#gdots').children[i].className = ok ? 'ok' : 'bad'; $('#gfb').textContent = ok ? '✅' : '❌'; stage.textContent = ''; await sleep2(450); if (document.body.contains(stage)) $('#gfb').textContent = '';
      }
      if (!document.body.contains(stage)) return;
      const good = okc / N >= 0.8; record('gonogo', good); if (good) addPeach();
      $('#cheer').textContent = good ? pick(T().right) : T().again; nextButton(() => this.play());
    })();
    window.__gng = { go, nogo, seq };
  }
});

// ---------- 2. Card sort: switch the rule (color game -> shape game) ----------
const CARD_COL = { red: '#ef476f', blue: '#118ab2' };
const cardSvg = (col, sh, sz = 74) => `<svg viewBox="0 0 60 60" width="${sz}" height="${sz}">${sh === 'star' ? `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 11 : 26; return (30 + r * Math.cos(a)).toFixed(1) + ',' + (31 + r * Math.sin(a)).toFixed(1); }).join(' ')}" fill="${CARD_COL[col]}" stroke="#1d3557" stroke-width="2.4" stroke-linejoin="round"/>` : `<circle cx="30" cy="30" r="24" fill="${CARD_COL[col]}" stroke="#1d3557" stroke-width="2.4"/>`}</svg>`;
registerGame({
  id: 'sortcards', subject: 'brain', icon: '🃏', title: B('Switch the Rule', '규칙 바꾸기'), sub: B('Color game, then shape game', '색깔 게임, 모양 게임'),
  area: AREA_BRAIN('Flexible thinking'), rounds: 2,
  play() {
    const lv = lvl('sortcards'), phases = lv === 1 ? [['color', 4], ['shape', 4]] : [['color', 3], ['shape', 4], ['color', 3]];
    const trials = phases.flatMap(([rule, n], pi) => Array.from({ length: n }, () => ({ rule, pi, card: pick([['red', 'star'], ['blue', 'circle']]) })));
    const rt = { color: B('COLOR game! Match the COLOR.', '색깔 게임! 같은 색깔 상자에 넣어요.'), shape: B('SHAPE game! Match the SHAPE.', '모양 게임! 같은 모양 상자에 넣어요.') };
    view().innerHTML = `<div class="prompt" id="rule"></div><div class="gdots" id="gdots">${trials.map(() => '<i></i>').join('')}</div>
      <div class="cardstage" id="cardstage"></div>
      <div class="boxes"><button class="cbox" data-s="left">${cardSvg('blue', 'star', 64)}</button><button class="cbox" data-s="right">${cardSvg('red', 'circle', 64)}</button></div>
      <div class="gfb" id="gfb"></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    let i = 0, lock = true, post = [], lastRule = null;
    const show = () => {
      const t = trials[i]; if (!t) return fin();
      if (t.rule !== lastRule) { $('#rule').textContent = L(rt[t.rule]); say(L(rt[t.rule])); lastRule = t.rule; }
      $('#cardstage').innerHTML = cardSvg(t.card[0], t.card[1], 96); lock = false;
    };
    const fin = () => { const acc = post.filter(Boolean).length / (post.length || 1), good = acc >= 0.75; record('sortcards', good); if (good) addPeach(); $('#cardstage').innerHTML = ''; $('#cheer').textContent = good ? pick(T().right) : T().again; nextButton(() => this.play()); };
    $$('.cbox').forEach(b => b.onclick = () => {
      if (lock || i >= trials.length) return; lock = true; const t = trials[i], want = t.rule === 'color' ? (t.card[0] === 'blue' ? 'left' : 'right') : (t.card[1] === 'star' ? 'left' : 'right'), ok = b.dataset.s === want;
      if (t.pi >= 1) post.push(ok); $('#gdots').children[i].className = ok ? 'ok' : 'bad'; $('#gfb').textContent = ok ? '✅' : '❌'; tone(ok ? 660 : 200, 120, 0, ok ? 'sine' : 'triangle', 0.1);
      if (!ok) $$('.cbox').find(x => x.dataset.s === want).classList.add('hint');
      setTimeout(() => { if (!document.body.contains(b)) return; $$('.cbox').forEach(x => x.classList.remove('hint')); $('#gfb').textContent = ''; i++; show(); }, sp(ok ? 500 : 1000));
    });
    show(); window.__dccs = { trials, answer: () => { const t = trials[i]; return t.rule === 'color' ? (t.card[0] === 'blue' ? 'left' : 'right') : (t.card[1] === 'star' ? 'left' : 'right'); }, idx: () => i };
  }
});

// ---------- 3. What is missing? (working memory) ----------
const MEMPOOL = ['🍎', '🐶', '🚗', '⭐', '🎈', '🐱', '🍌', '🌳', '⚽', '🦋', '🍓', '🎩', '🐟', '🚲', '🌙', '🧸'];
registerGame({
  id: 'missing', subject: 'brain', icon: '🙈', title: B("What's Missing?", '뭐가 없어졌지?'), sub: B('Remember, then find it', '기억하고 찾아요'),
  area: AREA_BRAIN('Memory'),
  play() {
    const n = lvl('missing') === 1 ? 3 : 5, items = shuffle(MEMPOOL).slice(0, n), miss = rnd(n), secs = n === 3 ? 3500 : 5000;
    if (dup(this, items.join('') + miss)) return this.play();
    const ask = B('Remember these pictures!', '그림을 잘 기억해요!');
    view().innerHTML = `<div class="prompt">${L(ask)}</div><div class="memrow" id="memrow">${items.map(e => `<span>${e}</span>`).join('')}</div><div class="timebar"><i id="tb" style="animation-duration:${sp(secs)}ms"></i></div>`; say(L(ask));
    setTimeout(() => {
      if (!document.getElementById('memrow')) return;
      const ds = others(MEMPOOL.filter(e => !items.includes(e)), '', 2), o = (e, ok) => ({ html: `<span class="emo">${e}</span>`, ok });
      quiz(this, { ask: B('Which one is missing?', '어떤 그림이 없어졌을까요?'), show: `<div class="memrow">${items.map((e, i) => i === miss ? '<span class="qbox">?</span>' : `<span>${e}</span>`).join('')}</div>`, opts: [o(items[miss], true), ...ds.map(e => o(e, false))], cls: 'shapes', after: B('Great memory!', '기억력이 대단해요!') });
    }, sp(secs));
  }
});

// ---------- 4. Spot the difference ----------
const SDPOOL = ['🍎', '🐶', '🚗', '⭐', '🎈', '🐱', '🍌', '🌳', '⚽', '🦋', '🍓', '🎩', '🐟', '🚲', '🌙', '🧸', '🍪', '🌻', '🐸', '🏠'];
registerGame({
  id: 'spotdiff', subject: 'brain', icon: '🔍', title: B('Spot the Difference', '다른 곳 찾기'), sub: B('Look carefully', '잘 살펴봐요'),
  area: AREA_BRAIN('Visual attention'), rounds: 3,
  play() {
    const lv = lvl('spotdiff'), cols = 3, rows = lv === 1 ? 2 : 3, N = cols * rows, k = lv === 1 ? 1 : 2, base = shuffle(SDPOOL).slice(0, N), diffs = shuffle([...Array(N).keys()]).slice(0, k);
    const second = base.map((e, i) => diffs.includes(i) ? pick(SDPOOL.filter(x => x !== e && !base.includes(x))) : e);
    const ask = B(k === 1 ? 'Find the one that is different!' : 'Find 2 things that are different!', k === 1 ? '다른 그림 1개를 찾아요!' : '다른 그림 2개를 찾아요!');
    const grid = (arr, cls) => `<div class="sdg ${cls}" style="--c:${cols}">${arr.map((e, i) => `<button class="sdc" data-i="${i}">${e}</button>`).join('')}</div>`;
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div><div class="sdwrap">${grid(base, 'ref')}<div class="sdarrow">⬇</div>${grid(second, 'tap')}</div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask)); $$('.sdg.ref .sdc').forEach(b => b.disabled = true);
    let found = new Set(), missed = false, done = false;
    $$('.sdg.tap .sdc').forEach(b => b.onclick = () => {
      if (done) return; const i = +b.dataset.i;
      if (diffs.includes(i)) { if (found.has(i)) return; found.add(i); b.classList.add('found'); tone(660, 120); if (found.size === k) { done = true; record('spotdiff', !missed); if (!missed) addPeach(); $('#cheer').textContent = pick(T().right); nextButton(() => this.play()); } }
      else { b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); if (!missed) { missed = true; record('spotdiff', false); } tone(200, 120, 0, 'triangle', 0.1); }
    });
    window.__sd = { diffs };
  }
});

// ---------- 5. What could it be? (divergent thinking, no wrong answers) ----------
const IMAGINE = {
  circle: [['🌞', B('sun', '해')], ['⚽', B('ball', '공')], ['🍪', B('cookie', '쿠키')], ['🕐', B('clock', '시계')], ['🌕', B('moon', '보름달')], ['🍕', B('pizza', '피자')]],
  triangle: [['⛰️', B('mountain', '산')], ['🍕', B('pizza slice', '피자 조각')], ['🎄', B('tree', '나무')], ['⛺', B('tent', '텐트')], ['🧀', B('cheese', '치즈')], ['⛵', B('sail', '돛')]],
  square: [['🪟', B('window', '창문')], ['🧇', B('waffle', '와플')], ['🖼️', B('picture', '액자')], ['📦', B('box', '상자')], ['🎁', B('present', '선물')], ['🍞', B('bread', '식빵')]],
  rectangle: [['🚪', B('door', '문')], ['📱', B('phone', '휴대폰')], ['📖', B('book', '책')], ['🍫', B('chocolate bar', '초콜릿')], ['🛏️', B('bed', '침대')], ['🚌', B('bus', '버스')]]
};
registerGame({
  id: 'imagine', subject: 'create', icon: '💭', title: B('What Could It Be?', '무엇일 수 있을까?'), sub: B('Many right answers!', '정답이 여러 개예요!'),
  area: AREA_CREATE('Imagination'), rounds: 4,
  play() {
    const k = pick(Object.keys(IMAGINE)); if (dup(this, k)) return this.play();
    const ask = B('What could this shape be? Tap 2 or more ideas!', '이 모양은 무엇일 수 있을까요? 2개 이상 골라요!'), need = 2;
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div><div class="show">${shapeSvg(k, 0).replace('class="shape"', 'class="shape big"')}</div>
      <div class="opts shapes imagine">${shuffle(IMAGINE[k]).map(it => `<button class="opt idea"><span class="emo">${it[0]}</span><span class="ol">${labelText(it[1])}</span></button>`).join('')}</div>
      <div><button class="next" id="idone" disabled>${T().done}</button></div><div class="fact" id="fact"></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    let n = 0, done = false; const btn = $('#idone');
    $$('.idea').forEach((b, i) => b.onclick = () => { if (done) return; b.classList.toggle('picked'); n = $$('.idea.picked').length; btn.disabled = n < need; tone(440 + 60 * n, 90); });
    btn.onclick = () => { if (done || n < need) return; done = true; record('imagine', true); addPeach(); $('#cheer').textContent = L(B('Great imagination!', '상상력이 멋져요!')); $('#fact').textContent = L(B('Can you think of one more idea? Tell a grown-up!', '또 다른 생각이 있나요? 어른에게 말해 줘요!')); say(L(B('Can you think of one more idea?', '또 다른 생각이 있나요?'))); btn.disabled = true; nextButton(() => this.play(), { auto: 3500 }); };
  }
});

// ---------- 6. Scene builder (open-ended play) ----------
const SCENES = {
  farm: { bg: 'linear-gradient(#bfe9ff 0 55%,#8fd86b 55% 100%)', st: ['🐄', '🐖', '🐔', '🚜', '🌳', '🏠', '🌻', '☀️', '🐑', '🐴'], n: B('Farm', '농장') },
  space: { bg: 'radial-gradient(circle at 20% 20%,#3b2d7a,#120a33)', st: ['🚀', '🌍', '🌙', '⭐', '🛸', '👩‍🚀', '☄️', '🪐', '🌠', '🌟'], n: B('Space', '우주') },
  ocean: { bg: 'linear-gradient(#9be3ff 0 20%,#2aa0d8 20% 100%)', st: ['🐠', '🐙', '🐳', '🦀', '🐢', '🐚', '🌊', '⛵', '🐬', '🦈'], n: B('Ocean', '바다') }
};
registerGame({
  id: 'scene', subject: 'create', icon: '🎨', title: B('Build a Scene', '장면 만들기'), sub: B('Place stickers and imagine', '스티커를 놓고 상상해요'),
  area: AREA_CREATE('Open-ended play'), rounds: 1,
  play() {
    const sk = pick(Object.keys(SCENES)), sc = SCENES[sk], ask = B('Tap a sticker, then tap the picture to place it. Make your own scene!', '스티커를 누르고 그림을 눌러 놓아요. 나만의 장면을 만들어요!');
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div>
      <div class="scene" id="scene" style="background:${sc.bg}"></div>
      <div class="pal" id="pal">${sc.st.map(e => `<button class="stkb" data-e="${e}">${e}</button>`).join('')}</div>
      <div><button class="pill" id="sundo">↩ ${T().undo}</button> <button class="pill" id="sclr">🗑 ${T().clear}</button> <button class="next" id="sdone">${T().done}</button></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    let sel = sc.st[0], placed = [], finished = false; const sceneEl = $('#scene');
    const draw = () => { sceneEl.innerHTML = placed.map((p, i) => `<span class="ps" data-i="${i}" style="left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%) rotate(${p.r}deg) scale(${p.s})">${p.e}</span>`).join(''); };
    $$('.stkb').forEach(b => { if (b.dataset.e === sel) b.classList.add('sel'); b.onclick = () => { sel = b.dataset.e; $$('.stkb').forEach(x => x.classList.toggle('sel', x === b)); tone(500, 60); }; });
    sceneEl.onpointerdown = (e) => {
      if (finished) return; const t = e.target.closest('.ps'); if (t) { placed.splice(+t.dataset.i, 1); draw(); return; }
      const r = sceneEl.getBoundingClientRect(); if (placed.length >= 16) return;
      placed.push({ e: sel, x: Math.round(100 * (e.clientX - r.left) / r.width), y: Math.round(100 * (e.clientY - r.top) / r.height), r: rnd(21) - 10, s: 0.9 + rnd(5) / 10 }); draw(); tone(380 + rnd(200), 70);
    };
    $('#sundo').onclick = () => { if (!finished) { placed.pop(); draw(); } }; $('#sclr').onclick = () => { if (!finished) { placed = []; draw(); } };
    $('#sdone').onclick = () => { if (finished || placed.length < 3) { if (!finished) $('#cheer').textContent = L(B('Add at least 3 stickers!', '스티커를 3개 이상 놓아요!')); return; } finished = true; record('scene', true); addPeach(); $('#cheer').textContent = L(B('Beautiful! Tell a grown-up your story!', '멋져요! 어른에게 이야기를 들려줘요!')); nextButton(() => this.play(), { auto: false }); };
    window.__scene = { place: (e, x, y) => { sel = e; placed.push({ e, x, y, r: 0, s: 1 }); draw(); }, count: () => placed.length };
  }
});

// ---------- 7. Story sparks ----------
const SPARK = [['🐘', '🚀', '🍕'], ['🐱', '🌈', '🎈'], ['🦖', '🏠', '🍪'], ['🐢', '🌙', '🎸'], ['🐶', '🚗', '🌻'], ['🦋', '⚽', '🎩'], ['🐙', '⭐', '🍓'], ['🐸', '🚲', '☂️'], ['🦁', '🎁', '🐟'], ['🐝', '🛁', '🏰']];
registerGame({
  id: 'storyspark', subject: 'create', icon: '✨', title: B('Story Sparks', '이야기 씨앗'), sub: B('Tell a story with 3 pictures', '그림 3개로 이야기해요'),
  area: AREA_CREATE('Storytelling'), rounds: 3,
  play() {
    const s = pick(SPARK); if (dup(this, s.join(''))) return this.play();
    const ask = B('Make up a story with all three pictures! Tell it to a grown-up.', '그림 3개로 이야기를 지어 봐요! 어른에게 들려줘요.');
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div><div class="show sparkrow">${s.map(e => `<span class="spark">${e}</span>`).join('')}</div>
      <div><button class="pill" id="snew">🔄 ${L(B('New pictures', '다른 그림'))}</button> <button class="next" id="sdone2">${L(B('I told a story!', '이야기했어요!'))}</button></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    let done = false; $('#snew').onclick = () => { if (!done) this.play(); };
    $('#sdone2').onclick = () => { if (done) return; done = true; record('storyspark', true); addPeach(); $('#cheer').textContent = L(B('What a story!', '멋진 이야기예요!')); nextButton(() => this.play(), { auto: 1500 }); };
  }
});
