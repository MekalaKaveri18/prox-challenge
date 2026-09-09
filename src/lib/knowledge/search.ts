import {
  type Process,
  dutyPoints,
  facts,
  figures,
  polarities,
  procedures,
  specs,
  troubleshooting,
  type DutyPoint,
} from "./pack"

const PROCESS_ALIASES: Record<string, Process> = {
  mig: "mig",
  gmaw: "mig",
  "solid core": "mig",
  solid: "mig",
  "gas shielded": "mig",
  flux: "fcaw",
  fcaw: "fcaw",
  "flux-cored": "fcaw",
  "flux cored": "fcaw",
  fluxcore: "fcaw",
  gasless: "fcaw",
  tig: "tig",
  gtaw: "tig",
  stick: "stick",
  smaw: "stick",
  arc: "stick",
}

export function parseProcess(raw?: string | null): Process | null {
  if (!raw) return null
  const k = raw.trim().toLowerCase()
  return PROCESS_ALIASES[k] ?? null
}

export function lookupDuty(opts: {
  process: Process
  volts: 120 | 240
  amps: number
}): {
  exact: DutyPoint | null
  nearest: DutyPoint
  interpolatedPct: number | null
  note: string
} {
  const process = opts.process === "fcaw" ? "mig" : opts.process
  const pool = dutyPoints.filter((d) => d.process === process && d.volts === opts.volts)
  const exact = pool.find((d) => d.amps === opts.amps) ?? null
  const nearest = pool.reduce((best, d) =>
    Math.abs(d.amps - opts.amps) < Math.abs(best.amps - opts.amps) ? d : best
  )
  let interpolatedPct: number | null = null
  const sorted = [...pool].sort((a, b) => a.amps - b.amps)
  const hi = sorted.find((d) => d.amps >= opts.amps)
  const lo = [...sorted].reverse().find((d) => d.amps <= opts.amps)
  if (lo && hi && lo.amps !== hi.amps) {
    const t = (opts.amps - lo.amps) / (hi.amps - lo.amps)
    interpolatedPct = Math.round(lo.dutyPct + t * (hi.dutyPct - lo.dutyPct))
  } else if (exact) {
    interpolatedPct = exact.dutyPct
  }

  const inRange =
    (process === "mig" && opts.volts === 240 && opts.amps >= 30 && opts.amps <= 220) ||
    (process === "mig" && opts.volts === 120 && opts.amps >= 30 && opts.amps <= 140) ||
    (process === "tig" && opts.volts === 240 && opts.amps >= 10 && opts.amps <= 175) ||
    (process === "tig" && opts.volts === 120 && opts.amps >= 10 && opts.amps <= 125) ||
    (process === "stick" && opts.volts === 240 && opts.amps >= 10 && opts.amps <= 175) ||
    (process === "stick" && opts.volts === 120 && opts.amps >= 10 && opts.amps <= 80)

  const note = !inRange
    ? `That amperage is outside the ${process.toUpperCase()} range on ${opts.volts} V. Check the spec plate before running it.`
    : exact
      ? "Rated nameplate / manual value — not an estimate."
      : `Manual publishes rated points, not every amp. Nearest rated point is ${nearest.dutyPct}% at ${nearest.amps} A. Linear interpolation between published points is ${interpolatedPct}%. Prefer the rated point; thermal protection will still trip if you push it.`

  return { exact, nearest, interpolatedPct, note }
}

export function searchKnowledge(query: string, limit = 8) {
  const q = query.toLowerCase()
  const tokens = q.split(/[^a-z0-9+]+/).filter((t) => t.length > 2)
  const score = (text: string, tags: string[] = []) => {
    const hay = `${text} ${tags.join(" ")}`.toLowerCase()
    let s = 0
    for (const t of tokens) {
      if (hay.includes(t)) s += 2
    }
    if (hay.includes(q)) s += 5
    return s
  }

  const hits: { kind: string; score: number; payload: unknown }[] = []

  for (const f of facts) {
    const s = score(f.text, f.tags)
    if (s) hits.push({ kind: "fact", score: s, payload: f })
  }
  for (const f of figures) {
    const s = score(`${f.title} ${f.caption}`, f.tags)
    if (s) hits.push({ kind: "figure", score: s, payload: { id: f.id, title: f.title, src: f.src, source: f.source, caption: f.caption } })
  }
  for (const p of polarities) {
    const s = score(`${p.process} ${p.polarity} ${p.notes.join(" ")} ${p.gas}`, [p.process, p.polarity])
    if (s) hits.push({ kind: "polarity", score: s, payload: p })
  }
  for (const t of troubleshooting) {
    const s = score(`${t.symptom} ${t.checks.map((c) => `${c.cause} ${c.fix}`).join(" ")}`)
    if (s) hits.push({ kind: "troubleshoot", score: s, payload: t })
  }
  for (const p of procedures) {
    const s = score(`${p.title} ${p.steps.join(" ")}`)
    if (s) hits.push({ kind: "procedure", score: s, payload: p })
  }

  hits.sort((a, b) => b.score - a.score)
  return {
    specs,
    hits: hits.slice(0, limit),
  }
}
