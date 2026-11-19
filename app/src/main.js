// Neon Vice Cover Studio — editor wiring.
// Loads photos locally, edits panels on a live canvas, and exports PNG covers at post sizes.
import { LAYOUTS, GRADES, LETTERING, POST_SIZES, TITLE_IDEAS } from "./presets.js";
import { renderCover, renderExport, defaultPanelState, layoutById, panelRects } from "./engine.js";
import { runShot } from "./shots.js";

const $ = (id) => document.getElementById(id);
const canvas = $("coverCanvas");
const statusLine = $("statusLine");

const state = {
  photos: [],
  photoUrls: [],
  layout: "classic",
  grade: "vice",
  lettering: "sunset",
  size: "square",
  gap: 10, radius: 6, gradeStrength: 70,
  grain: true, vignette: true, halftone: false,
  title: "NEON SHORE", subtitle: "one summer, no rules",
  titleSize: 100, titlePos: 82,
  badge: true, palms: true, sun: true,
  selected: 0,
  panels: defaultPanelState(6),
};
const history = { past: [], future: [] };

function snapshot() { return JSON.stringify({ ...state, photos: undefined, photoUrls: undefined }); }
function pushHistory() {
  history.past.push(snapshot());
  if (history.past.length > 60) history.past.shift();
  history.future = [];
}
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls(); redraw();
}

function currentOpts() {
  return {
    layout: state.layout, grade: state.grade, lettering: state.lettering,
    gap: state.gap, radius: state.radius, gradeStrength: state.gradeStrength,
    grain: state.grain, vignette: state.vignette, halftone: state.halftone,
    title: state.title, subtitle: state.subtitle,
    titleSize: state.titleSize, titlePos: state.titlePos,
    badge: state.badge, palms: state.palms, sun: state.sun,
    selected: state.selected, panels: state.panels,
  };
}

function redraw() {
  const size = POST_SIZES.find((s) => s.id === state.size) ?? POST_SIZES[0];
  if (canvas.width !== size.w || canvas.height !== size.h) { canvas.width = size.w; canvas.height = size.h; }
  renderCover(canvas, state.photos, currentOpts());
  $("selectedLabel").textContent = `Panel ${state.selected + 1} selected — drag to move, scroll to zoom`;
  const p = state.panels[state.selected];
  if (p) { $("zoomRange").value = Math.round(p.zoom * 100); $("zoomVal").textContent = String(Math.round(p.zoom * 100)); }
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function addFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      state.photos.push(img); state.photoUrls.push(url); added++;
      state.panels.forEach((p, i) => { if (i % Math.max(1, state.photos.length) === state.photos.length - 1) p.photo = state.photos.length - 1; });
    } catch { /* skip unreadable file */ }
  }
  renderThumbs();
  if (added) { pushHistory(); statusLine.textContent = `${state.photos.length} photo(s) loaded — pick a layout and export.`; redraw(); }
}

function renderThumbs() {
  const strip = $("thumbStrip");
  strip.innerHTML = "";
  state.photoUrls.forEach((url, i) => {
    const img = document.createElement("img");
    img.src = url; img.alt = `Photo ${i + 1}`; img.title = `Place photo ${i + 1} in the selected panel`;
    img.addEventListener("click", () => {
      pushHistory();
      state.panels[state.selected].photo = i;
      statusLine.textContent = `Photo ${i + 1} placed in panel ${state.selected + 1}.`;
      redraw();
    });
    strip.appendChild(img);
  });
}

function chipGrid(elId, items, getActive, onPick) {
  const el = $(elId); el.innerHTML = "";
  for (const item of items) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip" + (getActive(item) ? " active" : "");
    b.textContent = item.name;
    b.addEventListener("click", () => { pushHistory(); onPick(item); syncControls(); redraw(); });
    el.appendChild(b);
  }
}

