'use strict';
// Science extension: five senses, what living things need.

const SENSES = { eyes: ['👀', B('eyes', '눈')], ears: ['👂', B('ears', '귀')], nose: ['👃', B('nose', '코')], tongue: ['👅', B('tongue', '혀')], hands: ['✋', B('hands', '손')] };
const SENSE_Q = [['🌸', B('smell a flower', '꽃 냄새를 맡아요'), 'nose'], ['🌈', B('see a rainbow', '무지개를 봐요'), 'eyes'], ['🎵', B('hear music', '음악을 들어요'), 'ears'], ['🍦', B('taste ice cream', '아이스크림 맛을 봐요'), 'tongue'],
  ['🧸', B('feel a soft teddy bear', '부드러운 곰 인형을 만져요'), 'hands'], ['🔔', B('hear a bell', '종소리를 들어요'), 'ears'], ['🍋', B('taste a lemon', '레몬 맛을 봐요'), 'tongue'], ['🍪', B('smell a warm cookie', '따뜻한 쿠키 냄새를 맡아요'), 'nose']];
registerGame({
  id: 'senses', subject: 'sci', icon: '👃', title: B('My Five Senses', '오감 탐험'), sub: B('Eyes, ears, nose, tongue, hands', '눈, 귀, 코, 혀, 손'),
  area: AREA_SCI('Five senses'),
  play() {
    const t = pick(SENSE_Q), keys = Object.keys(SENSES), ds = others(keys, t[2], 2), o = (k) => ({ html: `<span class="emo">${SENSES[k][0]}</span>`, label: SENSES[k][1], ok: k === t[2] });
    quiz(this, {
      ask: B(`What do you use to ${t[1].en}?`, `${t[1].ko} — 무엇을 쓸까요?`), show: `<div class="bigword"><span class="emo">${t[0]}</span></div>`,
      opts: [o(t[2]), ...ds.map(o)], cls: 'shapes', after: B(`You use your ${SENSES[t[2]][1].en}!`, `${SENSES[t[2]][1].ko}을(를) 써요!`), vocab: SENSES[t[2]][1].en
    });
  }
});

const NEEDS = [
  { q: B('What does a PLANT need to grow?', '식물이 자라려면 무엇이 필요할까요?'), good: [['💧', B('water', '물')], ['☀️', B('sunlight', '햇빛')]], bad: [['🍕', B('pizza', '피자')], ['🧸', B('toys', '장난감')], ['📱', B('phone', '휴대폰')]] },
  { q: B('What does a DOG need to live?', '강아지가 살려면 무엇이 필요할까요?'), good: [['🍖', B('food', '먹이')], ['💧', B('water', '물')], ['🏠', B('shelter', '쉴 곳')]], bad: [['🎮', B('video game', '게임')], ['👟', B('shoes', '신발')], ['📺', B('TV', '텔레비전')]] },
  { q: B('What do PEOPLE need to live?', '사람이 살려면 무엇이 필요할까요?'), good: [['🍎', B('food', '음식')], ['💧', B('water', '물')], ['🌬️', B('air', '공기')]], bad: [['🎮', B('video game', '게임')], ['🧸', B('toys', '장난감')], ['🍬', B('candy', '사탕')]] }
];
registerGame({
  id: 'needs', subject: 'sci', icon: '💧', title: B('What Do They Need?', '무엇이 필요할까?'), sub: B('Plants, animals, people', '식물, 동물, 사람'),
  area: AREA_SCI('Needs of living things'),
  play() {
    const n = pick(NEEDS), g = pick(n.good), bs = shuffle(n.bad).slice(0, 2), o = (x, ok) => ({ html: `<span class="emo">${x[0]}</span>`, label: x[1], ok });
    quiz(this, { ask: n.q, opts: [o(g, true), ...bs.map(b => o(b, false))], cls: 'shapes', after: B(`They need ${g[1].en}!`, `${g[1].ko}이(가) 필요해요!`), vocab: g[1].en });
  }
});
