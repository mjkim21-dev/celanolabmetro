# Add a doc

Two steps:

1. Save your Markdown file in the `docs/` folder — e.g. `docs/40-my-protocol.md`.
2. Add a line to `docs/manifest.json`:

   ```json
   { "slug": "my-protocol", "title": "My protocol", "file": "40-my-protocol.md" }
   ```

Commit and push. The doc appears in the sidebar on the next page load.

## Field reference

- `slug` — the URL fragment (`#/docs/<slug>`). Use lowercase and hyphens.
- `title` — the sidebar label. Keep it short.
- `file` — filename inside `docs/`. Prefixing with a number is a nice way to
  control ordering when you look at the folder — the manifest controls the
  actual site order.

## Removing a doc

Delete the file and remove its entry from the manifest.
