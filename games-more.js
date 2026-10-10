'use strict';
// More games, modeled on common K workbook problem types (original content; see docs/workbook-research.md):
// quantity matching, number line hops, clocks, coins, opposites, ending sounds, story order, cause & effect,
// color mixing, feelings, days/seasons, and a robot-directions coding puzzle.

// ---------- SVG helpers ----------
const tfSvg = (n, col = '#ef476f') => `<svg viewBox="0 0 110 46" class="qsvg"><rect x="1" y="1" width="108" height="44" rx="6" fill="#fff" stroke="#1d3557" stroke-width="2"/>${Array.from({ length: 10 }, (_, i) => { const r = Math.floor(i / 5), c = i % 5; return `<rect x="${4 + c * 21}" y="${4 + r * 20}" width="19" height="19" rx="3" fill="#eef" stroke="#99a" stroke-width=".8"/>${i < n ? `<circle cx="${13.5 + c * 21}" cy="${13.5 + r * 20}" r="6.5" fill="${col}"/>` : ''}`; }).join('')}</svg>`;
const DICE = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
const diceSvg = (n, col = '#118ab2') => `<svg viewBox="0 0 50 50" class="qsvg die"><rect x="2" y="2" width="46" height="46" rx="9" fill="#fff" stroke="#1d3557" stroke-width="2.4"/>${DICE[n].map(p => `<circle cx="${12 + p[0] * 13}" cy="${12 + p[1] * 13}" r="5" fill="${col}"/>`).join('')}</svg>`;
const SPOTS = [[14, 12], [46, 9], [80, 14], [26, 32], [60, 30], [94, 32], [12, 52], [44, 50], [76, 50], [98, 52]];
const scatterSvg = (n, col = '#06d6a0') => `<svg viewBox="0 0 110 62" class="qsvg"><rect x="1" y="1" width="108" height="60" rx="8" fill="#fff" stroke="#1d3557" stroke-width="2"/>${shuffle(SPOTS).slice(0, n).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${col}"/>`).join('')}</svg>`;
const AREA_LIFE = (u) => B(`Me & My World · ${u}`, `나와 우리 주변 · ${u}`);

// ---------- 1. Quantity: which picture shows this number? ----------
registerGame({
  id: 'quantity', subject: 'math', icon: '🎲', title: B('Show Me the Number', '수만큼 찾기'), sub: B('Match numbers to dots', '숫자와 점 짝 맞추기'),
  area: AREA_MATH('Counting & cardinality'),
  play() {
    const lv = lvl('quantity'), n = lv === 1 ? 1 + rnd(8) : 3 + rnd(8), set = new Set([n]);
    while (set.size < 3) { const v = n + pick([-2, -1, 1, 2]); if (v >= 1 && v <= 10) set.add(v); }
    const maker = (v) => { const kinds = [() => tfSvg(v), () => scatterSvg(v)]; if (v <= 6) kinds.push(() => diceSvg(v)); return pick(kinds)(); };
    quiz(this, {
      ask: B(`Which one shows ${n}?`, `${n}을(를) 나타내는 것은 어느 것일까요?`), show: `<span class="num bignum">${n}</span>`,
      opts: [...set].map(v => ({ html: maker(v), ok: v === n })), cls: 'groups', after: B(`${n}!`, `${n}!`)
    });
  }
});

// ---------- 2. Number line hops ----------
const nlSvg = (at, arcFrom) => {
  const x = (i) => 6 + i * 10.8;
  let s = `<line x1="${x(0)}" y1="22" x2="${x(10)}" y2="22" stroke="#1d3557" stroke-width="1.6"/>`;
  for (let i = 0; i <= 10; i++) s += `<line x1="${x(i)}" y1="19" x2="${x(i)}" y2="25" stroke="#1d3557" stroke-width="1.2"/><text x="${x(i)}" y="32" font-size="5.6" text-anchor="middle" fill="#1d3557" font-weight="700">${i}</text>`;
  if (arcFrom !== undefined) s += `<path d="M${x(arcFrom)} 17 Q${(x(arcFrom) + x(at)) / 2} ${3} ${x(at)} 17" fill="none" stroke="#06d6a0" stroke-width="1.6" stroke-dasharray="2.5 2" marker-end="none"/>`;
  s += `<text x="${x(at)}" y="15" font-size="10" text-anchor="middle">🐸</text>`;
  return `<svg viewBox="0 0 120 36" class="nlsvg">${s}</svg>`;
};
registerGame({
  id: 'numline', subject: 'math', icon: '🐸', title: B('Frog Hops', '개구리 뛰기'), sub: B('Hop on the number line', '수직선에서 뛰어요'),
  area: AREA_MATH('Add & subtract'),
  play() {
    const lv = lvl('numline'), back = lv === 2 && rnd(2) === 0;
    let a, b, ans;
    if (back) { a = 3 + rnd(8); b = 1 + rnd(Math.min(3, a)); ans = a - b; } else { a = rnd(8); b = 1 + rnd(Math.min(lv === 1 ? 3 : 5, 10 - a)); ans = a + b; }
    quiz(this, {
      ask: back ? B(`The frog is on ${a}. Hop ${b} back. Where does it land?`, `개구리는 ${a}에 있어요. 뒤로 ${b}칸 뛰면 어디에 도착할까요?`) : B(`The frog is on ${a}. Hop ${b} forward. Where does it land?`, `개구리는 ${a}에 있어요. 앞으로 ${b}칸 뛰면 어디에 도착할까요?`),
      show: nlSvg(a), opts: numOpts(ans, 0, 10), after: back ? B(`${a} minus ${b} is ${ans}.`, `${a} 빼기 ${b}는 ${ans}.`) : B(`${a} plus ${b} is ${ans}.`, `${a} 더하기 ${b}는 ${ans}.`),
      onCorrect() { $('.show').innerHTML = nlSvg(ans, a); }
    });
  }
});

// ---------- 3. Clock (o'clock) ----------
const clockSvg = (h) => { let s = '<circle cx="50" cy="50" r="46" fill="#fff" stroke="#1d3557" stroke-width="3"/>'; for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; s += `<text x="${50 + 36 * Math.cos(a)}" y="${50 + 36 * Math.sin(a) + 3.5}" font-size="10" font-weight="800" text-anchor="middle" fill="#1d3557">${i}</text>`; }
  const ha = (h * 30 - 90) * Math.PI / 180; s += `<line x1="50" y1="50" x2="${50 + 22 * Math.cos(ha)}" y2="${50 + 22 * Math.sin(ha)}" stroke="#ef476f" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="50" y2="14" stroke="#118ab2" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.4" fill="#1d3557"/>`;
  return `<svg viewBox="0 0 100 100" class="clocksvg">${s}</svg>`; };
