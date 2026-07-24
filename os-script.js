/* ============================================================
   Angelina Rodriguez — Portfolio interactions
   "AngelinaOS" — window manager + dock + terminal + snake + live GitHub projects
   ============================================================ */

const GITHUB_USER = "angelinardz";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.innerWidth <= 760;

/* ---------- menu bar clock ---------- */
(function clock() {
  const el = document.getElementById("clock");
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  tick();
  setInterval(tick, 15000);
})();

/* ---------- window manager ---------- */
const AngelinaOSWindows = (function windowManager() {
  const desktop = document.getElementById("desktop");
  const windows = Array.from(document.querySelectorAll(".window"));
  const dockIcons = Array.from(document.querySelectorAll(".dock__icon[data-open]"));
  let zTop = 10;

  function getWindow(name) {
    return windows.find((w) => w.dataset.window === name);
  }

  function updateDockDots() {
    dockIcons.forEach((icon) => {
      const win = getWindow(icon.dataset.open);
      const dot = icon.querySelector(".dock__dot");
      if (dot) {
        dot.classList.toggle(
          "is-visible",
          !!win && !win.classList.contains("is-hidden") && !win.classList.contains("is-minimized")
        );
      }
    });
  }

  function bringToFront(win) {
    zTop += 1;
    win.style.zIndex = zTop;
    windows.forEach((w) => w.classList.toggle("is-active", w === win));
    win.dispatchEvent(new CustomEvent("os:focus"));
  }

  function isTopmost(win) {
    return Number(win.style.zIndex || 0) === zTop && !win.classList.contains("is-hidden") && !win.classList.contains("is-minimized");
  }

  function openWindow(name) {
    const win = getWindow(name);
    if (!win) return;
    win.classList.remove("is-hidden", "is-minimized");
    bringToFront(win);
    updateDockDots();
    if (isMobile()) {
      win.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function toggleWindow(name) {
    const win = getWindow(name);
    if (!win) return;
    if (isMobile()) {
      openWindow(name);
      return;
    }
    if (win.classList.contains("is-hidden") || win.classList.contains("is-minimized")) {
      openWindow(name);
    } else if (isTopmost(win)) {
      win.classList.add("is-minimized");
      updateDockDots();
    } else {
      bringToFront(win);
    }
  }

  dockIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWindow(icon.dataset.open);
    });
  });

  document.querySelectorAll(".desktop-icon[data-open]").forEach((icon) => {
    icon.addEventListener("click", () => openWindow(icon.dataset.open));
  });

  windows.forEach((win) => {
    win.addEventListener("mousedown", () => bringToFront(win));

    const bar = win.querySelector(".window__bar");
    const closeBtn = win.querySelector('[data-action="close"]');
    const minBtn = win.querySelector('[data-action="minimize"]');
    const maxBtn = win.querySelector('[data-action="maximize"]');

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      win.classList.add("is-hidden");
      updateDockDots();
    });
    minBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      win.classList.add("is-minimized");
      updateDockDots();
    });
    maxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      win.classList.toggle("is-maximized");
    });

    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    bar.addEventListener("mousedown", (e) => {
      if (isMobile() || win.classList.contains("is-maximized") || e.target.closest(".traffic")) return;
      dragging = true;
      bringToFront(win);
      const rect = win.getBoundingClientRect();
      const deskRect = desktop.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left - deskRect.left;
      startTop = rect.top - deskRect.top;
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const deskRect = desktop.getBoundingClientRect();
      const left = Math.min(Math.max(0, startLeft + dx), Math.max(0, deskRect.width - win.offsetWidth));
      const top = Math.min(Math.max(0, startTop + dy), Math.max(0, deskRect.height - win.offsetHeight));
      win.style.left = left + "px";
      win.style.top = top + "px";
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
      document.body.style.userSelect = "";
    });
  });

  updateDockDots();

  return { openWindow, toggleWindow, getWindow };
})();

/* ---------- dock magnification ---------- */
(function dockMagnify() {
  const dock = document.getElementById("dock");
  if (!dock || prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;
  const icons = Array.from(dock.querySelectorAll(".dock__icon"));

  dock.addEventListener("mousemove", (e) => {
    icons.forEach((icon) => {
      const rect = icon.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - center);
      const scale = Math.max(1, 1.55 - dist / 110);
      icon.style.transform = `scale(${scale}) translateY(${-(scale - 1) * 16}px)`;
    });
  });
  dock.addEventListener("mouseleave", () => {
    icons.forEach((icon) => {
      icon.style.transform = "";
    });
  });
})();

