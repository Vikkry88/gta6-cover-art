[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Vikkry88/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Vikkry88/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Vice Cover Studio

A small offline cover maker for the GTA-style "multi-panel collage" look. It runs entirely in your browser: no accounts, no uploads to a server, no build step, and no network access needed once the page is open. Everything you edit stays on your machine, and the finished cover is exported as a PNG file you can keep or share however you like.

## What it does

Neon Vice Cover Studio builds a GTA-style cover from several panels arranged on one canvas. You pick a layout, drop photos into the panels, style the title, grade the colours, and export. The tool was made as an entry for the make.fun competition `gta6-cover-art-01`, and it deliberately sticks to original artwork — the palm trees, sun, skyline and star shapes are drawn by the app itself rather than copied from any existing game art.

## Features

- **8 layouts** — from a single hero panel to dense multi-panel collages, so the same photos can become a square post, a portrait poster, or a wide banner.
- **6 colour grades** — one-click looks that push the whole cover toward a neon sunset, a faded retro print, a harsh daylight palette, and other moods, applied uniformly so the panels feel like one image.
- **4 lettering styles** — bold display lettering for the title and subtitle, with control over the words themselves so you can name your own fictional game, city, or episode.
- **Per-panel photo placement** — every panel accepts its own photo; drag to reposition, zoom to crop tighter or looser, and flip horizontally when the composition needs it.
- **Original motifs** — palm silhouettes, a striped sun, a skyline strip and star accents that can be layered over the panels for that unmistakable cover-art feel.
- **Texture controls** — film grain, vignette and a halftone print effect, each adjustable, so the export can look clean and digital or worn and printed.
- **Undo / redo and randomize** — step back through edits safely, or hit randomize to let the studio shuffle layout, grade and motifs for a fresh starting point.
- **PNG export at three sizes** — 1080×1080 (square), 1080×1350 (portrait) and 1920×1080 (wide), rendered from the same canvas so the design carries across formats.

## How to run it

You need Node 22 (standard library only — nothing to install). From the repo root:

```
node serve.ts
```

Then open http://localhost:8080 in a browser. That is all: the app is plain static files under `app/` (an `index.html`, a stylesheet and ES modules), so any static file server pointed at `app/` works too.

To reproduce the competition entry output instead, run:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes the `dossier.json` manifest there.

## Repository layout

- `app/` — the studio itself: `index.html`, `style.css`, and the ES modules under `app/src/`, plus sample images under `app/samples/`.
- `main.ts` — the competition entry program that assembles the output directory and dossier.
- `serve.ts` — a tiny local static server for trying the app.
- `screenshots/` — four captures of the studio and finished covers.
- `vendor/` — the vendored make.fun helper library used by `main.ts`.

## Notes

- The studio is fully offline: photos you load never leave your browser tab, and exports are generated locally.
- All motifs and lettering treatments are original to this project; it is a homage to a cover-art style, not a copy of any publisher's artwork.
- Licensed under MIT (see `LICENSE`).

## Screenshots

The `screenshots/` folder shows the studio in use: a wide finished cover, the editor itself, a square cover, and a portrait cover — all produced by the app's own export pipeline.
