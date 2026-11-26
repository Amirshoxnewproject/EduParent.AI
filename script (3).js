/* ===== EduParent AI – interactions (vanilla JS, demo data only) ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- 1. Mobile nav ---------- */
const burger = $('#burger'), links = $('#links');
const setNav = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
burger.onclick = () => setNav(!links.classList.contains('open'));
$$('#links a').forEach(a => a.addEventListener('click', () => setNav(false)));

/* ---------- 2. Demo modal (no backend connected) ---------- */
const modal = $('#modal'), defaultMsg = $('#modal p').innerHTML;
$$('[data-open]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault(); setNav(false);
  $('#mTitle').textContent = el.dataset.open; $('#modal p').innerHTML = defaultMsg; modal.showModal();
}));
$('#mClose').onclick = () => modal.close();
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
$('#yr').textContent = new Date().getFullYear();

/* ---------- 3. Telegram chat demo (scripted, clearly not live) ---------- */
const chat = $('#chat');
const script = [
  ['bot', 'Good evening! 📚 What did you learn today?'],
  ['me', 'Fractions in math. Adding fractions needs a common denominator. Also photosynthesis in biology.'],
  ['typing'],
  ['sum', '<b>Daily summary</b><br>Math: adding fractions with common denominators.<br>Biology: how plants make food from light.<br><b>+20 points</b> · 🔥 7-day streak'],
];
let timers = [];
function playChat() {
  timers.forEach(clearTimeout); timers = []; chat.innerHTML = '';
  let t = 400, typingEl;
  script.forEach(([type, html]) => {
    timers.push(setTimeout(() => {
      if (type === 'typing') { typingEl = add('bot', '<span class="dots"><i></i><i></i><i></i></span>'); return; }
      if (typingEl) { typingEl.remove(); typingEl = null; }
      add(type, html);
    }, t));
    t += type === 'typing' ? 1400 : 1500;
  });
}
function add(cls, html) { const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; chat.appendChild(d); return d; }
$('#replay').onclick = playChat; playChat();

/* ---------- 4. How it works: step highlighting ---------- */
const steps = $$('.step'), fill = $('#flowFill');
function setStep(i) {
  steps.forEach((s, k) => { s.classList.toggle('active', k === i); s.classList.toggle('done', k < i); });
  fill.style.width = (i / (steps.length - 1)) * 100 + '%';
}
steps.forEach((s, i) => s.onclick = () => { setStep(i); clearInterval(auto); });
let cur = 0, auto = null;
new IntersectionObserver(([e], o) => {
  if (!e.isIntersecting) return; o.disconnect();
  auto = setInterval(() => { cur = (cur + 1) % steps.length; setStep(cur); }, 2200);
}, { threshold: .5 }).observe($('#flow'));

