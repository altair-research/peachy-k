'use strict';
// Georgia & Our Nation (HMH Into Social Studies K: The World Around Us; Georgia K Social Studies AKS)
// Simplified flag drawings; see docs/curriculum-analysis.md.
const AREA_SS = (u) => B(`Social Studies · ${u}`, `사회 · ${u}`);
const starPoly = (cx, cy, r) => {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); }
  return `<polygon points="${p.join(' ')}" fill="#fff"/>`;
};
function flagUS() {
  const h = 100 / 13; let s = '';
  for (let i = 0; i < 13; i++) s += `<rect x="0" y="${i * h}" width="190" height="${h}" fill="${i % 2 ? '#fff' : '#b22234'}"/>`;
  s += `<rect width="76" height="${7 * h}" fill="#3c3b6e"/>`;
  for (let r = 0; r < 9; r++) { const n = r % 2 ? 5 : 6; for (let c = 0; c < n; c++) s += `<circle cx="${(r % 2 ? 12.6 + c * 12.6 : 6.3 + c * 12.6)}" cy="${4.2 + r * 5.6}" r="1.7" fill="#fff"/>`; }
  return `<svg viewBox="0 0 190 100" class="flag">${s}</svg>`;
}
function flagGA() {
  let s = `<rect width="190" height="100" fill="#fff"/><rect width="190" height="33.4" fill="#b22234"/><rect y="66.6" width="190" height="33.4" fill="#b22234"/>`;
  s += `<rect width="66.6" height="66.6" fill="#1b3a8a"/><circle cx="33.3" cy="33.3" r="12" fill="#e5b92b"/>`;
  for (let i = 0; i < 13; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 13; s += starPoly(33.3 + 25 * Math.cos(a), 33.3 + 25 * Math.sin(a), 4.2); }
  return `<svg viewBox="0 0 190 100" class="flag">${s}</svg>`;
}

// ---------- 1. Flags ----------
registerGame({
  id: 'flags', subject: 'ss', icon: '🇺🇸', title: B('Georgia & U.S. Flags', '조지아 주기와 미국 국기'), sub: B('Which flag is which?', '어느 깃발일까?'),
  area: AREA_SS('Symbols'),
  play() {
    const qs = [
      { ga: true, ask: B('Tap the GEORGIA flag.', '조지아 주기를 눌러요.') },
      { ga: false, ask: B('Tap the U.S.A. flag.', '미국 국기를 눌러요.') },
      { ga: false, ask: B('Which flag has 50 stars?', '별이 50개인 깃발은?') },
      { ga: true, ask: B('Which flag has a blue square with a circle of stars?', '파란 네모 안에 별이 동그랗게 있는 깃발은?') },
      { ga: false, ask: B('Which flag has lots of red and white stripes and a blue corner with many stars?', '빨강 흰색 줄이 많고 파란 모서리에 별이 많은 깃발은?') },
      { ga: true, ask: B('Which flag is the flag of the Peach State?', '복숭아의 주(Peach State) 깃발은?') },
      { ga: false, ask: B('Which flag is the flag of our country?', '우리나라(미국)의 깃발은?') }
    ];
    const q = pick(qs), ga = q.ga;
    quiz(this, {
      ask: q.ask,
      opts: [{ html: flagUS(), ok: !ga }, { html: flagGA(), ok: ga }], cls: 'flags',
      after: ga ? B('The Georgia flag has a blue square with 13 stars.', '조지아 주기는 파란 네모 안에 별 13개가 있어요.') : B('The U.S. flag has 50 stars and 13 stripes.', '미국 국기에는 별 50개와 줄 13개가 있어요.'),
      vocab: ga ? 'Georgia flag' : 'U.S. flag'
    });
  }
});

