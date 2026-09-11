/**
 * Celano Lab Metro — static site (no server, no build step).
 *
 * How this file is organized:
 *   1. Helpers                        — tiny DOM + fetch utilities
 *   2. Content (edit these)           — TOOLS list; docs & pairs load from
 *                                       manifest.json files on disk
 *   3. Layout                         — Header / Footer / Shell
 *   4. Routes                         — Home / Docs / Tools / Contribute
 *   5. Image Compare slider           — the actual before/after widget
 *   6. Router                         — hash-based, one entry per route
 */

// ============================================================================
// 1. Helpers
// ============================================================================

const h = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function")
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
};

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function loadText(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
  return res.text();
}

// ============================================================================
// 2. Content — edit these when you add tools
// ============================================================================

/**
 * Tools shown on the Tools page. To add one:
 *   1. Add an entry here.
 *   2. If it needs interactive UI, add a renderer in TOOL_RENDERERS below.
 *      Otherwise the generic detail page is used.
 */
const TOOLS = [
  {
    id: "image-compare",
    name: "Image Compare",
    summary: "Drag-to-reveal before / after slider for two aligned images.",
    status: "ready",
    description:
      "Compare pairs of images side by side with a draggable divider. Drop " +
      "new pairs into data/image-compare/<name>/ with before + after images.",
    tags: ["images", "comparison", "afm"],
  },
];

// ============================================================================
// 3. Layout
// ============================================================================

function Header(current) {
  const link = (href, label) =>
    h(
      "a",
      {
        href,
        class:
          "nav-link text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors",
        "aria-current": current === href ? "page" : null,
      },
      label
    );

  return h(
    "header",
    {
      class: "sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-ink-100",
    },
    [
      h(
        "div",
        {
          class: "max-w-6xl mx-auto px-6 h-16 flex items-center justify-between",
        },
        [
          h("a", { href: "#/", class: "flex items-center gap-2.5 group" }, [
            h("span", {
              class:
                "inline-flex items-center justify-center w-8 h-8 rounded-md bg-maroon-700 text-white font-bold text-sm shadow-sm group-hover:shadow transition-shadow",
              html: "M",
            }),
            h("span", { class: "font-semibold text-ink-900 tracking-tight" }, [
              "Celano Lab ",
              h("span", { class: "text-ink-400 font-normal" }, "/ metro"),
            ]),
          ]),
          h("nav", { class: "flex items-center gap-7" }, [
            link("#/", "Home"),
            link("#/docs", "Docs"),
            link("#/tools", "Tools"),
          ]),
        ]
      ),
    ]
  );
}

function Footer() {
  return h(
    "footer",
    { class: "border-t border-ink-100 py-8 mt-16 text-sm text-ink-500" },
    [
      h(
        "div",
        {
          class:
            "max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3",
        },
        [
          h("div", {}, [
            "Celano Lab / Nanoelectronics Metrology & Failure Analysis — ",
            h("span", { class: "text-ink-400" }, "internal working site"),
          ]),
          h("span", { class: "text-ink-400" }, "static site · hosted on GitHub Pages"),
        ]
      ),
    ]
  );
}

function Shell(current, main) {
  return [Header(current), h("main", { class: "flex-1" }, main), Footer()];
}

function EmptyState(title, body, hint) {
  return h(
    "div",
    {
      class:
        "rounded-xl border border-dashed border-ink-200 bg-ink-50/40 p-10 text-center max-w-lg",
    },
    [
      h("div", { class: "text-base font-semibold text-ink-900 mb-1" }, title),
      h("p", { class: "text-sm text-ink-600" }, body),
      hint ? h("p", { class: "text-xs text-ink-400 mt-3" }, hint) : null,
    ]
  );
}

function ErrorState(err) {
  return h(
    "div",
    { class: "rounded-xl border border-red-100 bg-red-50 p-6 max-w-lg text-red-900" },
    [
      h("div", { class: "font-semibold mb-1" }, "Something went wrong"),
      h("p", { class: "text-sm" }, String(err && err.message ? err.message : err)),
    ]
  );
}

function StatusPill(status) {
  const cls =
    status === "ready"
      ? "pill pill-ready"
      : status === "in-progress"
      ? "pill pill-in-progress"
      : "pill pill-planned";
  return h("span", { class: cls }, [
    h("span", { class: "w-1.5 h-1.5 rounded-full bg-current opacity-60" }),
    status || "planned",
  ]);
}