function syncControls() {
  chipGrid("layoutGrid", LAYOUTS, (l) => l.id === state.layout, (l) => {
    state.layout = l.id;
    const need = l.panels.length;
    while (state.panels.length < need) state.panels.push({ photo: state.panels.length % Math.max(1, state.photos.length), ox: 0, oy: 0, zoom: 1, flip: false });
    state.selected = Math.min(state.selected, need - 1);
  });
  chipGrid("gradeGrid", GRADES, (g) => g.id === state.grade, (g) => { state.grade = g.id; });
  chipGrid("letterGrid", LETTERING, (l) => l.id === state.lettering, (l) => { state.lettering = l.id; });
  const tabs = $("sizeTabs"); tabs.innerHTML = "";
  for (const s of POST_SIZES) {
    const b = document.createElement("button");
    b.type = "button"; b.className = s.id === state.size ? "active" : "";
    b.textContent = s.label;
    b.addEventListener("click", () => { state.size = s.id; syncControls(); redraw(); });
    tabs.appendChild(b);
  }
  $("titleInput").value = state.title; $("subtitleInput").value = state.subtitle;
  $("gapRange").value = state.gap; $("gapVal").textContent = state.gap;
  $("radiusRange").value = state.radius; $("radiusVal").textContent = state.radius;
  $("gradeRange").value = state.gradeStrength; $("gradeVal").textContent = state.gradeStrength;
  $("titleSize").value = state.titleSize; $("titleSizeVal").textContent = state.titleSize;
  $("titlePos").value = state.titlePos; $("titlePosVal").textContent = state.titlePos;
  $("grainToggle").checked = state.grain; $("vignetteToggle").checked = state.vignette;
  $("halftoneToggle").checked = state.halftone; $("badgeToggle").checked = state.badge;
  $("palmsToggle").checked = state.palms; $("sunToggle").checked = state.sun;
}

function bindRange(id, valId, key) {
  $(id).addEventListener("input", (e) => { state[key] = Number(e.target.value); $(valId).textContent = e.target.value; redraw(); });
}
function bindCheck(id, key) {
  $(id).addEventListener("change", (e) => { pushHistory(); state[key] = e.target.checked; redraw(); });
}

function downloadCanvas(c, name) {
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    statusLine.textContent = `Saved ${name}`;
  }, "image/png");
}

function exportSize(sizeId) {
  const size = POST_SIZES.find((s) => s.id === sizeId);
  const c = renderExport(state.photos, currentOpts(), size);
  downloadCanvas(c, `neon-vice-cover-${size.w}x${size.h}.png`);
}

