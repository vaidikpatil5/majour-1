"use client"

import { FileText } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-accent text-accent-foreground" : "bg-primary/20 text-primary"
        }`}
      >
        {isUser ? <span className="text-sm font-semibold">U</span> : <FileText className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? "bg-accent text-accent-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border border-border"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
