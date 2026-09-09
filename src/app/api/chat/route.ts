import { runOfflinePack } from "@/lib/agent/offline"
import { runOmniAgent, type ChatTurn } from "@/lib/agent/run"

export const maxDuration = 120

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: ChatTurn[]
    sessionId?: string | null
    imageDataUrl?: string | null
  }
  const messages = body.messages?.filter((m) => m.text?.trim()) ?? []
  if (!messages.length) {
    return Response.json({ error: "Empty message" }, { status: 400 })
  }

  const key = process.env.ANTHROPIC_API_KEY
  const hasKey = Boolean(key && !key.includes("your-api-key"))

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }
      try {
        if (!hasKey) {
          send({ type: "mode", mode: "offline" })
          runOfflinePack(messages[messages.length - 1]!.text, (e) => send(e))
          send({ type: "done" })
          return
        }
        send({ type: "mode", mode: "sdk" })
        await runOmniAgent({
          messages,
          sessionId: body.sessionId,
          imageDataUrl: body.imageDataUrl,
          onEvent: (e) => send(e),
        })
        send({ type: "done" })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Agent error"
        send({ type: "error", message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  const hasKey = Boolean(key && !key.includes("your-api-key"))
  return Response.json({ hasKey, product: "Vulcan OmniPro 220" })
}
