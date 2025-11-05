# -*- coding: utf-8 -*-
"""rag-llm-documind

Core RAG pipeline for DocuMind.
"""

import os
import json
from typing import List, Dict, Tuple
import fitz  # PyMuPDF
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from groq import Groq

# -------------------------
# Configuration
# -------------------------
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
FAISS_INDEX_FILE = "faiss_index.bin"
METADATA_FILE = "metadata.json"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K = 3
GROQ_MODEL = "llama-3.3-70b-versatile"
MAX_CONTEXT_CHARS = 4000

# -------------------------
# Global Variables
# -------------------------
client = None
embedder = None
FAISS_INDEX = None
METADATA = None
CHUNKS = None

def initialize_models():
    """Initialize the Groq client and sentence transformer model."""
    global client, embedder
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable not set.")
    client = Groq(api_key=GROQ_API_KEY)
    embedder = SentenceTransformer(EMBEDDING_MODEL)

def extract_pdf_text(pdf_path: str) -> List[Tuple[int, str]]:
    """Extract text from a PDF and return a list of (page_no, page_text)."""
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text()
        pages.append((i + 1, text))
    return pages

def chunk_text_from_pages(pages: List[Tuple[int, str]], chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> List[Dict]:
    """Convert a list of pages into a list of chunk dictionaries."""
    combined = [f"\n\n[PAGE {page_no}]\n{page_text.strip()}" for page_no, page_text in pages]
    all_text = "\n".join(combined)
    chunks = []
    start = 0
    text_len = len(all_text)
    while start < text_len:
        end = start + chunk_size
        chunk_text = all_text[start:end]
        chunks.append({"text": chunk_text, "start_char": start, "end_char": end})
        start = end - overlap
        if start < 0:
            start = 0
    return chunks

def embed_texts(texts: List[str]) -> np.ndarray:
    """Compute embeddings for a list of texts."""
    embs = embedder.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    return embs.astype("float32")

def setup_rag(pdf_files: List[str]):
    """Build the RAG index from a list of PDF files."""
    global FAISS_INDEX, METADATA, CHUNKS
    
    all_chunks = []
    metadata_list = []
    for pdf in pdf_files:
        pages = extract_pdf_text(pdf)
        pdf_chunks = chunk_text_from_pages(pages)
        for i, c in enumerate(pdf_chunks):
            chunk_id = f"{pdf}::chunk_{i}"
            entry = {
                "chunk_id": chunk_id,
                "pdf": pdf,
                "text": c["text"],
                "start_char": c["start_char"],
                "end_char": c["end_char"],
            }
            all_chunks.append(entry)
            metadata_list.append({"chunk_id": chunk_id, "pdf": pdf, "start_char": c["start_char"], "end_char": c["end_char"]})

    texts = [c["text"] for c in all_chunks]
    embs = embed_texts(texts)
    dim = embs.shape[1]
    
    index = faiss.IndexFlatL2(dim)
    index.add(embs)
    
    FAISS_INDEX = index
    METADATA = metadata_list
    CHUNKS = all_chunks

def retrieve(query: str, top_k=TOP_K) -> List[Dict]:
    """Retrieve relevant chunks for a given query."""
    q_emb = embed_texts([query])
    D, I = FAISS_INDEX.search(q_emb, top_k)
    scores = D[0].tolist()
    idxs = I[0].tolist()
    results = []
    for score, idx in zip(scores, idxs):
        if idx >= 0:
            results.append({
                "score": float(score),
                "metadata": METADATA[idx],
                "text": CHUNKS[idx]["text"]
            })
    return results

def build_context(retrieved: List[Dict], max_chars=MAX_CONTEXT_CHARS) -> Tuple[str, List[Dict]]:
    """Build the context string for the LLM from retrieved chunks."""
    context_parts = []
    sources = []
    total = 0
    for r in retrieved:
        txt = r["text"].strip()
        if total + len(txt) > max_chars:
            allowed = max_chars - total
            if allowed <= 50:
                break
            txt = txt[:allowed]
        context_parts.append(f"=== SOURCE: {r['metadata']['pdf']} ===\n{txt}\n")
        sources.append(r['metadata'])
        total += len(txt)
    return "\n".join(context_parts), sources

def ask_groq_with_context(query: str, context: str, model=GROQ_MODEL, max_tokens=256) -> Dict:
    """Get an answer from the Groq LLM based on the provided context."""
    system_msg = (
        "You are an AI assistant that answers user questions using only the provided DOCUMENT CONTEXT. "
        "If the answer is not present in the documents, say you don't know — do not hallucinate. "
        "Cite sources by filename when you use a fact from a document."
    )
    user_prompt = (
        "DOCUMENTS:\n" + context + "\n\n"
        "USER QUESTION:\n" + query + "\n\n"
        "INSTRUCTIONS: Answer concisely and include source filenames in square brackets like [filename.pdf]."
    )
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=max_tokens
    )
    content = resp.choices[0].message.content.strip()
    return {"text": content, "raw": resp}

def answer_query(query: str, top_k=TOP_K) -> Dict:
    """Answer a query using the RAG pipeline."""
    if FAISS_INDEX is None:
        return {"answer": "RAG index not set up. Please process PDFs first.", "sources": []}
    
    retrieved = retrieve(query, top_k=top_k)
    if not retrieved:
        return {"answer": "No relevant content found in PDFs.", "sources": []}
    
    context, sources = build_context(retrieved)
    resp = ask_groq_with_context(query, context)
    return {"answer": resp["text"], "sources": sources}

if __name__ == '__main__':
    # This block is for testing the module directly
    initialize_models()
    
    # Create a dummy PDF for testing
    dummy_pdf_path = "dummy_document.pdf"
    with fitz.open() as doc:
        page = doc.new_page()
        page.insert_text((50, 72), "This is a test document about machine learning and RAG models.")
        doc.save(dummy_pdf_path)

    setup_rag([dummy_pdf_path])
    
    test_query = "What is this document about?"
    result = answer_query(test_query)
    
    print("=== Test Query ===")
    print(f"Query: {test_query}")
    print(f"Answer: {result['answer']}")
    print(f"Sources: {result['sources']}")
    
    # Clean up the dummy file
    os.remove(dummy_pdf_path)

