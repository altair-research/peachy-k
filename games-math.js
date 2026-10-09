'use strict';
// Math games, following GCPS kindergarten units (Georgia Reveal Math K):
// U1 within 10, U2 shapes, U3 numbers to 20, U4 3-D shapes, U5 patterns/add-subtract, U6 within 20, U7 data.
const AREA_MATH = (u) => B(`Math · ${u}`, `수학 · ${u}`);

// ---------- 1. Count by tens ----------
registerGame({
  id: 'tens', subject: 'math', icon: '🚂', title: B('Count by Tens', '10씩 세기'), sub: B('10, 20, 30...', '10, 20, 30...'),
  area: AREA_MATH('Counting'),
  play() {
    const lv = lvl('tens'), maxK = lv === 1 ? 5 : 10;
    const kind = lv === 1 ? pick(['gap', 'gap', 'total']) : pick(['gap', 'back', 'total', 'gap']);
    const dots = '<span>🔵</span>'.repeat(10);
    const near = (ans) => { const set = new Set([ans]); while (set.size < 3) { const v = ans + pick([-20, -10, 10, 20]); if (v >= 10 && v <= 100) set.add(v); } return [...set].map(v => ({ html: `<span class="num">${v}</span>`, ok: v === ans })); };
    if (kind === 'total') {
      const k = 2 + rnd(maxK - 1), ans = k * 10, seq = Array.from({ length: k }, (_, i) => (i + 1) * 10);
      quiz(this, {
        ask: B('Each car has 10. How many in all?', '칸마다 10개씩 있어요. 모두 몇 개일까요?'),
        show: `<div class="train sm">${seq.map(() => `<div class="car"><div class="dots">${dots}</div></div>`).join('')}</div>`,
        opts: near(ans), after: B(seq.join(', '), seq.join(', '))
      });
      return;
    }
    const len = lv === 1 ? 4 : 5, startIdx = rnd(maxK - len + 1);
    let seq = Array.from({ length: len }, (_, i) => (startIdx + i + 1) * 10);
    if (kind === 'back') seq = seq.reverse();
    const gapAt = rnd(len), ans = seq[gapAt];
    quiz(this, {
      ask: kind === 'back' ? B('Count backward by tens. Which number is missing?', '10씩 거꾸로 세어요. 빠진 숫자는?') : B('Which number is missing?', '빠진 숫자는 뭘까요?'),
      show: `<div class="train">${seq.map((n, i) => `<div class="car ${i === gapAt ? 'gap' : ''}"><div class="n">${i === gapAt ? '?' : n}</div><div class="dots">${i === gapAt ? '' : dots}</div></div>`).join('')}</div>`,
      opts: near(ans), after: B(seq.join(', '), seq.join(', ')),
      onCorrect() { const g = $('.car.gap'); g.classList.remove('gap'); g.querySelector('.n').textContent = ans; g.querySelector('.dots').innerHTML = dots; }
    });
  }
});

// ---------- 2. Make ten (tap-to-fill ten-frame) ----------
registerGame({
  id: 'ten', subject: 'math', icon: '🍎', title: B('Make Ten', '10 만들기'), sub: B('Fill the box to 10', '칸을 10개로 채워요'),
  area: AREA_MATH('Within 10'),
  play() {
    const lv = lvl('ten'), start = lv === 1 ? 5 + rnd(4) : 1 + rnd(8), e = pick(['🍑', '🍎', '🍓', '🍊', '⭐']);
    if (dup(this, 'ten' + start)) return this.play();
    let filled = start;
    const draw = () => {
      view().innerHTML = `
        <div class="prompt">${T().fillAsk}<button class="say" id="sp">🔊</button></div>
        <div class="frame">${Array.from({ length: 10 }, (_, i) => i < filled ? `<div class="cell on">${e}</div>` : `<div class="cell empty"></div>`).join('')}</div>
        <div class="cheer" id="cheer"></div>`;
      $('#sp').onclick = () => say(T().fillAsk);
      $$('.cell.empty').forEach(c => c.onclick = () => {
        filled++; draw();
        if (filled < 10) { say(String(filled)); return; }
        record('ten', true); addPeach();
        $('#cheer').textContent = T().pair(start, 10 - start) + ' ' + pick(T().right);
        say(T().pair(start, 10 - start));
        nextButton(() => this.play());
      });
    };
    draw(); say(T().fillAsk);
  }
});

