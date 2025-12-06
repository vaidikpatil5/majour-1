"use client"

import React from "react"

import { useState } from "react"
import { Plus, FileText, Trash2, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PDFFile {
  id: string
  name: string
  file: File
}

interface SidebarProps {
  pdfs: PDFFile[]
  selectedPdfIds: string[]
  onAddPdf: (files: FileList) => void
  onRemovePdf: (id: string) => void
  onTogglePdfSelection: (id: string) => void
}

export default function Sidebar({ pdfs, selectedPdfIds, onAddPdf, onRemovePdf, onTogglePdfSelection }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Files selected:", e.target.files.length)
      onAddPdf(e.target.files)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border h-full`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {isOpen && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PDF Chat
          </h2>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-sidebar-accent/20 rounded-lg transition-colors"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${!isOpen ? "-rotate-90" : ""}`} />
        </button>
      </div>

      {/* Add PDF Section */}
      {isOpen && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4" />
              Add PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload PDF"
            />
          </div>
        </div>
      )}

      {/* PDFs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
              selectedPdfIds.includes(pdf.id)
                ? "bg-accent text-accent-foreground"
                : "bg-transparent hover:bg-sidebar-accent/30 text-sidebar-foreground"
            }`}
          >
            <button
              onClick={() => onTogglePdfSelection(pdf.id)}
              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                selectedPdfIds.includes(pdf.id)
                  ? "bg-accent border-accent"
                  : "border-sidebar-foreground/30 hover:border-primary"
              }`}
            >
              {selectedPdfIds.includes(pdf.id) && <Check className="w-3 h-3" />}
            </button>
            <FileText className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="text-sm truncate flex-1">{pdf.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemovePdf(pdf.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  aria-label={`Remove ${pdf.name}`}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {isOpen && (
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          <p>
            {selectedPdfIds.length} of {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  )
}