// ============================================================================
// 4. Routes
// ============================================================================

function Home() {
  const feature = (href, title, body) =>
    h(
      "a",
      {
        href,
        class:
          "card block rounded-xl border border-ink-100 bg-white p-6 hover:no-underline",
      },
      [
        h("div", { class: "flex items-center justify-between mb-3" }, [
          h("h3", { class: "text-base font-semibold text-ink-900" }, title),
          h("span", { class: "text-ink-300" }, "→"),
        ]),
        h("p", { class: "text-sm text-ink-600 leading-relaxed" }, body),
      ]
    );

  return h("div", {}, [
    h(
      "section",
      { class: "hero-grid border-b border-ink-100" },
      h("div", { class: "max-w-6xl mx-auto px-6 py-20" }, [
        h(
          "div",
          {
            class:
              "inline-flex items-center gap-2 text-xs font-medium text-maroon-700 bg-maroon-50 border border-maroon-100 rounded-full px-3 py-1 mb-6",
          },
          [
            h("span", { class: "w-1.5 h-1.5 rounded-full bg-maroon-700" }),
            "Internal working site",
          ]
        ),
        h(
          "h1",
          {
            class:
              "text-4xl sm:text-5xl font-bold tracking-tight text-ink-900 max-w-3xl leading-[1.1]",
          },
          [
            "A working document for the ",
            h("span", { class: "text-maroon-700" }, "Celano Lab"),
            " metrology group.",
          ]
        ),
        h(
          "p",
          { class: "mt-5 text-lg text-ink-600 max-w-2xl leading-relaxed" },
          "Notes, protocols, and the tools we build — kept in one place so the next person can pick up where we left off."
        ),
        h("div", { class: "mt-8 flex flex-wrap gap-3" }, [
          h(
            "a",
            {
              href: "#/docs",
              class:
                "inline-flex items-center gap-2 rounded-lg bg-ink-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors",
            },
            ["Open the docs", h("span", { html: "→" })]
          ),
          h(
            "a",
            {
              href: "#/tools",
              class:
                "inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white text-ink-900 px-4 py-2.5 text-sm font-medium hover:border-ink-300 transition-colors",
            },
            "Browse tools"
          ),
        ]),
      ])
    ),
    h(
      "section",
      { class: "max-w-6xl mx-auto px-6 py-14" },
      h("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, [
        feature(
          "#/docs",
          "Docs",
          "Protocols, SOPs, lab notes, and how-tos. Add a Markdown file to docs/ and list it in docs/manifest.json."
        ),
        feature(
          "#/tools",
          "Tools",
          "Small utilities for our metrology workflows. First one up: an image compare slider."
        ),
      ])
    ),
  ]);
}

async function DocsRoute(slug) {
  const wrap = h("div", { class: "max-w-6xl mx-auto px-6 py-10" });
  const sidebar = h("aside", {
    class:
      "md:sticky md:top-24 md:self-start w-full md:w-64 shrink-0 border-r-0 md:border-r md:border-ink-100 md:pr-6",
  });
  const article = h("article", { class: "flex-1 min-w-0" });

  wrap.append(
    h("div", { class: "flex flex-col md:flex-row gap-8" }, [sidebar, article])
  );

  sidebar.append(
    h("div", { class: "space-y-2" }, [
      h("div", { class: "skeleton h-4 w-24" }),
      h("div", { class: "skeleton h-4 w-32" }),
    ])
  );
  article.append(
    h("div", { class: "space-y-3 max-w-2xl" }, [
      h("div", { class: "skeleton h-8 w-2/3" }),
      h("div", { class: "skeleton h-4 w-full" }),
      h("div", { class: "skeleton h-4 w-11/12" }),
    ])
  );

  let docs;
  try {
    docs = await loadJSON("docs/manifest.json");
  } catch (err) {
    article.innerHTML = "";
    sidebar.innerHTML = "";
    article.append(ErrorState(err));
    return wrap;
  }

  // Sidebar
  sidebar.innerHTML = "";
  sidebar.append(
    h(
      "div",
      {
        class:
          "text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3",
      },
      "Documents"
    )
  );
  if (!docs.length) {
    sidebar.append(
      h(
        "p",
        { class: "text-sm text-ink-500" },
        "No docs yet. Add a Markdown file to docs/ and list it in docs/manifest.json."
      )
    );
  } else {
    const list = h("nav", { class: "flex flex-col gap-0.5" });
    const active = slug || docs[0].slug;
    for (const d of docs) {
      list.append(
        h(
          "a",
          {
            href: `#/docs/${d.slug}`,
            class:
              "doc-link block rounded-md px-2.5 py-1.5 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors",
            "aria-current": d.slug === active ? "page" : null,
          },
          d.title
        )
      );
    }
    sidebar.append(list);
  }

  // Article
  const activeSlug = slug || (docs[0] && docs[0].slug);
  article.innerHTML = "";
  if (!activeSlug) {
    article.append(
      EmptyState(
        "No docs yet",
        "Add a Markdown file to docs/ and list it in docs/manifest.json.",
        "See README → “Add a doc”."
      )
    );
    return wrap;
  }
  const doc = docs.find((d) => d.slug === activeSlug);
  if (!doc) {
    article.append(
      EmptyState("Doc not found", `No doc with slug "${activeSlug}".`)
    );
    return wrap;
  }
  try {
    const md = await loadText(`docs/${doc.file}`);
    const html = DOMPurify.sanitize(marked.parse(md));
    article.append(h("div", { class: "prose prose-ink max-w-2xl", html }));
  } catch (err) {
    article.append(ErrorState(err));
  }

  return wrap;
}