/* ---------- open a window from ?open=name (e.g. linked from the hero terminal) ---------- */
(function openFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("open");
  if (target) AngelinaOSWindows.openWindow(target);
})();

/* ============================================================
   PROJECTS: live from GitHub
   ============================================================ */

const PROJECT_DETAILS = {
  "ai-news-summarizer": {
    title: "AI News Summarizer",
    blurb:
      "Python app using TextBlob and Newspaper3k that scrapes a news article from a URL, extracts the title, author, date, and summary, and runs sentiment analysis to determine the article's tone — surfacing key metadata in seconds.",
    tags: ["Python", "TextBlob", "Newspaper3k", "NLP"],
    priority: 1,
  },
  "alettertonoone": {
    title: "ALetterToNoOne",
    blurb:
      "A privacy-first web experience built with HTML, CSS, and JavaScript. Timed text deletion and dynamic prompts reinforce anonymous, release-focused emotional expression — without social consequence.",
    tags: ["HTML", "CSS", "JavaScript"],
    priority: 2,
  },
  "listit": {
    title: "listIt",
    blurb: "A lightweight list-making web app for grocery shopping.",
    tags: ["HTML", "CSS", "JavaScript"],
    demo: "https://list-it-ten.vercel.app",
    priority: 4,
  },
};

const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#e8b93b",
  HTML: "#e2734f",
  CSS: "#7c5cbf",
  Java: "#b07219",
  TypeScript: "#3178c6",
};

const SKIP_REPOS = new Set(["angelina-rodriguez", "angelinardz.github.io"]);

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function projectCard(p) {
  const card = document.createElement("div");
  card.className = "project-card";

  const title = escapeHtml(p.title);
  const url = escapeHtml(p.url);
  const demo = p.demo ? escapeHtml(p.demo) : null;
  const langColor = LANG_COLORS[p.language] || "#3457d5";
  const stats = [];
  if (typeof p.stars === "number" && p.stars > 0) {
    stats.push(`<span class="gh-stat">★ ${p.stars}</span>`);
  }
  if (demo) {
    stats.push(
      `<a class="project-card__demo" href="${demo}" target="_blank" rel="noopener" aria-label="${title} — open live demo">live demo ↗</a>`
    );
  }
  stats.push(
    `<a class="gh-stat" href="${url}" target="_blank" rel="noopener" aria-label="${title} — view repository on GitHub">repo ↗</a>`
  );

  card.innerHTML = `
    ${p.wip ? '<span class="project-card__wip">in progress</span>' : ""}
    <div class="project-card__top">
      <span class="project-card__folder">✦</span>
      <span class="project-card__links">${stats.join("")}</span>
    </div>
    <h3>${title}</h3>
    <p>${escapeHtml(p.blurb)}</p>
    <div class="project-card__meta">
      <span class="project-card__tags">${(p.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</span>
      ${
        p.language
          ? `<span class="project-card__lang"><span class="lang-dot" style="background:${langColor}"></span>${escapeHtml(p.language)}</span>`
          : ""
      }
    </div>`;

  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    window.open(p.url, "_blank", "noopener");
  });
  return card;
}

async function loadProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  let projects = [];

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const repos = await res.json();

    projects = repos
      .filter((r) => !r.fork && !SKIP_REPOS.has(r.name.toLowerCase()))
      .map((r) => {
        const details = PROJECT_DETAILS[r.name.toLowerCase()] || {};
        return {
          title: details.title || r.name,
          blurb: details.blurb || r.description || "View this project on GitHub.",
          tags: details.tags || (r.language ? [r.language] : []),
          url: r.html_url,
          demo: details.demo || r.homepage || null,
          language: r.language,
          stars: r.stargazers_count,
          priority: details.priority ?? 99,
        };
      });
  } catch (err) {
    projects = Object.entries(PROJECT_DETAILS).map(([name, d]) => ({
      ...d,
      url: `https://github.com/${GITHUB_USER}/${name}`,
    }));
  }

  projects.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  grid.innerHTML = "";
  projects.forEach((p) => grid.appendChild(projectCard(p)));
}

loadProjects();

/* ============================================================
   OS TERMINAL — mini command engine for the Terminal.app window
   ============================================================ */
