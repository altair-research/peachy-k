'use strict';
// Reading games (EL Education K / Georgia ELA foundations: alphabet knowledge, letter sounds, rhyme).
const AREA_READ = (u) => B(`Reading · ${u}`, `읽기 · ${u}`);
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ---------- 1. Big and little letters ----------
registerGame({
  id: 'letters', subject: 'read', icon: '🔤', title: B('Big & Little Letters', '큰 글자 작은 글자'), sub: B('Match A with a', 'A와 a 짝 맞추기'),
  area: AREA_READ('Alphabet'),
  play() {
    const lv = lvl('letters'), pool = lv === 1 ? 'ABCDEFGHIJKLMNOP'.split('') : LETTERS;
    const t = pick(pool), up = rnd(2) === 0;                   // show uppercase -> pick lowercase, or reverse
    const f = (c) => (up ? c.toLowerCase() : c);
    const ds = others(pool, t, 2);
    quiz(this, {
      ask: up ? B('Find the little letter that matches!', '짝이 되는 작은 글자를 찾아요!') : B('Find the BIG letter that matches!', '짝이 되는 큰 글자를 찾아요!'),
      show: `<div class="letter">${up ? t : t.toLowerCase()}</div>`,
      opts: [t, ...ds].map(c => ({ html: `<span class="num">${f(c)}</span>`, ok: c === t })),
      after: B(`${t} and ${t.toLowerCase()}`, `${t}, ${t.toLowerCase()}`), vocab: t,
      onRender() { say(t, 'en-US', true); }
    });
  }
});

// ---------- 2. Beginning sounds ----------
const WORDS = {
  A: ['🍎', 'apple', '사과'], B: ['🏀', 'ball', '공'], C: ['🐱', 'cat', '고양이'], D: ['🐶', 'dog', '강아지'], E: ['🥚', 'egg', '달걀'],
  F: ['🐟', 'fish', '물고기'], G: ['🐐', 'goat', '염소'], H: ['🎩', 'hat', '모자'], I: ['🍦', 'ice cream', '아이스크림'], J: ['🧥', 'jacket', '재킷'],
  K: ['🔑', 'key', '열쇠'], L: ['🦁', 'lion', '사자'], M: ['🌙', 'moon', '달'], N: ['🥜', 'nut', '견과'], O: ['🐙', 'octopus', '문어'],
  P: ['🐷', 'pig', '돼지'], Q: ['👑', 'queen', '여왕'], R: ['🐰', 'rabbit', '토끼'], S: ['☀️', 'sun', '해'], T: ['🐯', 'tiger', '호랑이'],
  U: ['☂️', 'umbrella', '우산'], V: ['🚐', 'van', '밴'], W: ['⌚', 'watch', '손목시계'], Y: ['🧶', 'yarn', '털실'], Z: ['🦓', 'zebra', '얼룩말']
};
registerGame({
  id: 'sounds', subject: 'read', icon: '🔊', title: B('First Sound', '첫 소리 찾기'), sub: B('Which starts with B?', '어느 것이 B로 시작할까?'),
  area: AREA_READ('Letter sounds'),
  play() {
    const keys = Object.keys(WORDS), pool = lvl('sounds') === 1 ? 'ABCDEFGHMPST'.split('') : keys;
    const t = pick(pool), ds = others(keys, t, 2);
    const o = (k) => ({ html: `<span class="emo">${WORDS[k][0]}</span>`, label: B(WORDS[k][1], WORDS[k][2]), ok: k === t });
    quiz(this, {
      ask: B(`Which picture starts with the letter ${t}?`, `${t}로 시작하는 그림을 찾아요!`),
      show: `<div class="letter">${t}${t.toLowerCase()}</div>`,
      opts: [o(t), ...ds.map(o)],
      after: B(`${WORDS[t][1]} starts with ${t}.`, `${WORDS[t][1]}, ${t}로 시작해요.`), vocab: `${WORDS[t][1]} starts with ${t}.`
    });
  }
});

// ---------- 3. Rhymes ----------
const RHYMES = [
  [['🐱', 'cat'], ['🎩', 'hat'], ['🦇', 'bat']], [['🐶', 'dog'], ['🐸', 'frog'], ['🌫️', 'fog']],
  [['🐝', 'bee'], ['🌳', 'tree'], ['🔑', 'key']], [['🌙', 'moon'], ['🥄', 'spoon']],
  [['🎂', 'cake'], ['🐍', 'snake']], [['🐭', 'mouse'], ['🏠', 'house']],
  [['⏰', 'clock'], ['🧦', 'sock']], [['🐟', 'fish'], ['🍽️', 'dish']], [['⭐', 'star'], ['🚗', 'car'], ['🎸', 'guitar']]
];
registerGame({
  id: 'rhyme', subject: 'read', icon: '🎵', title: B('Rhyme Time', '운율 맞추기'), sub: B('cat, hat, bat', 'cat, hat, bat'),
  area: AREA_READ('Rhyming'),
  play() {
    const gi = rnd(RHYMES.length), g = shuffle(RHYMES[gi]), t = g[0], r = g[1];
    const pool = RHYMES.flatMap((x, i) => i === gi ? [] : x);
    const ds = shuffle(pool).slice(0, 2);
    const o = (w, ok) => ({ html: `<span class="emo">${w[0]}</span>`, label: w[1], ok });
    quiz(this, {
      ask: B(`Which word rhymes with ${t[1].toUpperCase()}?`, `${t[1]}와 소리가 비슷하게 끝나는 단어는?`),
      askSay: B(`Which word rhymes with ${t[1]}?`, `${t[1]}와 소리가 비슷하게 끝나는 단어는?`),
      show: `<div class="bigword"><span class="emo">${t[0]}</span> ${t[1]}</div>`,
      opts: [o(r, true), ...ds.map(d => o(d, false))],
      after: B(`${t[1]} and ${r[1]} rhyme!`, `${t[1]}, ${r[1]} 소리가 비슷해요!`), vocab: `${t[1]} and ${r[1]} rhyme!`
    });
  }
});