// ---------- 2. Georgia state symbols ----------
const GA_SYMBOLS = [
  { e: '🍑', n: B('peach', '복숭아'), q: B('fruit', '과일') }, { e: '🧅', n: B('Vidalia onion', '비달리아 양파'), q: B('vegetable', '채소') },
  { e: '🐦', n: B('brown thrasher', '브라운 트래셔(새)'), q: B('bird', '새') }, { e: '🌳', n: B('live oak', '라이브 오크(참나무)'), q: B('tree', '나무') },
  { e: '🐝', n: B('honeybee', '꿀벌'), q: B('insect', '곤충') }, { e: '🐢', n: B('gopher tortoise', '고퍼거북'), q: B('reptile', '파충류') },
  { e: '🌹', n: B('Cherokee rose', '체로키 장미'), q: B('flower', '꽃') }
];
registerGame({
  id: 'gasymbols', subject: 'ss', icon: '🍑', title: B('Peach State Symbols', '조지아 상징'), sub: B('Peach, bee, thrasher...', '복숭아, 꿀벌...'),
  area: AREA_SS('Georgia symbols'),
  play() {
    const t = pick(GA_SYMBOLS), ds = others(GA_SYMBOLS, t, 2);
    const o = (s) => ({ html: `<span class="emo">${s.e}</span>`, label: s.n, ok: s === t });
    quiz(this, {
      ask: B(`Which one is Georgia's state ${t.q.en.toUpperCase()}?`, `조지아의 주 ${t.q.ko}은(는) 어느 것일까요?`),
      askSay: B(`Which one is Georgia's state ${t.q.en}?`, `조지아의 주 ${t.q.ko}은 어느 것일까요?`),
      opts: [o(t), ...ds.map(o)],
      after: B(`The ${t.n.en} is Georgia's state ${t.q.en}!`, `${t.n.ko}은(는) 조지아의 주 ${t.q.ko}이에요!`), vocab: `The ${t.n.en} is Georgia's state ${t.q.en}!`
    });
  }
});

// ---------- 3. My address (street / city / state / country) ----------
const GWINNETT_CITIES = ['Lawrenceville', 'Duluth', 'Suwanee', 'Snellville', 'Lilburn', 'Buford', 'Norcross', 'Dacula', 'Grayson', 'Sugar Hill', 'Peachtree Corners'];
registerGame({
  id: 'address', subject: 'ss', icon: '🏠', title: B('Where I Live', '내가 사는 곳'), sub: B('Street, city, state, country', '주소, 도시, 주, 나라'),
  area: AREA_SS('My address'),
  play() {
    const kinds = ['state', 'country', 'nick', 'capital', 'big'];
    if (S.addr.city) kinds.push('city', 'city'); if (S.addr.street) kinds.push('street', 'street');
    const kind = pick(kinds), txt = (v) => `<span class="word">${v}</span>`;
    let ask, ok, ds, after;
    if (kind === 'state') { ask = B('What STATE do you live in?', '우리는 어느 주에 살까요?'); ok = 'Georgia'; ds = ['Florida', 'Alabama', 'Texas'].slice(0, 2); after = B('I live in the state of Georgia.', '우리는 조지아 주에 살아요.'); }
    else if (kind === 'country') { ask = B('What COUNTRY do you live in?', '우리는 어느 나라에 살까요?'); ok = 'United States'; ds = ['Canada', 'Mexico']; after = B('I live in the United States of America.', '우리는 미국에 살아요.'); }
    else if (kind === 'nick') { ask = B('Georgia is called the ___ State.', '조지아는 ___ 주(State)라고 불러요.'); ok = 'Peach'; ds = ['Apple', 'Orange']; after = B('Georgia is the Peach State!', '조지아는 복숭아의 주예요!'); }
    else if (kind === 'capital') { ask = B('What is the capital city of Georgia?', '조지아 주의 주도(수도)는 어디일까요?'); ok = 'Atlanta'; ds = ['Savannah', 'Macon'].slice(0, 2); after = B('Atlanta is the capital of Georgia.', '애틀랜타가 조지아의 주도예요.'); }
    else if (kind === 'big') { ask = B('Which is BIGGEST: a city, a state, or a country?', '도시, 주, 나라 중 가장 큰 것은?'); ok = 'Country'; ds = ['City', 'State']; after = B('A country is bigger than a state, and a state is bigger than a city.', '나라는 주보다 크고, 주는 도시보다 커요.'); }
    else if (kind === 'city') { ask = B('What CITY do you live in?', '우리는 어느 도시에 살까요?'); ok = S.addr.city; ds = others(GWINNETT_CITIES.filter(c => c.toLowerCase() !== ok.toLowerCase()), '', 2); after = B(`I live in ${ok}.`, `우리는 ${ok}에 살아요.`); }
    else { ask = B('What is your STREET address?', '우리 집 주소(번지/도로)는 무엇일까요?'); ok = S.addr.street; ds = ['100 Peachtree Street', '25 Maple Lane'].filter(x => x !== ok); after = B(`I live at ${ok}.`, `우리 집은 ${ok}예요.`); }
    const hint = (!S.addr.city && !S.addr.street && kind === 'state') ? `<div class="hint">👨‍👩‍👦 ${T().grownups} → ${T().addrTitle}</div>` : '';
    quiz(this, { ask, show: (kind === 'nick' ? '🍑' : '🏠') + hint, opts: [ok, ...ds].map(v => ({ html: txt(v), ok: v === ok })), cls: 'words', after, vocab: ok });
  }
});

