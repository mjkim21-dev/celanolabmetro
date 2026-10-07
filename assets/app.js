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

function embeddedFile(path) {
  const bag = window.__EMBEDDED_FILES__;
  if (!bag || bag[path] == null) return null;
  return bag[path];
}

async function loadJSON(path) {
  const text = await loadText(path);
  return JSON.parse(text);
}

async function loadText(path) {
  // Opening index.html directly (file://) blocks fetch(). The pages are
  // copied into assets/embedded-files.js for that case.
  if (location.protocol === "file:") {
    const cached = embeddedFile(path);
    if (cached != null) return cached;
    throw new Error(
      `${path}: the browser blocked this read because the page was opened as a file.`
    );
  }
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
    summary: "Drag-to-reveal trace / retrace slider for two aligned images.",
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
              html: "C",
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
//
// Features:
//   - Load pairs from data/image-compare/ (via manifest.json + meta.json)
//   - OR drag-drop / click-to-upload before + after images from disk
//   - Each image keeps its real aspect ratio. The frame fits both, so a
//     square scan is not cropped into 16:9.
//   - Shared physical scale: before_scan_size_nm / after_scan_size_nm are
//     the image widths. When both are set, 1 nm is the same length on both
//     images and the smaller field of view sits inside the larger one.
//   - An extra similarity transform (scale + translation) nudges the AFTER
//     image on top of that match. Three ways to set it:
//       1. Scan widths (metadata or the nm inputs).
//       2. 2-point calibration: 2 points on BEFORE, then the same 2 on AFTER.
//       3. Manual controls: scale + x/y offset (fractions of the before image).
//   - Save the current pair (images + meta.json + transform) as a ZIP.
//
// World units: the before image's width is 1. tx is a fraction of that
// width, ty a fraction of the before height, both offsetting the after
// image's center from the before image's center. scale multiplies the
// after size (1 = the scan-width match, or the same displayed width when
// scan widths are unknown).

const TOOL_RENDERERS = {
  "image-compare": renderImageCompare,
};

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"];

// ---- transform math -------------------------------------------------------

function positiveOrNull(value) {
  if (value === "" || value == null) return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Layout both images in a shared world where the before width is 1 and
 * pixels are square. Scan widths (nm) set the after/before size ratio.
 * The frame is the bounding box of both, so neither image is cropped.
 *
 * Returns rects {x, y, w, h} in world units (origin at the before center)
 * plus the frame bounds.
 */
function layoutPair(beforeNat, afterNat, beforeScanNm, afterScanNm, transform) {
  const t = transform || { scale: 1, tx: 0, ty: 0 };
  const bw = Math.max(beforeNat.w, 1);
  const bh = Math.max(beforeNat.h, 1);
  const aw = Math.max(afterNat.w, 1);
  const ah = Math.max(afterNat.h, 1);

  const beforeW = 1;
  const beforeH = bh / bw;
  const beforeRect = { x: -beforeW / 2, y: -beforeH / 2, w: beforeW, h: beforeH };

  const ratio =
    beforeScanNm > 0 && afterScanNm > 0 ? afterScanNm / beforeScanNm : 1;
  const scale = Number.isFinite(t.scale) && t.scale > 0 ? t.scale : 1;
  const afterW = ratio * scale;
  const afterH = afterW * (ah / aw);
  const cx = (t.tx || 0) * beforeW;
  const cy = (t.ty || 0) * beforeH;
  const afterRect = { x: cx - afterW / 2, y: cy - afterH / 2, w: afterW, h: afterH };

  const minX = Math.min(beforeRect.x, afterRect.x);
  const minY = Math.min(beforeRect.y, afterRect.y);
  const maxX = Math.max(beforeRect.x + beforeRect.w, afterRect.x + afterRect.w);
  const maxY = Math.max(beforeRect.y + beforeRect.h, afterRect.y + afterRect.h);
  const bounds = {
    minX,
    minY,
    frameW: Math.max(maxX - minX, 1e-6),
    frameH: Math.max(maxY - minY, 1e-6),
  };
  return { beforeRect, afterRect, bounds };
}

/**
 * Map two point pairs, in each image's own 0–1 coordinates, onto a
 * {scale, tx, ty} that lines the after image up with the before image.
 * beforeRect / afterRect must be the identity layout (scale 1, no offset)
 * the user was looking at when they clicked.
 */
function solveAlignment(b1, b2, a1, a2, beforeRect, afterRect) {
  const world = (local, rect) => ({
    x: rect.x + local.x * rect.w,
    y: rect.y + local.y * rect.h,
  });
  const wb1 = world(b1, beforeRect);
  const wb2 = world(b2, beforeRect);
  const dB = Math.hypot(wb2.x - wb1.x, wb2.y - wb1.y);
  const dA = Math.hypot((a2.x - a1.x) * afterRect.w, (a2.y - a1.y) * afterRect.h);
  const scale = dA > 1e-9 ? dB / dA : 1;

  const midB = { x: (wb1.x + wb2.x) / 2, y: (wb1.y + wb2.y) / 2 };
  const midA = { x: (a1.x + a2.x) / 2, y: (a1.y + a2.y) / 2 };
  const center = {
    x: midB.x - (midA.x - 0.5) * afterRect.w * scale,
    y: midB.y - (midA.y - 0.5) * afterRect.h * scale,
  };
  return {
    scale,
    tx: center.x / beforeRect.w,
    ty: center.y / beforeRect.h,
  };
}

function describeScale(beforeNm, afterNm) {
  if (beforeNm && afterNm) {
    const rel = afterNm / beforeNm;
    return `Matched to scan width: the retrace image is ${rel.toFixed(2)}× the trace width, so the same distance has the same size. The smaller scan sits inside the larger one. Scale 1 keeps that match.`;
  }
  return "Each image keeps its real aspect ratio. Enter both scan widths, or use Calibrate scale, to line up different fields of view.";
}

// ---- helpers --------------------------------------------------------------

function extOf(file) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
function isImageFile(file) {
  return file && IMAGE_EXTS.includes(extOf(file));
}
function urlFor(fileOrUrl) {
  if (!fileOrUrl) return null;
  if (typeof fileOrUrl === "string") return fileOrUrl;
  return URL.createObjectURL(fileOrUrl);
}
function toast(msg, ms = 2000) {
  const el = h("div", { class: "toast" }, msg);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

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

  // ---- Top toolbar: pair dropdown + Upload + Save ------------------------
  const toolbar = h("div", { class: "mt-8 flex flex-wrap items-center gap-3" });
  const uploadPanel = h("div", {
    class: "mt-4 hidden rounded-xl border border-ink-100 bg-ink-50/40 p-4",
  });
  const stage = h("div", { class: "mt-4" });
  const transformPanel = h("div", { class: "mt-4 flex flex-wrap items-end gap-3" });
  container.append(toolbar, uploadPanel, stage, transformPanel);

  stage.append(h("div", { class: "skeleton w-full min-h-[240px] rounded-xl" }));

  // ---- Load repo pairs ---------------------------------------------------
  let repoPairs = [];
  try {
    const manifest = await loadJSON("data/image-compare/manifest.json");
    const pairIds = Array.isArray(manifest) ? manifest : manifest.pairs || [];
    repoPairs = await Promise.all(
      pairIds.map(async (id) => {
        let meta = {};
        try {
          meta = await loadJSON(`data/image-compare/${id}/meta.json`);
        } catch {}
        const beforeExt = meta.before_ext || "svg";
        const afterExt = meta.after_ext || "svg";
        return {
          id,
          source: "repo",
          title: meta.title || prettify(id),
          description: meta.description || "",
          before_label: meta.before_label || "Trace",
          after_label: meta.after_label || "Retrace",
          before_ext: beforeExt,
          after_ext: afterExt,
          before_scan_size_nm: meta.before_scan_size_nm ?? null,
          after_scan_size_nm: meta.after_scan_size_nm ?? null,
          transform: meta.transform || null,
          before_url: `data/image-compare/${id}/before.${beforeExt}`,
          after_url: `data/image-compare/${id}/after.${afterExt}`,
          before_file: null,
          after_file: null,
        };
      })
    );
  } catch (err) {
    stage.innerHTML = "";
    stage.append(ErrorState(err));
    return container;
  }

  // ---- Toolbar UI --------------------------------------------------------
  const select = h(
    "select",
    {
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-2 pr-8 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
      "aria-label": "Select an image pair",
    },
    [
      ...repoPairs.map((p) => h("option", { value: p.id }, p.title)),
      h("option", { value: "__custom__", disabled: "" }, "— uploaded (custom) —"),
    ]
  );
  const uploadBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-700 hover:border-ink-300 hover:text-ink-900 inline-flex items-center gap-1.5",
    },
    ["+ Upload pair"]
  );
  const saveBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md bg-ink-900 text-white px-3 py-2 hover:bg-ink-800 inline-flex items-center gap-1.5",
      title: "Bundle current pair as a ZIP you can drop into data/image-compare/",
    },
    "Save pair to repo"
  );
  toolbar.append(
    h(
      "span",
      { class: "text-xs font-medium uppercase tracking-wider text-ink-400" },
      "Pair"
    ),
    select,
    uploadBtn,
    h("span", { class: "flex-1" }),
    saveBtn
  );

  // ---- Upload panel ------------------------------------------------------
  const uploadState = { before: null, after: null };
  const beforeZone = FileDropZone("Trace", (file) => {
    uploadState.before = file;
    maybeLoadUploaded();
  });
  const afterZone = FileDropZone("Retrace", (file) => {
    uploadState.after = file;
    maybeLoadUploaded();
  });
  uploadPanel.append(
    h("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-3" }, [
      beforeZone.node,
      afterZone.node,
    ]),
    h(
      "p",
      { class: "mt-3 text-xs text-ink-500" },
      "Drop or click each zone. When both are set the pair loads automatically. Nothing leaves your browser."
    )
  );
  uploadBtn.addEventListener("click", () => {
    uploadPanel.classList.toggle("hidden");
  });

  function maybeLoadUploaded() {
    if (!uploadState.before || !uploadState.after) return;
    const pair = {
      id: null,
      source: "upload",
      title: "Uploaded pair",
      description: "",
      before_label: "Trace",
      after_label: "Retrace",
      before_ext: extOf(uploadState.before),
      after_ext: extOf(uploadState.after),
      before_scan_size_nm: null,
      after_scan_size_nm: null,
      transform: null,
      before_url: urlFor(uploadState.before),
      after_url: urlFor(uploadState.after),
      before_file: uploadState.before,
      after_file: uploadState.after,
    };
    // Select the (disabled) custom entry visually.
    select.value = "__custom__";
    loadPair(pair);
    uploadPanel.classList.add("hidden");
  }

  // ---- Transform state + panel ------------------------------------------
  // The current pair's after-image transform. Kept as {scale, tx, ty} in
  // frame-normalized units (0 = no offset, 1 = full-frame offset).
  let currentPair = null;
  let currentTransform = { scale: 1, tx: 0, ty: 0 };
  let sliderApi = null;

  const beforeScanInput = h("input", {
    type: "number",
    step: "any",
    min: "0",
    placeholder: "—",
    class:
      "num-input text-sm rounded-md border border-ink-200 bg-white px-2 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
    title: "Horizontal field of view of the trace image, in nanometers",
  });
  const afterScanInput = h("input", {
    type: "number",
    step: "any",
    min: "0",
    placeholder: "—",
    class:
      "num-input text-sm rounded-md border border-ink-200 bg-white px-2 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
    title: "Horizontal field of view of the retrace image, in nanometers",
  });
  const scaleInput = h("input", {
    type: "number",
    step: "0.01",
    min: "0.001",
    max: "1000",
    value: "1.00",
    class:
      "num-input text-sm rounded-md border border-ink-200 bg-white px-2 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const txInput = h("input", {
    type: "number",
    step: "0.5",
    value: "0",
    class:
      "num-input text-sm rounded-md border border-ink-200 bg-white px-2 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const tyInput = h("input", {
    type: "number",
    step: "0.5",
    value: "0",
    class:
      "num-input text-sm rounded-md border border-ink-200 bg-white px-2 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const calibrateBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md border border-maroon-700 bg-white text-maroon-700 px-3 py-1.5 hover:bg-maroon-50",
    },
    "Calibrate scale"
  );
  const resetBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-1.5 text-ink-700 hover:border-ink-300 hover:text-ink-900",
    },
    "Reset transform"
  );

  const field = (label, input) =>
    h("div", { class: "flex flex-col gap-1" }, [
      h(
        "label",
        {
          class:
            "text-[11px] font-semibold uppercase tracking-wider text-ink-400",
        },
        label
      ),
      input,
    ]);

  const scaleNote = h("p", { class: "w-full text-xs text-ink-500 leading-relaxed" }, describeScale(null, null));

  transformPanel.append(
    calibrateBtn,
    field("Trace width (nm)", beforeScanInput),
    field("Retrace width (nm)", afterScanInput),
    field("Scale", scaleInput),
    field("X offset (%)", txInput),
    field("Y offset (%)", tyInput),
    resetBtn,
    scaleNote
  );

  const pushView = () => {
    const beforeScanNm = positiveOrNull(beforeScanInput.value);
    const afterScanNm = positiveOrNull(afterScanInput.value);
    if (currentPair) {
      currentPair.before_scan_size_nm = beforeScanNm;
      currentPair.after_scan_size_nm = afterScanNm;
    }
    sliderApi &&
      sliderApi.setView({
        transform: currentTransform,
        beforeScanNm,
        afterScanNm,
      });
    scaleNote.textContent = describeScale(beforeScanNm, afterScanNm);
  };

  const applyTransformFromInputs = () => {
    currentTransform = {
      scale: parseFloat(scaleInput.value) || 1,
      tx: (parseFloat(txInput.value) || 0) / 100,
      ty: (parseFloat(tyInput.value) || 0) / 100,
    };
    pushView();
  };
  [scaleInput, txInput, tyInput, beforeScanInput, afterScanInput].forEach((el) =>
    el.addEventListener("input", applyTransformFromInputs)
  );

  const writeInputsFromTransform = (t) => {
    scaleInput.value = t.scale.toFixed(2);
    txInput.value = (t.tx * 100).toFixed(1);
    tyInput.value = (t.ty * 100).toFixed(1);
  };

  const setTransform = (t) => {
    currentTransform = t;
    writeInputsFromTransform(t);
    pushView();
  };

  resetBtn.addEventListener("click", () => {
    setTransform({ scale: 1, tx: 0, ty: 0 });
  });

  calibrateBtn.addEventListener("click", () => {
    if (!sliderApi) return;
    // Reset transform so calibration clicks land on the raw image.
    setTransform({ scale: 1, tx: 0, ty: 0 });
    sliderApi.startCalibration((newTransform) => {
      setTransform(newTransform);
      toast("Calibrated — retrace image aligned to trace");
    });
  });

  // ---- Loading a pair ----------------------------------------------------

  function loadPair(pair) {
    currentPair = pair;
    stage.innerHTML = "";
    const { node, api } = ImageCompareSlider(pair);
    sliderApi = api;
    stage.append(node);

    // Scan widths size the images. A saved transform is an extra nudge
    // on top of that match (scale 1 = scan widths already agree).
    beforeScanInput.value =
      pair.before_scan_size_nm != null ? String(pair.before_scan_size_nm) : "";
    afterScanInput.value =
      pair.after_scan_size_nm != null ? String(pair.after_scan_size_nm) : "";
    let initial = { scale: 1, tx: 0, ty: 0 };
    if (pair.transform && typeof pair.transform.scale === "number") {
      initial = {
        scale: pair.transform.scale,
        tx: pair.transform.tx || 0,
        ty: pair.transform.ty || 0,
      };
    }
    setTransform(initial);
  }

  select.addEventListener("change", () => {
    const p = repoPairs.find((x) => x.id === select.value);
    if (p) loadPair(p);
  });

  saveBtn.addEventListener("click", () => {
    if (!currentPair) return;
    openSavePairModal(currentPair, currentTransform);
  });

  // ---- Initial load ------------------------------------------------------
  if (repoPairs.length) {
    loadPair(repoPairs[0]);
  } else {
    stage.innerHTML = "";
    stage.append(
      EmptyState(
        "No pairs yet",
        "Click “+ Upload pair” to load two images from your machine, or drop a pair into data/image-compare/.",
        "See docs → “Image Compare”."
      )
    );
    uploadPanel.classList.remove("hidden");
  }

  return container;
}

