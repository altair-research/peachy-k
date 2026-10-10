'use strict';
// Rule-based progress-report reader (no LLM, runs entirely in the browser).
// Input: plain text lines of a GCPS-style report (Infinite Campus "Area / Mark / Assignments" layout).
// Output: assignments with grades, mapped to game ids by keyword rules (see docs/curriculum-analysis.md).

const GRADE_POINTS = { U: 3, N: 2, S: 0.3, E: 0 };        // need score: higher = needs more practice (S = satisfactory, small nudge)
const SUBJECT_RULES = [                                       // detected from the course header line
  ['math', /MATHEMATICS/i], ['read', /READING/i], ['write', /WRITING/i], ['sci', /SCIENCE/i],
  ['ss', /SOCIAL STUDIES/i], ['health', /HEALTH/i], ['conduct', /CONDUCT/i]
];
// Fallback games when an assignment name matches no specific rule
const SUBJECT_DEFAULT = {
  math: ['tens', 'count', 'order'], read: ['letters', 'sounds', 'rhyme'], write: ['label', 'trace', 'draw'],
  sci: ['living', 'motion', 'sky', 'senses'], ss: ['flags', 'address', 'jobs'], health: [], conduct: []
};
// [subject, regex on assignment name, games (first = strongest link)]
const SKILL_RULES = [
  ['math', /by 10|tens/i, ['tens', 'order']],
  ['math', /representing 10|10 in sets|ten frame|make 10|compos|decompos/i, ['ten', 'teens']],
  ['math', /one to one|one-to-one|counting sets|scattered|array|circle|line/i, ['count']],
  ['math', /writing numbers/i, ['trace', 'order']],
  ['math', /rote|counting (forward|backward)|number path/i, ['order', 'count']],
  ['math', /length|longer|shorter|measur|heav/i, ['measure']],
  ['math', /\btime\b|calendar|routine/i, ['daytime']],
  ['math', /shape/i, ['shapes2d', 'shapes3d']],
  ['math', /pattern/i, ['pattern']],
  ['math', /compar|more|fewer|less/i, ['compare']],
  ['math', /add|subtract|take away|put together/i, ['addsub']],
  ['math', /graph|data/i, ['graph']],
  ['math', /unit 1 summative/i, ['ten', 'count', 'tens']],
  ['read', /uppercase|lowercase|letter names|alphabet/i, ['letters']],
  ['read', /letter sounds?|phonic|beginning sound/i, ['sounds', 'rhyme']],
  ['read', /rhym/i, ['rhyme']],
  ['write', /drawing|story response|label|student response/i, ['draw', 'label']],
  ['write', /sentence|opinion|informational|narrative/i, ['sentence', 'label']],
  ['read', /sight|high.frequency/i, ['sight']],
  ['read', /syllable/i, ['syllable']],
  ['ss', /labor day|worker|job|community/i, ['jobs', 'holidays']],
  ['ss', /flag|symbol/i, ['flags', 'gasymbols']],
  ['ss', /address|where i live|home/i, ['address']],
  ['ss', /holiday|thanksgiving|veteran|columbus|president|memorial/i, ['holidays']],
  ['ss', /money|coin|cents|income|earn|goods|services|spend|save/i, ['coins']],
  ['ss', /citizen|rules|character/i, ['citizen']],
  ['ss', /map|globe|direction/i, ['compass']],
  ['ss', /unit 1 assessment|our nation/i, ['flags', 'address', 'gasymbols', 'citizen']],
  ['sci', /force|push|pull|motion/i, ['motion']],
  ['sci', /living|plant|animal|needs/i, ['living']],
  ['sci', /sense|smell|taste|hear|touch/i, ['senses']],
  ['sci', /sky|sun|moon|star|day|night/i, ['sky']]
];

// pdf.js text items -> text lines (items on the same baseline are joined left to right)
function itemsToLines(items) {
  const rows = [];
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const y = it.transform[5], x = it.transform[4];
    let row = rows.find(r => Math.abs(r.y - y) <= 3);
    if (!row) { row = { y, parts: [] }; rows.push(row); }
    row.parts.push({ x, s: it.str });
  }
  return rows.sort((a, b) => b.y - a.y).map(r => r.parts.sort((a, b) => a.x - b.x).map(p => p.s).join(' '));
}

function subjectOf(line) { for (const [k, re] of SUBJECT_RULES) if (re.test(line)) return k; return null; }

// -> { items: [{subject, name, kind, date, grade}], courses: [{subject, avg}] }
function parseReportLines(lines) {
  const items = [], courses = []; let subject = null;
  for (let raw of lines) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    if (/^Class Name:/i.test(line)) continue;
    const hdr = line.match(/\bSEC:\s*\d/) && subjectOf(line);          // course header: "(S1) Teacher SUBJECT/GRADE K(n) SEC:..."
    if (hdr) { subject = hdr; const mp = line.match(/Avg\s*([A-Z])\b/); courses.push({ subject, avg: mp ? mp[1] : '' }); continue; }
    if (/Marking Period:/.test(line)) continue;
    const m = line.match(/^(.*?)\s*\(AKS\s+(Progress|Mastery)\*?\)\s*(\d{1,2}\/\d{1,2}\/\d{4})?\s*([A-Z])\b/);
    if (m && subject && m[1]) items.push({ subject, name: m[1].trim(), kind: m[2], date: m[3] || '', grade: m[4] });
  }
  return { items, courses };
}

function gamesFor(item) {
  for (const [sub, re, games] of SKILL_RULES) if (sub === item.subject && re.test(item.name)) return { games, specific: true };
  return { games: SUBJECT_DEFAULT[item.subject] || [], specific: false };
}

// -> { picks:[{id, score, reasons:[string]}], unmapped:[string] }
function scoreReport(parsed) {
  const score = {}, reasons = {}, unmapped = [];
  for (const it of parsed.items) {
    const p = GRADE_POINTS[it.grade]; if (!p) continue;      // E or unknown grades add nothing
    const w = p * (it.kind === 'Mastery' ? 1.5 : 1);
    const { games, specific } = gamesFor(it);
    if (!games.length) { unmapped.push(`${it.name} (${it.grade})`); continue; }
    games.forEach((id, i) => {
      const part = w * (specific ? (i === 0 ? 1 : 0.5) : 0.4);
      score[id] = (score[id] || 0) + part;
      (reasons[id] = reasons[id] || []).push(`${it.name} (${it.grade})`);
    });
  }
  const picks = Object.keys(score).map(id => ({ id, score: +score[id].toFixed(2), reasons: [...new Set(reasons[id])] })).sort((a, b) => b.score - a.score);
  return { picks, unmapped };
}

if (typeof module !== 'undefined') module.exports = { itemsToLines, parseReportLines, scoreReport, gamesFor };