// ---------- 4. Cardinal directions ----------
registerGame({
  id: 'compass', subject: 'ss', icon: '🧭', title: B('Map Directions', '지도 방향'), sub: B('North, south, east, west', '북, 남, 동, 서'),
  area: AREA_SS('Maps & directions'),
  play() {
    const dirs = [['N', B('North', '북쪽'), [0, -1]], ['E', B('East', '동쪽'), [1, 0]], ['S', B('South', '남쪽'), [0, 1]], ['W', B('West', '서쪽'), [-1, 0]]];
    const N = 4, items = [['🏠', B('house', '집')], ['🏫', B('school', '학교')], ['🌳', B('tree', '나무')], ['🏪', B('store', '가게')], ['⛲', B('fountain', '분수')], ['🏥', B('hospital', '병원')]];
    const [a, b] = shuffle(items).slice(0, 2); let ax, ay, d, dist;
    for (let k = 0; k < 40; k++) {                                        // random start + direction with room to move
      ax = rnd(N); ay = rnd(N); d = pick(dirs); dist = 1 + rnd(2);
      const bx = ax + d[2][0] * dist, by = ay + d[2][1] * dist; if (bx >= 0 && bx < N && by >= 0 && by < N) break;
    }
    const bx = ax + d[2][0] * dist, by = ay + d[2][1] * dist, rev = rnd(3) === 0;       // sometimes ask the other way around
    const ans = rev ? dirs.find(x => x[2][0] === -d[2][0] && x[2][1] === -d[2][1]) : d;
    const cells = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) cells.push(`<div class="mc">${x === ax && y === ay ? a[0] : x === bx && y === by ? b[0] : ''}</div>`);
    const rose = '<div class="rose"><span class="rn">N</span><span class="rw">W</span><span class="re">E</span><span class="rs">S</span></div>';
    const from = rev ? b : a, to = rev ? a : b;
    quiz(this, {
      ask: B(`Which way is the ${to[1].en} from the ${from[1].en}?`, `${from[1].ko}에서 ${to[1].ko}은(는) 어느 쪽에 있을까요?`),
      show: `<div class="mapwrap"><div class="map n4">${cells.join('')}</div>${rose}</div>`,
      opts: dirs.map(x => ({ html: `<span class="num">${x[0]}</span>`, label: x[1], ok: x === ans })), cls: 'shapes',
      after: B(`It is to the ${ans[1].en}.`, `${ans[1].ko}에 있어요.`), vocab: ans[1].en
    });
  }
});

// ---------- 5. Good citizens ----------
const CITIZEN = [
  [['🤝', B('Sharing with a friend', '친구와 나눠 써요')], ['😠', B('Grabbing a toy', '장난감을 빼앗아요')]],
  [['🗑️', B('Putting trash in the can', '쓰레기를 쓰레기통에 버려요')], ['🍬', B('Dropping trash on the floor', '쓰레기를 바닥에 버려요')]],
  [['🙋', B('Raising a hand to talk', '손을 들고 말해요')], ['📢', B('Shouting in class', '교실에서 소리쳐요')]],
  [['🚶', B('Walking in the hallway', '복도에서 걸어요')], ['🏃', B('Running in the hallway', '복도에서 뛰어요')]],
  [['🙏', B('Saying please and thank you', '"please", "thank you"라고 말해요')], ['🙊', B('Being rude', '무례하게 말해요')]],
  [['🧸', B('Helping clean up', '정리를 도와요')], ['🛋️', B('Leaving a mess', '어질러 놓고 가요')]],
  [['👂', B('Listening to the teacher', '선생님 말씀을 들어요')], ['🗣️', B('Talking while the teacher talks', '선생님이 말할 때 떠들어요')]],
  [['🪑', B('Pushing in my chair', '의자를 넣어요')], ['🪑', B('Leaving my chair out', '의자를 그냥 둬요')]],
  [['🧍', B('Taking turns', '차례를 지켜요')], ['🚷', B('Cutting in line', '새치기해요')]],
  [['🩹', B('Helping a friend who fell', '넘어진 친구를 도와줘요')], ['😆', B('Laughing at a friend who fell', '넘어진 친구를 비웃어요')]]
];
registerGame({
  id: 'citizen', subject: 'ss', icon: '🌟', title: B('Good Citizens', '착한 시민'), sub: B('Kind and fair', '친절하고 공정하게'),
  area: AREA_SS('Citizenship'),
  play() {
    const p = pick(CITIZEN), notQ = rnd(3) === 0;
    quiz(this, {
      ask: notQ ? B('Who is NOT being a good citizen?', '누가 좋은 시민이 아닐까요?') : B('Who is being a good citizen?', '누가 좋은 시민일까요?'),
      opts: [{ html: `<span class="emo">${p[0][0]}</span>`, label: p[0][1], ok: !notQ }, { html: `<span class="emo">${p[1][0]}</span>`, label: p[1][1], ok: notQ }], cls: 'groups',
      after: B('Good citizens are kind and follow the rules!', '좋은 시민은 친절하고 규칙을 지켜요!'), vocab: 'Good citizens follow the rules!'
    });
  }
});

