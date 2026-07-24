# Angelina Rodriguez — Personal Portfolio

A light, technical portfolio — paper background, slate ink, restrained indigo/terminal-green accents — built with plain HTML, CSS, and JavaScript. No build step required.

## Features
- A **real terminal** in the hero — not decorative. Type `help`, `about`, `projects`, `whoami`, `sudo hire-angelina`, and more to navigate the site
- Projects rendered as a **file explorer** (VS Code–style tree + detail panel), pulling **live data from the GitHub API** (`github.com/angelinardz`)
- Experience shown as a **git log** — commits, hashes, timestamps
- A hidden desktop OS easter egg (`.angelinaos`, linked quietly in the nav/footer, or type `os`/`play` in the terminal) with draggable windows, a dock, its own terminal, and a **Snake** game
- A classic Konami-code easter egg on the main site
- Fully responsive, respects `prefers-reduced-motion`

## Run locally
```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy (GitHub Pages)
1. Push these files to the `main` branch of `angelinardz.github.io`
2. The site goes live at `https://angelinardz.github.io`

## Customize
- **Project descriptions / order** — edit `PROJECT_DETAILS` in [script.js](script.js) (mirrored in [os-script.js](os-script.js) for the OS project window)
- **Terminal commands** — edit the `COMMANDS` object in [script.js](script.js)
- **Colors / type** — edit the CSS variables at the top of [styles.css](styles.css) / [os-styles.css](os-styles.css)
- **Snake** — lives at the bottom of [os-script.js](os-script.js); best score persists in `localStorage`