function prettify(id) {
  return id.replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Compact drag-drop + click-to-pick zone for a single image. */
function FileDropZone(label, onFile) {
  const input = h("input", {
    type: "file",
    accept: "image/*",
    class: "hidden",
  });
  const preview = h("div", {
    class: "mt-2 text-xs text-ink-500 truncate",
  }, "no file yet");

  const node = h(
    "label",
    {
      class:
        "dropzone flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed border-ink-200 bg-white px-4 py-6 hover:border-ink-300 text-center",
    },
    [
      h(
        "div",
        { class: "text-sm font-medium text-ink-800" },
        [label, h("span", { class: "text-ink-400 font-normal" }, "  · drop or click")]
      ),
      preview,
      input,
    ]
  );

  const setFile = (file) => {
    if (!file || !isImageFile(file)) {
      preview.textContent = "not an image file";
      return;
    }
    preview.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
    node.classList.add("dropzone--filled");
    onFile(file);
  };

  input.addEventListener("change", () => {
    if (input.files && input.files[0]) setFile(input.files[0]);
  });
  node.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    node.classList.add("dropzone--over");
  });
  node.addEventListener("dragleave", () => {
    node.classList.remove("dropzone--over");
  });
  node.addEventListener("drop", (ev) => {
    ev.preventDefault();
    node.classList.remove("dropzone--over");
    const file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (file) setFile(file);
  });

  return { node, setFile };
}

