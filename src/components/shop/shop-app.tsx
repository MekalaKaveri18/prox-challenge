"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ImagePlus, Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react"

type FigureEvt = { type: "figure"; id: string; title: string; src: string; source: string; caption: string }
type ArtifactEvt = { type: "artifact"; id: string; title: string; html: string }
type Msg = { role: "user" | "assistant"; text: string; figures?: FigureEvt[]; artifacts?: ArtifactEvt[] }

const STARTERS = [
  "What's the duty cycle for MIG welding at 200A on 240V?",
  "I'm getting porosity in my flux-cored welds. What should I check?",
  "What polarity setup do I need for TIG welding? Which socket does the ground clamp go in?",
]

type SpeechRec = {
  start: () => void
  stop: () => void
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
  onend: (() => void) | null
  continuous: boolean
  interimResults: boolean
  lang: string
}

export function ShopApp() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("")
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [mode, setMode] = useState<"sdk" | "offline" | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeArtifact, setActiveArtifact] = useState<ArtifactEvt | null>(null)
  const [activeFigure, setActiveFigure] = useState<FigureEvt | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRec | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { hasKey: boolean }) => setHasKey(d.hasKey))
      .catch(() => setHasKey(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  const figures = useMemo(() => {
    const all: FigureEvt[] = []
    for (const m of messages) {
      for (const f of m.figures ?? []) {
        if (!all.some((x) => x.id === f.id)) all.push(f)
      }
    }
    return all
  }, [messages])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setError(null)
    setInput("")
    const user: Msg = { role: "user", text: trimmed }
    const next = [...messages, user]
    setMessages(next)
    setBusy(true)
    setStatus("Thinking…")

    const assistant: Msg = { role: "assistant", text: "", figures: [], artifacts: [] }
    setMessages([...next, assistant])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          sessionId,
          imageDataUrl: photo,
        }),
      })
      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let acc = ""
      const figs: FigureEvt[] = []
      const arts: ArtifactEvt[] = []

      const flush = () => {
        setMessages([...next, { role: "assistant", text: acc, figures: [...figs], artifacts: [...arts] }])
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const chunks = buf.split("\n\n")
        buf = chunks.pop() ?? ""
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: "))
          if (!line) continue
          const ev = JSON.parse(line.slice(6)) as Record<string, unknown>
          if (ev.type === "text") {
            acc += String(ev.text)
            flush()
          } else if (ev.type === "figure") {
            const f = ev as unknown as FigureEvt
            if (!figs.some((x) => x.id === f.id)) figs.push(f)
            setActiveFigure(f)
            flush()
          } else if (ev.type === "artifact") {
            const a = ev as unknown as ArtifactEvt
            arts.push(a)
            setActiveArtifact(a)
            flush()
          } else if (ev.type === "status") {
            setStatus(String(ev.text))
          } else if (ev.type === "session") {
            setSessionId(String(ev.sessionId))
          } else if (ev.type === "mode") {
            setMode(ev.mode as "sdk" | "offline")
          } else if (ev.type === "error") {
            setError(String(ev.message))
          }
        }
      }
      if (!acc && !error) {
        acc = arts.length || figs.length ? "Diagrams are on the right." : "No reply — check the API key and try again."
        flush()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setBusy(false)
      setStatus("")
      setPhoto(null)
    }
  }

  function toggleMic() {
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec })
      .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition
    if (!SR) {
      setError("This browser has no speech recognition. Type instead.")
      return
    }
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SR()
    rec.lang = "en-US"
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript
      if (t) setInput((prev) => (prev ? `${prev} ${t}` : t))
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  function speakLast() {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.text)
    if (!last || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(last.text.replace(/\*\*/g, ""))
    u.rate = 1.02
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0f0c] text-[#f3eee4]">
      <header className="flex items-center justify-between gap-3 border-b border-[#2c2a22] px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <img src="/product/omnipro.webp" alt="" className="size-10 rounded-md object-cover ring-1 ring-[#3a372e]" />
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#c6b07a] uppercase">Prox challenge</p>
            <h1 className="text-base font-semibold tracking-tight">OmniPro 220 shop tech</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasKey === false && (
            <Badge variant="outline" className="hidden sm:inline-flex border-[#5c4a22] text-[#c6b07a]">
              Pack preview · add ANTHROPIC_API_KEY for Agent SDK
            </Badge>
          )}
          {mode === "sdk" && (
            <Badge className="bg-[#e4572e] text-white">Claude Agent SDK</Badge>
          )}
          {mode === "offline" && <Badge variant="secondary">Compiled pack</Badge>}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]">
        <section className="flex min-h-[50vh] flex-col border-b border-[#2c2a22] lg:border-r lg:border-b-0">
          <ScrollArea className="flex-1">
            <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 md:px-6">
              {messages.length === 0 && (
                <EmptyState onPick={(q) => send(q)} />
              )}
              {messages.map((m, i) => (
                <article
                  key={i}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-auto bg-[#e4572e] text-white"
                      : "bg-[#181914] ring-1 ring-[#322f27]"
                  )}
                >
                  {m.text || (busy && i === messages.length - 1 ? status || "…" : "")}
                  {m.role === "assistant" && (m.figures?.length || m.artifacts?.length) ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.artifacts?.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className="rounded-full bg-[#2a281f] px-2 py-0.5 text-[11px] text-[#c6b07a]"
                          onClick={() => setActiveArtifact(a)}
                        >
                          Artifact · {a.title}
                        </button>
                      ))}
                      {m.figures?.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className="rounded-full bg-[#2a281f] px-2 py-0.5 text-[11px] text-[#7aa2c4]"
                          onClick={() => setActiveFigure(f)}
                        >
                          {f.source}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
              {status && busy ? <p className="text-xs text-[#8a8373]">{status}</p> : null}
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <form
            className="border-t border-[#2c2a22] p-3 md:p-4"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            {photo ? (
              <div className="mb-2 flex items-center gap-2 text-xs text-[#b7b09f]">
                <img src={photo} alt="attach" className="h-10 rounded object-cover" />
                Photo attached
                <button type="button" className="underline" onClick={() => setPhoto(null)}>
                  remove
                </button>
              </div>
            ) : null}
            <div className="flex items-end gap-2 rounded-2xl bg-[#181914] p-2 ring-1 ring-[#322f27]">
              <label className="grid size-9 place-items-center rounded-xl text-[#b7b09f] hover:bg-[#2a281f]">
                <ImagePlus className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setPhoto(String(reader.result))
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void send(input)
                  }
                }}
                rows={2}
                placeholder="Ask about polarity, duty cycle, a bad bead…"
                className="min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[#6f6a5c]"
              />
              <Button type="button" variant="ghost" size="icon" onClick={toggleMic} aria-label="Voice">
                {listening ? <MicOff className="size-4 text-[#e4572e]" /> : <Mic className="size-4" />}
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={speakLast} aria-label="Speak reply">
                <Volume2 className="size-4" />
              </Button>
              <Button type="submit" disabled={busy} className="bg-[#e4572e] text-white hover:bg-[#c44722]">
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </section>

        <aside className="flex min-h-[40vh] flex-col bg-[#12130f]">
          <div className="flex items-center justify-between border-b border-[#2c2a22] px-4 py-2">
            <p className="text-xs tracking-wide text-[#c6b07a] uppercase">Workbench</p>
            <span className="text-[11px] text-[#6f6a5c]">Artifacts + manual pages</span>
          </div>
          {activeArtifact ? (
            <iframe
              title={activeArtifact.title}
              className="h-[46%] min-h-[220px] w-full border-b border-[#2c2a22] bg-[#10110f]"
              sandbox="allow-scripts"
              srcDoc={activeArtifact.html}
            />
          ) : (
            <div className="grid h-[46%] min-h-[220px] place-items-center px-8 text-center text-sm text-[#8a8373]">
              Ask about polarity, duty cycle, or a bad weld — I will draw it.
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col">
            {activeFigure ? (
              <figure className="flex min-h-0 flex-1 flex-col">
                <img src={activeFigure.src} alt={activeFigure.title} className="max-h-[48vh] w-full object-contain bg-black" />
                <figcaption className="border-t border-[#2c2a22] px-4 py-2 text-xs text-[#b7b09f]">
                  <span className="font-medium text-[#f3eee4]">{activeFigure.title}</span>
                  <span className="text-[#6f6a5c]"> · {activeFigure.source}</span>
                  <p className="mt-1">{activeFigure.caption}</p>
                </figcaption>
              </figure>
            ) : (
              <div className="grid flex-1 place-items-center px-6 text-center text-sm text-[#8a8373]">
                Manual photos land here. Selection chart, sockets, diagnosis.
              </div>
            )}
            {figures.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-[#2c2a22] p-2">
                {figures.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFigure(f)}
                    className={cn(
                      "h-14 w-12 shrink-0 overflow-hidden rounded ring-1 ring-[#322f27]",
                      activeFigure?.id === f.id && "ring-[#c6b07a]"
                    )}
                  >
                    <img src={f.src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl ring-1 ring-[#322f27]">
        <img src="/product/omnipro-inside.webp" alt="OmniPro 220 inside panel" className="h-40 w-full object-cover" />
      </div>
      <div>
        <p className="flex items-center gap-2 text-sm text-[#c6b07a]">
          <Sparkles className="size-4" /> Standing in the garage with a 48-page manual. Ask like you would a tech.
        </p>
        <p className="mt-2 text-sm text-[#b7b09f]">
          Answers come from a compiled knowledge pack (duty tables, polarity maps, troubleshooting) plus the actual pages. If it should be a diagram, you get a diagram.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {STARTERS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-xl bg-[#181914] px-3 py-2 text-left text-sm ring-1 ring-[#322f27] hover:ring-[#c6b07a]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