registerGame({
  id: 'clock', subject: 'math', icon: '🕒', title: B('What Time Is It?', '몇 시일까?'), sub: B("O'clock times", '정각 읽기'),
  area: AREA_MATH('Time (enrichment)'),
  play() {
    const h = 1 + rnd(12), set = new Set([h]); while (set.size < 3) { const v = ((h - 1 + pick([-2, -1, 1, 2, 3])) % 12 + 12) % 12 + 1; set.add(v); }
    quiz(this, {
      ask: B('What time does the clock show?', '시계가 가리키는 시각은?'), show: clockSvg(h),
      opts: [...set].map(v => ({ html: `<span class="num eq">${v}:00</span>`, ok: v === h })), cls: 'shapes', after: B(`It is ${h} o'clock.`, `${h}시예요.`), vocab: `${h} o'clock`
    });
  }
});

// ---------- 4. Days of the week and seasons ----------
const DAYS = [['Sunday', '일요일'], ['Monday', '월요일'], ['Tuesday', '화요일'], ['Wednesday', '수요일'], ['Thursday', '목요일'], ['Friday', '금요일'], ['Saturday', '토요일']];
const SEASONS = [['winter', '겨울', '⛄', B('It is cold and snowy.', '춥고 눈이 와요.')], ['spring', '봄', '🌷', B('Flowers bloom.', '꽃이 피어요.')], ['summer', '여름', '🏖️', B('It is hot and sunny.', '덥고 햇살이 강해요.')], ['fall', '가을', '🍂', B('Leaves fall from trees.', '나뭇잎이 떨어져요.')]];
registerGame({
  id: 'days', subject: 'life', icon: '📅', title: B('Days & Seasons', '요일과 계절'), sub: B('What comes next?', '다음은 무엇일까?'),
  area: AREA_LIFE('Calendar'),
  play() {
    if (rnd(2) === 0 && lvl('days') === 2 || rnd(3) === 0) {                         // seasons
      const t = pick(SEASONS), ds = others(SEASONS, t, 2), o = (s) => ({ html: `<span class="emo">${s[2]}</span>`, label: B(s[0], s[1]), ok: s === t });
      quiz(this, { ask: B(`Which season is this? ${L(t[3])}`, `어느 계절일까요? ${L(t[3])}`), opts: [o(t), ...ds.map(o)], cls: 'shapes', after: B(`It is ${t[0]}!`, `${t[1]}이에요!`), vocab: t[0] });
      return;
    }
    const i = rnd(7), kind = pick(lvl('days') === 1 ? ['after', 'after', 'weekend'] : ['after', 'before', 'weekend']);
    if (kind === 'weekend') {
      const good = pick([0, 6]), bad = others([1, 2, 3, 4, 5], -1, 2), o = (d, ok) => ({ html: `<span class="word">${DAYS[d][0]}</span>`, label: DAYS[d][1], ok });
      quiz(this, { ask: B('Which day is part of the weekend?', '주말인 요일은 무엇일까요?'), opts: [o(good, true), ...bad.map(d => o(d, false))], cls: 'words', after: B('Saturday and Sunday are the weekend.', '토요일과 일요일이 주말이에요.') });
      return;
    }
    const ans = kind === 'after' ? (i + 1) % 7 : (i + 6) % 7, ds = others([0, 1, 2, 3, 4, 5, 6].filter(d => d !== ans && d !== i), -1, 2);
    quiz(this, {
      ask: kind === 'after' ? B(`What day comes after ${DAYS[i][0]}?`, `${DAYS[i][1]} 다음 요일은?`) : B(`What day comes before ${DAYS[i][0]}?`, `${DAYS[i][1]} 전 요일은?`),
      opts: [ans, ...ds].map(d => ({ html: `<span class="word">${DAYS[d][0]}</span>`, label: DAYS[d][1], ok: d === ans })), cls: 'words', after: B(`${DAYS[ans][0]}!`, `${DAYS[ans][1]}!`), vocab: DAYS[ans][0]
    });
  }
});

