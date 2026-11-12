// Cene u RSD. Paket 2 = kupiš 2, treća gratis (3 bočice za 1000).
const PRICES = {1: 500, 2: 1000};
const SHIPPING = null; // [CENA] dostave; dok je null, ukupno je bez dostave
const WEB3FORMS_KEY = "18190543-882c-4de1-ab3a-67e6e8044b61";

// Parovi slika za klizač; null = placeholder dok ne stignu fotke iz demo videa.
const PAIRS = {
  hrana: {pre: "assets/pre-hrana.webp", posle: "assets/posle-hrana.webp"}
};

document.documentElement.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = n => n.toLocaleString("sr-RS") + " RSD";

// NAV
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), {passive: true});
const mm = $("#mmenu"), burger = $("#burger");
const setMenu = open => {
  mm.hidden = !open; burger.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
  (open ? $("#mclose") : burger).focus();
};
burger.onclick = () => setMenu(true);
$("#mclose").onclick = () => setMenu(false);
$$("a", mm).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape" && !mm.hidden) setMenu(false); });

// 1) HERO bočica + mehurići
if ($("#hero")) {
requestAnimationFrame(() => requestAnimationFrame(() => $("#bottle").classList.add("in")));
const bub = $("#bubbles");
const nBub = matchMedia("(max-width:767px)").matches ? 4 : 7;
for (let i = 0; i < nBub; i++) {
  const s = 8 + Math.round(Math.random() * 12);
  bub.insertAdjacentHTML("beforeend",
    `<svg width="${s}" height="${s}" viewBox="0 0 20 20" style="left:${18 + (i * 64 / nBub) + Math.random() * 6}%;animation-duration:${6 + Math.random() * 4}s;animation-delay:-${Math.random() * 8}s"><circle cx="10" cy="10" r="9"/></svg>`);
}
new IntersectionObserver(([e]) => bub.classList.toggle("paused", !e.isIntersecting)).observe($("#hero"));
}

// Fade-up reveal sa stagger-om
const rvObs = new IntersectionObserver(entries => {
  entries.filter(e => e.isIntersecting).forEach((e, i) => {
    e.target.style.transitionDelay = (i * 0.06) + "s";
    e.target.classList.add("in"); rvObs.unobserve(e.target);
  });
}, {rootMargin: "0px 0px -8% 0px"});
$$(".rv").forEach(el => rvObs.observe(el));

// 2) PRE / POSLE klizač
if ($("#ba")) {
const ba = $("#ba"), range = $("#baRange");
let pos = 50;
const setPos = p => {
  pos = Math.max(0, Math.min(100, Math.round(p)));
  ba.style.setProperty("--p", pos + "%");
  range.value = pos;
};
range.addEventListener("input", () => setPos(+range.value));
$$("[data-step]").forEach(b => b.addEventListener("click", () => setPos(pos + +b.dataset.step)));
const layer = (el, src, txt) => {
  el.classList.toggle("ph", !src);
  el.style.backgroundImage = src ? `url("${src}")` : "";
  el.innerHTML = src ? "" : `<span>${txt}</span>`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", src ? `${txt.includes("PRE") ? "Pre" : "Posle"} – fleka na tkanini` : txt);
};
const showPair = key => {
  const p = PAIRS[key], name = {hrana: "hrana", pice: "piće", masna: "masna fleka"}[key];
  layer($("#baBefore"), p.pre, `[FOTKA PRE – ${name}]`);
  layer($("#baAfter"), p.posle, `[FOTKA POSLE – ${name}]`);
  setPos(50);
};
showPair("hrana");
}

// 3) KAPI – jednom
const steps = $("#steps");
if (steps) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { steps.classList.add("done"); o.disconnect(); } }, {threshold: .35}).observe(steps);

// 5) VIDEO
$$(".vid").forEach(fig => {
  const v = $("video", fig), b = $(".vid-btn", fig);
  const sync = () => {
    fig.classList.toggle("playing", !v.paused);
    b.innerHTML = `<svg class="ic"><use href="#i-${v.paused ? "play" : "pause"}"/></svg>`;
    b.setAttribute("aria-label", v.paused ? "Pusti video" : "Pauziraj video");
  };
  b.onclick = () => v.paused ? v.play().catch(() => {}) : v.pause();
  v.addEventListener("play", sync); v.addEventListener("pause", sync);
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) v.pause(); }).observe(fig);
});

// 6) FAQ
$$(".qa button").forEach(b => b.addEventListener("click", () => {
  const open = b.getAttribute("aria-expanded") !== "true";
  b.setAttribute("aria-expanded", open);
  $("#" + b.getAttribute("aria-controls")).hidden = !open;
}));

