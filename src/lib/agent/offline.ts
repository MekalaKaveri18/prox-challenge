import { renderNamedArtifact } from "@/lib/artifacts/render"
import { figureById, polarityFor } from "@/lib/knowledge/pack"
import { lookupDuty, parseProcess } from "@/lib/knowledge/search"
import type { AgentEvent } from "@/lib/agent/tools"

type Emit = (e: AgentEvent | { type: "text"; text: string }) => void

function emitFigure(emit: Emit, id: string) {
  const f = figureById(id)
  if (!f) return
  emit({ type: "figure", id: f.id, title: f.title, src: f.src, source: f.source, caption: f.caption })
}

function duty(emit: Emit, process: "mig" | "fcaw" | "tig" | "stick", volts: 120 | 240, amps: number) {
  const found = lookupDuty({ process, volts, amps })
  const point = found.exact ?? found.nearest
  const dutyPct = found.exact?.dutyPct ?? found.interpolatedPct ?? point.dutyPct
  const weld = found.exact?.weldMinutes ?? Number(((dutyPct / 100) * 10).toFixed(1))
  const rest = Number((10 - weld).toFixed(1))
  emitFigure(emit, process === "tig" || process === "stick" ? "duty-tig-stick" : "duty-mig")
  const art = renderNamedArtifact("duty", { process, volts, amps, dutyPct, weld, rest, note: found.note })
  emit({ type: "artifact", id: `duty-${process}-${volts}-${amps}`, title: art.title, html: art.html })
  return { dutyPct, weld, rest, note: found.note, exact: Boolean(found.exact) }
}

function polarity(emit: Emit, process: "mig" | "fcaw" | "tig" | "stick") {
  const p = polarityFor(process)
  emitFigure(emit, p.figureId)
  emitFigure(emit, "front-panel")
  const art = renderNamedArtifact("polarity", { process })
  emit({ type: "artifact", id: `polarity-${process}`, title: art.title, html: art.html })
  return p
}

export function runOfflinePack(userText: string, emit: Emit) {
  const q = userText.toLowerCase()

  if (/duty cycle|200\s*a|200a/.test(q) && /mig|240|weld/.test(q)) {
    const d = duty(emit, "mig", 240, 200)
    emit({
      type: "text",
      text: `MIG at **200 A on 240 V** is a rated **${d.dutyPct}% duty cycle** — that's **${d.weld} minutes welding** and **${d.rest} minutes resting** in every 10-minute window (Owner's Manual p.7 and p.19, plus the nameplate).\n\nLeave the power switch ON if it thermal-trips so the fan can cool it. Rest the gun on concrete, away from the ground clamp. The interactive window is that 10-minute clock; the photo is the same diagram from the book.`,
    })
    return
  }

  if (/porosity|holes in|swiss cheese|pinhol/.test(q)) {
    const art = renderNamedArtifact("porosity", {})
    emit({ type: "artifact", id: "porosity", title: art.title, html: art.html })
    emitFigure(emit, "porosity")
    emitFigure(emit, "troubleshoot-porosity")
    emitFigure(emit, "weld-diagnosis")
    const flux = /flux/.test(q)
    emit({
      type: "text",
      text: `${flux ? "Flux-cored porosity" : "Porosity"} is almost never "the machine is junk." Walk it in this order:\n\n1. **Polarity.** ${flux ? "Self-shielded flux-cored is DCEN: ground clamp in the **positive** socket, gun power in the **negative** socket." : "Solid MIG is DCEP; flux-cored is DCEN. Mixing them up is the classic hole-maker."} (Manual p.13 / p.43)\n2. **Bright metal.** Paint, rust, oil, mill scale — grind it off.\n3. **Clean wire.** Rusty flux-core feeds contamination into the puddle.\n4. **Gas.** Flux-cored on this setup is **gasless**. If you're on solid wire, 20–30 SCFH, bottle not empty, nozzle clean, gun connector fully seated so the O-rings aren't showing.\n5. **CTWD under 1/2 inch** and a steady travel speed.\n\nThe photos on the right are the book's diagnosis chart and the porosity troubleshooting table. Check the boxes in the artifact as you go.`,
    })
    if (flux) polarity(emit, "fcaw")
    return
  }

  if (/tig/i.test(q) && /polar|socket|ground|clamp|which/.test(q)) {
    const p = polarity(emit, "tig")
    emit({
      type: "text",
      text: `TIG on the OmniPro 220 is **${p.polarity}**.\n\n- **Ground clamp** goes in the **POSITIVE (+)** socket\n- **TIG torch** (sold separately) goes in the **NEGATIVE (−)** socket\n- Twist both clockwise until they lock\n- Shielding gas is **100% argon**, 10–25 SCFH\n- Optional foot pedal plugs into the socket **inside** the case\n\nPower OFF while you swap dinse plugs. The board is the socket map; the photo is Owner's Manual p.24 so you can match the drawing on the machine.`,
    })
    return
  }

  if (/polar|socket|dcep|dcen/.test(q)) {
    const proc = parseProcess(q.includes("flux") ? "fcaw" : q.includes("stick") ? "stick" : q.includes("tig") ? "tig" : "mig") ?? "mig"
    const p = polarity(emit, proc)
    emit({
      type: "text",
      text: `${proc.toUpperCase()} is **${p.polarity}**. Ground → ${p.groundSocket === "+" ? "POSITIVE (+)" : "NEGATIVE (−)"}. ${p.electrodeLabel} → ${p.electrodeSocket === "+" ? "POSITIVE (+)" : "NEGATIVE (−)"}. ${p.gas}\n\n${p.notes.map((n) => `• ${n}`).join("\n")}\n\n${p.source}`,
    })
    return
  }

  if (/setting|wire speed|voltage|thickness|chart/.test(q)) {
    const art = renderNamedArtifact("settings", {})
    emit({ type: "artifact", id: "settings", title: art.title, html: art.html })
    emitFigure(emit, "selection-chart")
    emitFigure(emit, "settings")
    emit({
      type: "text",
      text: `I will not make up wire-speed numbers. The **selection chart** on the machine (and in the figure pane) is the starting point. On the LCD: Home → process → cables/gas as shown → left knob wire diameter, right knob thickness. The **white mark** is the synergic WFS/voltage for that combo. Then tune off a scrap coupon.`,
    })
    return
  }

  emit({
    type: "text",
    text: `Offline pack mode (no API key) — I can still pull duty cycle, polarity, porosity, and the selection chart from the compiled manual. Add ANTHROPIC_API_KEY to .env.local for the Claude Agent SDK.\n\nTry the starter questions, or ask about sockets, duty cycle, wire tension (3–5 solid / 2–3 flux-cored), or the front panel.`,
  })
  emitFigure(emit, "front-panel")
}