// ---------- 5. Coins (personal finance) ----------
const COINS = { penny: { v: 1, r: 22, f: '#c47a43', s: '#8a4f23', t: 'ONE CENT', n: B('penny', '페니') }, nickel: { v: 5, r: 26, f: '#d6dbe0', s: '#8e99a4', t: 'FIVE CENTS', n: B('nickel', '니켈') },
  dime: { v: 10, r: 19, f: '#dfe4e8', s: '#8e99a4', t: 'ONE DIME', n: B('dime', '다임') }, quarter: { v: 25, r: 30, f: '#cfd5da', s: '#7d8893', t: 'QUARTER', n: B('quarter', '쿼터') } };
const coinSvg = (k) => { const c = COINS[k]; return `<svg viewBox="0 0 64 64" class="coinsvg"><circle cx="32" cy="32" r="${c.r}" fill="${c.f}" stroke="${c.s}" stroke-width="3"/><circle cx="32" cy="32" r="${c.r - 5}" fill="none" stroke="${c.s}" stroke-width="1" stroke-dasharray="2 2"/><text x="32" y="${k === 'dime' ? 34 : 35}" font-size="${k === 'quarter' ? 6.4 : 5.6}" font-weight="800" text-anchor="middle" fill="${c.s}">${c.t.split(' ')[0]}</text>${c.t.split(' ')[1] ? `<text x="32" y="${k === 'dime' ? 40 : 41}" font-size="5.6" font-weight="800" text-anchor="middle" fill="${c.s}">${c.t.split(' ')[1]}</text>` : ''}</svg>`; };
registerGame({
  id: 'coins', subject: 'ss', icon: '🪙', title: B('Coins', '동전'), sub: B('Penny, nickel, dime, quarter', '페니, 니켈, 다임, 쿼터'),
  area: AREA_SS('Personal finance'),
  play() {
    const lv = lvl('coins'), keys = Object.keys(COINS), mode = lv === 1 ? pick(['value', 'coin', 'pennies']) : pick(['value', 'coin', 'pennies', 'mixed']);
    if (mode === 'value') {
      const k = pick(keys), vals = [1, 5, 10, 25], set = new Set([COINS[k].v]); while (set.size < 3) set.add(pick(vals));
      quiz(this, { ask: B(`How many cents is a ${COINS[k].n.en.toUpperCase()} worth?`, `${COINS[k].n.ko}은(는) 몇 센트일까요?`), askSay: B(`How many cents is a ${COINS[k].n.en} worth?`, `${COINS[k].n.ko}은(는) 몇 센트일까요?`), show: coinSvg(k),
        opts: [...set].map(v => ({ html: `<span class="num">${v}¢</span>`, ok: v === COINS[k].v })), after: B(`A ${COINS[k].n.en} is worth ${COINS[k].v} cents.`, `${COINS[k].n.ko}은(는) ${COINS[k].v}센트예요.`), vocab: `A ${COINS[k].n.en} is worth ${COINS[k].v} cents.` });
    } else if (mode === 'coin') {
      const t = pick(keys), ds = others(keys, t, 2), o = (k) => ({ html: coinSvg(k), label: lv === 1 ? COINS[k].n : null, ok: k === t });
      quiz(this, { ask: B(`Which coin is worth ${COINS[t].v} cents?`, `${COINS[t].v}센트인 동전은 어느 것일까요?`), opts: [o(t), ...ds.map(o)], cls: 'shapes', after: B(`The ${COINS[t].n.en} is worth ${COINS[t].v} cents.`, `${COINS[t].n.ko}이(가) ${COINS[t].v}센트예요.`), vocab: COINS[t].n.en });
    } else {
      const n = 1 + rnd(mode === 'pennies' ? 9 : 4), nk = mode === 'mixed' ? 1 + rnd(2) : 0, total = n + nk * 5;
      const show = `<div class="coinrow">${Array.from({ length: nk }, () => coinSvg('nickel')).join('')}${Array.from({ length: n }, () => coinSvg('penny')).join('')}</div>`;
      quiz(this, { ask: B('How many cents in all?', '모두 몇 센트일까요?'), show, opts: numOpts(total, 1, 25), after: B(`${total} cents!`, `${total}센트!`) });
    }
  }
});

