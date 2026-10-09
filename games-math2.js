'use strict';
// Math extension: measurement (length / weight) and time-of-day patterns.

const HEAVY_PAIRS = [
  [['🐘', B('elephant', '코끼리')], ['🐭', B('mouse', '쥐')]], [['🚗', B('car', '자동차')], ['🚲', B('bicycle', '자전거')]],
  [['🐋', B('whale', '고래')], ['🐟', B('fish', '물고기')]], [['🐻', B('bear', '곰')], ['🐦', B('bird', '새')]]
];
registerGame({
  id: 'measure', subject: 'math', icon: '📏', title: B('Longer or Shorter?', '더 길까? 더 짧을까?'), sub: B('Length and weight', '길이와 무게'),
  area: AREA_MATH('Measurement'),
  play() {
    const lv = lvl('measure');
    if (rnd(3) === 0) {                                          // heavier / lighter
      const pr = pick(HEAVY_PAIRS), heavy = rnd(2) === 0;
      quiz(this, {
        ask: heavy ? B('Which one is HEAVIER?', '어느 것이 더 무거울까요?') : B('Which one is LIGHTER?', '어느 것이 더 가벼울까요?'),
        opts: [{ html: `<span class="emo">${pr[0][0]}</span>`, label: pr[0][1], ok: heavy }, { html: `<span class="emo">${pr[1][0]}</span>`, label: pr[1][1], ok: !heavy }], cls: 'groups',
        after: B(`The ${pr[0][1].en} is heavier.`, `${pr[0][1].ko}가 더 무거워요.`), vocab: heavy ? 'heavier' : 'lighter'
      });
      return;
    }
    const n = lv === 1 ? 2 : 3, gap = lv === 1 ? 50 : 28, longer = rnd(2) === 0;
    let ws; do { ws = Array.from({ length: n }, () => 60 + rnd(181)); } while ([...ws].sort((a, b) => a - b).some((v, i, a) => i && v - a[i - 1] < gap));
    const target = longer ? Math.max(...ws) : Math.min(...ws), cols = shuffle(['#ef476f', '#118ab2', '#06d6a0', '#ffb703']);
    quiz(this, {
      ask: longer ? B('Which one is LONGER?', '어느 것이 더 길까요?') : B('Which one is SHORTER?', '어느 것이 더 짧을까요?'),
      opts: ws.map((v, i) => ({ html: `<div class="bar" style="width:${v}px;background:${cols[i]}"></div>`, ok: v === target })), cls: 'bars',
      after: longer ? B('That one is the longest!', '이것이 가장 길어요!') : B('That one is the shortest!', '이것이 가장 짧아요!'), vocab: longer ? 'longer' : 'shorter'
    });
  }
});

const DAYTIME = [['⏰', B('Waking up', '잠에서 깨요'), 'morning'], ['🥞', B('Eating breakfast', '아침밥을 먹어요'), 'morning'], ['🚌', B('Riding the bus to school', '학교 버스를 타요'), 'morning'],
  ['🥪', B('Eating lunch', '점심을 먹어요'), 'afternoon'], ['⚽', B('Playing outside after school', '방과 후에 밖에서 놀아요'), 'afternoon'],
  ['🛁', B('Taking a bath before bed', '자기 전에 목욕해요'), 'night'], ['📖', B('Reading a bedtime story', '잠자리 동화를 읽어요'), 'night'], ['😴', B('Going to sleep', '잠을 자요'), 'night'], ['🌙', B('Seeing the moon and stars', '달과 별을 봐요'), 'night']];
registerGame({
  id: 'daytime', subject: 'math', icon: '🕐', title: B('My Day', '나의 하루'), sub: B('Morning, afternoon, night', '아침, 오후, 밤'),
  area: AREA_MATH('Time patterns'),
  play() {
    const t = pick(DAYTIME), P = { morning: ['🌅', B('Morning', '아침')], afternoon: ['☀️', B('Afternoon', '오후')], night: ['🌙', B('Night', '밤')] };
    quiz(this, {
      ask: B('When do you do this?', '언제 하는 일일까요?'),
      show: `<div class="bigword"><span class="emo">${t[0]}</span> ${L(t[1])}</div>`,
      opts: Object.keys(P).map(k => ({ html: `<span class="emo">${P[k][0]}</span>`, label: P[k][1], ok: k === t[2] })), cls: 'shapes',
      after: B(`That is in the ${P[t[2]][1].en.toLowerCase()}.`, `${P[t[2]][1].ko}에 해요.`), vocab: P[t[2]][1].en
    });
  }
});
