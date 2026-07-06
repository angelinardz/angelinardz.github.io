# Angelina Rodriguez — Personal Portfolio

A minimalist, tech-styled portfolio (navy / gray / white) built with plain HTML, CSS, and JavaScript — no build step required.

## Features
- Terminal-style hero with a typewriter role animation
- Projects section pulls **live data from the GitHub API** (`github.com/angelinardz`) — every card links to its repository and shows language + stars automatically
- Scroll-triggered reveals, magnetic buttons, 3D tilt project cards, cursor glow
- Fully responsive and respects `prefers-reduced-motion`

## Run locally
```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy (GitHub Pages)
1. Create a repo named `angelinardz.github.io`
2. Push these files to the `main` branch
3. The site goes live at `https://angelinardz.github.io`

## Customize
- **Project descriptions / order** — edit `PROJECT_DETAILS` in [script.js](script.js)
- **Unreleased projects** (like HabitTracker) — edit `EXTRA_PROJECTS` in [script.js](script.js); when its repo goes public, remove it from there and add an entry to `PROJECT_DETAILS`
- **Colors** — edit the CSS variables at the top of [styles.css](styles.css)
- **Typewriter phrases** — edit `roles` in [script.js](script.js)