// ---------- 6. Opposites ----------
const OPP = [[['hot', '뜨거워요', '🔥'], ['cold', '차가워요', '🧊']], [['up', '위', '⬆️'], ['down', '아래', '⬇️']], [['day', '낮', '☀️'], ['night', '밤', '🌙']], [['happy', '기뻐요', '😀'], ['sad', '슬퍼요', '😢']],
  [['big', '커요', '🐘'], ['small', '작아요', '🐭']], [['fast', '빨라요', '🐇'], ['slow', '느려요', '🐢']], [['wet', '젖었어요', '💧'], ['dry', '말랐어요', '🏜️']], [['old', '나이 들었어요', '👴'], ['young', '어려요', '👶']],
  [['tall', '키가 커요', '🦒'], ['short', '키가 작아요', '🐁']], [['open', '열려 있어요', '📖'], ['closed', '닫혀 있어요', '📕']]];
registerGame({
  id: 'opposites', subject: 'read', icon: '↔️', title: B('Opposites', '반대말'), sub: B('Hot and cold, up and down', '뜨겁다와 차갑다'),
  area: AREA_READ('Vocabulary'),
  play() {
    const pr = pick(OPP), flip = rnd(2) === 0, a = pr[flip ? 1 : 0], b = pr[flip ? 0 : 1], pool = OPP.filter(p => p !== pr).flatMap(p => p), ds = shuffle(pool).slice(0, 2);
    const o = (w, ok) => ({ html: `<span class="emo">${w[2]}</span>`, label: B(w[0], w[1]), ok });
    quiz(this, {
      ask: B(`What is the opposite of ${a[0].toUpperCase()}?`, `${a[0]}의 반대말은 무엇일까요?`), askSay: B(`What is the opposite of ${a[0]}?`, `${a[0]}의 반대말은 무엇일까요?`),
      show: `<div class="bigword"><span class="emo">${a[2]}</span> ${a[0]}</div>`, opts: [o(b, true), ...ds.map(w => o(w, false))], cls: 'shapes', after: B(`${a[0]} and ${b[0]} are opposites!`, `${a[0]}와 ${b[0]}는 반대말이에요!`), vocab: `${a[0]} and ${b[0]} are opposites!`
    });
  }
});