function ImageCompareSlider(pair) {
  const KEY_STEP = 2;
  const KEY_STEP_LARGE = 10;

  const beforeImg = h("img", {
    src: pair.before_url,
    alt: pair.before_label || "Trace",
    class: "absolute select-none pointer-events-none",
    draggable: "false",
    style: "object-fit: contain; max-width: none;",
  });
  const afterImg = h("img", {
    src: pair.after_url,
    alt: pair.after_label || "Retrace",
    class: "absolute select-none pointer-events-none",
    draggable: "false",
    style: "object-fit: contain; max-width: none;",
  });

  const topLayer = h(
    "div",
    {
      class: "absolute inset-0 overflow-hidden will-change-[clip-path] bg-ink-100",
      style: "clip-path: inset(0 50% 0 0);",
    },
    beforeImg
  );
  const bottomLayer = h("div", { class: "absolute inset-0 overflow-hidden" }, afterImg);

  const beforeBadge = h(
    "div",
    {
      class:
        "absolute top-3 left-3 z-10 rounded-md bg-black/60 text-white text-xs font-medium px-2 py-1 backdrop-blur-sm",
    },
    pair.before_label || "Trace"
  );
  const afterBadge = h(
    "div",
    {
      class:
        "absolute top-3 right-3 z-10 rounded-md bg-black/60 text-white text-xs font-medium px-2 py-1 backdrop-blur-sm",
    },
    pair.after_label || "Retrace"
  );

  const divider = h("div", {
    class:
      "slider-divider absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] pointer-events-none",
    style: "left: 50%;",
  });

  const handle = h(
    "button",
    {
      type: "button",
      class:
        "slider-handle absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-ink-200 flex items-center justify-center text-ink-700 cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-maroon-500/60 focus:ring-offset-2 focus:ring-offset-white",
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

  // Calibration overlay (label + progress). Hidden except during calibration.
  const calibHud = h(
    "div",
    {
      class:
        "hidden absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-md bg-maroon-700 text-white text-xs font-medium px-3 py-1.5 shadow-lg",
    },
    ""
  );
  const cancelCalibBtn = h(
    "button",
    {
      type: "button",
      class:
        "hidden absolute top-3 right-3 z-30 rounded-md bg-white/90 text-ink-800 text-xs font-medium px-2 py-1 border border-ink-200 hover:bg-white",
    },
    "Cancel"
  );

  const dotsLayer = h("div", { class: "absolute inset-0 pointer-events-none z-20" });

  const frame = h(
    "div",
    {
      class:
        "slider-frame relative mx-auto rounded-xl overflow-hidden border border-ink-100 bg-ink-100 cursor-ew-resize",
    },
    [
      bottomLayer,
      topLayer,
      beforeBadge,
      afterBadge,
      divider,
      handle,
      dotsLayer,
      calibHud,
      cancelCalibBtn,
    ]
  );

  const caption = h(
    "div",
    { class: "mt-3 text-sm text-ink-600 leading-relaxed max-w-3xl" },
    pair.description || ""
  );

  const wrap = h("div", {}, [frame, caption]);

  // ---- Slider drag / keyboard -------------------------------------------
  let dragging = false;
  let calibrating = false;
  let percent = 50;
  const setPercent = (p) => {
    percent = Math.max(0, Math.min(100, p));
    topLayer.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    divider.style.left = `${percent}%`;
    handle.style.left = `${percent}%`;
    handle.setAttribute("aria-valuenow", String(Math.round(percent)));
  };
  const percentFromEvent = (ev) => {
    const rect = frame.getBoundingClientRect();
    const x =
      (ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX) -
      rect.left;
    return (x / rect.width) * 100;
  };
  const onPointerDown = (ev) => {
    if (calibrating) return; // clicks are handled by calibration layer
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

  // ---- Shared-scale layout ------------------------------------------------
  // Images are placed in percentages of the frame. The frame's aspect ratio
  // is the bounding box of both images, so neither one is cropped.

  let view = {
    transform: { scale: 1, tx: 0, ty: 0 },
    beforeScanNm: pair.before_scan_size_nm,
    afterScanNm: pair.after_scan_size_nm,
  };
  let nat = null;
  let layout = null;

  const placeImage = (img, rect, bounds) => {
    img.style.left = `${((rect.x - bounds.minX) / bounds.frameW) * 100}%`;
    img.style.top = `${((rect.y - bounds.minY) / bounds.frameH) * 100}%`;
    img.style.width = `${(rect.w / bounds.frameW) * 100}%`;
    img.style.height = `${(rect.h / bounds.frameH) * 100}%`;
  };

  const applyLayout = () => {
    if (!nat) return;
    const next = layoutPair(
      nat.before,
      nat.after,
      view.beforeScanNm,
      view.afterScanNm,
      view.transform
    );
    layout = next;
    placeImage(beforeImg, next.beforeRect, next.bounds);
    placeImage(afterImg, next.afterRect, next.bounds);
    const aspect = next.bounds.frameW / next.bounds.frameH;
    frame.style.setProperty("--slider-aspect", String(aspect));
  };

  const setView = (next) => {
    view = {
      transform: next.transform || view.transform,
      beforeScanNm: positiveOrNull(next.beforeScanNm),
      afterScanNm: positiveOrNull(next.afterScanNm),
    };
    applyLayout();
  };

  const readNat = (img) =>
    new Promise((resolve) => {
      const done = () =>
        resolve({
          w: img.naturalWidth || 1,
          h: img.naturalHeight || 1,
        });
      if (img.complete && img.naturalWidth) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", () => resolve({ w: 1, h: 1 }), { once: true });
      }
    });
  Promise.all([readNat(beforeImg), readNat(afterImg)]).then(([before, after]) => {
    nat = { before, after };
    applyLayout();
  });

  // ---- Calibration mode -------------------------------------------------
  //
  // The user clicks 2 points on BEFORE, then 2 on AFTER. Clicks that miss
  // the image are ignored. Points are stored in each image's own 0–1 space
  // so a letterboxed scan still measures the real picture.

  let calibClicks = { before: [], after: [] };
  let onCalibrationDone = null;

  const framePointToLocal = (pt, rect, bounds) => {
    const worldX = bounds.minX + pt.x * bounds.frameW;
    const worldY = bounds.minY + pt.y * bounds.frameH;
    return {
      x: (worldX - rect.x) / rect.w,
      y: (worldY - rect.y) / rect.h,
    };
  };

  const clearDots = () => (dotsLayer.innerHTML = "");
  const drawDot = (pt, label, cls) => {
    const dot = h(
      "div",
      {
        class: `calib-dot ${cls || ""}`,
        style: `left: ${pt.x * 100}%; top: ${pt.y * 100}%;`,
      },
      String(label)
    );
    dotsLayer.append(dot);
  };
  const updateCalibHud = () => {
    if (calibClicks.before.length < 2) {
      calibHud.textContent = `Calibrate: click 2 points on TRACE (${calibClicks.before.length}/2)`;
    } else {
      calibHud.textContent = `Calibrate: click 2 corresponding points on RETRACE (${calibClicks.after.length}/2)`;
    }
  };
  const endCalibration = (transform) => {
    calibrating = false;
    frame.classList.remove("slider-frame--calibrating");
    calibHud.classList.add("hidden");
    cancelCalibBtn.classList.add("hidden");
    clearDots();
    calibClicks = { before: [], after: [] };
    if (transform && onCalibrationDone) onCalibrationDone(transform);
    onCalibrationDone = null;
  };

  const onCalibClick = (ev) => {
    if (!calibrating || !layout) return;
    if (ev.target === cancelCalibBtn) return;
    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pt = {
      x: (ev.clientX - rect.left) / rect.width,
      y: (ev.clientY - rect.top) / rect.height,
    };
    const onBefore = calibClicks.before.length < 2;
    const imageRect = onBefore ? layout.beforeRect : layout.afterRect;
    const local = framePointToLocal(pt, imageRect, layout.bounds);
    if (local.x < -0.02 || local.x > 1.02 || local.y < -0.02 || local.y > 1.02) return;
    const clamped = {
      x: Math.min(1, Math.max(0, local.x)),
      y: Math.min(1, Math.max(0, local.y)),
    };
    if (onBefore) {
      calibClicks.before.push(clamped);
      drawDot(pt, calibClicks.before.length, "");
      if (calibClicks.before.length === 2) setPercent(0);
    } else if (calibClicks.after.length < 2) {
      calibClicks.after.push(clamped);
      drawDot(pt, calibClicks.after.length, "calib-dot--after");
      if (calibClicks.after.length === 2) {
        const [b1, b2] = calibClicks.before;
        const [a1, a2] = calibClicks.after;
        const transform = solveAlignment(b1, b2, a1, a2, layout.beforeRect, layout.afterRect);
        setTimeout(() => endCalibration(transform), 250);
        return;
      }
    }
    updateCalibHud();
  };
  frame.addEventListener("click", onCalibClick);
  cancelCalibBtn.addEventListener("click", () => endCalibration(null));

  const startCalibration = (done) => {
    calibrating = true;
    onCalibrationDone = done;
    calibClicks = { before: [], after: [] };
    clearDots();
    setPercent(100); // show only BEFORE
    frame.classList.add("slider-frame--calibrating");
    calibHud.classList.remove("hidden");
    cancelCalibBtn.classList.remove("hidden");
    updateCalibHud();
  };

  return {
    node: wrap,
    api: { set: setPercent, setView, startCalibration },
  };
}

// ---- Save pair to repo (ZIP download) --------------------------------------

function openSavePairModal(pair, transform) {
  const defaultId =
    pair.id ||
    ("pair-" +
      new Date().toISOString().slice(0, 10) +
      "-" +
      Math.random().toString(36).slice(2, 6));

  const idInput = h("input", {
    type: "text",
    value: defaultId,
    class:
      "w-full text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const titleInput = h("input", {
    type: "text",
    value: pair.title || prettify(defaultId),
    class:
      "w-full text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const descInput = h("textarea", {
    rows: "3",
    class:
      "w-full text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  }, pair.description || "");
  const beforeLabelInput = h("input", {
    type: "text",
    value: pair.before_label || "Trace",
    class:
      "w-full text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });
  const afterLabelInput = h("input", {
    type: "text",
    value: pair.after_label || "Retrace",
    class:
      "w-full text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-maroon-500/40 focus:border-maroon-500",
  });

  const cancelBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md border border-ink-200 bg-white px-3 py-2 text-ink-700 hover:border-ink-300",
    },
    "Cancel"
  );
  const downloadBtn = h(
    "button",
    {
      type: "button",
      class:
        "text-sm rounded-md bg-ink-900 text-white px-3 py-2 hover:bg-ink-800",
    },
    "Download ZIP"
  );

  const field = (label, control, hint) =>
    h("div", { class: "mb-3" }, [
      h(
        "label",
        {
          class:
            "block text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-1",
        },
        label
      ),
      control,
      hint ? h("p", { class: "text-xs text-ink-400 mt-1" }, hint) : null,
    ]);

  const card = h("div", { class: "modal-card" }, [
    h(
      "h3",
      { class: "text-lg font-semibold text-ink-900 mb-4" },
      "Save pair to repo"
    ),
    field("Pair ID (folder name)", idInput, "lowercase, hyphens. becomes data/image-compare/<id>/"),
    field("Title", titleInput),
    field("Description", descInput),
    h("div", { class: "grid grid-cols-2 gap-3" }, [
      field("Trace label", beforeLabelInput),
      field("Retrace label", afterLabelInput),
    ]),
    h("div", { class: "mt-5 flex items-center justify-end gap-2" }, [cancelBtn, downloadBtn]),
  ]);
  const backdrop = h("div", { class: "modal-backdrop" }, card);
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  cancelBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (ev) => {
    if (ev.target === backdrop) close();
  });

  downloadBtn.addEventListener("click", async () => {
    const id = (idInput.value || defaultId).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    if (!id) return;

    const meta = {
      title: titleInput.value.trim() || prettify(id),
      description: descInput.value.trim(),
      before_label: beforeLabelInput.value.trim() || "Trace",
      after_label: afterLabelInput.value.trim() || "Retrace",
      before_ext: pair.before_ext,
      after_ext: pair.after_ext,
    };
    if (pair.before_scan_size_nm != null) meta.before_scan_size_nm = pair.before_scan_size_nm;
    if (pair.after_scan_size_nm != null) meta.after_scan_size_nm = pair.after_scan_size_nm;
    if (
      transform &&
      (transform.scale !== 1 || transform.tx !== 0 || transform.ty !== 0)
    ) {
      meta.transform = {
        scale: Number(transform.scale.toFixed(6)),
        tx: Number(transform.tx.toFixed(6)),
        ty: Number(transform.ty.toFixed(6)),
      };
    }

    try {
      const zip = new JSZip();
      const folder = zip.folder(id);
      folder.file("meta.json", JSON.stringify(meta, null, 2) + "\n");

      // Add image bytes. For uploaded files we have a File; for repo pairs
      // we have a URL — fetch it back and embed the bytes so the ZIP is
      // self-contained.
      const beforeBytes = pair.before_file
        ? pair.before_file
        : await fetch(pair.before_url).then((r) => r.blob());
      const afterBytes = pair.after_file
        ? pair.after_file
        : await fetch(pair.after_url).then((r) => r.blob());
      folder.file(`before.${meta.before_ext}`, beforeBytes);
      folder.file(`after.${meta.after_ext}`, afterBytes);

      const readme =
        `# ${meta.title}\n\n` +
        `Generated by the Image Compare tool.\n\n` +
        `## To install\n\n` +
        `1. Unzip this file into data/image-compare/ so you have\n` +
        `   data/image-compare/${id}/.\n` +
        `2. Add the id to data/image-compare/manifest.json:\n\n` +
        `   ["sample-pair", "${id}"]\n\n` +
        `3. Commit and push.\n`;
      folder.file("README.md", readme);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = h("a", { href: url, download: `${id}.zip` });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      close();
      toast(`Downloaded ${id}.zip — unzip into data/image-compare/`);
    } catch (err) {
      alert("Save failed: " + (err && err.message ? err.message : err));
    }
  });
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