// ---------- 3. Count the objects (one-to-one correspondence) ----------
registerGame({
  id: 'count', subject: 'math', icon: '🔢', title: B('Count Peaches', '복숭아 세기'), sub: B('Tap and count', '눌러서 세어요'),
  area: AREA_MATH('Counting objects'),
  play() {
    const lv = lvl('count'), n = lv === 1 ? 2 + rnd(9) : 8 + rnd(13), e = pick(['🍑', '🍑', '🍎', '🐞', '⭐', '🦆']);
    quiz(this, {
      ask: B(T().countAsk, I18N.ko.countAsk),
      show: `<div class="scatter">${Array.from({ length: n }, () => `<button class="obj" style="transform:translate(${rnd(21) - 10}px,${rnd(21) - 10}px) rotate(${rnd(41) - 20}deg)">${e}</button>`).join('')}</div>`,
      opts: numOpts(n, 1, 20),
      after: B(`${n}`, `${n}`),
      onRender() {
        let c = 0;
        $$('.obj').forEach(b => b.onclick = () => { if (b.classList.contains('counted')) return; c++; b.classList.add('counted'); b.dataset.n = c; say(String(c)); });
      }
    });
  }
});

// ---------- 4. Number order: next / before / counting back ----------
registerGame({
  id: 'order', subject: 'math', icon: '🔟', title: B('What Comes Next?', '다음 숫자는?'), sub: B('Count forward and back', '앞으로 뒤로 세어요'),
  area: AREA_MATH('Counting to 100'),
  play() {
    const lv = lvl('order'), hi = lv === 1 ? 20 : 100;
    const kind = lv === 1 ? pick(['next', 'next', 'before']) : pick(['next', 'before', 'back', 'mid']);
    let cards, ans, ask;
    if (kind === 'next') { const a = 1 + rnd(hi - 4); cards = [a, a + 1, a + 2, '?']; ans = a + 3; ask = B('What comes next?', '다음 숫자는 뭘까요?'); }
    else if (kind === 'before') { const a = 2 + rnd(hi - 4); cards = ['?', a, a + 1, a + 2]; ans = a - 1; ask = B('What comes before?', '앞에 올 숫자는 뭘까요?'); }
    else if (kind === 'back') { const a = 4 + rnd(hi - 4); cards = [a, a - 1, a - 2, '?']; ans = a - 3; ask = B('Count backward. What comes next?', '거꾸로 세어요. 다음은 뭘까요?'); }
    else { const a = 1 + rnd(hi - 4); cards = [a, a + 1, '?', a + 3]; ans = a + 2; ask = B('Which number is missing?', '빠진 숫자는 뭘까요?'); }
    quiz(this, { ask, show: `<div class="train">${cards.map(c => `<div class="car ${c === '?' ? 'gap' : ''}"><div class="n">${c}</div></div>`).join('')}</div>`, opts: numOpts(ans, 0, hi), after: B(`${ans}`, `${ans}`) });
  }
});

