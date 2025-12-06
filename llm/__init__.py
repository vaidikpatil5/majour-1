import os
import json
import tempfile
from typing import List, Dict, Tuple
import fitz  # PyMuPDF
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

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
# Global Variables (per-session, but we'll manage persistence)
# -------------------------
client = None
embedder = None

def initialize_models():
    """Initialize the Groq client and sentence transformer model."""
    global client, embedder
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable not set.")
    client = Groq(api_key=GROQ_API_KEY)
    embedder = SentenceTransformer(EMBEDDING_MODEL)

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from a file based on its type."""
    if file_type == 'pdf':
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += '\n'
            text += page.get_text()
        return text
    elif file_type in ['text', 'markdown']:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def chunk_text(text: str, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> List[Dict]:
    """Chunk text into overlapping segments."""
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + chunk_size
        chunk_text = text[start:end]
        chunks.append({"text": chunk_text, "start_char": start, "end_char": end})
        start = end - overlap
        if start < 0:
            start = 0
    return chunks

def embed_texts(texts: List[str]) -> np.ndarray:
    """Compute embeddings for a list of texts."""
    embs = embedder.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return embs.astype("float32")

def setup_rag_from_context(context_data: Dict[str, str]):
    """Build the RAG index from context_data (filename: text)."""
    all_chunks = []
    metadata_list = []
    for filename, text in context_data.items():
        file_chunks = chunk_text(text)
        for i, c in enumerate(file_chunks):
            chunk_id = f"{filename}::chunk_{i}"
            entry = {
                "chunk_id": chunk_id,
                "filename": filename,
                "text": c["text"],
                "start_char": c["start_char"],
                "end_char": c["end_char"],
            }
            all_chunks.append(entry)
            metadata_list.append({"chunk_id": chunk_id, "filename": filename, "start_char": c["start_char"], "end_char": c["end_char"]})

    texts = [c["text"] for c in all_chunks]
    embs = embed_texts(texts)
    dim = embs.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(embs)

    return index, metadata_list, all_chunks

def retrieve(query: str, index, metadata, chunks, top_k=TOP_K) -> List[Dict]:
    """Retrieve relevant chunks for a given query."""
    q_emb = embed_texts([query])
    D, I = index.search(q_emb, top_k)
    scores = D[0].tolist()
    idxs = I[0].tolist()
    results = []
    for score, idx in zip(scores, idxs):
        if idx >= 0:
            results.append({
                "score": float(score),
                "metadata": metadata[idx],
                "text": chunks[idx]["text"]
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
        context_parts.append(f"=== SOURCE: {r['metadata']['filename']} ===\n{txt}\n")
        sources.append(r['metadata'])
        total += len(txt)
    return "\n".join(context_parts), sources

def ask_groq_with_context(query: str, context: str, model=GROQ_MODEL, max_tokens=256) -> Dict:
    """Get an answer from the Groq LLM based on the provided context."""
    system_msg = (
        "You are an AI assistant that answers user questions using only the provided DOCUMENT CONTEXT. "
        "If the answer is too generic u can respond otherwise if not present in the documents, say , no mentions in the doc  — do not hallucinate. "
        "Cite sources page no by filename when you use a fact from a document."
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

def query_processor(context_data: Dict[str, str], prompt: str) -> Dict:
    '''
        - context_data contains the text of files attached by user.
        - It is a dictionary where filename is the key
          and respective value is the file's text content.
        - The prompt is a string containing the query provided by user.
        - The return value is a string (containing the answer to prompt).
    '''
    if not context_data:
        return {"text": "No files provided. Please upload at least one PDF or text file.", "sources": []}

    try:
        initialize_models()
        index, metadata, chunks = setup_rag_from_context(context_data)
        retrieved = retrieve(prompt, index, metadata, chunks)
        if not retrieved:
            return {"text": "No relevant content found in the uploaded files.", "sources": []}
        context, sources = build_context(retrieved)
        resp = ask_groq_with_context(prompt, context)
        return {"text": resp["text"], "sources": sources}
    except Exception as e:
        return {"text": f"An error occurred while processing your query: {str(e)}. Please check your API key and file formats.", "sources": []}
