import { polarityFor, type Process } from "@/lib/knowledge/pack"

const CSS = `
  :root { --bg:#10110f; --ink:#f4efe4; --dim:#b7b09f; --line:#3a372e; --hot:#e4572e; --ok:#c6b07a; --pos:#d4a017; --neg:#7aa2c4; }
  * { box-sizing:border-box; }
  body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background:var(--bg); color:var(--ink); padding:16px; }
  h1 { font-size:15px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; margin:0 0 8px; color:var(--ok); }
  p { margin:0 0 10px; color:var(--dim); font-size:13px; line-height:1.45; }
  .src { font-size:11px; color:#8a8373; }
  .panel { border:1px solid var(--line); border-radius:14px; padding:16px; background:#181914; }
  .sockets { display:flex; gap:18px; justify-content:center; margin:18px 0 8px; }
  .sock { width:92px; height:92px; border-radius:50%; border:4px solid var(--line); display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; }
  .sock.on-pos { border-color:var(--pos); box-shadow:0 0 0 6px rgba(212,160,23,.18); }
  .sock.on-neg { border-color:var(--neg); box-shadow:0 0 0 6px rgba(122,162,196,.18); }
  .sock span { font-size:11px; font-weight:600; color:var(--dim); margin-top:4px; }
  .legend { display:grid; gap:8px; margin-top:12px; font-size:13px; }
  .legend b { color:var(--ink); }
  .warn { margin-top:12px; padding:10px 12px; border-radius:10px; background:#2a1a14; color:#f0c7b8; font-size:12px; }
  label { font-size:12px; color:var(--dim); display:block; margin:10px 0 4px; }
  select, input { background:#0d0e0c; color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px 10px; width:100%; }
  .bar { height:14px; background:#2a281f; border-radius:99px; overflow:hidden; margin:8px 0; }
  .bar > i { display:block; height:100%; background:linear-gradient(90deg,var(--ok),var(--hot)); }
  .kpi { display:flex; gap:12px; margin-top:10px; }
  .kpi div { flex:1; border:1px solid var(--line); border-radius:10px; padding:10px; text-align:center; }
  .kpi strong { display:block; font-size:20px; }
  button { background:var(--hot); color:#fff; border:0; border-radius:8px; padding:8px 12px; font-weight:700; cursor:pointer; }
  .checks { display:grid; gap:8px; }
  .checks label { display:flex; gap:8px; align-items:flex-start; color:var(--ink); font-size:13px; }
`

function shell(title: string, body: string, extraScript = "") {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${CSS}</style></head><body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <script>${extraScript}</script>
  </body></html>`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}

export function polarityArtifact(process: Process) {
  const p = polarityFor(process)
  const processLabel =
    process === "mig" ? "MIG (solid wire, gas)" : process === "fcaw" ? "Flux-cored (gasless)" : process === "tig" ? "TIG" : "Stick"
    const body = `
    <p>${escapeHtml(processLabel)} on the OmniPro 220 uses <b style="color:var(--ink)">${p.polarity}</b>. Plug the cables like this — reversing them can wreck the weld and, on flux-cored, is a classic porosity cause.</p>
    <div class="panel">
      <div class="sockets">
        <div class="sock on-pos">+<span>${p.electrodeSocket === "+" ? "Gun / torch / stinger" : "Ground clamp"}</span></div>
        <div class="sock on-neg">−<span>${p.electrodeSocket === "-" ? "Gun / torch / stinger" : "Ground clamp"}</span></div>
      </div>
      <div class="legend">
        <div><b>Ground clamp</b> → ${p.groundSocket === "+" ? "POSITIVE (+)" : "NEGATIVE (−)"} socket</div>
        <div><b>${escapeHtml(p.electrodeLabel)}</b> → ${p.electrodeSocket === "+" ? "POSITIVE (+)" : "NEGATIVE (−)"} socket</div>
        <div><b>Gas</b> — ${escapeHtml(p.gas)}</div>
      </div>
      <div class="warn">Twist each dinse plug clockwise until it locks. Power OFF while swapping. ${escapeHtml(p.source)}</div>
    </div>`
  return shell(`${processLabel} polarity`, body)
}

export function dutyArtifact(opts: { process: Process; volts: 120 | 240; amps: number; dutyPct: number; weld: number; rest: number; note: string }) {
  const label = opts.process === "fcaw" ? "MIG / flux-cored output" : opts.process.toUpperCase()
  const body = `
    <p>Duty cycle is how many minutes you can weld in a 10-minute window at this current without cooking the machine.</p>
    <div class="panel">
      <p>${label} · ${opts.volts} VAC · ${opts.amps} A → <b style="color:var(--ink)">${opts.dutyPct}%</b></p>
      <div class="bar"><i style="width:${opts.dutyPct}%"></i></div>
      <div class="kpi">
        <div><strong>${opts.weld}</strong><span class="src">min weld</span></div>
        <div><strong>${opts.rest}</strong><span class="src">min rest</span></div>
        <div><strong>10</strong><span class="src">min window</span></div>
      </div>
      <p class="src" style="margin-top:12px">${escapeHtml(opts.note)}</p>
      <p class="warn">If the LCD shows overheat, leave POWER ON so the fan runs. Rest the gun on concrete, away from the ground clamp.</p>
    </div>`
  return shell("Duty cycle", body)
}

export function porosityArtifact() {
  const body = `
    <p>Walk these in order. Flux-cored porosity is usually polarity or dirty metal — not “the machine is broken.”</p>
    <div class="panel checks">
      ${[
        "Power OFF, unplug, discharge the gun to ground before you wrench on anything.",
        "Polarity: DCEN for flux-cored (ground on +, gun power on −). DCEP for solid MIG (opposite).",
        "Workpiece is bright metal — no paint, rust, oil, mill scale.",
        "Wire is clean. Rusty flux-cored will hole the bead.",
        "If flux-cored: gas OFF. If solid MIG: bottle has gas, 20–30 SCFH, nozzle clean, gun connector fully seated.",
        "CTWD under 1/2 inch. Steady travel.",
      ]
        .map((c, i) => `<label><input type="checkbox"/> <span><b>${i + 1}.</b> ${c}</span></label>`)
        .join("")}
    </div>
    <p class="src">Owner's Manual p.37 (diagnosis photos) and p.43 (porosity table).</p>`
  return shell("Porosity checklist", body)
}

