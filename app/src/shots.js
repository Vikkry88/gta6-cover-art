// Fixed scenes for screenshots and the judge contact sheet: ?shot=cover renders one exported cover full-frame;
// ?shot=editor shows the studio with samples loaded. Query params: layout, grade,
// lettering, size, title, subtitle. window.__shotReady is set once painted.
export async function runShot(params, api) {
  const { state, loadImage, renderThumbs, syncControls, redraw } = api;
  const shot = params.get("shot");
  if (shot === "cover") document.body.classList.add("shot-cover");
  for (const name of ["boulevard", "pier"]) {
    const url = `samples/${name}.jpg`;
    state.photos.push(await loadImage(url));
    state.photoUrls.push(url);
  }
  state.layout = params.get("layout") ?? "classic";
  state.grade = params.get("grade") ?? "vice";
  state.lettering = params.get("lettering") ?? "sunset";
  state.size = params.get("size") ?? "square";
  state.title = params.get("title") ?? "NEON SHORE";
  state.subtitle = params.get("subtitle") ?? "one summer, no rules";
  if (params.get("titlePos")) state.titlePos = Number(params.get("titlePos"));
  state.panels.forEach((p, i) => { p.photo = i % state.photos.length; p.ox = 0; p.oy = 0; p.zoom = 1; p.flip = false; });
  // a little per-panel variety so the grid reads as distinct crops
  if (state.panels[1]) state.panels[1].zoom = 1.35;
  if (state.panels[3]) { state.panels[3].zoom = 1.25; state.panels[3].oy = -0.08; }
  if (state.panels[4]) state.panels[4].flip = true;
  state.selected = shot === "cover" ? -1 : 0;
  renderThumbs(); syncControls(); redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