// 4) CENA + FORMA (poruci.html)
if ($("#form")) {
let qty = 1, shown = 0;
const pkg = () => +$("input[name=paket]:checked").value;
const total = () => PRICES[pkg()] * qty + (SHIPPING || 0);
const totalEl = $("#total");
const animate = to => {
  if (reduced) { totalEl.textContent = fmt(to); shown = to; return; }
  const from = shown, t0 = performance.now();
  const tick = t => {
    const k = Math.min(1, (t - t0) / 400), e = 1 - Math.pow(1 - k, 3);
    totalEl.textContent = fmt(Math.round(from + (to - from) * e));
    if (k < 1) requestAnimationFrame(tick); else shown = to;
  };
  requestAnimationFrame(tick);
};
const render = () => {
  $("#qty").textContent = qty;
  $("#qMinus").disabled = qty <= 1;
  $$(".pkg-p").forEach(el => { const v = PRICES[el.dataset.pkg]; el.textContent = typeof v === "number" ? fmt(v) : "Cena na upit"; });
  $("#ship").textContent = typeof SHIPPING === "number" ? fmt(SHIPPING) : "Cena na upit";
  $("#totNote").textContent = SHIPPING === null ? "+ dostava" : "";
  animate(total());
};
$$("input[name=paket]").forEach(r => r.addEventListener("change", render));
$("#qMinus").onclick = () => { if (qty > 1) { qty--; render(); } };
$("#qPlus").onclick = () => { if (qty < 20) { qty++; render(); } };
render();

// FORMA
const form = $("#form"), send = $("#send"), status = $("#status");
const rules = {
  ime: v => v.trim().length >= 3 || "Upišite ime i prezime.",
  tel: v => /^[+\d][\d\s/-]{7,}$/.test(v.trim()) || "Upišite ispravan broj telefona (npr. 064 123 4567).",
  grad: v => v.trim().length >= 2 || "Upišite grad.",
  pb: v => /^\d{5}$/.test(v.trim()) || "Poštanski broj ima 5 cifara.",
  adr: v => v.trim().length >= 4 || "Upišite ulicu i broj."
};
const check = id => {
  const el = $("#" + id), r = rules[id](el.value), err = $("#" + id + "-e");
  const bad = r !== true;
  el.setAttribute("aria-invalid", bad);
  if (bad) el.setAttribute("aria-describedby", id + "-e"); else el.removeAttribute("aria-describedby");
  err.textContent = bad ? r : "";
  return !bad;
};
Object.keys(rules).forEach(id => {
  const el = $("#" + id);
  el.addEventListener("blur", () => el.value && check(id));
  el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && check(id));
});
const label = () => ({1: "1 bočica", 2: "2 + 1 gratis (3 bočice)"})[pkg()] + (qty > 1 ? ` × ${qty}` : "");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const bad = Object.keys(rules).filter(id => !check(id));
  if (bad.length) { $("#" + bad[0]).focus(); return; }
  const tot = fmt(total()) + (SHIPPING === null ? " + dostava" : "");
  const data = Object.fromEntries(new FormData(form));
  send.disabled = true; send.textContent = "Šalje se…"; status.className = "status"; status.textContent = "";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {"Content-Type": "application/json", Accept: "application/json"},
      body: JSON.stringify({access_key: WEB3FORMS_KEY, subject: `Nova porudžbina – Magic Clean – ${label()} – ${tot}`, from_name: "Magic Clean sajt", paket: label(), kolicina: qty, ukupno: tot, ...data})
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) throw new Error(j.message || res.status);
    status.className = "status ok";
    status.innerHTML = `<svg class="ic"><use href="#i-check"/></svg><span>Hvala! Porudžbina je primljena, javićemo vam se radi potvrde.</span>`;
    form.reset(); qty = 1; render();
  } catch {
    status.className = "status bad";
    status.innerHTML = `<span>Slanje nije uspelo – pišite nam na TikTok <a href="https://www.tiktok.com/@magic_clean_" target="_blank" rel="noopener">@magic_clean_</a>.</span>`;
  } finally {
    send.disabled = false; send.innerHTML = `Pošalji porudžbinu <svg class="ic"><use href="#i-arrow"/></svg>`;
  }
});
}
const mbarPrice = $("#mbarPrice");
if (mbarPrice) mbarPrice.textContent = fmt(PRICES[1]);
// Paket iz linka: poruci.html?paket=2
const qp = new URLSearchParams(location.search).get("paket");
if (qp && $(`input[name=paket][value="${qp}"]`)) { $(`input[name=paket][value="${qp}"]`).checked = true; $(`input[name=paket][value="${qp}"]`).dispatchEvent(new Event("change")); }