async function ToolsRoute(id) {
  const wrap = h("div", { class: "max-w-6xl mx-auto px-6 py-10" });

  wrap.append(
    h("div", { class: "mb-8" }, [
      h(
        "h1",
        { class: "text-2xl font-semibold tracking-tight text-ink-900" },
        "Tools"
      ),
      h(
        "p",
        { class: "text-ink-600 text-sm mt-1" },
        "Small, focused utilities built by the lab."
      ),
    ])
  );

  if (id) {
    const tool = TOOLS.find((t) => t.id === id);
    if (!tool) {
      wrap.append(
        EmptyState("Tool not found", `No tool registered with id "${id}".`)
      );
      return wrap;
    }
    const specific = TOOL_RENDERERS[tool.id];
    if (specific) {
      wrap.append(await specific(tool));
    } else {
      wrap.append(GenericToolDetail(tool));
    }
    return wrap;
  }

  const grid = h("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4" });
  for (const t of TOOLS) grid.append(ToolCard(t));
  wrap.append(grid);
  return wrap;
}

function ToolCard(t) {
  return h(
    "a",
    {
      href: `#/tools/${t.id}`,
      class:
        "card group block rounded-xl border border-ink-100 bg-white p-5 hover:no-underline",
    },
    [
      h("div", { class: "flex items-start justify-between gap-3 mb-2" }, [
        h("h3", { class: "text-base font-semibold text-ink-900" }, t.name),
        StatusPill(t.status),
      ]),
      h(
        "p",
        { class: "text-sm text-ink-600 leading-relaxed" },
        t.summary || "No summary yet."
      ),
      h(
        "div",
        {
          class:
            "mt-4 pt-4 border-t border-ink-100 flex items-center justify-between",
        },
        [
          h(
            "div",
            { class: "flex flex-wrap gap-1.5" },
            (t.tags || []).map((tag) =>
              h(
                "span",
                {
                  class:
                    "text-[11px] font-medium text-ink-500 bg-ink-50 rounded px-1.5 py-0.5",
                },
                tag
              )
            )
          ),
          h(
            "span",
            {
              class:
                "text-sm text-ink-400 group-hover:text-maroon-700 transition-colors",
            },
            "Open →"
          ),
        ]
      ),
    ]
  );
}

function GenericToolDetail(t) {
  return h("div", {}, [
    h(
      "a",
      {
        href: "#/tools",
        class:
          "inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-4",
      },
      "← All tools"
    ),
    h("div", { class: "flex items-center gap-3 mb-2" }, [
      h(
        "h2",
        { class: "text-2xl font-semibold tracking-tight text-ink-900" },
        t.name
      ),
      StatusPill(t.status),
    ]),
    h(
      "p",
      { class: "text-ink-600 max-w-2xl leading-relaxed" },
      t.summary || ""
    ),
    h(
      "div",
      { class: "mt-6 max-w-2xl prose prose-ink" },
      h("p", {}, t.description || "No description yet.")
    ),
  ]);
}

// ============================================================================
// 5. Image Compare slider
// ============================================================================

