// Cover rendering engine for Neon Vice Cover Studio.
// Draws multi-panel covers onto a 2D canvas: photos with per-panel crop, colour grades,
// original palm / sun / skyline motifs, bold lettering, grain and vignette. No external assets.
import { LAYOUTS, GRADES } from "./presets.js";

export function defaultPanelState(count) {
  return Array.from({ length: count }, () => ({ photo: 0, ox: 0, oy: 0, zoom: 1, flip: false }));
}

export function layoutById(id) { return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0]; }
export function gradeById(id) { return GRADES.find((g) => g.id === id) ?? GRADES[0]; }

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPhotoCover(ctx, img, x, y, w, h, state) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih) * (state?.zoom ?? 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2 + (state?.ox ?? 0) * w;
  const dy = y + (h - dh) / 2 + (state?.oy ?? 0) * h;
  ctx.save();
  if (state?.flip) { ctx.translate(x + w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(x + w / 2), 0); }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawSkyBackdrop(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.sky[0]);
  g.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawSunDisc(ctx, cx, cy, r) {
  ctx.save();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, "#ffe29a"); g.addColorStop(0.55, "#ff9a5c"); g.addColorStop(1, "#ff5e8a");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 5; i++) {
    const yy = cy + r * (0.05 + i * 0.17);
    ctx.fillRect(cx - r, yy, r * 2, r * 0.045 + i * 1.5);
  }
  ctx.restore();
}

function drawPalm(ctx, x, y, s, flip, color) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = "round";
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -70, 34, -118); ctx.stroke();
  ctx.lineWidth = 5;
  const fronds = [[34, -118, 92, -150, 118, -108], [34, -118, 78, -168, 60, -128], [34, -118, 10, -172, -34, -140], [34, -118, -30, -150, -70, -112], [34, -118, 52, -138, 96, -124]];
  for (const [x1, y1, cx, cy, x2, y2] of fronds) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(30, -112, 7, 0, Math.PI * 2); ctx.arc(42, -108, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSkyline(ctx, w, h, color) {
  ctx.save(); ctx.fillStyle = color;
  const base = h; let x = -10; let i = 0;
  const heights = [0.16, 0.24, 0.13, 0.3, 0.19, 0.26, 0.14, 0.22, 0.17, 0.28, 0.15, 0.21];
  while (x < w + 20) {
    const bw = w * 0.055 + (i % 3) * w * 0.012;
    const bh = h * heights[i % heights.length];
    ctx.fillRect(x, base - bh, bw, bh);
    x += bw + w * 0.008; i++;
  }
  ctx.restore();
}

function applyGradeWash(ctx, w, h, grade, strength) {
  const a = strength / 100;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.wash[0]); g.addColorStop(0.6, grade.wash[1]); g.addColorStop(1, grade.wash[2]);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

function applyGrain(ctx, w, h) {
  ctx.save(); ctx.globalAlpha = 0.07;
  const step = Math.max(3, Math.round(w / 320));
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 2600; i++) {
    const x = ((i * 2654435761) % 10000) / 10000 * w;
    const y = ((i * 40503) % 10000) / 10000 * h;
    ctx.fillRect(x, y, step, step);
  }
  ctx.restore();
}

function applyVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(8,2,20,0.55)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function applyHalftone(ctx, w, h) {
  ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = "#000000";
  const s = Math.max(10, w / 90);
  for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) {
    ctx.beginPath(); ctx.arc(x, y, s * 0.16, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function fitFontSize(ctx, text, maxWidth, start, family, weight) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 14) { size -= 3; ctx.font = `${weight} ${size}px ${family}`; }
  return size;
}

