"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"

const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_URL || "http://localhost:5000"

interface PDFFile {
  id: string
  name: string
  file: File
}

export default function Home() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([])
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([])
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddPdf = (files: FileList) => {
    console.log("handleAddPdf called with files:", files.length)
    Array.from(files).forEach((file) => {
      console.log("Processing file:", file.name)
      const newPdf: PDFFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file: file,
      }
      setPdfs((prev) => [...prev, newPdf])
      setSelectedPdfIds((prev) => [...prev, newPdf.id])
    })
    console.log("PDFs state updated, current count:", pdfs.length + files.length)
  }

  const handleRemovePdf = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id))
    setSelectedPdfIds((prev) => prev.filter((pId) => pId !== id))
  }

  const handleTogglePdfSelection = (id: string) => {
    setSelectedPdfIds((prev) => (prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]))
  }

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim() || selectedPdfIds.length === 0) {
      alert("Please select at least one PDF")
      return
    }

    const userMessage = { id: Date.now().toString(), role: "user" as const, content: prompt }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("query_box", prompt)
      formData.append("query_submission", "true")

      // Add selected PDF files to FormData
      selectedPdfIds.forEach((id) => {
        const pdf = pdfs.find((p) => p.id === id)
        if (pdf) {
          formData.append("files", pdf.file, pdf.name)
        }
      })

      const response = await fetch(`${FLASK_API_URL}/response_page`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Flask API error: ${response.status}`)
      }

      const jsonResponse = await response.json()
      const responseText = jsonResponse.response || jsonResponse.error || "Unable to extract response"
      const sources: Array<{ filename?: string; pdf?: string }> = Array.isArray(jsonResponse.sources) ? jsonResponse.sources : []
      const sourceLabels = sources
        .map((s) => s.filename || s.pdf)
        .filter(Boolean) as string[]
      const content = sourceLabels.length
        ? `${responseText}\n\nSources: ${sourceLabels.join(', ')}`
        : responseText

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error communicating with Flask backend:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `Error: Unable to process query. Make sure Flask is running at ${FLASK_API_URL}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground dark">
      <Sidebar
        pdfs={pdfs}
        selectedPdfIds={selectedPdfIds}
        onAddPdf={handleAddPdf}
        onRemovePdf={handleRemovePdf}
        onTogglePdfSelection={handleTogglePdfSelection}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedPdfCount={selectedPdfIds.length}
      />
    </div>
  )
}
