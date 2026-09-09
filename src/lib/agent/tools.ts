import { z } from "zod"
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk"
import { renderNamedArtifact } from "@/lib/artifacts/render"
import { figureById, figures, polarityFor, type Process } from "@/lib/knowledge/pack"
import { lookupDuty, parseProcess, searchKnowledge } from "@/lib/knowledge/search"

export type AgentEvent =
  | { type: "figure"; id: string; title: string; src: string; source: string; caption: string }
  | { type: "artifact"; id: string; title: string; html: string }
  | { type: "status"; text: string }

export type EventSink = (e: AgentEvent) => void

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  }
}

function asProcess(raw: string): Process {
  return parseProcess(raw) ?? "mig"
}

export function createOmniServer(emit: EventSink) {
  return createSdkMcpServer({
    name: "omni",
    version: "1.0.0",
    tools: [
      tool(
        "lookup_spec",
        "Search the compiled OmniPro 220 knowledge pack (facts, polarity, troubleshooting, procedures, figures). Use this before answering technical questions.",
        { query: z.string() },
        async ({ query }) => {
          emit({ type: "status", text: `Looking up: ${query}` })
          const result = searchKnowledge(query)
          for (const hit of result.hits) {
            if (hit.kind === "figure") {
              const f = hit.payload as { id: string; title: string; src: string; source: string; caption: string }
              emit({ type: "figure", ...f })
            }
          }
          return jsonResult(result)
        }
      ),
      tool(
        "get_duty_cycle",
        "Look up rated duty cycle. process: mig|fcaw|tig|stick. volts: 120 or 240. amps: welding current. Flux-cored uses the MIG output ratings.",
        {
          process: z.string(),
          volts: z.number(),
          amps: z.number(),
        },
        async ({ process, volts, amps }) => {
          const proc = asProcess(process)
          const v = volts === 120 ? 120 : 240
          const found = lookupDuty({ process: proc, volts: v, amps })
          const point = found.exact ?? found.nearest
          const dutyPct = found.exact?.dutyPct ?? found.interpolatedPct ?? point.dutyPct
          const weld = found.exact?.weldMinutes ?? Number(((dutyPct / 100) * 10).toFixed(1))
          const rest = Number((10 - weld).toFixed(1))
          emit({ type: "status", text: `Duty cycle ${proc.toUpperCase()} ${amps}A @ ${v}V` })
          const fig = figureById(proc === "mig" || proc === "fcaw" ? "duty-mig" : "duty-tig-stick")
          if (fig) emit({ type: "figure", id: fig.id, title: fig.title, src: fig.src, source: fig.source, caption: fig.caption })
          const art = renderNamedArtifact("duty", {
            process: proc,
            volts: v,
            amps,
            dutyPct,
            weld,
            rest,
            note: found.note,
          })
          emit({ type: "artifact", id: `duty-${proc}-${v}-${amps}`, title: art.title, html: art.html })
          return jsonResult({ process: proc, volts: v, amps, ...found, display: { dutyPct, weld, rest } })
        }
      ),
      tool(
        "get_polarity",
        "Return exact dinse socket assignments for a process and emit a polarity board plus the matching manual photo.",
        { process: z.string() },
        async ({ process }) => {
          const proc = asProcess(process)
          const p = polarityFor(proc)
          emit({ type: "status", text: `Polarity ${proc.toUpperCase()} ${p.polarity}` })
          const fig = figureById(p.figureId)
          if (fig) emit({ type: "figure", id: fig.id, title: fig.title, src: fig.src, source: fig.source, caption: fig.caption })
          const art = renderNamedArtifact("polarity", { process: proc })
          emit({ type: "artifact", id: `polarity-${proc}`, title: art.title, html: art.html })
          return jsonResult(p)
        }
      ),
      tool(
        "get_figure",
        "Surface a manual page image in the UI. Pass an id from the catalog or a tag like polarity, porosity, duty, schematic, selection-chart, front-panel, wire-feed.",
        { idOrTag: z.string() },
        async ({ idOrTag }) => {
          const key = idOrTag.toLowerCase()
          const match =
            figures.find((f) => f.id === key) ||
            figures.find((f) => f.tags.some((t) => t.toLowerCase() === key || key.includes(t.toLowerCase()))) ||
            figures.find((f) => `${f.title} ${f.caption}`.toLowerCase().includes(key))
          if (!match) return jsonResult({ error: "No figure", ids: figures.map((f) => f.id) })
          emit({ type: "figure", id: match.id, title: match.title, src: match.src, source: match.source, caption: match.caption })
          return jsonResult(match)
        }
      ),
      tool(
        "render_artifact",
        "Show an interactive Claude-style artifact. kind: polarity | duty | porosity | settings | troubleshoot. For polarity pass process. For duty pass process, volts, amps, dutyPct, weld, rest, note.",
        {
          kind: z.string(),
          process: z.string().optional(),
          volts: z.number().optional(),
          amps: z.number().optional(),
          dutyPct: z.number().optional(),
          weld: z.number().optional(),
          rest: z.number().optional(),
          note: z.string().optional(),
        },
        async (params) => {
          const kind = params.kind as "polarity" | "duty" | "porosity" | "settings" | "troubleshoot"
          const art = renderNamedArtifact(kind, params)
          emit({ type: "artifact", id: `art-${kind}-${Date.now()}`, title: art.title, html: art.html })
          return jsonResult({ ok: true, title: art.title })
        }
      ),
      tool(
        "list_figures",
        "List every manual figure the UI can display.",
        {},
        async () => jsonResult(figures.map((f) => ({ id: f.id, title: f.title, tags: f.tags, source: f.source })))
      ),
    ],
  })
}

export const MCP_TOOL_NAMES = [
  "mcp__omni__lookup_spec",
  "mcp__omni__get_duty_cycle",
  "mcp__omni__get_polarity",
  "mcp__omni__get_figure",
  "mcp__omni__render_artifact",
  "mcp__omni__list_figures",
]