// ---------- 5. Compare groups: more / fewer / same ----------
registerGame({
  id: 'compare', subject: 'math', icon: '⚖️', title: B('More or Fewer?', '더 많이? 더 적게?'), sub: B('Compare groups', '묶음 비교하기'),
  area: AREA_MATH('Comparing sets'),
  play() {
    const lv = lvl('compare'), e = pick(['🍑', '🍎', '🐟', '⭐']);
    const same = lv === 2 && rnd(4) === 0;
    let a = 1 + rnd(10), b = same ? a : 1 + rnd(10);
    if (!same && a === b) b = a === 10 ? 9 : a + 1;
    const more = lv === 1 ? rnd(2) === 0 : true;
    const askMore = lv === 2 ? B('Which group has MORE? Or are they the SAME?', '어느 쪽이 더 많을까요? 아니면 같을까요?') : more ? B('Which group has MORE?', '어느 쪽이 더 많을까요?') : B('Which group has FEWER?', '어느 쪽이 더 적을까요?');
    const opts = [{ html: emojiRow(a, e, 'sm'), ok: !same && (more ? a > b : a < b) || false }, { html: emojiRow(b, e, 'sm'), ok: !same && (more ? b > a : b < a) || false }];
    if (lv === 2) opts.push({ html: '<span class="num">=</span>', label: B('Same', '같아요'), ok: same });
    quiz(this, { ask: askMore, opts, cls: 'groups', after: B(same ? `${a} and ${b} are the same.` : `${a} and ${b}.`, same ? `${a}와 ${b}는 같아요.` : `${a}와 ${b}.`) });
  }
});

// ---------- 6. Add and take away (within 5 / 10) ----------
registerGame({
  id: 'addsub', subject: 'math', icon: '➕', title: B('Peach Stories', '복숭아 이야기'), sub: B('Put together, take away', '더하고 빼요'),
  area: AREA_MATH('Add & subtract'),
  play() {
    const lv = lvl('addsub'), top = lv === 1 ? 5 : 10, e = pick(['🍑', '🍎', '🐥', '🍪']);
    const add = rnd(2) === 0;
    let show, ans, ask, speech;
    if (add) {
      const a = 1 + rnd(top - 1), b = 1 + rnd(top - a); ans = a + b;
      show = `<div class="story">${emojiRow(a, e, 'sm')}<span class="op">+</span>${emojiRow(b, e, 'sm')}</div>`;
      ask = B(`${a} and ${b} more. How many in all?`, `${a}개에 ${b}개를 더하면 모두 몇 개일까요?`);
      speech = B(`${a} plus ${b} is ${ans}.`, `${a} 더하기 ${b}는 ${ans}.`);
    } else {
      const a = 2 + rnd(top - 1), b = 1 + rnd(a - 1); ans = a - b;
      show = `<div class="story">${Array.from({ length: a }, (_, i) => `<span class="${i >= a - b ? 'gone' : ''}">${e}</span>`).join('')}</div>`;
      ask = B('Take away the crossed ones. How many are left?', '지워진 것을 빼면 몇 개 남을까요?');
      speech = B(`${a} minus ${b} is ${ans}.`, `${a} 빼기 ${b}는 ${ans}.`);
    }
    quiz(this, { ask, show, opts: numOpts(ans, 0, top), after: speech });
  }
});

// ---------- 7. Teen numbers (ten and some more) ----------
registerGame({
  id: 'teens', subject: 'math', icon: '🧱', title: B('Ten and More', '10과 더'), sub: B('11 to 19', '11부터 19까지'),
  area: AREA_MATH('Numbers to 20'),
  play() {
    const lv = lvl('teens'), n = lv === 1 ? 11 + rnd(5) : 11 + rnd(9), e = pick(['🍑', '🍎', '⭐']);
    quiz(this, {
      ask: B('A full ten and some more. How many in all?', '가득 찬 10과 더 있어요. 모두 몇 개일까요?'),
      show: `<div class="story"><div class="frame mini">${Array.from({ length: 10 }, () => `<div class="cell on">${e}</div>`).join('')}</div><span class="op">+</span>${emojiRow(n - 10, e, 'sm')}</div>`,
      opts: numOpts(n, 11, 20), after: B(`Ten and ${n - 10} make ${n}.`, `10과 ${n - 10}를 합치면 ${n}.`)
    });
  }
});

