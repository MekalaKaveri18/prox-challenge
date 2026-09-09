export type Process = "mig" | "fcaw" | "tig" | "stick"

export type Polarity = "DCEP" | "DCEN"

export type Figure = {
  id: string
  title: string
  src: string
  source: string
  page: number
  tags: string[]
  caption: string
}

export type DutyPoint = {
  process: Process
  volts: 120 | 240
  amps: number
  dutyPct: number
  weldMinutes: number
  restMinutes: number
  source: string
}

export type PolaritySetup = {
  process: Process
  polarity: Polarity
  groundSocket: "+" | "-"
  electrodeSocket: "+" | "-"
  electrodeLabel: string
  gas: string
  notes: string[]
  figureId: string
  source: string
}

export const PRODUCT = {
  name: "Vulcan OmniPro 220",
  item: "57812",
  maker: "Harbor Freight / Vulcan",
  summary:
    "Multiprocess welder: MIG, flux-cored, TIG, and Stick. Dual input 120 VAC / 240 VAC with LCD synergic controls.",
}

export const figures: Figure[] = [
  {
    id: "front-panel",
    title: "Front panel controls",
    src: "/manual/om-08-front-panel.jpg",
    source: "Owner's Manual p.8",
    page: 8,
    tags: ["controls", "sockets", "lcd", "positive", "negative"],
    caption:
      "Front: LCD, knobs, Home/Back, MIG gun / spool gun cable socket, negative (−) socket, positive (+) socket, spool gun gas outlet, storage.",
  },
  {
    id: "interior",
    title: "Interior / wire feed",
    src: "/manual/om-09-interior.jpg",
    source: "Owner's Manual p.9",
    page: 9,
    tags: ["wire feed", "tensioner", "spool", "foot pedal", "idler"],
    caption:
      "Interior: wire feed mechanism, feed tensioner, idler arm, spool, cold wire feed switch, wire feed control socket, foot pedal socket.",
  },
  {
    id: "feed-roller",
    title: "Feed roller grooves",
    src: "/manual/om-12-feed-roller.jpg",
    source: "Owner's Manual p.12",
    page: 12,
    tags: ["feed roller", "wire", "v-groove", "knurled"],
    caption:
      "Solid-core uses V-groove (0.025 or 0.030/0.035). Flux-cored uses knurled groove (0.030/0.035 or 0.045). Number showing must match spool diameter.",
  },
  {
    id: "polarity-fcaw",
    title: "DCEN flux-cored polarity",
    src: "/manual/om-13-polarity-fcaw.jpg",
    source: "Owner's Manual p.13",
    page: 13,
    tags: ["polarity", "flux", "fcaw", "dcen", "gasless"],
    caption:
      "Flux-cored (gasless): ground clamp in POSITIVE (+), wire feed power cable in NEGATIVE (−). Twist clockwise to lock. Gun connector must be fully seated in the wire feed socket.",
  },
  {
    id: "polarity-mig",
    title: "DCEP solid-core MIG polarity",
    src: "/manual/om-14-polarity-mig.jpg",
    source: "Owner's Manual p.14",
    page: 14,
    tags: ["polarity", "mig", "dcep", "gas"],
    caption:
      "Solid-core MIG (gas shielded): ground clamp in NEGATIVE (−), wire feed power cable in POSITIVE (+). Shielding gas per settings chart. C100 uses CGA 580/320 adapter.",
  },
  {
    id: "wire-feed",
    title: "Threading wire and tensioner",
    src: "/manual/om-15-wire-feed.jpg",
    source: "Owner's Manual p.15",
    page: 15,
    tags: ["tensioner", "wire feed", "contact tip"],
    caption:
      "Hold wire under tension while feeding ≥12 in into the inlet liner. Tension 3–5 for solid wire, 2–3 for flux-cored. Too much force crushes flux-cored wire.",
  },
  {
    id: "duty-mig",
    title: "MIG duty cycle",
    src: "/manual/om-19-duty-cycle-mig.jpg",
    source: "Owner's Manual p.19",
    page: 19,
    tags: ["duty cycle", "mig", "overheat"],
    caption:
      "Duty cycle is minutes of weld in a 10-minute window. 240 VAC MIG: 25% at 200 A (2.5 min weld / 7.5 min rest), 100% at 115 A. 120 VAC MIG: 40% at 100 A, 100% at 75 A. Cool with power ON so the fan runs.",
  },
  {
    id: "settings",
    title: "Process settings on the LCD",
    src: "/manual/om-20-settings.jpg",
    source: "Owner's Manual p.20",
    page: 20,
    tags: ["settings", "synergic", "wfs", "voltage"],
    caption:
      "Home → select process → plug cables/gas as shown on screen → left knob wire diameter, right knob thickness. White mark is the recommended WFS/voltage for that combo. MIG gas 20–30 SCFH.",
  },
  {
    id: "polarity-tig",
    title: "TIG torch polarity",
    src: "/manual/om-24-polarity-tig.jpg",
    source: "Owner's Manual p.24",
    page: 24,
    tags: ["polarity", "tig", "dcen", "torch", "ground"],
    caption:
      "TIG: ground clamp in POSITIVE (+), TIG torch cable in NEGATIVE (−). Optional foot pedal into the interior foot pedal socket. 100% argon. TIG torch sold separately.",
  },
  {
    id: "tig-gas",
    title: "TIG shielding gas",
    src: "/manual/om-25.jpg",
    source: "Owner's Manual p.25",
    page: 25,
    tags: ["tig", "argon", "gas"],
    caption: "TIG uses 100% argon. Set flow 10–25 SCFH per the settings chart on the inside of the door.",
  },
  {
    id: "polarity-stick",
    title: "Stick polarity",
    src: "/manual/om-27-polarity-stick.jpg",
    source: "Owner's Manual p.27",
    page: 27,
    tags: ["polarity", "stick", "dcep", "electrode holder"],
    caption:
      "Stick: electrode holder in POSITIVE (+), ground clamp in NEGATIVE (−). Twist clockwise to lock.",
  },
  {
    id: "duty-tig-stick",
    title: "TIG and Stick duty cycle",
    src: "/manual/om-29-duty-cycle-tig-stick.jpg",
    source: "Owner's Manual p.29",
    page: 29,
    tags: ["duty cycle", "tig", "stick"],
    caption:
      "Same 10-minute window. See specifications: TIG 240 V 30% at 175 A / 100% at 105 A. Stick 240 V 25% at 175 A / 100% at 100 A.",
  },
  {
    id: "weld-diagnosis",
    title: "Wire weld diagnosis chart",
    src: "/manual/om-35-weld-diagnosis.jpg",
    source: "Owner's Manual p.35",
    page: 35,
    tags: ["diagnosis", "bead", "voltage", "travel", "ctwd", "polarity"],
    caption:
      "Visual bead examples: good weld, voltage/WFS too low or high, travel too fast/slow, CTWD too long or wrong polarity. Correct by matching the pictured defect.",
  },
  {
    id: "penetration",
    title: "Penetration profiles",
    src: "/manual/om-36-penetration.jpg",
    source: "Owner's Manual p.36",
    page: 36,
    tags: ["penetration", "burn-through", "heat"],
    caption:
      "Excess penetration/burn-through vs proper vs inadequate. Causes include heat, travel speed, CTWD, dirty metal, gap.",
  },
  {
    id: "porosity",
    title: "Porosity and spatter",
    src: "/manual/om-37-porosity.jpg",
    source: "Owner's Manual p.37",
    page: 37,
    tags: ["porosity", "spatter", "gas", "dirty"],
    caption:
      "Porosity: small cavities in the bead. Check polarity, shielding gas (MIG), dirty workpiece/wire, travel speed, CTWD. Excessive grainy spatter: dirt, polarity, gas, WFS too fast, CTWD too long.",
  },
  {
    id: "stick-diagnosis",
    title: "Stick weld diagnosis",
    src: "/manual/om-38-stick-diagnosis.jpg",
    source: "Owner's Manual p.38",
    page: 38,
    tags: ["stick", "diagnosis", "current", "arc length"],
    caption: "Stick bead examples for current too low/high, travel too fast/slow, arc too short/long. Clean slag first.",
  },
  {
    id: "troubleshoot-mig",
    title: "MIG / flux-cored troubleshooting",
    src: "/manual/om-42-troubleshoot-mig.jpg",
    source: "Owner's Manual p.42",
    page: 42,
    tags: ["troubleshooting", "wire feed", "arc", "bird nest"],
    caption:
      "Wire not feeding, bird's nest, unstable arc, weak arc. Unstable arc: DCEP for MIG, DCEN for flux-cored self-shielded.",
  },
  {
    id: "troubleshoot-porosity",
    title: "Porosity troubleshooting table",
    src: "/manual/om-43-troubleshoot-porosity.jpg",
    source: "Owner's Manual p.43",
    page: 43,
    tags: ["porosity", "troubleshooting", "thermal"],
    caption:
      "Porosity in weld metal: empty bottle, gas flow wrong, dirty workpiece, CTWD too long, polarity (DCEP MIG / DCEN flux-cored), dirty wire.",
  },
  {
    id: "troubleshoot-tig",
    title: "TIG / Stick troubleshooting",
    src: "/manual/om-44-troubleshoot-tig.jpg",
    source: "Owner's Manual p.44",
    page: 44,
    tags: ["troubleshooting", "tig", "stick"],
    caption: "TIG/Stick: thermal trip, trigger, ground not attached, gas not connected, weak arc, unstable arc.",
  },
  {
    id: "schematic",
    title: "Wiring schematic",
    src: "/manual/om-45-schematic.jpg",
    source: "Owner's Manual p.45",
    page: 45,
    tags: ["schematic", "wiring", "board"],
    caption: "Internal wiring schematic. Service only with power disconnected.",
  },
  {
    id: "specs",
    title: "Specifications",
    src: "/manual/om-07-specs.jpg",
    source: "Owner's Manual p.7",
    page: 7,
    tags: ["specs", "duty cycle", "range"],
    caption: "Rated inputs, current ranges, duty cycles, OCV 86 VDC, wire sizes, spool up to 12 lb.",
  },
  {
    id: "quick-start",
    title: "Quick-start spool loading",
    src: "/manual/qs-01.jpg",
    source: "Quick-start guide p.1",
    page: 1,
    tags: ["spool", "quick start"],
    caption: "2 lb spool loading: wingnut, brake pad, spacer, spindle. Wire unwinds clockwise. Hold gun clear.",
  },
  {
    id: "selection-chart",
    title: "Settings / selection chart",
    src: "/manual/selection-chart.jpg",
    source: "Selection chart (door sticker)",
    page: 1,
    tags: ["settings", "chart", "wire speed", "voltage", "thickness"],
    caption:
      "Factory selection chart from the machine. Use this for recommended wire, gas, WFS, and voltage vs material thickness. Also printed on the inside of the welder door.",
  },
]

