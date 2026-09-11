# Image Compare pairs

The [Image Compare tool](#/tools/image-compare) lets you drag a slider across
two aligned images to reveal each side. You can either load a pair from the
repo or drop in two images from your machine on the fly.

## Three ways to align images at the same scale

Different scans often have different fields of view (500 nm vs 2 μm, say).
The tool has three ways to make them match, in order of ease:

### 1. Auto-scale from metadata (best for shared pairs)

If you record scan sizes in `meta.json`, the tool auto-scales the after image
so the two share the same nm/px:

```json
{
  "before_scan_size_nm": 500,
  "after_scan_size_nm": 2000
}
```

### 2. Two-point calibration (best for ad-hoc comparisons)

Zero metadata needed. Works with *any* two images.

1. Load a pair (repo or drag-drop).
2. Click **Calibrate scale**.
3. The slider swings to show only the BEFORE image. Click **two points** on it
   — either two corresponding features, or two ends of the scale bar.
4. The slider swings to show only the AFTER image. Click **the same two
   points** you picked on before.
5. Done — the tool solves for the scale + offset that maps the after image
   onto the before image and applies it.

Under the hood this is a similarity transform in frame-normalized coordinates:

```
scale = |b2 - b1| / |a2 - a1|
shift = mid_b - scale * mid_a
```

### 3. Manual controls (fine-tune)

Below the slider there are numeric inputs for **Scale**, **X offset (%)**, and
**Y offset (%)** that always work on top of whatever the other two methods set.
Use them for last-mile tweaks. **Reset transform** clears everything.

## Drag-drop upload

1. Click **+ Upload pair** in the tool's toolbar.
2. Drop or click each dropzone (Before / After) to pick a file. Images stay in
   your browser — nothing gets uploaded anywhere.
3. As soon as both are set the pair loads. Calibrate + adjust as needed.

Supported extensions: `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg`, `bmp`.

## Save a pair to the repo

Once you have a pair loaded (and optionally calibrated) that you want to keep
around for the lab:

1. Click **Save pair to repo**.
2. Fill in the id (folder name), title, description, and labels.
3. The browser downloads a ZIP containing `<id>/before.<ext>`,
   `<id>/after.<ext>`, `<id>/meta.json` (with the transform baked in), and a
   short `README.md`.
4. Unzip it into `data/image-compare/` so you end up with
   `data/image-compare/<id>/`.
5. Add the id to `data/image-compare/manifest.json`:

   ```json
   ["sample-pair", "<id>"]
   ```

6. Commit and push. Anyone opening the tool will see your new pair with the
   transform already applied.

## meta.json — full field reference

All fields are optional except when noted. Anything missing gets a sensible
default.

```json
{
  "title": "Tip A vs Tip B on Sample 12",
  "description": "Same 5 nN setpoint, 512x512 px.",
  "before_label": "Tip A",
  "after_label": "Tip B",
  "before_ext": "png",
  "after_ext": "png",
  "before_scan_size_nm": 500,
  "after_scan_size_nm": 2000,
  "transform": { "scale": 4.0, "tx": 0.05, "ty": -0.02 }
}
```

- `before_ext` / `after_ext` — file extensions of `before.*` / `after.*`.
  Default `svg`. Set to match your files.
- `before_scan_size_nm` / `after_scan_size_nm` — physical scan size. If both
  are present the initial scale is set automatically.
- `transform` — saved after-image transform in frame-normalized units. Takes
  priority over the auto-scale from scan sizes.

## Notes

- Both images should ideally share the same aspect ratio.
- Very large files bloat the git repo. Downsample to a reasonable resolution
  (a few thousand pixels on the long edge is plenty for slider viewing) before
  saving.