// ---------- 8. 2-D shapes (SVG, random rotation) ----------
const SHAPES = {
  circle: { n: B('circle', '동그라미'), svg: '<circle cx="50" cy="50" r="40"/>' },
  square: { n: B('square', '네모(정사각형)'), svg: '<rect x="14" y="14" width="72" height="72"/>' },
  triangle: { n: B('triangle', '세모'), svg: '<polygon points="50,10 92,86 8,86"/>' },
  rectangle: { n: B('rectangle', '직사각형'), svg: '<rect x="6" y="26" width="88" height="48"/>' },
  hexagon: { n: B('hexagon', '육각형'), svg: '<polygon points="50,6 87,28 87,72 50,94 13,72 13,28"/>' }
};
const SHAPE_COLORS = ['#ef476f', '#118ab2', '#06d6a0', '#ffb703', '#8338ec'];
const shapeSvg = (k, rot) => `<svg viewBox="0 0 100 100" class="shape" style="transform:rotate(${rot}deg)" fill="${pick(SHAPE_COLORS)}" stroke="#1d3557" stroke-width="3">${SHAPES[k].svg}</svg>`;
const SHAPE_FACTS = {
  circle: B('Which shape is round, with no corners?', '둥글고 뾰족한 곳이 없는 모양은?'),
  triangle: B('Which shape has 3 sides?', '변이 3개인 모양은?'),
  square: B('Which shape has 4 sides that are all the same?', '변 4개가 모두 같은 모양은?'),
  rectangle: B('Which shape has 4 sides, with 2 long and 2 short?', '긴 변 2개, 짧은 변 2개인 모양은?'),
  hexagon: B('Which shape has 6 sides?', '변이 6개인 모양은?')
};
registerGame({
  id: 'shapes2d', subject: 'math', icon: '🔺', title: B('Shape Finder', '모양 찾기'), sub: B('Circles, squares, triangles...', '동그라미, 네모, 세모...'),
  area: AREA_MATH('Shapes'),
  play() {
    const lv = lvl('shapes2d'), pool = lv === 1 ? ['circle', 'square', 'triangle', 'rectangle'] : Object.keys(SHAPES);
    const t = pick(pool), ds = others(pool, t, 2), byFact = rnd(2) === 0;
    const rot = () => (lv === 1 ? rnd(2) * 15 : rnd(61) - 30);
    quiz(this, {
      ask: byFact ? SHAPE_FACTS[t] : B(`Tap the ${SHAPES[t].n.en.toUpperCase()}.`, `${SHAPES[t].n.ko}을(를) 눌러요.`),
      askSay: byFact ? SHAPE_FACTS[t] : B(`Tap the ${SHAPES[t].n.en}.`, `${SHAPES[t].n.ko}을 눌러요.`),
      askExtra: S.lang === 'ko' && !byFact ? { t: SHAPES[t].n.en, lang: 'en-US' } : null,
      opts: [t, ...ds].map(k => ({ html: shapeSvg(k, rot()), ok: k === t })), cls: 'shapes',
      after: B(`That is a ${SHAPES[t].n.en}.`, `${SHAPES[t].n.ko}이에요.`), vocab: SHAPES[t].n.en
    });
  }
});

// ---------- 9. 3-D shapes in my world ----------
const SOLIDS = {
  sphere: { n: B('sphere', '구'), things: [['🏀', B('basketball', '농구공')], ['⚽', B('soccer ball', '축구공')], ['🌍', B('globe', '지구본')]] },
  cube: { n: B('cube', '정육면체'), things: [['🎲', B('dice', '주사위')], ['🧊', B('ice cube', '얼음')]] },
  cone: { n: B('cone', '원뿔'), things: [['🍦', B('ice cream cone', '아이스크림콘')], ['🥳', B('party hat', '고깔모자')]] },
  cylinder: { n: B('cylinder', '원기둥'), things: [['🥫', B('can', '캔')], ['🔋', B('battery', '건전지')]] }
};
registerGame({
  id: 'shapes3d', subject: 'math', icon: '🧊', title: B('Shapes Around Me', '내 주변의 모양'), sub: B('Spheres, cubes, cones...', '공, 상자, 원뿔...'),
  area: AREA_MATH('3-D shapes'),
  play() {
    const keys = Object.keys(SOLIDS), t = pick(keys), ds = others(keys, t, 2);
    const mk = (k, ok) => { const [html, label] = pick(SOLIDS[k].things); return { html: `<span class="emo">${html}</span>`, label, ok }; };
    quiz(this, {
      ask: B(`Which one looks like a ${SOLIDS[t].n.en.toUpperCase()}?`, `${SOLIDS[t].n.ko} 모양은 어느 것일까요?`),
      askSay: B(`Which one looks like a ${SOLIDS[t].n.en}?`, `${SOLIDS[t].n.ko} 모양은 어느 것일까요?`),
      opts: [mk(t, true), ...ds.map(k => mk(k, false))],
      after: B(`A ${SOLIDS[t].n.en}!`, `${SOLIDS[t].n.ko}!`), vocab: SOLIDS[t].n.en
    });
  }
});

