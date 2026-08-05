// ===== Card cursor spotlight =====
(function () {
  if (window.matchMedia("(hover: none)").matches) return;
  const cards = document.querySelectorAll(".stat, .skills__group, .project, .timeline__content");
  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();

// ===== Full-screen loader =====
(function () {
  const loader = document.getElementById("loader");
  if (!loader) return;
  let done = false;
  function hide() {
    if (done) return;
    done = true;
    loader.classList.add("is-done");
  }
  window.addEventListener("load", function () { setTimeout(hide, 400); });
  setTimeout(hide, 4500); // safety fallback
})();

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
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
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

// ===== 3D tilt on project cards =====
(function () {
  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".project").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        "perspective(800px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
        (px * 8).toFixed(2) + "deg) translateY(-6px)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });
})();

// ===== Side HUD section nav =====
(function () {
  const nav = document.getElementById("hud-nav");
  if (!nav) return;
  const links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  const map = {};
  links.forEach(function (a) { map[a.getAttribute("data-target")] = a; });

  const hero = document.getElementById("hero");
  window.addEventListener("scroll", function () {
    const past = window.scrollY > (hero ? hero.offsetHeight * 0.9 : window.innerHeight);
    nav.classList.toggle("is-visible", past);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          const a = map[e.target.id];
          if (a) a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    ["about", "experience", "skills", "projects", "education", "contact"].forEach(function (id) {
      const s = document.getElementById(id);
      if (s) obs.observe(s);
    });
  }
})();

// ===== Kerala (IST) clock =====
(function () {
  const el = document.getElementById("ist-clock");
  if (!el) return;
  function tick() {
    try {
      const t = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
      });
      el.innerHTML = "🕒 <b>" + t + " IST</b> · Kochi, Kerala";
    } catch (e) { el.textContent = ""; }
  }
  tick();
  setInterval(tick, 30000);
})();

// ===== Custom cursor ring =====
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ring = document.getElementById("cursor-ring");
  if (!ring) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, on = false;
  window.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    if (!on) { on = true; ring.classList.add("is-on"); }
  }, { passive: true });
  window.addEventListener("pointerdown", function () { ring.classList.add("is-active"); });
  window.addEventListener("pointerup", function () { ring.classList.remove("is-active"); });
  const sel = "a, button, .btn, .project, .stat, .skills__group, .timeline__content, .hud-nav a, input, .nav__brand, .cmdk-fab";
  document.addEventListener("pointerover", function (e) { if (e.target.closest(sel)) ring.classList.add("is-active"); });
  document.addEventListener("pointerout", function (e) { if (e.target.closest(sel)) ring.classList.remove("is-active"); });
  (function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
    requestAnimationFrame(loop);
  })();
})();

// ===== Text-scramble section titles =====
(function () {
  const titles = document.querySelectorAll(".ttl");
  if (!titles.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%!<>/*0123456789";
  function scramble(el) {
    const final = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("data-text", final);
    const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / 620);
      const reveal = Math.floor(p * final.length);
      let out = "";
      for (let i = 0; i < final.length; i++) {
        if (i < reveal || final[i] === " ") out += final[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final;
    })(start);
  }
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  titles.forEach(function (t) { obs.observe(t); });
})();

// ===== Command palette (⌘K) =====
(function () {
  const root = document.getElementById("cmdk");
  const input = document.getElementById("cmdk-input");
  const list = document.getElementById("cmdk-list");
  const fab = document.getElementById("cmdk-fab");
  if (!root || !input || !list) return;

  const commands = [
    { label: "About", ic: "▹", type: "section", target: "#about" },
    { label: "Experience", ic: "▹", type: "section", target: "#experience" },
    { label: "Skills", ic: "▹", type: "section", target: "#skills" },
    { label: "Projects", ic: "▹", type: "section", target: "#projects" },
    { label: "Education", ic: "▹", type: "section", target: "#education" },
    { label: "Contact", ic: "▹", type: "section", target: "#contact" },
    { label: "Download résumé", ic: "⤓", type: "link", target: "resume.pdf", ext: true },
    { label: "GitHub", ic: "↗", type: "link", target: "https://github.com/muhassin-emvigo", ext: true },
    { label: "LinkedIn", ic: "↗", type: "link", target: "https://in.linkedin.com/in/muhassin-babu-mm", ext: true },
    { label: "Email me", ic: "✉", type: "link", target: "mailto:muhassin.babu@emvigotech.com" },
    { label: "Print / save as PDF", ic: "⎙", type: "print" }
  ];
  let filtered = commands.slice(), sel = 0;

  function render() {
    if (!filtered.length) { list.innerHTML = '<li class="cmdk__empty">No matches</li>'; return; }
    list.innerHTML = filtered.map(function (c, i) {
      return '<li class="cmdk__item' + (i === sel ? " is-sel" : "") + '" role="option" data-i="' + i + '">' +
        '<span class="ic">' + c.ic + "</span>" + c.label +
        (c.ext ? '<span class="arrow">↗</span>' : "") + "</li>";
    }).join("");
  }
  function open() {
    root.classList.add("is-open"); root.setAttribute("aria-hidden", "false");
    input.value = ""; filtered = commands.slice(); sel = 0; render();
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { root.classList.remove("is-open"); root.setAttribute("aria-hidden", "true"); }
  function run(c) {
    if (!c) return;
    close();
    if (c.type === "section") {
      const el = document.querySelector(c.target);
      if (el) { if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 }); else el.scrollIntoView({ behavior: "smooth" }); }
    } else if (c.type === "link") {
      window.open(c.target, c.ext ? "_blank" : "_self");
    } else if (c.type === "print") {
      window.print();
    }
  }

  function norm(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  input.addEventListener("input", function () {
    const q = norm(input.value.trim());
    filtered = commands.filter(function (c) { return norm(c.label).indexOf(q) !== -1; });
    sel = 0; render();
  });
  list.addEventListener("click", function (e) {
    const li = e.target.closest(".cmdk__item"); if (!li) return;
    run(filtered[parseInt(li.getAttribute("data-i"), 10)]);
  });
  root.addEventListener("click", function (e) { if (e.target.hasAttribute("data-cmdk-close")) close(); });
  if (fab) fab.addEventListener("click", open);

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); root.classList.contains("is-open") ? close() : open(); return; }
    if (!root.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === "Enter") { e.preventDefault(); run(filtered[sel]); }
  });
})();

// ===== Service worker (PWA / offline) =====
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
