'use strict';
// Science (GCPS K AKS: life, earth, physical science)
const AREA_SCI = (u) => B(`Science · ${u}`, `과학 · ${u}`);

const LIVING = [['🐕', B('dog', '강아지'), true], ['🌱', B('seedling', '새싹'), true], ['🦋', B('butterfly', '나비'), true], ['🐟', B('fish', '물고기'), true], ['🌳', B('tree', '나무'), true],
  ['🚗', B('car', '자동차'), false], ['⚽', B('ball', '공'), false], ['🧸', B('teddy bear', '곰 인형'), false], ['📖', B('book', '책'), false], ['⛰️', B('mountain', '산'), false]];
registerGame({
  id: 'living', subject: 'sci', icon: '🌱', title: B('Living or Not?', '살아 있을까?'), sub: B('Plants, animals, things', '식물, 동물, 물건'),
  area: AREA_SCI('Living things'),
  play() {
    const t = pick(LIVING);
    quiz(this, {
      ask: B('Is it living or not living?', '살아 있는 것일까요, 아닐까요?'),
      show: `<div class="bigword"><span class="emo">${t[0]}</span></div>`,
      opts: [{ html: '<span class="emo">🌿</span>', label: B('Living', '살아 있어요'), ok: t[2] }, { html: '<span class="emo">🧱</span>', label: B('Not living', '살아 있지 않아요'), ok: !t[2] }], cls: 'groups',
      after: B(`A ${t[1].en} is ${t[2] ? 'living' : 'not living'}.`, `${t[1].ko}은(는) ${t[2] ? '살아 있어요' : '살아 있지 않아요'}.`), vocab: `${t[1].en}`
    });
  }
});

const SKY = [['☀️', B('sun', '해'), true], ['🌈', B('rainbow', '무지개'), true], ['🌙', B('moon', '달'), false], ['⭐', B('stars', '별'), false], ['🌌', B('night sky', '밤하늘'), false]];
registerGame({
  id: 'sky', subject: 'sci', icon: '🌙', title: B('Day Sky, Night Sky', '낮하늘 밤하늘'), sub: B('Sun, moon, stars', '해, 달, 별'),
  area: AREA_SCI('Day and night'),
  play() {
    const t = pick(SKY);
    quiz(this, {
      ask: B('Do you see this in the day sky or the night sky?', '낮 하늘에서 볼까요, 밤 하늘에서 볼까요?'),
      show: `<div class="bigword"><span class="emo">${t[0]}</span></div>`,
      opts: [{ html: '<span class="emo">🌤️</span>', label: B('Day', '낮'), ok: t[2] }, { html: '<span class="emo">🌃</span>', label: B('Night', '밤'), ok: !t[2] }], cls: 'groups',
      after: B(`You see the ${t[1].en} in the ${t[2] ? 'day' : 'night'} sky.`, `${t[1].ko}은(는) ${t[2] ? '낮' : '밤'} 하늘에서 봐요.`), vocab: t[1].en
    });
  }
});

const MOTION = [['⚽', B('Kicking a ball', '공을 차요'), 'push'], ['🛒', B('Moving a cart forward', '카트를 밀어요'), 'push'], ['🚪', B('Pushing a door open', '문을 밀어서 열어요'), 'push'],
  ['🧲', B('A magnet pulls a paperclip', '자석이 클립을 끌어당겨요'), 'pull'], ['🐕', B('A dog tugs on a leash', '강아지가 줄을 당겨요'), 'pull'], ['🗄️', B('Opening a drawer', '서랍을 당겨서 열어요'), 'pull']];
registerGame({
  id: 'motion', subject: 'sci', icon: '🧲', title: B('Push or Pull?', '밀기 당기기'), sub: B('How things move', '물체가 움직이는 방법'),
  area: AREA_SCI('Motion'),
  play() {
    const t = pick(MOTION);
    quiz(this, {
      ask: B('Is it a push or a pull?', '미는 걸까요, 당기는 걸까요?'),
      show: `<div class="bigword"><span class="emo">${t[0]}</span> ${L(t[1])}</div>`,
      opts: [{ html: '<span class="emo">👉</span>', label: B('Push', '밀기'), ok: t[2] === 'push' }, { html: '<span class="emo">🤏</span>', label: B('Pull', '당기기'), ok: t[2] === 'pull' }], cls: 'groups',
      after: B(`It is a ${t[2]}!`, t[2] === 'push' ? '미는 거예요!' : '당기는 거예요!'), vocab: t[2]
    });
  }
});
