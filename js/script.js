// ===== Scroll reveal =====
const revealEls = document.querySelectorAll("[data-reveal]");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-in"); });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Boot sequence + hero XP =====
const bootFill = document.getElementById("bootFill");
const bootPct = document.getElementById("bootPct");
const bootStatus = document.getElementById("bootStatus");

const heroLiters = document.getElementById("heroLiters");
const heroXP = document.getElementById("heroXP");

let boot = 0;

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function bootStep(){
  boot += Math.floor(Math.random() * 7) + 4;
  if (boot > 100) boot = 100;

  bootFill.style.width = `${boot}%`;
  bootPct.textContent = `${boot}%`;

  if (boot < 35) bootStatus.textContent = "INITIALIZING";
  else if (boot < 70) bootStatus.textContent = "CALIBRATING";
  else if (boot < 100) bootStatus.textContent = "FINAL CHECKS";
  else bootStatus.textContent = "SYSTEM READY";

  if (boot < 100) setTimeout(bootStep, 120);
}
setTimeout(bootStep, 260);

function countTo(el, to, ms){
  const start = performance.now();
  const from = parseFloat(el.textContent) || 0;

  function tick(now){
    const t = Math.min(1, (now - start) / ms);
    const v = from + (to - from) * easeOutCubic(t);
    el.textContent = v.toFixed(1);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Hero starts at some believable level
setTimeout(() => {
  const startL = 2.2;
  countTo(heroLiters, startL, 900);
  heroXP.style.width = `${Math.min(100, (startL / 4.5) * 100)}%`;
}, 650);

// ===== Tilt (main character hover) =====
const tiltCards = document.querySelectorAll(".tilt");
tiltCards.forEach(card => {
  let rect = null;

  card.addEventListener("mousemove", (e) => {
    rect = rect || card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rx = ((y / rect.height) - 0.5) * -6;
    const ry = ((x / rect.width) - 0.5) * 9;

    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    rect = null;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
});

// ===== Tracker mechanics =====
const target = 4.5;
let current = 0;

const fill = document.getElementById("fill");
const cur = document.getElementById("cur");
const pct = document.getElementById("pct");
const log = document.getElementById("log");
const status = document.getElementById("status");
const rank = document.getElementById("rank");

// dynamic stats
const focusB = document.getElementById("focusB");
const discB  = document.getElementById("discB");
const outB   = document.getElementById("outB");

const focusV = document.getElementById("focusV");
const discV  = document.getElementById("discV");
const outV   = document.getElementById("outV");

function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

function hydrationTier(p){
  if (p >= 100) return { status:"FULL BOOST", rank:"RANK: BEAST MODE" };
  if (p >= 75)  return { status:"OPTIMAL",   rank:"RANK: LOCKED IN" };
  if (p >= 45)  return { status:"STABLE",    rank:"RANK: WARMUP" };
  return { status:"LOW POWER", rank:"RANK: REBOOT" };
}

function setStats(p){
  // p = 0..100
  // Base “Dieuwe” vibe: discipline is naturally high
  const focus = clamp(55 + p * 0.35, 0, 100);         // 55 -> 90
  const disc  = clamp(78 + p * 0.18, 0, 100);         // 78 -> 96
  const out   = clamp(40 + p * 0.55, 0, 100);         // 40 -> 95

  focusB.style.width = `${focus}%`;
  discB.style.width  = `${disc}%`;
  outB.style.width   = `${out}%`;

  focusV.textContent = `${Math.round(focus)}%`;
  discV.textContent  = `${Math.round(disc)}%`;
  outV.textContent   = `${Math.round(out)}%`;
}

function update(){
  const p = clamp((current / target) * 100, 0, 100);

  fill.style.width = `${p}%`;
  cur.textContent = current.toFixed(1);
  pct.textContent = Math.round(p);

  const t = hydrationTier(p);
  status.textContent = t.status;
  rank.textContent = t.rank;

  setStats(p);

  // Sync hero display too (makes it feel “one system”)
  heroLiters.textContent = current.toFixed(1);
  heroXP.style.width = `${p}%`;
}

function addLog(amount){
  const time = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<span>${time}</span><span>+${amount.toFixed(2)}L</span>`;
  log.prepend(item);
  while (log.children.length > 6) log.removeChild(log.lastChild);
}

document.querySelectorAll("[data-add]").forEach(btn => {
  btn.addEventListener("click", () => {
    const add = parseFloat(btn.dataset.add);
    current = clamp(current + add, 0, target);
    addLog(add);
    update();
  });
});

document.getElementById("reset").addEventListener("click", () => {
  current = 0;
  log.innerHTML = "";
  update();
});

// init with a believable “already training” value
current = 2.2;
update();