/* ---------- 5. Future Progress Meter (sample state) ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const START = { pts: 120, streak: 6, week: [20, 35, 25, 15, 25, 0, 0], shared: false, today: 5 }; // today = Sat index
let st;
const BADGES = [
  ['First share', s => s.sharedCount >= 1],
  ['Curious mind (150 pts)', s => s.pts >= 150],
  ['7-day streak', s => s.streak >= 7],
  ['Level 2 reached', s => s.pts >= 200],
];
const wk = $('#weekBars'), bd = $('#badges');
function resetMeter() { st = { ...START, week: [...START.week], sharedCount: 0 }; renderMeter(); }
function renderMeter() {
  const goal = Math.ceil((st.pts + 1) / 200) * 200, lvl = goal / 200;
  const circ = 327, into = st.pts % 200;
  $('#ringBar').style.strokeDashoffset = circ - circ * (into / 200);
  $('#pts').textContent = st.pts; $('#goal').textContent = goal;
  $('#lvl').textContent = 'Level ' + lvl;
  $('#streak').textContent = st.streak;
  $('#mp').textContent = st.pts * 5;
  $('#dailyPct').textContent = Math.min(100, st.week[st.today] / 35 * 100).toFixed(0) + '%';
  const max = Math.max(40, ...st.week);
  wk.innerHTML = st.week.map((v, i) => `<div title="${DAYS[i]}: ${v} pts"><i style="height:${Math.max(4, v / max * 80)}%"></i>${DAYS[i]}</div>`).join('');
  bd.innerHTML = BADGES.map(([n, f]) => `<span class="badge ${f(st) ? 'on' : ''}">${n}</span>`).join('');
}
function earn(n, share) {
  st.pts += n; st.week[st.today] += n;
  if (share) { st.sharedCount++; if (!st.shared) { st.shared = true; st.streak++; } }
  renderMeter();
}
$('#actShare').onclick = () => earn(20, true);
$('#actQuiz').onclick = () => earn(15, false);
$('#actReset').onclick = resetMeter;
resetMeter();

/* ---------- 6. Parent dashboard (sample data) ---------- */
const SAMPLE = {
  Mon: { s: 'Practiced fraction addition and read a chapter on the water cycle.', sub: [['Math', 80], ['Science', 55]], p: 20 },
  Tue: { s: 'Learned past simple verbs and wrote five practice sentences.', sub: [['English', 75], ['History', 40]], p: 35 },
  Wed: { s: 'Studied photosynthesis and drew a labelled diagram.', sub: [['Biology', 85], ['Math', 50]], p: 25 },
  Thu: { s: 'Short session. Reviewed vocabulary only.', sub: [['English', 45]], p: 15 },
  Fri: { s: 'Solved word problems and summarised a history lesson.', sub: [['Math', 90], ['History', 65]], p: 25 },
};
const tabs = $('#dayTabs'), chart = $('#chart'), read = $('#chartRead');
const keys = Object.keys(SAMPLE);
tabs.innerHTML = keys.map(k => `<button role="tab" data-k="${k}">${k}</button>`).join('');
chart.innerHTML = keys.map(k => `<div data-k="${k}"><i style="height:0"></i>${k}</div>`).join('');
function showDay(k) {
  const d = SAMPLE[k];
  $$('button', tabs).forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
  $$('div', chart).forEach(c => c.classList.toggle('on', c.dataset.k === k));
  $('#dayTitle').textContent = `Daily report · ${k}`;
  $('#daySummary').textContent = d.s;
  $('#subjects').innerHTML = d.sub.map(([n, v]) => `<div class="sub"><div class="sub-h"><span>${n}</span><span>${v}%</span></div><div class="sub-b"><i style="width:${v}%"></i></div></div>`).join('');
  read.textContent = `${k}: ${d.p} progress points (sample data)`;
}
tabs.onclick = e => { const b = e.target.closest('button'); if (b) showDay(b.dataset.k); };
chart.onclick = e => { const c = e.target.closest('div[data-k]'); if (c) showDay(c.dataset.k); };
chart.onmouseover = e => { const c = e.target.closest('div[data-k]'); if (c) read.textContent = `${c.dataset.k}: ${SAMPLE[c.dataset.k].p} progress points (sample data)`; };
showDay('Wed');

/* ---------- 7. Animated counters + chart grow-in, on scroll ---------- */
function count(el) {
  const to = +el.dataset.count, t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / 1200);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return; o.unobserve(e.target);
  $$('[data-count]', e.target).forEach(count);
  const max = Math.max(...keys.map(k => SAMPLE[k].p));
  $$('div[data-k] i', chart).forEach((b, i) => b.style.height = SAMPLE[keys[i]].p / max * 85 + '%');
}), { threshold: .3 }).observe($('.dash'));

/* ---------- 8. Gentle reveal on scroll for section headings ---------- */
const rv = $$('.sec h2, .cta h2');
rv.forEach(el => el.classList.add('rv'));
new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .2 }).observe && rv.forEach(el => new IntersectionObserver(([e], o) => { if (e.isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: .2 }).observe(el));

/* ---------- 9. Install as an app (PWA) ---------- */
// Works on Chrome (desktop + Android) when the site is served over HTTPS.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('service-worker.js');
const instBtn = $('#installBtn');
let deferred = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; instBtn.hidden = false; });
window.addEventListener('appinstalled', () => { instBtn.hidden = true; });
// iPhone Safari has no install prompt, so show manual steps instead
if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone) instBtn.hidden = false;
instBtn.onclick = async () => {
  setNav(false);
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; instBtn.hidden = true; return; }
  $('#mTitle').textContent = 'Install EduParent AI';
  $('#modal p').textContent = 'On iPhone: tap the Share button in Safari, then choose "Add to Home Screen".';
  modal.showModal();
};
