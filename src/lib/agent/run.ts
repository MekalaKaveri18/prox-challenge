import { query } from "@anthropic-ai/claude-agent-sdk"
import { SYSTEM_PROMPT } from "./prompt"
import { MCP_TOOL_NAMES, createOmniServer, type AgentEvent } from "./tools"

export type ChatTurn = { role: "user" | "assistant"; text: string }

export type RunInput = {
  messages: ChatTurn[]
  sessionId?: string | null
  imageDataUrl?: string | null
  onEvent: (e: AgentEvent | { type: "text"; text: string } | { type: "session"; sessionId: string }) => void
}

function buildPrompt(messages: ChatTurn[], imageDataUrl?: string | null) {
  const history = messages
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "User" : "Tech"}: ${m.text}`)
    .join("\n\n")
  const last = messages[messages.length - 1]?.text ?? ""
  const photo = imageDataUrl
    ? "\n\nThe user attached a photo of their weld or setup (base64 data URL follows). Compare it to the diagnosis charts.\n" +
      imageDataUrl.slice(0, 120) +
      "… (full image is in the conversation UI; describe from the caption they typed and pull diagnosis figures)."
    : ""
  return [history && `Prior conversation:\n${history}`, `User: ${last}${photo}`].filter(Boolean).join("\n\n")
}

export async function runOmniAgent(input: RunInput) {
  const server = createOmniServer((e) => input.onEvent(e))
  let sessionId = input.sessionId ?? undefined

  let streamed = false
  const q = query({
    prompt: buildPrompt(input.messages, input.imageDataUrl),
    options: {
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: { omni: server },
      allowedTools: MCP_TOOL_NAMES,
      disallowedTools: ["Bash", "BashOutput", "KillShell", "Write", "Edit", "NotebookEdit", "WebSearch", "WebFetch", "Task"],
      permissionMode: "dontAsk",
      permissionPrompts: "none",
      settingSources: [],
      strictMcpConfig: true,
      allowDangerouslySkipPermissions: false,
      maxTurns: 12,
      ...(sessionId ? { resume: sessionId } : {}),
      includePartialMessages: true,
      thinking: { type: "disabled" },
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      },
    },
  })

  for await (const message of q) {
    if ("session_id" in message && typeof message.session_id === "string" && message.session_id) {
      sessionId = message.session_id
      input.onEvent({ type: "session", sessionId })
    }

    if (message.type === "stream_event") {
      const event = (message as { event?: { type?: string; delta?: { type?: string; text?: string } } }).event
      if (event?.delta?.type === "text_delta" && event.delta.text) {
        input.onEvent({ type: "text", text: event.delta.text })
        streamed = true
      }
      continue
    }

    if (message.type === "assistant") {
      const content = message.message.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "text" && block.text && !streamed) {
            input.onEvent({ type: "text", text: block.text })
          }
          if (block.type === "tool_use") {
            input.onEvent({ type: "status", text: `Using ${block.name}` })
          }
        }
      }
    }

    if (message.type === "result") {
      const result = message as { subtype?: string; errors?: unknown }
      if (result.subtype && result.subtype !== "success") {
        throw new Error(`Agent failed: ${JSON.stringify(result.errors ?? result.subtype)}`)
      }
    }
  }

  return { sessionId }
}