let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
}
function panelAt(pt) {
  const rects = panelRects(layoutById(state.layout), canvas.width, canvas.height, state.gap * (canvas.width / 1080));
  return rects.findIndex((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h);
}
canvas.addEventListener("pointerdown", (e) => {
  const pt = canvasPoint(e);
  const idx = panelAt(pt);
  if (idx < 0) return;
  state.selected = idx;
  drag = { idx, startX: pt.x, startY: pt.y, ox: state.panels[idx].ox, oy: state.panels[idx].oy };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const pt = canvasPoint(e);
  const rects = panelRects(layoutById(state.layout), canvas.width, canvas.height, state.gap * (canvas.width / 1080));
  const r = rects[drag.idx];
  state.panels[drag.idx].ox = drag.ox + (pt.x - drag.startX) / r.w;
  state.panels[drag.idx].oy = drag.oy + (pt.y - drag.startY) / r.h;
  redraw();
});
canvas.addEventListener("pointerup", () => { if (drag) pushHistory(); drag = null; });
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const p = state.panels[state.selected];
  p.zoom = Math.min(3, Math.max(1, p.zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
  redraw();
}, { passive: false });

$("photoInput").addEventListener("change", (e) => addFiles([...e.target.files]));
const dz = $("dropZone");
dz.addEventListener("click", () => $("photoInput").click());
dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") $("photoInput").click(); });
["dragover", "dragenter"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
dz.addEventListener("drop", (e) => addFiles([...e.dataTransfer.files]));
window.addEventListener("paste", (e) => addFiles([...(e.clipboardData?.files ?? [])]));

async function loadSample(name) {
  const url = `samples/${name}.jpg`;
  const img = await loadImage(url);
  state.photos.push(img); state.photoUrls.push(url);
  state.panels.forEach((p, i) => { p.photo = i % state.photos.length; });
  renderThumbs(); pushHistory();
  statusLine.textContent = `Sample "${name}" loaded.`;
  redraw();
}
$("sampleA").addEventListener("click", () => loadSample("boulevard"));
$("sampleB").addEventListener("click", () => loadSample("pier"));

$("titleInput").addEventListener("input", (e) => { state.title = e.target.value; redraw(); });
$("subtitleInput").addEventListener("input", (e) => { state.subtitle = e.target.value; redraw(); });
bindRange("gapRange", "gapVal", "gap");
bindRange("radiusRange", "radiusVal", "radius");
bindRange("gradeRange", "gradeVal", "gradeStrength");
bindRange("titleSize", "titleSizeVal", "titleSize");
bindRange("titlePos", "titlePosVal", "titlePos");
bindCheck("grainToggle", "grain"); bindCheck("vignetteToggle", "vignette"); bindCheck("halftoneToggle", "halftone");
bindCheck("badgeToggle", "badge"); bindCheck("palmsToggle", "palms"); bindCheck("sunToggle", "sun");

$("zoomRange").addEventListener("input", (e) => {
  state.panels[state.selected].zoom = Number(e.target.value) / 100;
  $("zoomVal").textContent = e.target.value; redraw();
});
$("flipBtn").addEventListener("click", () => { pushHistory(); const p = state.panels[state.selected]; p.flip = !p.flip; redraw(); });
$("fillAllBtn").addEventListener("click", () => {
  pushHistory();
  const src = state.panels[state.selected].photo;
  state.panels.forEach((p) => { p.photo = src; });
  statusLine.textContent = "One photo across every panel — drag each panel to frame a different crop.";
  redraw();
});

$("exportSquare").addEventListener("click", () => exportSize("square"));
$("exportPortrait").addEventListener("click", () => exportSize("portrait"));
$("exportWide").addEventListener("click", () => exportSize("wide"));
$("exportAll").addEventListener("click", () => POST_SIZES.forEach((s, i) => setTimeout(() => exportSize(s.id), i * 350)));

$("undoBtn").addEventListener("click", () => {
  const prev = history.past.pop();
  if (!prev) return;
  history.future.push(snapshot()); restore(prev);
});
$("redoBtn").addEventListener("click", () => {
  const next = history.future.pop();
  if (!next) return;
  history.past.push(snapshot()); restore(next);
});
$("randomBtn").addEventListener("click", () => {
  pushHistory();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  state.layout = pick(LAYOUTS).id; state.grade = pick(GRADES).id; state.lettering = pick(LETTERING).id;
  const [t, s] = pick(TITLE_IDEAS); state.title = t; state.subtitle = s;
  const need = layoutById(state.layout).panels.length;
  while (state.panels.length < need) state.panels.push({ photo: 0, ox: 0, oy: 0, zoom: 1, flip: false });
  state.panels.forEach((p, i) => { p.photo = state.photos.length ? i % state.photos.length : 0; p.ox = 0; p.oy = 0; p.zoom = 1; });
  syncControls(); redraw();
  statusLine.textContent = "New look rolled — tweak anything, then export PNG covers at 1080×1080, 1080×1350 or 1920×1080.";
});

const params = new URLSearchParams(location.search);
if (params.get("shot")) {
  runShot(params, { state, loadImage, renderThumbs, syncControls, redraw, currentOpts });
} else {
  syncControls(); redraw();
  loadSample("boulevard").then(() => loadSample("pier")).catch(() => redraw());
}
