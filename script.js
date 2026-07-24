/* ============================================================
   Angelina Rodriguez — Portfolio interactions
   Terminal command engine, file-explorer projects, konami egg
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

/* ============================================================
   TERMINAL ENGINE
   ============================================================ */
(function terminal() {
  const body = document.getElementById("terminalBody");
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");
  const wrap = document.getElementById("terminal");
  if (!body || !output || !input) return;

  const history = [];
  let historyIndex = -1;

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function printLine(text, variant) {
    const line = document.createElement("div");
    line.className = "terminal__line" + (variant ? ` terminal__line--${variant}` : "");
    line.innerHTML = text;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  function printCommand(text) {
    printLine(escapeHtml(text), "cmd");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function goToOS(query) {
    printLine("Access granted. Loading .angelinaos …", "ok");
    setTimeout(() => {
      window.location.href = "os.html" + (query ? `?${query}` : "");
    }, 700);
  }

  const COMMANDS = {
    help() {
      printLine("available commands:", "out");
      [
        ["help", "show this list"],
        ["about", "jump to the about section"],
        ["experience", "jump to experience"],
        ["projects", "jump to the projects explorer"],
        ["contact", "jump to contact"],
        ["whoami", "print a one-line bio"],
        ["skills", "list languages & tools"],
        ["resume", "how to get my resume"],
        ["ls", "list site contents"],
        ["clear", "clear the terminal"],
        ["sudo hire-angelina", "…worth a shot"],
      ].forEach(([cmd, desc]) => {
        printLine(`  <span class="terminal__line--accent" style="display:inline-block;width:9.5rem">${cmd}</span>${desc}`, "out");
      });
      printLine("psst — there's more hidden on this site than what's in this list.", "muted");
    },
    about() { printLine("opening about.md …", "out"); scrollToSection("about"); },
    experience() { printLine("opening experience.log …", "out"); scrollToSection("experience"); },
    projects() { printLine("opening projects/ …", "out"); scrollToSection("projects"); },
    contact() { printLine("opening contact.sh …", "out"); scrollToSection("contact"); },
    whoami() {
      printLine("Angelina Rodriguez — CS student @ UT Austin. Interested in ML/AI and software engineering.", "out");
      printLine("Dell Scholar · first-gen college student · open to internships.", "muted");
    },
    skills() {
      printLine("languages: Python, Java, JavaScript, HTML &amp; CSS, SQL", "out");
      printLine("tools: Git &amp; GitHub, VS Code, Tableau, Flask, Linux", "out");
    },
    resume() {
      printLine("no PDF hosted yet — the fastest path is straight to my inbox:", "out");
      printLine('<a href="mailto:angelinardz06@gmail.com">angelinardz06@gmail.com</a>', "out");
    },
    ls() {
      printLine("about.md   experience.log   projects/   contact.sh   .angelinaos", "out");
    },
    clear() { output.innerHTML = ""; },
    date() { printLine(new Date().toString(), "out"); },
    echo(args) { printLine(escapeHtml(args.join(" ")), "out"); },
    pwd() { printLine("/home/guest/angelina-rodriguez", "out"); },
    os() { goToOS(); },
    "cd"(args) {
      const target = (args[0] || "").replace(/^\.\//, "").replace(/\/$/, "");
      if (target === ".angelinaos" || target === "os" || target === "angelinaos") return goToOS();
      if (["about", "experience", "projects", "contact"].includes(target)) return COMMANDS[target]();
      printLine(`cd: no such file or directory: ${escapeHtml(target || "")}`, "err");
    },
    sudo(args) {
      const joined = args.join(" ").toLowerCase();
      if (joined.includes("hire")) {
        printLine("[sudo] password for recruiter: ********", "muted");
        printLine("Permission granted. Excellent choice — let's talk.", "ok");
        scrollToSection("contact");
        return;
      }
      if (joined.includes("rm") || joined.includes("shutdown")) {
        printLine("Nice try. This portfolio is read-only. 😉", "err");
        return;
      }
      printLine("Permission granted, but there's nothing to do here.", "muted");
    },
    play() { printLine("Loading snake.exe …", "out"); goToOS("open=snake"); },
    snake() { COMMANDS.play(); },
    konami() {
      printLine("↑ ↑ ↓ ↓ ← → ← → B A", "accent");
      printLine("🔓 achievement unlocked — check the bottom of the screen.", "ok");
      unlockKonamiToast();
    },
  };

  const ALIASES = { home: "about", top: "about" };

  function run(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    printCommand(trimmed);
    history.push(trimmed);
    historyIndex = history.length;

    const parts = trimmed.split(/\s+/);
    let cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (ALIASES[cmd]) cmd = ALIASES[cmd];

    if (COMMANDS[cmd]) {
      COMMANDS[cmd](args);
    } else {
      printLine(`command not found: ${escapeHtml(cmd)} — type <span class="terminal__line--accent">help</span>`, "err");
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) { historyIndex -= 1; input.value = history[historyIndex]; }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (historyIndex < history.length - 1) { historyIndex += 1; input.value = history[historyIndex]; }
      else { historyIndex = history.length; input.value = ""; }
      e.preventDefault();
    }
  });

  wrap.addEventListener("click", () => input.focus());

  /* ---------- boot sequence ---------- */
  function boot() {
    const now = new Date();
    printLine(`Last login: ${now.toDateString()} on ttys001`, "muted");
    printLine("whoami", "cmd");
    printLine("Angelina Rodriguez — CS @ UT Austin · interested in ML/AI &amp; software engineering", "ok");
    printLine("type <span class=\"terminal__line--accent\">help</span> to see what this terminal can do.", "muted");
  }
  boot();
})();

/* ============================================================
   PROJECTS: live from GitHub, rendered as a file explorer
   ============================================================ */

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
  JavaScript: "#e8b93b",
  HTML: "#e2734f",
  CSS: "#7c5cbf",
  Java: "#b07219",
  TypeScript: "#3178c6",
};

