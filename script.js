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
