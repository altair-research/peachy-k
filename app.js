'use strict';
// App shell: home menu grouped by school subject, grown-ups panel, language switch.
const SUBJECT_ORDER = ['math', 'read', 'ss', 'sci'];
const SUBJECT_ICON = { math: '🔢', read: '📖', ss: '🍑', sci: '🔬' };
GAMES.forEach(g => { g.play = g.play.bind(g); });

function home() {
  $('#langBtn').textContent = T().switchTo;
  document.documentElement.lang = S.lang;
  view().innerHTML = `
    <h1>🍑 ${T().app}</h1>
    <div class="tag">${T().tagline}</div>
    ${picksHtml()}
    ${SUBJECT_ORDER.map(sub => `
      <section class="subj ${sub}"><h2>${SUBJECT_ICON[sub]} ${T().subjects[sub]}</h2>
        <div class="menu">${GAMES.filter(g => g.subject === sub).map(g => `<button class="big ${sub}" data-id="${g.id}"><span class="gi">${g.icon}</span>${L(g.title)}<small>${L(g.sub)}</small></button>`).join('')}</div>
      </section>`).join('')}
    <button class="link" id="find">${T().findStart}</button>
    <button class="link" id="parent">${T().grownups}</button>
    <p class="note">${T().note}</p>`;
  $$('.big').forEach(b => b.onclick = () => GAMES.find(g => g.id === b.dataset.id).play());
  $('#parent').onclick = grownups; $('#find').onclick = intro;
  $$('.pick').forEach(b => b.onclick = () => gameById(b.dataset.id).play());
}

function picksHtml() {
  const picks = currentPicks(3); if (!picks.length) return '';
  return `<section class="subj picks"><h2>⭐ ${T().picks}</h2><div class="menu">${picks.map(p => { const g = gameById(p.id); return `<button class="big ${g.subject} pick" data-id="${g.id}"><span class="gi">${g.icon}</span>${L(g.title)}<small>${whyText(p)}</small></button>`; }).join('')}</div></section>`;
}

function grownups() {
  const rows = GAMES.map(g => { const s = stat(g.id); return `<tr><td>${g.icon} ${L(g.title)}</td><td>${L(g.area)}</td><td>${s.right}</td><td>${s.wrong}</td><td>${s.level}</td></tr>`; }).join('');
  const weak = GAMES.map(g => ({ g, s: stat(g.id) })).filter(x => x.s.right + x.s.wrong >= 5).sort((a, b) => a.s.right / (a.s.right + a.s.wrong) - b.s.right / (b.s.right + b.s.wrong)).slice(0, 3);
  view().innerHTML = `<h1>${T().grownups}</h1>
    <p class="focus"><b>${T().focus}</b> ${weak.length ? weak.map(x => `${x.g.icon} ${L(x.g.title)}`).join(' · ') : T().focusNone}</p>
    <div class="tablewrap"><table><tr><th>${T().colGame}</th><th>${T().colArea}</th><th>${T().colRight}</th><th>${T().colMiss}</th><th>${T().colLevel}</th></tr>${rows}</table></div>
    <h2>${T().addrTitle}</h2>
    <div class="form"><input id="street" placeholder="${T().street}" value="${S.addr.street.replace(/"/g, '&quot;')}"><input id="city" placeholder="${T().city}" value="${S.addr.city.replace(/"/g, '&quot;')}">
    <button class="next" id="saveAddr">${T().save}</button> <span id="savedMsg"></span></div>
    <button class="link" id="reset">${T().reset}</button>
    <div><button class="next" id="b">${T().back}</button></div>`;
  $('#saveAddr').onclick = () => { S.addr = { street: $('#street').value.trim(), city: $('#city').value.trim() }; save(); $('#savedMsg').textContent = T().saved; };
  $('#reset').onclick = () => { if (confirm(T().resetAsk)) { S.stats = {}; S.peaches = 0; S.profile = null; save(); renderPeaches(); grownups(); } };
  $('#b').onclick = home;
}

$('#homeBtn').onclick = () => { quitDiag(); home(); };
$('#langBtn').onclick = () => { S.lang = S.lang === 'en' ? 'ko' : 'en'; save(); quitDiag(); home(); };
renderPeaches(); S.introSeen ? home() : intro();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