function drawLettering(ctx, w, h, opts) {
  const title = (opts.title || "").trim().toUpperCase();
  const sub = (opts.subtitle || "").trim();
  if (!title && !sub) return;
  const family = `"Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`;
  const base = h * 0.115 * (opts.titleSize / 100);
  const size = title ? fitFontSize(ctx, title, w * 0.92, base, family, "900") : base;
  const cy = h * (opts.titlePos / 100);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // dark band behind lettering for poster contrast
  const bandH = size * 1.9 + (sub ? size * 0.5 : 0);
  const band = ctx.createLinearGradient(0, cy - bandH / 2, 0, cy + bandH / 2);
  band.addColorStop(0, "rgba(10,4,26,0)"); band.addColorStop(0.25, "rgba(10,4,26,0.55)");
  band.addColorStop(0.8, "rgba(10,4,26,0.55)"); band.addColorStop(1, "rgba(10,4,26,0)");
  ctx.fillStyle = band; ctx.fillRect(0, cy - bandH / 2, w, bandH);
  ctx.font = `900 ${size}px ${family}`;
  if (opts.lettering === "sunset") {
    const g = ctx.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
    g.addColorStop(0, "#fff3b0"); g.addColorStop(0.5, "#ffb347"); g.addColorStop(1, "#ff5e8a");
    ctx.lineWidth = size * 0.14; ctx.strokeStyle = "#2b1055"; ctx.strokeText(title, w / 2, cy);
    ctx.fillStyle = g; ctx.fillText(title, w / 2, cy);
  } else if (opts.lettering === "neon") {
    ctx.shadowColor = "#ff2e9a"; ctx.shadowBlur = size * 0.45;
    ctx.fillStyle = "#fff"; ctx.fillText(title, w / 2, cy);
    ctx.shadowColor = "#2ee6c8"; ctx.shadowBlur = size * 0.3;
    ctx.fillText(title, w / 2, cy);
  } else if (opts.lettering === "outline") {
    ctx.lineWidth = size * 0.1; ctx.strokeStyle = "#ffffff"; ctx.strokeText(title, w / 2, cy);
    ctx.fillStyle = "rgba(255,94,138,0.85)"; ctx.fillText(title, w / 2, cy);
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.05;
    ctx.fillStyle = "#ffffff"; ctx.fillText(title, w / 2, cy);
  }
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (sub) {
    const ss = size * 0.3;
    ctx.font = `italic 700 ${ss}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = "#ffe9a8"; ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 6;
    ctx.fillText(sub, w / 2, cy + size * 0.78);
  }
  ctx.restore();
}

function drawStarBadge(ctx, w, h) {
  const cx = w * 0.9, cy = h * 0.1, r = Math.min(w, h) * 0.075;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22);
  ctx.fillStyle = "#ffb347"; ctx.strokeStyle = "#fff"; ctx.lineWidth = r * 0.08;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.48;
    const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2b1055"; ctx.font = `900 ${r * 0.42}px "Arial Black", Impact, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("★", 0, 1);
  ctx.restore();
}

export function panelRects(layout, w, h, gap) {
  return layout.panels.map(([fx, fy, fw, fh]) => ({
    x: fx * w + gap / 2, y: fy * h + gap / 2,
    w: fw * w - gap, h: fh * h - gap,
  }));
}

export function renderCover(canvas, photos, opts) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  const layout = layoutById(opts.layout);
  const grade = gradeById(opts.grade);
  drawSkyBackdrop(ctx, w, h, grade);
  if (opts.sun) drawSunDisc(ctx, w * 0.5, h * 0.34, Math.min(w, h) * 0.2);
  const rects = panelRects(layout, w, h, opts.gap * (w / 1080));
  rects.forEach((r, i) => {
    const state = opts.panels[i] ?? { photo: 0, ox: 0, oy: 0, zoom: 1, flip: false };
    const img = photos.length ? photos[Math.min(state.photo, photos.length - 1)] : null;
    ctx.save();
    roundedRect(ctx, r.x, r.y, r.w, r.h, opts.radius * (w / 1080));
    ctx.clip();
    if (img) {
      ctx.filter = grade.filter;
      drawPhotoCover(ctx, img, r.x, r.y, r.w, r.h, state);
      ctx.filter = "none";
    } else {
      const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      g.addColorStop(0, "#3d2b6b"); g.addColorStop(1, "#7a2e6d");
      ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = `700 ${Math.min(r.w, r.h) * 0.11}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ADD A PHOTO", r.x + r.w / 2, r.y + r.h / 2);
    }
    ctx.restore();
    ctx.save();
    roundedRect(ctx, r.x, r.y, r.w, r.h, opts.radius * (w / 1080));
    ctx.strokeStyle = i === opts.selected ? "#2ee6c8" : "rgba(255,255,255,0.85)";
    ctx.lineWidth = i === opts.selected ? Math.max(4, w * 0.005) : Math.max(2, w * 0.0025);
    ctx.stroke(); ctx.restore();
  });
  applyGradeWash(ctx, w, h, grade, opts.gradeStrength);
  drawSkyline(ctx, w, h, "rgba(16,6,34,0.32)");
  if (opts.palms) {
    drawPalm(ctx, w * 0.045, h * 0.99, (h / 1080) * 1.15, false, "rgba(12,4,28,0.9)");
    drawPalm(ctx, w * 0.965, h * 0.99, (h / 1080) * 0.95, true, "rgba(12,4,28,0.85)");
  }
  if (opts.halftone) applyHalftone(ctx, w, h);
  if (opts.vignette) applyVignette(ctx, w, h);
  if (opts.grain) applyGrain(ctx, w, h);
  drawLettering(ctx, w, h, opts);
  if (opts.badge) drawStarBadge(ctx, w, h);
  // outer poster frame
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
}

export function renderExport(photos, opts, size) {
  const c = document.createElement("canvas");
  c.width = size.w; c.height = size.h;
  renderCover(c, photos, { ...opts, selected: -1 });
  return c;
}
