# Celano Lab Metro — working site

Internal working site for the **Nanoelectronics Metrology & Failure Analysis
Lab** at ASU. Pure static HTML/CSS/JS. No server, no build step, no install.

- Tools are small JavaScript widgets in `assets/app.js`. First one is an image
  compare slider.

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

