"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import MessageBubble from "./message-bubble"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatAreaProps {
  messages: Message[]
  onSendMessage: (prompt: string) => void
  isLoading: boolean
  selectedPdfCount?: number
}

export default function ChatArea({ messages, onSendMessage, isLoading, selectedPdfCount }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 md:p-6">
        <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Talk to Your PDFs
        </h1>
        {selectedPdfCount && selectedPdfCount > 0 ? (
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing {selectedPdfCount} PDF{selectedPdfCount !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">Select at least one PDF to start</p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mb-4 text-5xl">📄</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Welcome to PDF Chat</h2>
            <p className="text-muted-foreground max-w-md">
              Upload PDFs from the sidebar, select them, and ask questions about their content. I'll provide answers
              based on the documents.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="flex-1 bg-card rounded-lg p-4">
                  <p className="text-muted-foreground">Analyzing your question...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 md:p-6 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your PDFs..."
            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || (selectedPdfCount || 0) === 0}
            className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
