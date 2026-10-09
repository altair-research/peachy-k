'use strict';
// Reading extension: read & match, sight words, syllables, letter memory.
// Uses CVC / BIGGER word lists from games-write.js.

// ---------- Read and match (decode a word, pick the picture) ----------
registerGame({
  id: 'readmatch', subject: 'read', icon: '👀', title: B('Read & Match', '읽고 짝 맞추기'), sub: B('Read the word, find the picture', '단어를 읽고 그림 찾기'),
  area: AREA_READ('Decoding'),
  play() {
    const pool = lvl('readmatch') === 1 ? CVC : [...CVC, ...BIGGER], t = pick(pool), ds = others(pool, t, 2);
    const o = (w) => ({ html: `<span class="emo">${w[1]}</span>`, ok: w === t });
    quiz(this, {
      ask: B('Read the word. Which picture matches?', '단어를 읽어 보세요. 어느 그림일까요?'),
      show: `<div class="bigword">${t[0]} <button class="say" id="hear" aria-label="${T().listen}">🔊</button></div>`,
      opts: [o(t), ...ds.map(o)], cls: 'shapes', after: B(`${t[0]}!`, `${t[0]} — ${t[2].ko}!`), vocab: t[0],
      onRender() { $('#hear').onclick = () => say(t[0], 'en-US'); }
    });
  }
});

// ---------- Sight words ----------
const SIGHT1 = ['I', 'a', 'the', 'and', 'to', 'is', 'my', 'we', 'see', 'like', 'can', 'go'];
const SIGHT2 = [...SIGHT1, 'up', 'look', 'you', 'me', 'no', 'it', 'in', 'he', 'she', 'are', 'do', 'at'];
registerGame({
  id: 'sight', subject: 'read', icon: '👁️', title: B('Sight Words', '자주 보는 단어'), sub: B('the, and, see, like...', 'the, and, see, like...'),
  area: AREA_READ('High-frequency words'),
  play() {
    const pool = lvl('sight') === 1 ? SIGHT1 : SIGHT2, t = pick(pool), ds = others(pool, t, 2);
    quiz(this, {
      ask: B(`Tap the word "${t}".`, `"${t}" 단어를 눌러요.`), askSay: B('Tap the word', '단어를 눌러요'), askExtra: { t, lang: 'en-US' },
      show: `<button class="say big-say" id="hear">🔊</button>`,
      opts: [t, ...ds].map(w => ({ html: `<span class="num">${w}</span>`, ok: w === t })), cls: 'shapes',
      after: B(`${t}!`, `${t}!`), onRender() { $('#hear').onclick = () => say(t, 'en-US'); }
    });
  }
});

// ---------- Count the syllables ----------
const SYL = [['dog', '🐶', 1], ['sun', '☀️', 1], ['fish', '🐟', 1], ['apple', '🍎', 2], ['monkey', '🐵', 2], ['tiger', '🐯', 2], ['rabbit', '🐰', 2],
  ['banana', '🍌', 3], ['butterfly', '🦋', 3], ['elephant', '🐘', 3], ['umbrella', '☂️', 3], ['dinosaur', '🦖', 3]];
registerGame({
  id: 'syllable', subject: 'read', icon: '👏', title: B('Clap the Parts', '박수로 음절 세기'), sub: B('How many parts?', '몇 개로 나뉠까?'),
  area: AREA_READ('Syllables'),
  play() {
    const pool = lvl('syllable') === 1 ? SYL.filter(x => x[2] <= 2) : SYL, t = pick(pool);
    quiz(this, {
      ask: B('Say the word and clap. How many parts?', '단어를 말하며 박수를 쳐요. 몇 부분일까요?'),
      show: `<div class="bigword"><span class="emo">${t[1]}</span> ${t[0]} <button class="say" id="hear">🔊</button></div><button class="pill" id="clap">👏 <span id="cl">0</span></button>`,
      opts: [1, 2, 3].map(n => ({ html: `<span class="num">${n}</span>`, label: '👏'.repeat(n), ok: n === t[2] })), cls: 'shapes',
      after: B(`${t[0]} has ${t[2]} ${t[2] === 1 ? 'part' : 'parts'}!`, `${t[0]}는 ${t[2]}부분이에요!`), vocab: t[0],
      onRender() { let c = 0; $('#hear').onclick = () => say(t[0], 'en-US'); $('#clap').onclick = () => { c++; $('#cl').textContent = c; }; }
    });
  }
});

// ---------- Memory match: big and little letters (flip cards) ----------
registerGame({
  id: 'memory', subject: 'read', icon: '🃏', title: B('Letter Memory', '글자 기억 게임'), sub: B('Flip cards, match A with a', '카드를 뒤집어 A와 a 찾기'),
  area: AREA_READ('Alphabet'),
  play() {
    const pairs = lvl('memory') === 1 ? 4 : 6, ls = shuffle('ABCDEFGHIJKLMNOP'.split('')).slice(0, pairs);
    const cards = shuffle(ls.flatMap(c => [{ k: c, t: c }, { k: c, t: c.toLowerCase() }]));
    view().innerHTML = `<div class="prompt">${S.lang === 'ko' ? '짝이 되는 큰 글자와 작은 글자를 찾아요!' : 'Find the big and little letter pairs!'}</div>
      <div class="mem">${cards.map((c, i) => `<button class="card" data-i="${i}"><span class="back">🍑</span><span class="face">${c.t}</span></button>`).join('')}</div><div class="cheer" id="cheer"></div>`;
    let open = [], lock = false, misses = 0, matched = 0;
    const finish = () => { const ok = misses <= pairs; record('memory', ok); if (ok) addPeach(); $('#cheer').textContent = pick(T().right); nextButton(() => this.play()); };
    $$('.card').forEach(b => b.onclick = () => {
      if (lock || b.classList.contains('flip') || b.classList.contains('gone')) return;
      b.classList.add('flip'); const c = cards[+b.dataset.i]; say(c.t, 'en-US'); open.push(b);
      if (open.length < 2) return;
      lock = true; const [x, y] = open; open = [];
      if (cards[+x.dataset.i].k === cards[+y.dataset.i].k) {
        matched++; setTimeout(() => { x.classList.add('gone'); y.classList.add('gone'); lock = false; if (matched === pairs) finish(); }, 500);
      } else { misses++; setTimeout(() => { x.classList.remove('flip'); y.classList.remove('flip'); lock = false; }, 800); }
    });
  }
});