export const polarities: PolaritySetup[] = [
  {
    process: "mig",
    polarity: "DCEP",
    groundSocket: "-",
    electrodeSocket: "+",
    electrodeLabel: "Wire feed power cable (MIG gun)",
    gas: "Shielding gas per chart (typically C25 or C100). Flow 20–30 SCFH.",
    notes: [
      "Solid-core / gas-shielded MIG only.",
      "Twist both cables clockwise until they lock.",
      "Gun cable connector must be fully seated in the wire feed socket or gas will leak.",
    ],
    figureId: "polarity-mig",
    source: "Owner's Manual p.14",
  },
  {
    process: "fcaw",
    polarity: "DCEN",
    groundSocket: "+",
    electrodeSocket: "-",
    electrodeLabel: "Wire feed power cable (MIG gun)",
    gas: "None (self-shielded flux-cored). Do not run shielding gas.",
    notes: [
      "Reversed from solid-wire MIG. Wrong polarity is a top cause of porosity and an unstable arc.",
      "Tensioner 2–3 so the flux core is not crushed.",
      "Use the knurled feed roller groove.",
    ],
    figureId: "polarity-fcaw",
    source: "Owner's Manual p.13",
  },
  {
    process: "tig",
    polarity: "DCEN",
    groundSocket: "+",
    electrodeSocket: "-",
    electrodeLabel: "TIG torch cable (torch sold separately)",
    gas: "100% argon. Flow 10–25 SCFH.",
    notes: [
      "Ground clamp → positive socket. Torch → negative socket.",
      "Optional foot pedal plugs into the interior foot pedal socket.",
      "DC TIG for mild steel / stainless. AC TIG for aluminum (machine supports AC TIG).",
      "Manual: TIG is a skilled process; practice on scrap first.",
    ],
    figureId: "polarity-tig",
    source: "Owner's Manual p.24",
  },
  {
    process: "stick",
    polarity: "DCEP",
    groundSocket: "-",
    electrodeSocket: "+",
    electrodeLabel: "Electrode holder",
    gas: "None",
    notes: [
      "Electrode holder → positive. Ground clamp → negative.",
      "No shielding gas. Slag must be chipped after the weld.",
    ],
    figureId: "polarity-stick",
    source: "Owner's Manual p.27",
  },
]

