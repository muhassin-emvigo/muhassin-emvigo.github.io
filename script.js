// ===== Theme toggle (persisted) =====
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const icon = toggle.querySelector(".theme-toggle__icon");

  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  applyTheme(initial);

  toggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
