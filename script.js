// ===== Animated background (particles + light streaks) =====
(function () {
  const canvas = document.getElementById("fx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // Particles (drifting starfield)
  const count = Math.max(50, Math.min(150, Math.floor(W / 11)));
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.45 + 0.15,
      tw: Math.random() * 0.018 + 0.004, ph: Math.random() * 6.28,
      vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.06,
    });
  }

  // Light streaks (diagonal comets)
  const streaks = [];
  const DIRX = -0.42, DIRY = 1; // down-left
  const dlen = Math.hypot(DIRX, DIRY);
  const ux = DIRX / dlen, uy = DIRY / dlen;
  function spawnStreak() {
    const margin = 200;
    const x = Math.random() * (W + margin * 2) - margin;
    const y = -margin * Math.random();
    streaks.push({
      x: x, y: y,
      len: Math.random() * 160 + 90,
      speed: Math.random() * 5 + 4,
      life: 1,
      tint: Math.random() < 0.4,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.ph += p.tw;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
      const a = p.base * (0.55 + 0.45 * Math.sin(p.ph));
      ctx.beginPath();
      ctx.fillStyle = "rgba(220, 232, 236, " + a.toFixed(3) + ")";
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }

    // streaks
    if (!reduce) {
      if (streaks.length < 16 && Math.random() < 0.28) spawnStreak();
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += ux * s.speed; s.y += uy * s.speed;
        const tailX = s.x - ux * s.len, tailY = s.y - uy * s.len;
        const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        const head = s.tint ? "rgba(143, 170, 178, 0.9)" : "rgba(255, 255, 255, 0.9)";
        g.addColorStop(0, head);
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        if (s.y - s.len > H || s.x + s.len < 0) streaks.splice(i, 1);
      }
    }
    raf = requestAnimationFrame(draw);
  }

  let raf = requestAnimationFrame(draw);
})();

// ===== Cinema: pinned scroll-scrubbed scenes =====
(function () {
  const cinema = document.getElementById("hero");
  if (!cinema || !cinema.classList.contains("cinema")) return;
  const layers = Array.prototype.slice.call(cinema.querySelectorAll(".cinema__layer"));
  const cue = document.getElementById("cinema-cue");
  const vig = cinema.querySelector(".cinema__vignette");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finalIdx = layers.length - 1;

  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function bump(x, c, w) {
    const rise = smoothstep(c - w, c - w * 0.35, x);
    const fall = 1 - smoothstep(c + w * 0.35, c + w, x);
    return Math.min(rise, fall);
  }

  if (reduce) {
    layers.forEach(function (l, i) {
      l.style.opacity = i === finalIdx ? "1" : "0";
      l.style.pointerEvents = i === finalIdx ? "auto" : "none";
    });
    if (cue) cue.style.opacity = "0";
    if (window.__setScrub) window.__setScrub(0.5);
    return;
  }

  const centers = [0.06, 0.32, 0.56];
  const W = 0.17;

  function update() {
    const rect = cinema.getBoundingClientRect();
    const total = cinema.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
    if (window.__setScrub) window.__setScrub(p);

    for (let i = 0; i < layers.length; i++) {
      let o;
      if (i === finalIdx) o = smoothstep(0.66, 0.86, p);
      else o = bump(p, centers[i], W);
      const l = layers[i];
      l.style.opacity = o.toFixed(3);
      l.style.transform = "translateY(" + ((1 - o) * 22).toFixed(1) + "px)";
      l.style.pointerEvents = (i === finalIdx && o > 0.5) ? "auto" : "none";
    }
    if (cue) cue.style.opacity = Math.max(0, 1 - p * 4).toFixed(3);
    if (vig) vig.style.opacity = (0.5 + p * 0.5).toFixed(3);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ===== Mobile menu =====
(function () {
  const menuToggle = document.getElementById("menu-toggle");
  const links = document.querySelector(".nav__links");
  if (!menuToggle || !links) return;

  menuToggle.addEventListener("click", function () {
    const open = links.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// ===== Scroll progress bar =====
(function () {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ===== Animated stat counters =====
(function () {
  const nums = document.querySelectorAll(".stat__num[data-count]");
  if (!nums.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  function animate(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach(function (n) { observer.observe(n); });
})();

// ===== Back to top =====
(function () {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", function () {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener("click", function () {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ===== Lenis smooth scroll =====
(function () {
  if (typeof Lenis === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
  });
  window.__lenis = lenis;

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // smooth in-page anchor navigation (accounts for sticky header)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -70 });
    });
  });
})();

// ===== Scroll reveal =====
(function () {
  const sections = document.querySelectorAll(".section");
  sections.forEach(function (s) { s.setAttribute("data-animate", ""); });

  if (!("IntersectionObserver" in window)) {
    sections.forEach(function (s) { s.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach(function (s) { observer.observe(s); });
})();

// ===== Staggered card reveal =====
(function () {
  const groups = document.querySelectorAll(".timeline, .projects");
  if (!groups.length) return;

  const items = [];
  groups.forEach(function (group) {
    const cards = group.querySelectorAll(".timeline__item, .project");
    cards.forEach(function (card, i) {
      card.setAttribute("data-animate", "");
      card.style.transitionDelay = Math.min(i * 80, 400) + "ms";
      items.push(card);
    });
  });

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (c) { c.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach(function (c) { observer.observe(c); });
})();