// ---------- 6. Community workers (Labor Day) ----------
const JOBS = [
  { e: '🧑‍🚒', n: B('firefighter', '소방관'), q: B('Who puts out fires?', '불을 끄는 사람은 누구일까요?') },
  { e: '👮', n: B('police officer', '경찰관'), q: B('Who helps keep us safe?', '우리를 안전하게 지켜 주는 사람은?') },
  { e: '🧑‍🏫', n: B('teacher', '선생님'), q: B('Who teaches children at school?', '학교에서 아이들을 가르치는 사람은?') },
  { e: '🧑‍⚕️', n: B('doctor', '의사'), q: B('Who helps sick people feel better?', '아픈 사람을 낫게 도와주는 사람은?') },
  { e: '🧑‍🌾', n: B('farmer', '농부'), q: B('Who grows food on a farm?', '농장에서 먹거리를 키우는 사람은?') },
  { e: '👷', n: B('builder', '건축 노동자'), q: B('Who builds houses and buildings?', '집과 건물을 짓는 사람은?') },
  { e: '🧑‍🍳', n: B('cook', '요리사'), q: B('Who cooks food in a restaurant?', '식당에서 음식을 만드는 사람은?') },
  { e: '🧑‍✈️', n: B('pilot', '조종사'), q: B('Who flies an airplane?', '비행기를 조종하는 사람은?') }
];
registerGame({
  id: 'jobs', subject: 'ss', icon: '👷', title: B('Who Helps Us?', '누가 도와줄까?'), sub: B('Workers & Labor Day', '일하는 사람들과 노동절'),
  area: AREA_SS('Labor Day & jobs'),
  play() {
    const t = pick(JOBS), ds = others(JOBS, t, 2);
    const o = (j) => ({ html: `<span class="emo">${j.e}</span>`, label: j.n, ok: j === t });
    quiz(this, { ask: t.q, opts: [o(t), ...ds.map(o)], after: B(`A ${t.n.en} helps our community!`, `${t.n.ko}은(는) 우리 마을을 도와줘요!`), vocab: t.n.en });
  }
});

// ---------- 7. Holidays ----------
const HOLIDAYS = [
  { e: '👷', n: B('Labor Day', '노동절') }, { e: '🦃', n: B('Thanksgiving', '추수감사절') }, { e: '🎆', n: B('Independence Day', '독립기념일') },
  { e: '🎖️', n: B('Veterans Day', '재향군인의 날') }, { e: '⛵', n: B('Columbus Day', '콜럼버스의 날') }
];
registerGame({
  id: 'holidays', subject: 'ss', icon: '🎆', title: B('American Holidays', '미국 기념일'), sub: B('Match the picture', '그림 짝 맞추기'),
  area: AREA_SS('Holidays'),
  play() {
    const t = pick(HOLIDAYS), ds = others(HOLIDAYS, t, 2);
    const o = (h) => ({ html: `<span class="emo">${h.e}</span>`, ok: h === t });
    quiz(this, { ask: B(`Which picture goes with ${t.n.en.toUpperCase()}?`, `${t.n.ko}과 어울리는 그림은?`), askSay: B(`Which picture goes with ${t.n.en}?`, `${t.n.ko}과 어울리는 그림은?`), opts: [o(t), ...ds.map(o)], cls: 'shapes', after: B(`${t.n.en}!`, `${t.n.ko}!`), vocab: t.n.en });
  }
});