(function osTerminal() {
  const output = document.getElementById("osTerminalOutput");
  const input = document.getElementById("osTerminalInput");
  const body = document.getElementById("osTerminalBody");
  if (!output || !input) return;

  function printLine(text, variant) {
    const line = document.createElement("div");
    line.className = "terminal__line" + (variant ? ` terminal__line--${variant}` : "");
    line.innerHTML = text;
    output.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  const COMMANDS = {
    help() {
      printLine("available: help, about, experience, projects, contact, play, ls, whoami, home, clear", "out");
    },
    about() { AngelinaOSWindows.openWindow("about"); printLine("opened about.md", "out"); },
    experience() { AngelinaOSWindows.openWindow("experience"); printLine("opened experience.log", "out"); },
    projects() { AngelinaOSWindows.openWindow("projects"); printLine("opened projects/", "out"); },
    contact() { AngelinaOSWindows.openWindow("contact"); printLine("opened contact.sh", "out"); },
    play() { AngelinaOSWindows.openWindow("snake"); printLine("opened Snake — click the board to play", "ok"); },
    snake() { COMMANDS.play(); },
    whoami() { printLine("Angelina Rodriguez — CS @ UT Austin. Dell Scholar. Open to internships.", "out"); },
    ls() { printLine("about.md  experience.log  projects/  contact.sh  Snake.app", "out"); },
    home() { printLine("returning to the regular site …", "out"); setTimeout(() => { window.location.href = "index.html"; }, 500); },
    clear() { output.innerHTML = ""; },
    sudo(args) {
      if (args.join(" ").toLowerCase().includes("hire")) {
        printLine("Permission granted. Let's talk.", "ok");
        AngelinaOSWindows.openWindow("contact");
        return;
      }
      printLine("Permission granted, but there's nothing to do here.", "muted");
    },
  };

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    const line = document.createElement("div");
    line.className = "terminal__line terminal__line--cmd";
    line.textContent = raw;
    output.appendChild(line);

    const [cmd, ...args] = raw.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) fn(args);
    else printLine(`command not found: ${escapeHtml(cmd)}`, "err");
    body.scrollTop = body.scrollHeight;
  });

  body.addEventListener("click", () => input.focus());
})();

/* ============================================================
   SNAKE — canvas game inside the Snake.app window
   ============================================================ */
(function snakeGame() {
  const canvas = document.getElementById("snakeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cell = 15;
  const cols = canvas.width / cell;
  const rows = canvas.height / cell;
  const scoreEl = document.getElementById("snakeScore");
  const bestEl = document.getElementById("snakeBest");
  const hintEl = document.getElementById("snakeHint");

  let best = Number(localStorage.getItem("angelina_os_snake_best") || 0);
  if (bestEl) bestEl.textContent = best;

  let snake, dir, nextDir, food, score, alive;

  function placeFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function reset() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    alive = true;
    placeFood();
    if (scoreEl) scoreEl.textContent = score;
    if (hintEl) hintEl.textContent = "arrow keys / WASD to move";
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    ctx.fillStyle = "#14161c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e2734f";
    roundRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4, 4);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#6fce93" : "#3457d5";
      roundRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2, 3);
    });

    if (!alive) {
      ctx.fillStyle = "rgba(20, 22, 28, 0.78)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f4f5f7";
      ctx.textAlign = "center";
      ctx.font = "600 16px 'Space Grotesk', sans-serif";
      ctx.fillText("game over", canvas.width / 2, canvas.height / 2 - 6);
      ctx.fillStyle = "#aab0c0";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText("click to restart", canvas.width / 2, canvas.height / 2 + 16);
    }
  }

  function gameOver() {
    alive = false;
    if (score > best) {
      best = score;
      localStorage.setItem("angelina_os_snake_best", String(best));
      if (bestEl) bestEl.textContent = best;
    }
    if (hintEl) hintEl.textContent = "game over — click or press a key to restart";
    draw();
  }

  function tick() {
    if (!alive) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitsWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    const hitsSelf = snake.some((s) => s.x === head.x && s.y === head.y);
    if (hitsWall || hitsSelf) { gameOver(); return; }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      if (scoreEl) scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  const KEY_DIR = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  };
  const RESTART_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", " "]);

  canvas.setAttribute("tabindex", "0");
  canvas.addEventListener("keydown", (e) => {
    if (!alive) {
      if (RESTART_KEYS.has(e.key)) { e.preventDefault(); reset(); draw(); }
      return;
    }
    const d = KEY_DIR[e.key];
    if (!d) return;
    e.preventDefault();
    if (snake.length > 1 && d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  });
  canvas.addEventListener("click", () => {
    canvas.focus();
    if (!alive) { reset(); draw(); }
  });

  const snakeWindow = canvas.closest(".window");
  if (snakeWindow) {
    snakeWindow.addEventListener("os:focus", () => canvas.focus());
  }

  reset();
  draw();
  setInterval(tick, 120);
})();
