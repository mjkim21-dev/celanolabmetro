# Celano Lab Metro — working site

Internal working site for the **Nanoelectronics Metrology & Failure Analysis
Lab** at ASU. Pure static HTML/CSS/JS. No server, no build step, no install.

- Hosted for free on **GitHub Pages**.
- Docs are plain Markdown files in `docs/`.
- Tools are small JavaScript widgets in `assets/app.js`. First one is an image
  compare slider.

## Publish it (one-time, ~2 minutes)

1. Push this folder to a GitHub repo (a fresh empty repo is fine).
2. On GitHub go to **Settings → Pages**.
3. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)`
4. Save. Wait a minute. Your site is live at
   `https://<your-username>.github.io/<repo-name>/`.

That URL is what you share with the lab. Every push to `main` updates it.

## Add a doc

1. Save your Markdown file in `docs/` — e.g. `docs/40-my-protocol.md`.
2. Add one line to `docs/manifest.json`:

   ```json
   { "slug": "my-protocol", "title": "My protocol", "file": "40-my-protocol.md" }
   ```

3. Commit and push.

## Add an image-compare pair

1. Create `data/image-compare/<pair-id>/` with a `before.<ext>` and
   `after.<ext>` image (png / jpg / webp / svg / etc.).
2. Add a `meta.json` in that folder — see
   [`docs/30-image-compare.md`](docs/30-image-compare.md) for fields.
3. Add the folder name to `data/image-compare/manifest.json`:

   ```json
   ["sample-pair", "your-new-pair"]
   ```

4. Commit and push.

## Layout

```
celanolabmetro/
  index.html               # entry point
  assets/
    app.js                 # SPA + router + image-compare slider
    styles.css
    favicon.svg
  docs/
    manifest.json          # ordered list of docs
    10-welcome.md
    20-add-a-doc.md
    30-image-compare.md
  data/
    image-compare/
      manifest.json        # list of pair folders
      sample-pair/
        before.svg
        after.svg
        meta.json
  README.md
  .nojekyll                # tells GitHub Pages not to process with Jekyll
  .gitignore
```

## Previewing locally (optional)

Because browsers block `fetch()` on `file://`, opening `index.html` by
double-click will not load the docs. Two easy ways to preview before pushing:

- **VS Code**: install the "Live Server" extension → right-click `index.html`
  → "Open with Live Server".
- **Any Python install**: `python -m http.server 8000` in this folder, then
  open <http://localhost:8000>.

Neither of these is needed to *use* the site — pushing to GitHub Pages is the
normal flow.