// ---------- 7. Ending sounds ----------
registerGame({
  id: 'endsound', subject: 'read', icon: '🔚', title: B('Last Sound', '끝소리 찾기'), sub: B('cat ends with t', 'cat은 t로 끝나요'),
  area: AREA_READ('Phonemic awareness'),
  play() {
    const w = pick(CVC), last = w[0][w[0].length - 1], ds = others(ALPHA.filter(c => c !== last), '', 2);
    quiz(this, {
      ask: B(`Which letter does "${w[0]}" end with?`, `"${w[0]}"는 어떤 글자로 끝날까요?`), askSay: B(`Which letter does the word end with?`, `이 단어는 어떤 글자로 끝날까요?`), askExtra: { t: w[0], lang: 'en-US' },
      show: `<div class="bigword"><span class="emo">${w[1]}</span> ${w[0]}</div>`, opts: [last, ...ds].map(c => ({ html: `<span class="num">${c}</span>`, ok: c === last })), cls: 'shapes',
      after: B(`${w[0]} ends with ${last}.`, `${w[0]}는 ${last}로 끝나요.`), vocab: `${w[0]} ends with ${last}.`
    });
  }
});

// ---------- 8. Story order ----------
const STORIES = [
  { s: ['🌰', '🌱', '🌻'], a: B('A seed grows into a sprout, then a flower.', '씨앗이 싹이 되고, 그다음 꽃이 돼요.') }, { s: ['🥚', '🐣', '🐔'], a: B('An egg hatches into a chick, and the chick grows into a hen.', '알에서 병아리가 나오고, 병아리는 닭으로 자라요.') },
  { s: ['🌅', '☀️', '🌙'], a: B('Morning comes first, then noon, then night.', '아침, 낮, 밤 순서예요.') }, { s: ['🍞', '🥪', '😋'], a: B('Get bread, make a sandwich, then eat it.', '빵을 꺼내고, 샌드위치를 만들고, 먹어요.') },
  { s: ['👶', '🧒', '🧑'], a: B('A baby grows into a child, then a grown-up.', '아기가 어린이가 되고, 어른이 돼요.') }, { s: ['🪥', '🦷', '😁'], a: B('Brush your teeth, get them clean, and smile!', '이를 닦으면 깨끗해지고 활짝 웃어요!') },
  { s: ['🌰', '🌱', '🌳', '🍎'], a: B('A seed grows into a tree that gives apples.', '씨앗이 자라 나무가 되고 사과가 열려요.') }, { s: ['🥚', '🍳', '🍽️', '😋'], a: B('Crack the egg, cook it, serve it, and eat!', '알을 깨서 익히고, 담아서, 먹어요!') }
];
registerGame({
  id: 'story', subject: 'brain', icon: '🔢', title: B('What Happens First?', '무엇이 먼저일까?'), sub: B('Put pictures in order', '그림을 순서대로'),
  area: AREA_BRAIN('Sequencing'),
  play() {
    const pool = lvl('story') === 1 ? STORIES.filter(x => x.s.length === 3) : STORIES, st = pick(pool);
    tileRound(this, { ask: B('Put the pictures in order: first, next, last!', '그림을 순서대로 눌러요: 먼저, 그다음, 마지막!'), target: st.s, extra: [], after: st.a, vocab: L(B(st.a.en, st.a.en)) });
  }
});

// ---------- 9. Cause and effect ----------
const CAUSE = [
  [['🌧️', B('It rains.', '비가 와요.')], ['💦', B('puddles', '물웅덩이')]], [['🧊', B('An ice cube sits in the hot sun.', '얼음이 뜨거운 햇볕에 있어요.')], ['💧', B('it melts', '녹아요')]],
  [['🌱', B('A plant gets water and sun.', '식물이 물과 햇빛을 받아요.')], ['🌻', B('it grows', '자라요')]], [['⚽', B('You kick a ball.', '공을 차요.')], ['💨', B('it rolls away', '굴러가요')]],
  [['😴', B('You are very sleepy.', '아주 졸려요.')], ['🛏️', B('go to bed', '자러 가요')]], [['🦷', B('You brush your teeth.', '이를 닦아요.')], ['😁', B('clean teeth', '깨끗한 이')]],
  [['🥶', B('It is very cold outside.', '밖이 아주 추워요.')], ['🧥', B('put on a coat', '외투를 입어요')]], [['🔔', B('You ring a bell.', '종을 울려요.')], ['🎵', B('it makes a sound', '소리가 나요')]]
];
registerGame({
  id: 'cause', subject: 'brain', icon: '➡️', title: B('Cause and Effect', '왜 그럴까?'), sub: B('What happens next?', '그러면 어떻게 될까?'),
  area: AREA_BRAIN('Cause & effect'),
  play() {
    const t = pick(CAUSE), ds = others(CAUSE, t, 2), o = (c, ok) => ({ html: `<span class="emo">${c[1][0]}</span>`, label: c[1][1], ok });
    quiz(this, { ask: B('What happens next?', '그다음에는 어떻게 될까요?'), show: `<div class="bigword"><span class="emo">${t[0][0]}</span> ${L(t[0][1])}</div>`, opts: [o(t, true), ...ds.map(c => o(c, false))], cls: 'shapes', after: B(`${t[0][1].en} So ${t[1][1].en}!`, `${t[0][1].ko} 그래서 ${t[1][1].ko}!`) });
  }
});

