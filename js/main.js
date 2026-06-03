/* ============================================================
   RankEngine — interactions (vanilla, no frameworks)
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animOff = () => document.body.classList.contains("anim-off");

  /* -------------------------------------------------- NAV scroll state */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* -------------------------------------------------- mobile nav */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* -------------------------------------------------- HERO typewriter */
  const phrases = [
    "meer klanten.",
    "gevonden worden.",
    "meer omzet.",
    "online groeien.",
    "vol in de agenda."
  ];
  const typed = document.getElementById("typed");
  let pi = 0, ci = 0, deleting = false;

  function speed(base) { const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--speed")) || 1; return base / s; }

  function tick() {
    if (!typed) return;
    if (animOff() || prefersReduced) { typed.textContent = phrases[0]; return; }
    const word = phrases[pi];
    if (!deleting) {
      ci++;
      typed.textContent = word.slice(0, ci);
      if (ci >= word.length) { deleting = true; return setTimeout(tick, speed(1500)); }
      setTimeout(tick, speed(72 + Math.random() * 60));
    } else {
      ci--;
      typed.textContent = word.slice(0, ci);
      if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, speed(280)); }
      setTimeout(tick, speed(38));
    }
  }
  setTimeout(tick, 650);

  /* -------------------------------------------------- HERO cursor glow */
  const glow = document.getElementById("heroGlow");
  const hero = document.getElementById("hero");
  if (glow && hero) {
    let tx = 0, ty = -0.4, cx = 0, cy = -0.4, raf = null;
    const lerp = (a, b, n) => a + (b - a) * n;
    function render() {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      glow.style.transform = `translate(calc(-50% + ${cx}px), calc(-40% + ${cy}px))`;
      if (Math.abs(cx - tx) > 0.4 || Math.abs(cy - ty) > 0.4) raf = requestAnimationFrame(render);
      else { raf = null; }
    }
    hero.addEventListener("pointermove", (e) => {
      if (animOff() || prefersReduced) return;
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * 0.55;
      ty = (e.clientY - r.top - r.height * 0.30) * 0.55;
      if (!raf) raf = requestAnimationFrame(render);
    });
  }

  /* -------------------------------------------------- SERVICE card glow tracking */
  document.querySelectorAll(".svc").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* -------------------------------------------------- SCROLL reveal */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* -------------------------------------------------- COUNTERS */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const dur = parseInt(el.dataset.dur || "1500", 10);
    if (animOff() || prefersReduced) { el.textContent = fmt(target, dec); return; }
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(target * easeOut(p), dec);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(target, dec);
    }
    requestAnimationFrame(frame);
  }
  function fmt(n, dec) {
    return n.toLocaleString("nl-NL", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => animateCount(c));
  }

  /* -------------------------------------------------- TESTIMONIAL slider */
  const track = document.getElementById("tstTrack");
  const dotsWrap = document.getElementById("tstDots");
  if (track && dotsWrap) {
    const slides = track.children.length;
    let idx = 0, timer = null;
    for (let i = 0; i < slides; i++) {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Review " + (i + 1));
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    }
    const dots = dotsWrap.children;
    function go(n, manual) {
      idx = (n + slides) % slides;
      track.style.transform = `translateX(${-idx * 100}%)`;
      for (let i = 0; i < dots.length; i++) dots[i].classList.toggle("on", i === idx);
      if (manual) restart();
    }
    function next() { go(idx + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      if (animOff() || prefersReduced) return;
      timer = setInterval(next, 6000 / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--speed")) || 1));
    }
    document.getElementById("tstNext").addEventListener("click", () => go(idx + 1, true));
    document.getElementById("tstPrev").addEventListener("click", () => go(idx - 1, true));
    go(0);
    restart();
    // pause on hover
    track.parentElement.addEventListener("mouseenter", () => timer && clearInterval(timer));
    track.parentElement.addEventListener("mouseleave", restart);
  }

  /* -------------------------------------------------- FLOATING CTA */
  const floatCta = document.getElementById("floatCta");
  const contact = document.getElementById("contact");
  if (floatCta && hero) {
    let pastHero = false, atContact = false;
    const update = () => floatCta.classList.toggle("show", pastHero && !atContact);
    const heroIo = new IntersectionObserver((e) => { pastHero = !e[0].isIntersecting; update(); }, { threshold: 0 });
    heroIo.observe(hero);
    if (contact) {
      const cIo = new IntersectionObserver((e) => { atContact = e[0].isIntersecting; update(); }, { threshold: 0.15 });
      cIo.observe(contact);
    }
  }
})();