// ---------- 10. Patterns ----------
registerGame({
  id: 'pattern', subject: 'math', icon: '🎨', title: B('Pattern Parade', '무늬 퍼레이드'), sub: B('What comes next?', '다음에 올 것은?'),
  area: AREA_MATH('Patterns'),
  play() {
    const lv = lvl('pattern');
    const units = lv === 1 ? ['AB', 'AB', 'AAB'] : ['ABB', 'AABB', 'ABC', 'AAB', 'ABCC'];
    const unit = pick(units), pal = shuffle(['🔴', '🔵', '🟢', '🟡', '🐶', '🐱', '🍎', '🍌', '⭐', '🌙', '🦋', '🌸']);
    const sym = {}; [...new Set(unit)].forEach((c, i) => sym[c] = pal[i]);
    const total = unit.length * 2 + rnd(unit.length), seq = Array.from({ length: total + 1 }, (_, i) => sym[unit[i % unit.length]]);
    const ans = seq[total], shown = seq.slice(0, total);
    const choices = [ans, ...others(pal.slice(0, 6).filter(x => x !== ans), ans, 2)];
    quiz(this, {
      ask: B('What comes next in the pattern?', '무늬의 다음에 올 것은 뭘까요?'),
      show: `<div class="train pat">${shown.map(s => `<div class="pc">${s}</div>`).join('')}<div class="pc gap">?</div></div>`,
      opts: choices.map(c => ({ html: `<span class="emo">${c}</span>`, ok: c === ans })), cls: 'shapes',
      onCorrect() { const g = $('.pc.gap'); g.classList.remove('gap'); g.textContent = ans; }
    });
  }
});

// ---------- 11. Graphs ----------
registerGame({
  id: 'graph', subject: 'math', icon: '📊', title: B('Read the Graph', '그래프 읽기'), sub: B('Which has the most?', '어느 것이 가장 많을까?'),
  area: AREA_MATH('Data'),
  play() {
    const lv = lvl('graph'), cats = shuffle(['🍎', '🍌', '🍇', '🍑']).slice(0, lv === 1 ? 2 : 3);
    const counts = shuffle([1, 2, 3, 4, 5, 6]).slice(0, cats.length);
    const col = (c, n) => `<div class="gcol"><div class="gstack">${Array.from({ length: n }, () => `<span>${c}</span>`).join('')}</div><div class="glabel">${c}</div></div>`;
    const show = `<div class="graph">${cats.map((c, i) => col(c, counts[i])).join('')}</div>`;
    const mode = rnd(2) === 0 ? 'most' : 'howmany';
    if (mode === 'most') {
      const top = Math.max(...counts);
      quiz(this, { ask: B('Which one has the MOST?', '가장 많은 것은 어느 것일까요?'), show, opts: cats.map((c, i) => ({ html: `<span class="emo">${c}</span>`, ok: counts[i] === top })), cls: 'shapes' });
    } else {
      const i = rnd(cats.length);
      quiz(this, { ask: B(`How many ${cats[i]} are there?`, `${cats[i]}는 몇 개일까요?`), show, opts: numOpts(counts[i], 1, 7), after: B(`${counts[i]}`, `${counts[i]}`) });
    }
  }
});