export const dutyPoints: DutyPoint[] = [
  { process: "mig", volts: 240, amps: 200, dutyPct: 25, weldMinutes: 2.5, restMinutes: 7.5, source: "Owner's Manual p.7, p.19, nameplate" },
  { process: "mig", volts: 240, amps: 130, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 240 V MIG X 60%" },
  { process: "mig", volts: 240, amps: 115, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7, p.19" },
  { process: "mig", volts: 120, amps: 100, dutyPct: 40, weldMinutes: 4, restMinutes: 6, source: "Owner's Manual p.7, p.19" },
  { process: "mig", volts: 120, amps: 85, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 120 V MIG X 60%" },
  { process: "mig", volts: 120, amps: 75, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7, p.19" },
  { process: "tig", volts: 240, amps: 175, dutyPct: 30, weldMinutes: 3, restMinutes: 7, source: "Owner's Manual p.7" },
  { process: "tig", volts: 240, amps: 125, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 240 V TIG X 60%" },
  { process: "tig", volts: 240, amps: 105, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7" },
  { process: "tig", volts: 120, amps: 125, dutyPct: 40, weldMinutes: 4, restMinutes: 6, source: "Owner's Manual p.7" },
  { process: "tig", volts: 120, amps: 105, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 120 V TIG X 60%" },
  { process: "tig", volts: 120, amps: 90, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7" },
  { process: "stick", volts: 240, amps: 175, dutyPct: 25, weldMinutes: 2.5, restMinutes: 7.5, source: "Owner's Manual p.7" },
  { process: "stick", volts: 240, amps: 115, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 240 V Stick X 60%" },
  { process: "stick", volts: 240, amps: 100, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7" },
  { process: "stick", volts: 120, amps: 80, dutyPct: 40, weldMinutes: 4, restMinutes: 6, source: "Owner's Manual p.7" },
  { process: "stick", volts: 120, amps: 70, dutyPct: 60, weldMinutes: 6, restMinutes: 4, source: "Nameplate 120 V Stick X 60%" },
  { process: "stick", volts: 120, amps: 60, dutyPct: 100, weldMinutes: 10, restMinutes: 0, source: "Owner's Manual p.7" },
]

export const specs = {
  ocv: "86 VDC",
  mig: {
    input: { "120": "20.8 A at 100 A out", "240": "25.5 A at 200 A out" },
    range: { "120": "30–140 A", "240": "30–220 A" },
    materials: "Mild steel, stainless. Aluminum with optional spool gun.",
    solidWire: ['0.025"', '0.030"', '0.035"'],
    fluxWire: ['0.030"', '0.035"', '0.045"'],
    wfs: "50–500 IPM",
    spool: "Up to 12 lb",
  },
  tig: {
    input: { "120": "20.6 A at 125 A out", "240": "15.6 A at 175 A out" },
    range: { "120": "10–125 A", "240": "10–175 A" },
    materials: "Mild steel, stainless, chrome-moly. AC TIG for aluminum.",
  },
  stick: {
    input: { "120": "19.5 A at 80 A out", "240": "23.7 A at 175 A out" },
    range: { "120": "10–80 A", "240": "10–175 A" },
    materials: "Mild steel, stainless.",
  },
  electrical: [
    "No extension cord.",
    "Use only a supplied power cord or identical replacement. Do not patch cords.",
    "GFCI-protected, delayed-action breaker. 120 VAC needs a 20 A rated receptacle.",
    "Green wire is equipment ground — never defeat it.",
  ],
}

export const procedures: { id: string; title: string; source: string; steps: string[] }[] = [
  {
    id: "duty-overheat",
    title: "If the welder overheats",
    source: "Owner's Manual p.19",
    steps: [
      "LCD shows a warning and output shuts down (thermal protection).",
      "Rest the gun/torch on a non-conductive heat-proof surface (concrete), clear of the ground clamp.",
      "Leave POWER ON so the fan cools the machine.",
      "It returns to service after cooling. Then use shorter welds and longer rests.",
    ],
  },
  {
    id: "vehicle",
    title: "Welding on a vehicle",
    source: "Owner's Manual p.19",
    steps: [
      "Disconnect the vehicle battery at both the positive connection and the ground before welding.",
      "Welding voltage and HF bursts can damage vehicle electronics.",
    ],
  },
  {
    id: "porosity-checks",
    title: "Porosity in flux-cored or MIG",
    source: "Owner's Manual p.37, p.43",
    steps: [
      "Shut off, unplug, discharge the gun to ground before servicing.",
      "Confirm polarity: DCEP for solid MIG, DCEN for self-shielded flux-cored.",
      "Clean the workpiece to bare metal — rust, paint, oil, mill scale cause holes.",
      "Confirm wire is clean (no rust or residue).",
      "Flux-cored: you should not be running shielding gas. MIG: bottle not empty, 20–30 SCFH, nozzle clean, gun connector fully seated.",
      "Keep contact-tip-to-work distance under 1/2 inch.",
      "Hold a steady travel speed. CTWD too long also causes porosity.",
    ],
  },
]

export const troubleshooting = [
  {
    id: "porosity",
    process: ["mig", "fcaw"] as Process[],
    symptom: "Porosity (small holes / cavities in the bead)",
    figureIds: ["porosity", "troubleshoot-porosity", "weld-diagnosis"],
    checks: [
      { cause: "Wrong polarity", fix: "DCEP for MIG solid wire. DCEN for flux-cored. This is the first thing to check on flux-cored." },
      { cause: "Dirty workpiece", fix: "Grind or wire-brush to bright metal." },
      { cause: "Dirty / rusty wire", fix: "Replace or clean wire. Contamination feeds straight into the puddle." },
      { cause: "Shielding gas (MIG only)", fix: "Bottle not empty. Flow 20–30 SCFH. Clean nozzle. Connector fully inserted so O-rings are not exposed." },
      { cause: "Using gas on self-shielded flux-cored", fix: "Turn gas off. Flux-cored is designed to run gasless on this setup." },
      { cause: "CTWD too long or gun too far", fix: "Stay under 1/2 in contact-tip-to-work." },
      { cause: "Inconsistent travel", fix: "Steady speed. Pause only if weaving." },
    ],
    source: "Owner's Manual p.37, p.43",
  },
  {
    id: "unstable-arc",
    process: ["mig", "fcaw"] as Process[],
    symptom: "Unstable welding arc",
    figureIds: ["troubleshoot-mig", "polarity-mig", "polarity-fcaw"],
    checks: [
      { cause: "Wire not feeding", fix: "See wire-feed troubleshooting: tension, roller groove, liner, gun straight." },
      { cause: "Wrong tip / liner size or worn tip", fix: "Match contact tip to wire diameter." },
      { cause: "WFS wrong", fix: "Tune wire feed speed until the arc steadies. White mark on the LCD is the synergic starting point." },
      { cause: "Loose cables", fix: "Tighten gun and ground. Ground on clean bare metal." },
      { cause: "Wrong polarity", fix: "DCEP MIG, DCEN flux-cored." },
      { cause: "Gas too low or too high (MIG)", fix: "Follow settings chart. Fully seat gun connector." },
    ],
    source: "Owner's Manual p.42",
  },
  {
    id: "bird-nest",
    process: ["mig", "fcaw"] as Process[],
    symptom: "Bird's nest at the feeder",
    figureIds: ["wire-feed", "troubleshoot-mig"],
    checks: [
      { cause: "Excess feed pressure", fix: "Back off tensioner. 3–5 solid, 2–3 flux-cored." },
      { cause: "Wrong contact tip", fix: "Tip must match wire size." },
      { cause: "Gun connector not fully in the wire feed socket", fix: "Insert fully, then snug the knob — do not overtighten." },
      { cause: "Damaged liner", fix: "Technician inspect/replace." },
    ],
    source: "Owner's Manual p.42",
  },
]

export const facts: { id: string; text: string; source: string; tags: string[] }[] = [
  { id: "mig-200-240", text: "MIG at 200 A on 240 V is rated 25% duty cycle: 2.5 minutes welding, 7.5 minutes resting in every 10 minutes.", source: "Owner's Manual p.7, p.19", tags: ["duty", "mig"] },
  { id: "tension", text: "Feed tensioner: 3–5 for solid wire, 2–3 for flux-cored. Excess force crushes flux-cored wire and causes feed issues.", source: "Owner's Manual p.15", tags: ["tensioner"] },
  { id: "ctwd", text: "Maintain less than 1/2 inch contact-tip-to-work distance. Long CTWD looks like wrong polarity on the diagnosis chart.", source: "Owner's Manual p.35", tags: ["ctwd"] },
  { id: "shade", text: "Minimum shade 10 welding helmet / full face shield.", source: "Owner's Manual p.3, p.28", tags: ["safety"] },
  { id: "radius", text: "Clear combustibles 35 feet (10 m) around the work.", source: "Owner's Manual p.4", tags: ["safety"] },
  { id: "no-ext", text: "Do not use an extension cord on this welder.", source: "Owner's Manual p.6", tags: ["electrical"] },
  { id: "spool-dir", text: "Spool must unwind clockwise. Loose wingnut lets wire unravel.", source: "Owner's Manual p.10", tags: ["spool"] },
  { id: "mig-gas", text: "MIG shielding gas flow 20–30 SCFH. TIG 10–25 SCFH, 100% argon.", source: "Owner's Manual p.20, p.30", tags: ["gas"] },
]

export function figureById(id: string) {
  return figures.find((f) => f.id === id)
}

export function polarityFor(process: Process) {
  return polarities.find((p) => p.process === process)!
}