// ---------- 10. Color mixing ----------
const CDOT = (c) => `<span class="cdot" style="background:${c}"></span>`;
const MIX = [['#e63946', '#ffd166', '#ff8c42', B('red', '빨강'), B('yellow', '노랑'), B('orange', '주황')], ['#118ab2', '#ffd166', '#2dc653', B('blue', '파랑'), B('yellow', '노랑'), B('green', '초록')],
  ['#e63946', '#118ab2', '#8338ec', B('red', '빨강'), B('blue', '파랑'), B('purple', '보라')], ['#e63946', '#ffffff', '#ffb3c1', B('red', '빨강'), B('white', '하양'), B('pink', '분홍')], ['#118ab2', '#ffffff', '#a8dadc', B('blue', '파랑'), B('white', '하양'), B('light blue', '하늘색')]];
registerGame({
  id: 'colors', subject: 'sci', icon: '🎨', title: B('Mix the Colors', '색 섞기'), sub: B('Red + yellow = ?', '빨강 + 노랑 = ?'),
  area: AREA_SCI('Colors & art'),
  play() {
    const t = pick(MIX), ds = others(MIX, t, 2), o = (m, ok) => ({ html: CDOT(m[2]), label: m[5], ok });
    quiz(this, { ask: B(`What color do you get when you mix ${t[3].en} and ${t[4].en}?`, `${t[3].ko}과 ${t[4].ko}을 섞으면 무슨 색이 될까요?`), show: `<div class="mixrow">${CDOT(t[0])}<span class="op">+</span>${CDOT(t[1])}<span class="op">=</span><span class="qbox">?</span></div>`,
      opts: [o(t, true), ...ds.map(m => o(m, false))], cls: 'shapes', after: B(`${t[3].en} and ${t[4].en} make ${t[5].en}!`, `${t[3].ko}과 ${t[4].ko}을 섞으면 ${t[5].ko}!`), vocab: t[5].en, onCorrect() { $('.mixrow .qbox').outerHTML = CDOT(t[2]); } });
  }
});

// ---------- 11. Feelings ----------
const FEEL = { happy: ['😀', B('happy', '기뻐요')], sad: ['😢', B('sad', '슬퍼요')], scared: ['😨', B('scared', '무서워요')], excited: ['🤩', B('excited', '신나요')], angry: ['😠', B('angry', '화나요')], tired: ['😴', B('tired', '피곤해요')] };
const FEEL_Q = [['🎂', B('It is your birthday party!', '생일 파티예요!'), 'happy'], ['🍦', B('Your ice cream fell on the ground.', '아이스크림을 땅에 떨어뜨렸어요.'), 'sad'], ['🌑', B('It is very dark and you hear a loud noise.', '아주 깜깜한데 큰 소리가 나요.'), 'scared'],
  ['🎁', B('You get a surprise present!', '깜짝 선물을 받았어요!'), 'excited'], ['🧸', B('A friend took your toy without asking.', '친구가 허락 없이 장난감을 가져갔어요.'), 'angry'], ['🛏️', B('You played all day. Now it is bedtime.', '하루 종일 놀았어요. 이제 잘 시간이에요.'), 'tired']];
registerGame({
  id: 'feelings', subject: 'life', icon: '😊', title: B('How Do They Feel?', '어떤 기분일까?'), sub: B('Happy, sad, scared...', '기쁨, 슬픔, 무서움...'),
  area: AREA_LIFE('Feelings'),
  play() {
    const t = pick(FEEL_Q), keys = Object.keys(FEEL), ds = others(keys, t[2], 2), o = (k) => ({ html: `<span class="emo">${FEEL[k][0]}</span>`, label: FEEL[k][1], ok: k === t[2] });
    quiz(this, { ask: B('How would you feel?', '어떤 기분이 들까요?'), show: `<div class="bigword"><span class="emo">${t[0]}</span> ${L(t[1])}</div>`, opts: [o(t[2]), ...ds.map(o)], cls: 'shapes', after: B(`You would feel ${FEEL[t[2]][1].en}.`, `${FEEL[t[2]][1].ko}.`), vocab: FEEL[t[2]][1].en });
  }
});

