# DocuMind

Chat with your PDFs using a RAG pipeline backed by Groq. Upload documents, retrieve the most relevant chunks via FAISS embeddings, and generate concise answers with source citations. Includes a Flask backend and a Next.js UI.

## Features
- Multiple PDF upload and selection
- RAG retrieval with `sentence-transformers` + `faiss-cpu`
- Groq `llama-3.3-70b-versatile` for answer generation
- Source citation returned and displayed in the UI
- Flask API with CORS enabled
- Next.js app for a modern chat UI

## Architecture
- Backend: Flask app (`docmind/__init__.py`) exposing `POST /response_page`
  - File ingestion (PDF and text), text extraction with PyMuPDF
  - RAG pipeline in `llm/__init__.py`
  - Returns JSON `{ query, response, sources }` when `Accept: application/json`
- Frontend: Next.js app in `new_ui`
  - Uploads selected PDFs and query to the Flask endpoint
  - Displays assistant messages and source filenames

## Prerequisites
- Python 3.10+
- Node.js 18+
- Conda (optional, recommended)
- Groq API key

## Backend Setup

Option A: pip
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Option B: conda
```bash
conda env create -f environment.yml
conda activate docmind-env
```

Environment
```
GROQ_API_KEY=your_groq_api_key_here
```

Run
```bash
python app.py
# Flask listens on http://localhost:5000
```

## Frontend Setup (Next.js)
```bash
cd new_ui
npm install
```

Environment (optional if using default)
```
NEXT_PUBLIC_FLASK_URL=http://localhost:5000
```

Run
```bash
npm run dev
# Next.js on http://localhost:3000
```

## Usage
- Open `http://localhost:3000`
- Click **Add PDF** to select files
- Select at least one file
- Type a question and click **Send**
- The assistant replies with an answer and `Sources: …` when available

## Troubleshooting
- Next.js lock: if you see `.next/dev/lock` acquisition errors, terminate other `next dev` processes or delete `.next` and restart.
- Backend dependency: install `flask-cors` if missing. It is listed in `requirements.txt`.
- Backend not reachable: verify Flask is running at `http://localhost:5000` and the UI variable `NEXT_PUBLIC_FLASK_URL` points there.
- No PDFs selected: the Send button remains disabled until at least one file is selected.

## Docker (optional)
The provided `Dockerfile` builds with `environment.yml`. Ensure the CMD points to `app.py` if you run the container-based setup.

## Project Structure
```
docmind/
├── __init__.py              # Flask app + routes
├── pdf_utility.py           # PDF extraction helpers
├── static/                  # CSS, images
├── templates/               # HTML templates (legacy UI)
llm/
├── __init__.py              # RAG + Groq integration
new_ui/                      # Next.js chat UI
├── app/                     # Pages and layout
├── components/              # UI components
app.py                       # Flask entrypoint
requirements.txt             # Python dependencies
environment.yml              # Conda environment
Dockerfile                   # Container build
```

## License
See `LICENSE`.