const TOOL_RENDERERS = {
  "image-compare": renderImageCompare,
};

async function renderImageCompare(tool) {
  const container = h("div", {});

  container.append(
    h(
      "a",
      {
        href: "#/tools",
        class:
          "inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-4",
      },
      "← All tools"
    ),
    h("div", { class: "flex items-center gap-3 mb-1" }, [
      h(
        "h2",
        { class: "text-2xl font-semibold tracking-tight text-ink-900" },
        tool.name
      ),
      StatusPill(tool.status),
    ]),
    h(
      "p",
      { class: "text-ink-600 max-w-2xl leading-relaxed" },
      tool.summary || ""
    )
  );

  const controls = h("div", { class: "mt-8 flex flex-wrap items-center gap-3" });
  const stage = h("div", { class: "mt-4" });
  container.append(controls, stage);

  stage.append(h("div", { class: "skeleton w-full aspect-video rounded-xl" }));

  let manifest;
  try {
    manifest = await loadJSON("data/image-compare/manifest.json");
  } catch (err) {
    stage.innerHTML = "";
    stage.append(ErrorState(err));
    return container;
  }

  const pairIds = Array.isArray(manifest) ? manifest : manifest.pairs || [];
  if (!pairIds.length) {
    stage.innerHTML = "";
    stage.append(
      EmptyState(
        "No pairs yet",
        "Create a folder under data/image-compare/ with a before and after image, and add its name to data/image-compare/manifest.json.",
        "See README → “Add an image-compare pair”."
      )
    );
    return container;
  }

  // Load every pair's meta.json in parallel.
  const pairs = await Promise.all(
    pairIds.map(async (id) => {
      let meta = {};
      try {
        meta = await loadJSON(`data/image-compare/${id}/meta.json`);
      } catch {
        // meta.json is optional
      }
      const beforeExt = meta.before_ext || "svg";
      const afterExt = meta.after_ext || "svg";
      return {
        id,
        title: meta.title || prettify(id),
        description: meta.description || "",
        before_label: meta.before_label || "Before",
        after_label: meta.after_label || "After",
        before_url: `data/image-compare/${id}/before.${beforeExt}`,
        after_url: `data/image-compare/${id}/after.${afterExt}`,
      };
    })
  );

  // Selector
  const select = h(
    "select",
    {
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-2 pr-8 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
      "aria-label": "Select an image pair",
    },
    pairs.map((p) => h("option", { value: p.id }, p.title))
  );
  const resetBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-700 hover:border-ink-300 hover:text-ink-900",
      title: "Reset divider to 50%",
    },
    "Reset"
  );
  controls.append(
    h(
      "span",
      { class: "text-xs font-medium uppercase tracking-wider text-ink-400" },
      "Pair"
    ),
    select,
    resetBtn
  );

  let sliderApi = null;
  function mount(pair) {
    stage.innerHTML = "";
    const { node, api } = ImageCompareSlider(pair);
    sliderApi = api;
    stage.append(node);
  }

  mount(pairs[0]);
  select.addEventListener("change", () => {
    const p = pairs.find((x) => x.id === select.value);
    if (p) mount(p);
  });
  resetBtn.addEventListener("click", () => sliderApi && sliderApi.set(50));

  return container;
}