// ---------- 12. Code the robot (directions) ----------
registerGame({
  id: 'robot', subject: 'brain', icon: '🤖', title: B('Code the Robot', '로봇 코딩'), sub: B('Give the robot directions', '로봇에게 길을 알려 줘요'),
  area: AREA_BRAIN('Coding & directions'),
  play() {
    const lv = lvl('robot'), N = lv === 1 ? 3 : 4, K = lv === 1 ? 2 + rnd(2) : 3 + rnd(3), D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
    let tx = 0, ty = 0, guard = 0;
    while ((tx === 0 && ty === 0) && guard++ < 50) { tx = 0; ty = 0; for (let i = 0; i < K; i++) { const d = D[pick(['d', 'r', 'r', 'd', 'u', 'l'])]; const nx = tx + d[0], ny = ty + d[1]; if (nx >= 0 && ny >= 0 && nx < N && ny < N) { tx = nx; ty = ny; } } }
    const ask = B('Tell the robot how to get to the star!', '로봇이 별에 가도록 길을 알려 줘요!'), cells = [];
    view().innerHTML = `<div class="prompt">${L(ask)}<button class="say" id="sp">🔊</button></div>
      <div class="rgrid" style="--n:${N}">${Array.from({ length: N * N }, (_, i) => `<div class="rc" data-x="${i % N}" data-y="${Math.floor(i / N)}"></div>`).join('')}</div>
      <div class="rprog" id="rprog"></div>
      <div class="rkeys">${[['u', '⬆️'], ['l', '⬅️'], ['d', '⬇️'], ['r', '➡️']].map(k => `<button class="pill" data-k="${k[0]}">${k[1]}</button>`).join('')}</div>
      <div><button class="pill" id="rrun">▶ ${T().run}</button> <button class="pill" id="rclr">🗑 ${T().clear}</button></div><pk-cheer class="cheer" id="cheer"></pk-cheer>`;
    $('#sp').onclick = () => say(L(ask)); say(L(ask));
    const cell = (x, y) => document.querySelector(`.rc[data-x="${x}"][data-y="${y}"]`);
    let prog = [], x = 0, y = 0, busy = false, solved = false, missed = false; const arrows = { u: '⬆️', d: '⬇️', l: '⬅️', r: '➡️' };
    const paint = () => { $$('.rc').forEach(c => { c.textContent = ''; }); cell(tx, ty).textContent = '⭐'; cell(x, y).textContent = '🤖'; };
    const showProg = () => { $('#rprog').innerHTML = prog.map(k => `<span>${arrows[k]}</span>`).join('') || `<em>${T().addArrows}</em>`; };
    paint(); showProg();
    $$('.rkeys .pill').forEach(b => b.onclick = () => { if (busy || solved || prog.length >= 10) return; prog.push(b.dataset.k); showProg(); say('', 'en-US'); });
    $('#rclr').onclick = () => { if (busy || solved) return; prog = []; x = 0; y = 0; paint(); showProg(); $('#cheer').textContent = ''; };
    $('#rrun').onclick = async () => {
      if (busy || solved || !prog.length) return; busy = true; x = 0; y = 0; paint();
      const alive = () => !!document.getElementById('rrun');
      for (const k of prog) { await new Promise(r => setTimeout(r, 380)); if (!alive()) return; const nx = x + D[k][0], ny = y + D[k][1]; if (nx >= 0 && ny >= 0 && nx < N && ny < N) { x = nx; y = ny; paint(); } }
      busy = false; if (!alive()) return;
      if (x === tx && y === ty) { solved = true; record('robot', !missed); if (!missed) addPeach(); $('#cheer').textContent = pick(T().right); nextButton(() => this.play()); }
      else { missed = true; $('#cheer').textContent = T().again; setTimeout(() => { if (alive()) { x = 0; y = 0; paint(); } }, 700); }
    };
    window.__robot = { tx, ty, N, D, press: (k) => document.querySelector(`.rkeys .pill[data-k="${k}"]`).click(), run: () => $('#rrun').click() };
  }
});
