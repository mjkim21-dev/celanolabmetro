# Image Compare pairs

The [Image Compare tool](#/tools/image-compare) shows a before/after slider for
pairs of images stored on disk.

## Add a pair

1. Create a folder under `data/image-compare/` — the folder name is the pair id
   (lowercase and hyphens):

   ```
   data/image-compare/
     tip-a-vs-b/
   ```

2. Drop your images in as `before.<ext>` and `after.<ext>`. Any of these work:
   `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg`, `bmp`.

3. Add a `meta.json` alongside them so the tool knows their format and can
   show a nice title:

   ```json
   {
     "title": "Tip A vs Tip B on Sample 12",
     "description": "Same setpoint and scan range on both.",
     "before_label": "Tip A",
     "after_label": "Tip B",
     "before_ext": "png",
     "after_ext": "png"
   }
   ```

4. Add the folder name to `data/image-compare/manifest.json`:

   ```json
   ["sample-pair", "tip-a-vs-b"]
   ```

5. Commit and push. The pair appears in the tool's dropdown.

## Notes

- Both images should share the same aspect ratio (ideally the same pixel
  dimensions) so features line up under the divider.
- Keep files reasonable in size — this is a git repo, not a data lake.
- `before_ext` / `after_ext` in `meta.json` default to `svg`. Set them to match
  your files (e.g. `"png"`).