const LANG_EXT = {
  Python: "py",
  JavaScript: "js",
  HTML: "html",
  CSS: "css",
  Java: "java",
  TypeScript: "ts",
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

function fileNameFor(p) {
  const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const ext = LANG_EXT[p.language] || "md";
  return `${slug}.${ext}`;
}

function renderPanel(p) {
  const panel = document.getElementById("projectsPanel");
  const langColor = LANG_COLORS[p.language] || "#3457d5";
  const demo = p.demo
    ? `<a href="${escapeHtml(p.demo)}" target="_blank" rel="noopener" class="is-primary">live demo ↗</a>`
    : "";

  panel.innerHTML = `
    <div class="panel-project__top">
      <h3 class="panel-project__title">${escapeHtml(p.title)}</h3>
      ${p.wip ? '<span class="panel-project__badge">in progress</span>' : ""}
    </div>
    <p class="panel-project__blurb">${escapeHtml(p.blurb)}</p>
    <div class="panel-project__meta">
      <div class="panel-project__tags">${(p.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
      ${
        p.language
          ? `<span class="panel-project__lang"><span class="lang-dot" style="background:${langColor}"></span>${escapeHtml(p.language)}</span>`
          : ""
      }
      ${typeof p.stars === "number" && p.stars > 0 ? `<span class="panel-project__lang">★ ${p.stars}</span>` : ""}
    </div>
    <div class="panel-project__links">
      ${demo}
      <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">view repo ↗</a>
    </div>`;
}

function treeItem(p, index) {
  const btn = document.createElement("button");
  btn.className = "tree-item";
  btn.type = "button";
  btn.dataset.index = index;
  const name = fileNameFor(p);
  const dot = LANG_COLORS[p.language] || "#3457d5";
  const dotIndex = name.lastIndexOf(".");
  btn.innerHTML = `
    <span class="tree-item__dot" style="background:${dot}"></span>
    <span>${escapeHtml(name.slice(0, dotIndex))}<span class="tree-item__ext">${escapeHtml(name.slice(dotIndex))}</span></span>`;
  return btn;
}

async function loadProjects() {
  const tree = document.getElementById("projectsTree");
  const panel = document.getElementById("projectsPanel");
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

  if (!projects.length) {
    panel.innerHTML = '<p class="panel-project__empty">No projects found.</p>';
    return;
  }

  const items = [];
  projects.forEach((p, i) => {
    const item = treeItem(p, i);
    item.addEventListener("click", () => {
      items.forEach((el) => el.classList.remove("is-active"));
      item.classList.add("is-active");
      renderPanel(p);
    });
    items.push(item);
    tree.appendChild(item);
  });

  items[0].classList.add("is-active");
  renderPanel(projects[0]);
}

loadProjects();

/* ============================================================
   KONAMI CODE EASTER EGG
   ============================================================ */
function unlockKonamiToast() {
  const toast = document.getElementById("konamiToast");
  if (!toast) return;
  toast.innerHTML = '🔓 achievement unlocked — <a href="os.html">enter AngelinaOS</a>';
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 6000);
}

(function konami() {
  const sequence = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];
  let pos = 0;
  const toast = document.getElementById("konamiToast");
  if (!toast) return;

  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === sequence[pos]) {
      pos += 1;
      if (pos === sequence.length) {
        pos = 0;
        unlockKonamiToast();
      }
    } else {
      pos = key === sequence[0] ? 1 : 0;
    }
  });
})();
