# Muhassin Babu MM — Public Profile & Résumé

> Technology Architect · Agentic Workflows · Node.js · Ex-Infosys

A clean, responsive, single-page personal profile / résumé website. Built with
plain HTML, CSS, and JavaScript — no build step, no dependencies. Just open it
in a browser or host it anywhere static files are served.

## ✨ Features

- **Single-page layout** with About, Experience, Skills, Projects, Education, and Contact sections
- **Light / dark theme toggle** (respects system preference, remembers your choice)
- **Fully responsive** — looks good on phones, tablets, and desktops
- **Smooth scrolling** navigation and subtle scroll-reveal animations
- **Zero dependencies** — a single HTML file plus a stylesheet and a small script
- **Accessible** markup with semantic sections and ARIA labels

## 📁 Structure

```
index.html    # Page content and sections
styles.css    # All styling and theming (CSS variables)
script.js     # Theme toggle, mobile menu, scroll reveal
```

## 🖊️ How to customize

Open `index.html` and replace the placeholder content with your own:

1. **Name, title, tagline** — in the `#hero` section.
2. **About text and skills list** — in the `#about` section.
3. **Work history** — in the `#experience` section (`.timeline__item` blocks).
4. **Skills** — in the `#skills` section.
5. **Projects** — in the `#projects` section; update titles, descriptions, and the
   `Code` / `Live` links.
6. **Education** — in the `#education` section.
7. **Contact & social links** — update the email and the GitHub / LinkedIn URLs in
   the hero, contact, and footer.

To change colors, edit the CSS variables at the top of `styles.css` (the `:root`
and `[data-theme="dark"]` blocks). To add a downloadable résumé, drop a
`resume.pdf` file next to `index.html` (the hero's "Download résumé" button links
to it).

## 🚀 Run locally

Just open `index.html` in your browser, or serve the folder:

```bash
# Python
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🌐 Deploy with GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick your branch, and set the folder to `/ (root)`.
4. Save — your site will be published at
   `https://<username>.github.io/<repository>/`.

---

_Feel free to make it your own._
