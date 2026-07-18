/* ============================================================
   Angelina Rodriguez — Portfolio interactions
   "AngelinaOS" — window manager + dock + live GitHub projects
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
(function windowManager() {
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
  }

  function toggleWindow(name) {
    const win = getWindow(name);
    if (!win) return;
    if (isMobile()) {
      win.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
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

/* ---------- projects: live from GitHub ---------- */

// Curated resume descriptions keyed by repo name (lowercased).
// Repos not listed here fall back to their GitHub description.
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
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  TypeScript: "#3178c6",
};

const SKIP_REPOS = new Set(["angelina-rodriguez", "angelinardz.github.io"]); // profile README + this portfolio's own repo

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
  const langColor = LANG_COLORS[p.language] || "#b9a3cc";
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
    // Offline or rate-limited: fall back to curated static cards.
    projects = Object.entries(PROJECT_DETAILS).map(([name, d]) => ({
      ...d,
      url: `https://github.com/${GITHUB_USER}/${name}`,
    }));
  }

  projects.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  grid.innerHTML = "";
  projects.forEach((p) => {
    const card = projectCard(p);
    grid.appendChild(card);
  });
}

loadProjects();