export function settingsArtifact() {
  const body = `
    <p>The OmniPro is synergic: pick process, wire size, and thickness, then start at the white mark on the LCD. The door sticker is the authority for starting numbers — we show it rather than inventing a chart.</p>
    <div class="panel">
      <label>Process</label>
      <select id="p">
        <option value="mig">MIG solid / gas</option>
        <option value="fcaw">Flux-cored / gasless</option>
        <option value="tig">TIG</option>
        <option value="stick">Stick</option>
      </select>
      <p id="out" style="margin-top:12px;color:var(--ink)"></p>
    </div>`
  const extra = `
      const map = {
        mig: 'Ground on NEGATIVE. Gun power on POSITIVE (DCEP). Gas 20–30 SCFH. Solid wire 0.025 / 0.030 / 0.035. V-groove roller. Tension 3–5.',
        fcaw: 'Ground on POSITIVE. Gun power on NEGATIVE (DCEN). No gas. Flux-cored 0.030 / 0.035 / 0.045. Knurled roller. Tension 2–3.',
        tig: 'Ground on POSITIVE. Torch on NEGATIVE (DCEN). 100% argon 10–25 SCFH. Torch sold separately. Practice on scrap.',
        stick: 'Holder on POSITIVE. Ground on NEGATIVE (DCEP). No gas. Chip slag after the bead.'
      };
      const p = document.getElementById('p');
      const out = document.getElementById('out');
      function draw(){ out.textContent = map[p.value]; }
      p.onchange = draw; draw();`
  return shell("Settings configurator", body, extra)
}

export function renderNamedArtifact(
  kind: "polarity" | "duty" | "porosity" | "settings" | "troubleshoot",
  params: Record<string, string | number | undefined>
) {
  if (kind === "polarity") {
    const process = (params.process as Process) || "mig"
    return { title: "Polarity board", html: polarityArtifact(process) }
  }
  if (kind === "duty") {
    return {
      title: "Duty cycle",
      html: dutyArtifact({
        process: (params.process as Process) || "mig",
        volts: params.volts === 120 ? 120 : 240,
        amps: Number(params.amps) || 200,
        dutyPct: Number(params.dutyPct) || 25,
        weld: Number(params.weld) || 2.5,
        rest: Number(params.rest) || 7.5,
        note: String(params.note || ""),
      }),
    }
  }
  if (kind === "porosity" || kind === "troubleshoot") {
    return { title: "Porosity / defect walkthrough", html: porosityArtifact() }
  }
  return { title: "Settings", html: settingsArtifact() }
}