function prettify(id) {
  return id.replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function ImageCompareSlider(pair) {
  const KEY_STEP = 2;
  const KEY_STEP_LARGE = 10;

  const beforeImg = h("img", {
    src: pair.before_url,
    alt: pair.before_label || "Before",
    class: "block w-full h-full object-cover select-none pointer-events-none",
    draggable: "false",
  });
  const afterImg = h("img", {
    src: pair.after_url,
    alt: pair.after_label || "After",
    class: "block w-full h-full object-cover select-none pointer-events-none",
    draggable: "false",
  });

  const topLayer = h(
    "div",
    {
      class: "absolute inset-0 overflow-hidden will-change-[clip-path]",
      style: "clip-path: inset(0 50% 0 0);",
    },
    beforeImg
  );
  const bottomLayer = h("div", { class: "absolute inset-0" }, afterImg);

  const beforeBadge = h(
    "div",
    {
      class:
        "absolute top-3 left-3 z-10 rounded-md bg-black/60 text-white text-xs font-medium px-2 py-1 backdrop-blur-sm",
    },
    pair.before_label || "Before"
  );
  const afterBadge = h(
    "div",
    {
      class:
        "absolute top-3 right-3 z-10 rounded-md bg-black/60 text-white text-xs font-medium px-2 py-1 backdrop-blur-sm",
    },
    pair.after_label || "After"
  );

  const divider = h("div", {
    class:
      "absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] pointer-events-none",
    style: "left: 50%;",
  });

  const handle = h(
    "button",
    {
      type: "button",
      class:
        "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-ink-200 flex items-center justify-center text-ink-700 cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-maroon-500/60 focus:ring-offset-2 focus:ring-offset-white",
      style: "left: 50%;",
      role: "slider",
      "aria-label": "Compare position",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": "50",
      "aria-orientation": "horizontal",
      tabindex: "0",
    },
    h("span", {
      html: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 6 3 12 9 18"/>
        <polyline points="15 6 21 12 15 18"/>
      </svg>
      `,
    })
  );

  const frame = h(
    "div",
    {
      class:
        "relative w-full rounded-xl overflow-hidden border border-ink-100 bg-ink-100 aspect-video cursor-ew-resize",
    },
    [bottomLayer, topLayer, beforeBadge, afterBadge, divider, handle]
  );

  const caption = h(
    "div",
    { class: "mt-3 text-sm text-ink-600 leading-relaxed max-w-3xl" },
    pair.description || ""
  );

  const wrap = h("div", {}, [frame, caption]);

  let dragging = false;
  const setPercent = (p) => {
    const pct = Math.max(0, Math.min(100, p));
    topLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.style.left = `${pct}%`;
    handle.style.left = `${pct}%`;
    handle.setAttribute("aria-valuenow", String(Math.round(pct)));
  };
  const percentFromEvent = (ev) => {
    const rect = frame.getBoundingClientRect();
    const x =
      (ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX) -
      rect.left;
    return (x / rect.width) * 100;
  };
  const onPointerDown = (ev) => {
    dragging = true;
    setPercent(percentFromEvent(ev));
    ev.preventDefault();
  };
  const onPointerMove = (ev) => {
    if (!dragging) return;
    setPercent(percentFromEvent(ev));
  };
  const onPointerUp = () => {
    dragging = false;
  };
  frame.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  handle.addEventListener("keydown", (ev) => {
    const cur = parseFloat(handle.getAttribute("aria-valuenow") || "50");
    const step = ev.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    let next = cur;
    switch (ev.key) {
      case "ArrowLeft":  next = cur - step; break;
      case "ArrowRight": next = cur + step; break;
      case "Home":       next = 0;          break;
      case "End":        next = 100;        break;
      default: return;
    }
    ev.preventDefault();
    setPercent(next);
  });

  return { node: wrap, api: { set: setPercent } };
}

// ============================================================================
// 6. Router
// ============================================================================

const routes = [
  { pattern: /^#\/?$/,               key: "#/",         render: () => Promise.resolve(Home()) },
  { pattern: /^#\/docs\/?$/,         key: "#/docs",     render: () => DocsRoute(null) },
  { pattern: /^#\/docs\/([^/]+)\/?$/,key: "#/docs",     render: (m) => DocsRoute(decodeURIComponent(m[1])) },
  { pattern: /^#\/tools\/?$/,        key: "#/tools",    render: () => ToolsRoute(null) },
  { pattern: /^#\/tools\/([^/]+)\/?$/,key: "#/tools",   render: (m) => ToolsRoute(decodeURIComponent(m[1])) },
];

async function render() {
  const hash = location.hash || "#/";
  const match = routes
    .map((r) => ({ r, m: hash.match(r.pattern) }))
    .find((x) => x.m);

  const app = document.getElementById("app");
  app.innerHTML = "";

  if (!match) {
    app.append(
      ...Shell(
        "#/",
        h("div", { class: "max-w-3xl mx-auto px-6 py-20" }, [
          EmptyState(
            "Page not found",
            `Nothing matches "${hash}".`,
            "Try Home, Docs, or Tools in the nav."
          ),
        ])
      )
    );
    return;
  }

  try {
    const content = await match.r.render(match.m);
    app.append(...Shell(match.r.key, content));
  } catch (err) {
    app.append(
      ...Shell(
        match.r.key,
        h("div", { class: "max-w-3xl mx-auto px-6 py-20" }, [ErrorState(err)])
      )
    );
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
