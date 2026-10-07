# Add a doc

Two steps:

1. Save your Markdown file in the `docs/` folder — e.g. `docs/40-my-protocol.md`.
2. Add a line to `docs/manifest.json`:

   ```json
   { "slug": "my-protocol", "title": "My protocol", "file": "40-my-protocol.md" }
   ```

Commit and push. The doc appears in the sidebar on the next page load.

Opening `index.html` by double-click cannot read new files (browsers block
that). The pages already in the site are copied into `assets/embedded-files.js`
for that case. After you add a doc, preview with a local server, or regenerate
the copy from the project folder:

```bash
python -c "import json,pathlib; p=pathlib.Path; files=['docs/manifest.json','docs/10-welcome.md','docs/20-add-a-doc.md','docs/30-image-compare.md','data/image-compare/manifest.json','data/image-compare/sample-pair/meta.json']; p('assets/embedded-files.js').write_text('window.__EMBEDDED_FILES__ = '+json.dumps({f:p(f).read_text(encoding='utf-8') for f in files},ensure_ascii=False)+';\n',encoding='utf-8')"
```

## Field reference

- `slug` — the URL fragment (`#/docs/<slug>`). Use lowercase and hyphens.
- `title` — the sidebar label. Keep it short.
- `file` — filename inside `docs/`. Prefixing with a number is a nice way to
  control ordering when you look at the folder — the manifest controls the
  actual site order.

## Removing a doc

Delete the file and remove its entry from the manifest.
