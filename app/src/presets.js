// Presets for Neon Vice Cover Studio: eight panel layouts, six colour grades and four lettering styles.
// Every motif is original vector art drawn at render time; no game assets, logos or fonts are used.

export const POST_SIZES = [
  { id: "square", label: "Square 1080 × 1080", w: 1080, h: 1080 },
  { id: "portrait", label: "Portrait 1080 × 1350", w: 1080, h: 1350 },
  { id: "wide", label: "Wide 1920 × 1080", w: 1920, h: 1080 },
];

// Layouts are lists of fractional rectangles [x, y, w, h] inside the cover.
export const LAYOUTS = [
  { id: "classic", name: "Classic Cover", panels: [
    [0, 0, 0.52, 0.58], [0.52, 0, 0.48, 0.29], [0.52, 0.29, 0.48, 0.29],
    [0, 0.58, 0.34, 0.42], [0.34, 0.58, 0.33, 0.42], [0.67, 0.58, 0.33, 0.42],
  ]},
  { id: "hero", name: "Hero + Three", panels: [
    [0, 0, 0.62, 1], [0.62, 0, 0.38, 0.34], [0.62, 0.34, 0.38, 0.33], [0.62, 0.67, 0.38, 0.33],
  ]},
  { id: "grid9", name: "Nine Panel Grid", panels: [
    [0, 0, 1/3, 1/3], [1/3, 0, 1/3, 1/3], [2/3, 0, 1/3, 1/3],
    [0, 1/3, 1/3, 1/3], [1/3, 1/3, 1/3, 1/3], [2/3, 1/3, 1/3, 1/3],
    [0, 2/3, 1/3, 1/3], [1/3, 2/3, 1/3, 1/3], [2/3, 2/3, 1/3, 1/3],
  ]},
  { id: "full", name: "Full Bleed", panels: [[0, 0, 1, 1]] },
  { id: "diptych", name: "Split Diptych", panels: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
  { id: "strip", name: "Triple Strip", panels: [[0, 0, 1/3, 1], [1/3, 0, 1/3, 1], [2/3, 0, 1/3, 1]] },
  { id: "magazine", name: "Magazine", panels: [
    [0, 0, 1, 0.62], [0, 0.62, 0.5, 0.38], [0.5, 0.62, 0.5, 0.38],
  ]},
  { id: "film", name: "Filmstrip", panels: [
    [0, 0.12, 0.25, 0.76], [0.25, 0.12, 0.25, 0.76], [0.5, 0.12, 0.25, 0.76], [0.75, 0.12, 0.25, 0.76],
  ]},
];

export const GRADES = [
  { id: "vice", name: "Vice Sunset", filter: "saturate(1.35) contrast(1.08) brightness(1.03)",
    sky: ["#2b1055", "#7597de"], wash: ["rgba(255,94,138,0.0)", "rgba(255,122,61,0.38)", "rgba(140,30,110,0.45)"] },
  { id: "neon", name: "Neon Nights", filter: "saturate(1.5) contrast(1.15) hue-rotate(-8deg)",
    sky: ["#0b0620", "#123a5c"], wash: ["rgba(46,230,200,0.10)", "rgba(255,0,128,0.22)", "rgba(30,0,80,0.5)"] },
  { id: "golden", name: "Golden Hour", filter: "sepia(0.25) saturate(1.3) contrast(1.05) brightness(1.06)",
    sky: ["#3a1c4d", "#f7b267"], wash: ["rgba(255,179,71,0.0)", "rgba(255,140,66,0.3)", "rgba(120,40,60,0.4)"] },
  { id: "teal", name: "Teal Heat", filter: "saturate(1.25) contrast(1.1) hue-rotate(12deg)",
    sky: ["#062b33", "#1b7f79"], wash: ["rgba(46,230,200,0.12)", "rgba(0,120,140,0.25)", "rgba(4,40,60,0.45)"] },
  { id: "noir", name: "Noir Pop", filter: "grayscale(0.55) contrast(1.25) brightness(1.02)",
    sky: ["#101014", "#3a3a44"], wash: ["rgba(255,255,255,0.0)", "rgba(255,60,90,0.18)", "rgba(0,0,0,0.55)"] },
  { id: "candy", name: "Candy Pop", filter: "saturate(1.6) contrast(1.02) brightness(1.08) hue-rotate(6deg)",
    sky: ["#4a105e", "#ff7eb6"], wash: ["rgba(255,126,182,0.08)", "rgba(255,200,120,0.22)", "rgba(120,40,160,0.35)"] },
];

export const LETTERING = [
  { id: "block", name: "Block White" },
  { id: "sunset", name: "Sunset Gradient" },
  { id: "neon", name: "Neon Glow" },
  { id: "outline", name: "Poster Outline" },
];

export const TITLE_IDEAS = [
  ["NEON SHORE", "one summer, no rules"], ["MIDNIGHT DRIVE", "the city never sleeps"],
  ["PIER PRESSURE", "salt, sun and second chances"], ["BOULEVARD QUEEN", "golden hour royalty"],
  ["NIGHT SHIFT", "clock in after dark"], ["SUNSET HEIST", "take the light and run"],
];
