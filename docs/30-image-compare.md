# Image Compare

The [Image Compare tool](#/tools/image-compare) is a trace / retrace slider.
Drag the divider to reveal either scan. Load a pair saved in the repo, or
drop two images in from your machine. Nothing you drop in is uploaded.

The left image is **trace**. The right image is **retrace**.

## How the panel shows the two scans

Each image keeps its real aspect ratio. A square scan stays square. The
frame is the box that fits both pictures, so neither one is cropped.

**Trace width (nm)** and **Retrace width (nm)** are the horizontal field of
view. Enter both under the slider, or store them in `meta.json`. The panel
then draws both scans so one nanometer is the same length on screen. The
smaller field of view sits inside the larger one, with the gray panel
showing in the margin. Height follows each image’s own pixel aspect ratio
(square pixels).

With both widths set, **Scale 1** means that match is already applied.
**X offset (%)** is a percent of the trace image’s width. **Y offset (%)**
is a percent of its height. **Reset transform** clears the scale and the
offsets. It does not clear the scan widths.

If the widths are blank, both images are shown at the same displayed width,
each with its real aspect ratio. Use the width fields or **Calibrate scale**
when the fields of view differ.

Example: a 500 nm trace and a 2000 nm retrace. The retrace image is drawn
four times as wide as the trace, and the trace sits in the middle of it.

## Three ways to line the scans up

### 1. Scan widths

Best when you know the field of view.

```json
{
  "before_scan_size_nm": 500,
  "after_scan_size_nm": 2000
}
```

`before_scan_size_nm` is the trace width. `after_scan_size_nm` is the
retrace width. The names stay `before` / `after` in the file. The labels on
screen are Trace and Retrace.

### 2. Two-point calibration

Best when you do not have scan widths. Works with any two images.

1. Load a pair.
2. Click **Calibrate scale**.
3. The slider shows only the trace. Click **two points** on it — the same
   feature on each, or the two ends of the scale bar.
4. The slider shows only the retrace. Click **the same two points**.
5. The tool scales the retrace so those distances match, then shifts it so
   the midpoints line up.

Clicks that miss the picture are ignored. Calibration replaces the scale and
offsets. It does not change the scan widths. If widths are already set, the
new scale is an extra nudge on top of that match.

### 3. Manual controls

**Scale**, **X offset (%)**, and **Y offset (%)** sit under the slider.
Use them for a last small adjustment after the widths or the calibration.

## Upload a pair

1. Click **+ Upload pair**.
2. Drop or click the **Trace** and **Retrace** zones.
3. The pair loads as soon as both files are set.

Supported files: `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg`, `bmp`.

## Save a pair to the repo

1. Click **Save pair to repo**.
2. Fill in the id (folder name), title, description, and labels.
3. The browser downloads a ZIP with `<id>/before.<ext>`, `<id>/after.<ext>`,
   `<id>/meta.json`, and a short `README.md`.
4. Unzip it into `data/image-compare/` so the folder is
   `data/image-compare/<id>/`.
5. Add the id to `data/image-compare/manifest.json`:

   ```json
   ["sample-pair", "<id>"]
   ```

6. Commit and push. The pair opens with the saved scale and offsets.

On disk the images are still named `before` and `after`. That is the folder
layout. The labels you typed are what the slider shows.

## meta.json

Every field can be omitted. Missing labels become Trace and Retrace.

```json
{
  "title": "Tip A vs Tip B on Sample 12",
  "description": "Same 5 nN setpoint, 512x512 px.",
  "before_label": "Trace",
  "after_label": "Retrace",
  "before_ext": "png",
  "after_ext": "png",
  "before_scan_size_nm": 500,
  "after_scan_size_nm": 2000,
  "transform": { "scale": 1.02, "tx": 0.05, "ty": -0.02 }
}
```

- `before_ext` / `after_ext` — extensions of `before.*` and `after.*`.
  Default `svg`.
- `before_scan_size_nm` / `after_scan_size_nm` — trace and retrace widths,
  in nanometers.
- `transform` — extra scale and offset on top of the scan-width match.
  `scale` 1 and offsets 0 means the widths stand alone. `tx` is a fraction
  of the trace width. `ty` is a fraction of the trace height.

## Notes

- Very large files bloat the git repo. A few thousand pixels on the long
  edge is enough for the slider.
