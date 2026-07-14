/* ============================================================
   Angelina Rodriguez — Portfolio interactions
   ============================================================ */

const GITHUB_USER = "angelinardz";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- nav: hide on scroll down, show on scroll up ---------- */
(function navScroll() {
  const nav = document.getElementById("nav");
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      nav.classList.toggle("nav--scrolled", y > 20);
      if (!prefersReducedMotion) {
        nav.classList.toggle("nav--hidden", y > lastY && y > 200);
      }
      lastY = y;
    },
    { passive: true }
  );
})();

/* ---------- cursor glow ---------- */
(function cursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;
  let raf = null;
  window.addEventListener("mousemove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      glow.style.opacity = "1";
      raf = null;
    });
  });
})();

/* ---------- magnetic buttons ---------- */
(function magnetic() {
  if (prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
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

// Shown even if there's no public repo yet.
const EXTRA_PROJECTS = [
  {
    title: "HabitTracker",
    blurb:
      "React-based habit tracker featuring streak tracking, a built-in Pomodoro timer, and productivity graphs. Uses component-based state management with Supabase auth + storage, deployed on Vercel for secure multi-user, persistent data.",
    tags: ["React", "Supabase", "Vercel"],
    url: "https://github.com/" + GITHUB_USER,
    wip: true,
    language: "JavaScript",
    priority: 3,
  },
];

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
  card.className = "project-card reveal";

  const title = escapeHtml(p.title);
  const url = escapeHtml(p.url);
  const demo = p.demo ? escapeHtml(p.demo) : null;
  const langColor = LANG_COLORS[p.language] || "#5b8cff";
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

  // Whole card opens the repo; inner links (demo/repo) take precedence.
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

  projects = projects.concat(EXTRA_PROJECTS);
  projects.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  grid.innerHTML = "";
  projects.forEach((p, i) => {
    const card = projectCard(p);
    card.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

loadProjects();
